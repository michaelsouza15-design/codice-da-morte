// Cross-Platform Audio Recorder for PC, Android, and iOS iPhone Safari
// Includes MediaRecorder with intelligent MIME type detection and PCM WAV fallback

export interface RecordedAudioResult {
  blob: Blob;
  base64Url: string;
  duration: number; // in seconds
  mimeType: string;
}

export class CrossPlatformAudioRecorder {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private timerInterval: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isRecording: boolean = false;
  private mimeType: string = '';

  // Fallback WAV recorder variables
  private scriptProcessor: ScriptProcessorNode | null = null;
  private pcmBuffers: Float32Array[] = [];
  private pcmLength: number = 0;
  private sampleRate: number = 44100;
  private usingWavFallback: boolean = false;

  private onVolumeChange: ((volume: number) => void) | null = null;
  private onTimeUpdate: ((seconds: number) => void) | null = null;

  public static isSupported(): boolean {
    const hasMediaDevices = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const hasAudioContext = typeof window !== 'undefined' && Boolean(window.AudioContext || (window as any).webkitAudioContext);
    return hasMediaDevices && (hasMediaRecorder || hasAudioContext);
  }

  public static getBestMimeType(): string {
    if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
      return 'audio/wav';
    }

    // Check preferred types for Android/Chrome/PC
    const preferredOrder = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4', // Common on Safari iOS
      'audio/aac', // Safari iOS
      'audio/ogg;codecs=opus',
      'audio/wav',
    ];

    for (const type of preferredOrder) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      } catch (e) {}
    }

    return '';
  }

  public async start(callbacks?: {
    onVolume?: (volume: number) => void;
    onTime?: (seconds: number) => void;
  }): Promise<boolean> {
    if (this.isRecording) return true;

    this.onVolumeChange = callbacks?.onVolume || null;
    this.onTimeUpdate = callbacks?.onTime || null;
    this.audioChunks = [];
    this.pcmBuffers = [];
    this.pcmLength = 0;
    this.usingWavFallback = false;

    try {
      // 1. Request microphone access with mobile-friendly constraints
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // 2. Setup Web Audio for live volume meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume().catch(() => {});
        }
        this.sampleRate = this.audioContext.sampleRate || 44100;
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        // Volume polling loop
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkVolume = () => {
          if (!this.isRecording || !this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          const vol = Math.min(100, Math.round((avg / 128) * 100));
          if (this.onVolumeChange) {
            this.onVolumeChange(vol);
          }
          this.animFrameId = requestAnimationFrame(checkVolume);
        };
        this.animFrameId = requestAnimationFrame(checkVolume);
      }

      // 3. Try standard MediaRecorder
      const detectedMime = CrossPlatformAudioRecorder.getBestMimeType();
      this.mimeType = detectedMime;

      if (typeof MediaRecorder !== 'undefined' && detectedMime) {
        try {
          this.mediaRecorder = new MediaRecorder(this.mediaStream, {
            mimeType: detectedMime,
            audioBitsPerSecond: 64000,
          });
        } catch (err) {
          // If specifying mimeType fails on strict Safari, attempt without options
          try {
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.mimeType = this.mediaRecorder.mimeType || 'audio/mp4';
          } catch (e) {
            this.mediaRecorder = null;
          }
        }
      }

      if (this.mediaRecorder) {
        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };
        // Slice chunks every 250ms
        this.mediaRecorder.start(250);
      } else {
        // Fallback: PCM WAV via ScriptProcessorNode (universal across all iOS/Android/PC)
        this.setupPcmFallback();
      }

      this.isRecording = true;
      this.startTime = Date.now();

      // Timer ticker
      this.timerInterval = setInterval(() => {
        if (!this.isRecording) return;
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.onTimeUpdate) {
          this.onTimeUpdate(elapsed);
        }
      }, 250);

      return true;
    } catch (error) {
      console.warn('CrossPlatformAudioRecorder start error:', error);
      this.cleanup();
      return false;
    }
  }

  private setupPcmFallback() {
    if (!this.audioContext || !this.mediaStream) return;
    this.usingWavFallback = true;
    this.mimeType = 'audio/wav';

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    const bufferSize = 4096;
    this.scriptProcessor = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isRecording) return;
      const input = e.inputBuffer.getChannelData(0);
      const copy = new Float32Array(input.length);
      copy.set(input);
      this.pcmBuffers.push(copy);
      this.pcmLength += input.length;
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  public async stop(): Promise<RecordedAudioResult | null> {
    if (!this.isRecording) return null;

    const duration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
    this.isRecording = false;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    try {
      let finalBlob: Blob;

      if (!this.usingWavFallback && this.mediaRecorder) {
        finalBlob = await new Promise<Blob>((resolve) => {
          if (!this.mediaRecorder) {
            resolve(new Blob(this.audioChunks, { type: this.mimeType || 'audio/webm' }));
            return;
          }

          this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.audioChunks, { type: this.mimeType || 'audio/webm' });
            resolve(blob);
          };

          try {
            if (this.mediaRecorder.state === 'recording') {
              this.mediaRecorder.stop();
            } else {
              resolve(new Blob(this.audioChunks, { type: this.mimeType || 'audio/webm' }));
            }
          } catch (e) {
            resolve(new Blob(this.audioChunks, { type: this.mimeType || 'audio/webm' }));
          }
        });
      } else {
        // Encode PCM into WAV
        finalBlob = this.encodeWav(this.pcmBuffers, this.pcmLength, this.sampleRate);
      }

      this.cleanup();

      // Convert Blob to Data URL
      const base64Url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(finalBlob);
      });

      return {
        blob: finalBlob,
        base64Url,
        duration,
        mimeType: this.mimeType || finalBlob.type || 'audio/webm',
      };
    } catch (err) {
      console.warn('CrossPlatformAudioRecorder stop error:', err);
      this.cleanup();
      return null;
    }
  }

  public cancel() {
    this.isRecording = false;
    this.cleanup();
  }

  private cleanup() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.mediaRecorder = null;
    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch (e) {}
      this.scriptProcessor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.audioChunks = [];
    this.pcmBuffers = [];
    this.pcmLength = 0;
  }

  // Universal WAV PCM encoder (Works on 100% of browsers and iOS versions)
  private encodeWav(buffers: Float32Array[], totalLength: number, sampleRate: number): Blob {
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const b of buffers) {
      merged.set(b, offset);
      offset += b.length;
    }

    const wavBuffer = new ArrayBuffer(44 + merged.length * 2);
    const view = new DataView(wavBuffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + merged.length * 2, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
    view.setUint16(22, 1, true); // NumChannels (1 = Mono)
    view.setUint32(24, sampleRate, true); // SampleRate
    view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, merged.length * 2, true);

    // Write PCM 16-bit audio samples
    let index = 44;
    for (let i = 0; i < merged.length; i++) {
      const s = Math.max(-1, Math.min(1, merged[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      index += 2;
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}
