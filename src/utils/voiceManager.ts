import { Socket } from 'socket.io-client';

export interface VoiceParticipant {
  playerId: string;
  isSpeaking: boolean;
  isMuted: boolean;
  volume: number; // 0 to 100
  lastSpokeAt?: number;
}

class VoiceManager {
  private socket: Socket | null = null;
  private myPlayerId: string = '';
  private isListening: boolean = false;
  private isMuted: boolean = true;
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private isSpeaking: boolean = false;
  private audioQueue: string[] = [];
  private isPlayingQueue: boolean = false;
  private participants: Map<string, VoiceParticipant> = new Map();
  private onSpeakingChangeCallbacks: ((participants: Map<string, VoiceParticipant>) => void)[] = [];
  private onLocalSpeakingCallbacks: ((isSpeaking: boolean, volume: number) => void)[] = [];
  private onMicStatusCallbacks: ((isMuted: boolean) => void)[] = [];
  private activeAudioElements: HTMLAudioElement[] = [];
  private masterVoiceVolume: number = (() => {
    try {
      const saved = localStorage.getItem('codice_master_voice_vol');
      return saved ? parseFloat(saved) : 1.0;
    } catch {
      return 1.0;
    }
  })();
  private userVolumes: Map<string, number> = new Map();

  public init(socket: Socket | null, myPlayerId: string) {
    this.socket = socket;
    this.myPlayerId = myPlayerId;
    this.setupSocketListeners();
  }

  public setSocket(socket: Socket | null, myPlayerId: string) {
    this.socket = socket;
    this.myPlayerId = myPlayerId;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    // Remove existing handlers to avoid duplicates
    this.socket.off('voice_audio_chunk');
    this.socket.off('voice_speaking_state');
    this.socket.off('voice_mic_status');

    // Receive incoming voice audio chunk from other online player
    this.socket.on(
      'voice_audio_chunk',
      ({
        senderId,
        audioData,
        mimeType,
      }: {
        senderId: string;
        senderName: string;
        characterId?: string;
        audioData: string;
        mimeType?: string;
      }) => {
        if (senderId === this.myPlayerId) return; // Don't play own echo
        this.playAudioChunk(audioData, mimeType || 'audio/webm', senderId);
        
        // Update participant speaking state
        const p = this.participants.get(senderId) || {
          playerId: senderId,
          isSpeaking: true,
          isMuted: false,
          volume: 75,
          lastSpokeAt: Date.now(),
        };
        p.isSpeaking = true;
        p.lastSpokeAt = Date.now();
        this.participants.set(senderId, p);
        this.notifyParticipants();

        // Auto-reset speaking state after 1 second of silence
        setTimeout(() => {
          const current = this.participants.get(senderId);
          if (current && Date.now() - (current.lastSpokeAt || 0) >= 900) {
            current.isSpeaking = false;
            this.participants.set(senderId, current);
            this.notifyParticipants();
          }
        }, 1000);
      }
    );

    this.socket.on(
      'voice_speaking_state',
      ({ playerId, isSpeaking, volume }: { playerId: string; isSpeaking: boolean; volume: number }) => {
        if (playerId === this.myPlayerId) return;
        const p = this.participants.get(playerId) || {
          playerId,
          isSpeaking,
          isMuted: false,
          volume,
        };
        p.isSpeaking = isSpeaking;
        p.volume = volume;
        this.participants.set(playerId, p);
        this.notifyParticipants();
      }
    );

    this.socket.on('voice_mic_status', ({ playerId, isMuted }: { playerId: string; isMuted: boolean }) => {
      if (playerId === this.myPlayerId) return;
      const p = this.participants.get(playerId) || {
        playerId,
        isSpeaking: false,
        isMuted,
        volume: 0,
      };
      p.isMuted = isMuted;
      if (isMuted) p.isSpeaking = false;
      this.participants.set(playerId, p);
      this.notifyParticipants();
    });
  }

  public async startMicrophone(): Promise<boolean> {
    try {
      if (this.mediaStream && this.mediaStream.active && this.mediaStream.getAudioTracks().length > 0) {
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume().catch(() => {});
        }
        this.unmute();
        return true;
      }

      if (!navigator?.mediaDevices?.getUserMedia) {
        console.warn('getUserMedia is not supported on this browser context.');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      this.isMuted = false;
      this.notifyMicStatus(false);

      if (this.socket) {
        this.socket.emit('voice_mic_status', { isMuted: false });
      }

      this.setupAudioAnalysis(stream);
      this.setupRecorder(stream);
      return true;
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      return false;
    }
  }

  public mute() {
    this.isMuted = true;
    if (this.mediaStream) {
      this.mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.pause();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.notifyLocalSpeaking(false, 0);
    this.notifyMicStatus(true);
    if (this.socket) {
      this.socket.emit('voice_mic_status', { isMuted: true });
      this.socket.emit('voice_speaking_state', { isSpeaking: false, volume: 0 });
    }
  }

  public async unmute() {
    if (!this.mediaStream || !this.mediaStream.active) {
      await this.startMicrophone();
      return;
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume().catch(() => {});
    }
    this.isMuted = false;
    this.mediaStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      try {
        this.mediaRecorder.resume();
      } catch (e) {}
    }
    this.notifyMicStatus(false);
    if (this.socket) {
      this.socket.emit('voice_mic_status', { isMuted: false });
    }
  }

  public toggleMute() {
    if (this.isMuted || !this.mediaStream) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  public stopMicrophone() {
    this.mute();
    if (this.mediaRecorder) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
      this.mediaRecorder = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
  }

  private async setupAudioAnalysis(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioContext || this.audioContext.state === 'closed') {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume().catch(() => {});
      }
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser || this.isMuted) {
          if (this.isSpeaking) {
            this.isSpeaking = false;
            this.notifyLocalSpeaking(false, 0);
          }
          this.animFrameId = requestAnimationFrame(checkVolume);
          return;
        }

        this.analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volumePercent = Math.min(100, Math.round((average / 128) * 100));
        const nowSpeaking = volumePercent > 10; // Threshold for speaking detection

        if (nowSpeaking !== this.isSpeaking) {
          this.isSpeaking = nowSpeaking;
          this.notifyLocalSpeaking(nowSpeaking, volumePercent);
          if (this.socket) {
            this.socket.emit('voice_speaking_state', { isSpeaking: nowSpeaking, volume: volumePercent });
          }
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
      this.animFrameId = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn('Web Audio volume analysis setup failed:', err);
    }
  }

  private setupRecorder(stream: MediaStream) {
    try {
      let mimeType = 'audio/webm;codecs=opus';
      if (typeof MediaRecorder === 'undefined') return;

      let recorder: MediaRecorder | null = null;
      try {
        if (MediaRecorder.isTypeSupported && !MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
            ? 'audio/ogg;codecs=opus'
            : 'audio/mp4';
        }
        recorder = new MediaRecorder(stream, { mimeType });
      } catch (e) {
        // Fallback without mimeType options if browser is restrictive
        recorder = new MediaRecorder(stream);
      }

      this.mediaRecorder = recorder;

      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0 && !this.isMuted && this.socket) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Data = reader.result as string;
            if (base64Data && this.socket) {
              this.socket.emit('voice_audio_chunk', {
                audioData: base64Data,
                mimeType,
              });
            }
          };
          reader.readAsDataURL(e.data);
        }
      };

      // Broadcast chunks every 350ms for low latency conversation
      recorder.start(350);
    } catch (err) {
      console.warn('MediaRecorder error:', err);
    }
  }

  private playAudioChunk(audioData: string, mimeType: string, senderId?: string) {
    try {
      const audio = new Audio(audioData);
      const userVol = senderId ? (this.userVolumes.get(senderId) ?? 1.0) : 1.0;
      audio.volume = Math.max(0, Math.min(1, this.masterVoiceVolume * userVol));
      audio.onended = () => {
        const idx = this.activeAudioElements.indexOf(audio);
        if (idx !== -1) this.activeAudioElements.splice(idx, 1);
      };
      this.activeAudioElements.push(audio);
      audio.play().catch(() => {
        // Autoplay restrictions handle silently
      });
    } catch (err) {
      console.warn('Failed to play audio chunk:', err);
    }
  }

  public setMasterVoiceVolume(vol: number) {
    this.masterVoiceVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('codice_master_voice_vol', this.masterVoiceVolume.toString());
    } catch {}
  }

  public getMasterVoiceVolume(): number {
    return this.masterVoiceVolume;
  }

  public setUserVolume(playerId: string, vol: number) {
    this.userVolumes.set(playerId, Math.max(0, Math.min(1, vol)));
  }

  public getUserVolume(playerId: string): number {
    return this.userVolumes.get(playerId) ?? 1.0;
  }

  public onParticipantsChange(cb: (participants: Map<string, VoiceParticipant>) => void) {
    this.onSpeakingChangeCallbacks.push(cb);
    return () => {
      this.onSpeakingChangeCallbacks = this.onSpeakingChangeCallbacks.filter((c) => c !== cb);
    };
  }

  public onLocalSpeaking(cb: (isSpeaking: boolean, volume: number) => void) {
    this.onLocalSpeakingCallbacks.push(cb);
    return () => {
      this.onLocalSpeakingCallbacks = this.onLocalSpeakingCallbacks.filter((c) => c !== cb);
    };
  }

  public onMicStatus(cb: (isMuted: boolean) => void) {
    this.onMicStatusCallbacks.push(cb);
    return () => {
      this.onMicStatusCallbacks = this.onMicStatusCallbacks.filter((c) => c !== cb);
    };
  }

  private notifyParticipants() {
    this.onSpeakingChangeCallbacks.forEach((cb) => cb(new Map(this.participants)));
  }

  private notifyLocalSpeaking(isSpeaking: boolean, volume: number) {
    this.onLocalSpeakingCallbacks.forEach((cb) => cb(isSpeaking, volume));
  }

  private notifyMicStatus(isMuted: boolean) {
    this.onMicStatusCallbacks.forEach((cb) => cb(isMuted));
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMicActive(): boolean {
    return !this.isMuted && this.mediaStream !== null;
  }
}

export const voiceManager = new VoiceManager();
