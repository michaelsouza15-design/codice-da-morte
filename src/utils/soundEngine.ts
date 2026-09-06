// Gothic Audio Engine & Soundtrack Manager using Web Audio API & HTML5 Audio

export type TrackId =
  | 'rastro_trevas'
  | 'a_luz_na_cupula'
  | 'eu_vou_achar'
  | 'codice_sombras'
  | 'despertar_dracula'
  | 'custom';

export interface SoundtrackTrack {
  id: TrackId;
  title: string;
  subtitle: string;
  description: string;
  genre: string;
  fileSrc: string;
  isInitialTheme?: boolean;
}

export const SOUNDTRACK_PLAYLIST: SoundtrackTrack[] = [
  {
    id: 'rastro_trevas',
    title: 'Rastro nas Trevas',
    subtitle: 'Tema Oficial da Tela Inicial',
    description: 'Arpejos acelerados de cravo e sintetizador analógico de perseguição sob a luz da lua.',
    genre: 'Eletrogótico / Darkwave',
    fileSrc: '/audio/rastro_nas_trevas.mp3',
    isInitialTheme: true,
  },
  {
    id: 'a_luz_na_cupula',
    title: 'A Luz na Cúpula',
    subtitle: 'Épico Gótico Orquestral',
    description: 'Épico gótico orquestral com coro dramático, órgão de tubos e timbales ancestrais sob a abóbada da biblioteca.',
    genre: 'Gótico Sinfônico / Coral',
    fileSrc: '/audio/a_luz_na_cupula.mp3',
  },
  {
    id: 'eu_vou_achar',
    title: 'Eu Vou Achar',
    subtitle: 'A Marca Que Você Deixou',
    description: 'Rock gótico de investigação com pulso tenso, batida marcante e revelação dos segredos da sala fechada.',
    genre: 'Goth Rock / Investigativo',
    fileSrc: '/audio/eu_vou_achar.mp3',
  },
  {
    id: 'codice_sombras',
    title: 'O Códice das Sombras',
    subtitle: 'Tema Ambiente de Dedução',
    description: 'Arpejos etéreos de caixinha de música, celesta e sinos distantes na névoa da biblioteca.',
    genre: 'Dark Ambient / Mistério',
    fileSrc: '/audio/o_codice_das_sombras.mp3',
  },
  {
    id: 'despertar_dracula',
    title: 'O Despertar do Conde',
    subtitle: 'Noite Eterna dos Vampiros',
    description: 'Sinfonia fúnebre com violoncelo dramático, coros soturnos e crescendo orquestral de revelação do crime.',
    genre: 'Gótico Fúnebre / Orquestral',
    fileSrc: '/audio/o_despertar_do_conde.mp3',
  },
];

class GothicSoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private activeNodes: Array<AudioNode | { stop?: () => void; disconnect: () => void }> = [];
  private sequenceTimers: number[] = [];
  private isPlayingMusic = false;
  private currentTrackId: TrackId = 'rastro_trevas';
  private musicVolume = 0.45;
  private sfxVolume = 0.7;
  private isMuted = false;

  // HTML5 Audio elements for MP3 playback
  private audioEl: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private customAudioBlobUrl: string | null = null;
  private customAudioFileName: string | null = null;
  private customTrackMap: Partial<Record<TrackId, string>> = {};

  private autoStartTriggered = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Bind initial interaction to auto-start 'Rastro nas Trevas' on first gesture
  public enableAutoTheme() {
    if (this.autoStartTriggered) return;
    const startOnGesture = () => {
      if (!this.autoStartTriggered && !this.isPlayingMusic) {
        this.autoStartTriggered = true;
        this.playTrack('rastro_trevas');
      }
      window.removeEventListener('click', startOnGesture);
      window.removeEventListener('keydown', startOnGesture);
      window.removeEventListener('touchstart', startOnGesture);
    };

    window.addEventListener('click', startOnGesture, { once: true });
    window.addEventListener('keydown', startOnGesture, { once: true });
    window.addEventListener('touchstart', startOnGesture, { once: true });
  }

  // --- SOUNDTRACK PLAYBACK & SWITCHING ---

  private synthTimerId: number | null = null;

  public playTrack(trackId: TrackId = 'rastro_trevas') {
    this.stopMusic();
    this.initContext();
    this.currentTrackId = trackId;
    this.isPlayingMusic = true;

    this.notifyTrackChanged(trackId);

    // Check if we have an MP3 file (either custom uploaded blob or from /audio/)
    const customUrl = this.customTrackMap[trackId] || (trackId === 'custom' ? this.customAudioBlobUrl : null);
    const trackInfo = SOUNDTRACK_PLAYLIST.find((t) => t.id === trackId);
    const mp3Src = customUrl || (trackInfo ? trackInfo.fileSrc : null);

    if (mp3Src) {
      this.tryPlayMp3(mp3Src, trackId);
    } else {
      this.fallbackToSynthesized(trackId);
    }
  }

  private notifyTrackChanged(trackId: TrackId) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gothic_track_changed', {
          detail: { trackId, isPlaying: this.isPlayingMusic },
        })
      );
    }
  }

  private tryPlayMp3(src: string, trackId: TrackId) {
    try {
      if (!this.audioEl) {
        this.audioEl = new Audio();
      }

      // DO NOT loop the same track; advance to next track when song finishes!
      this.audioEl.loop = false;
      this.audioEl.src = src;
      this.audioEl.volume = this.isMuted ? 0 : this.musicVolume;

      // When the song ends, advance to the next track in playlist order!
      this.audioEl.onended = () => {
        if (this.isPlayingMusic) {
          this.nextTrack();
        }
      };

      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio MP3 playing successfully
          })
          .catch(() => {
            // If MP3 file not found or browser blocked, fallback to synthesized audio
            this.fallbackToSynthesized(trackId);
          });
      }
    } catch {
      this.fallbackToSynthesized(trackId);
    }
  }

  private fallbackToSynthesized(trackId: TrackId) {
    switch (trackId) {
      case 'a_luz_na_cupula':
        this.startLuzNaCupulaSynth();
        break;
      case 'eu_vou_achar':
        this.startEuVouAcharSynth();
        break;
      case 'codice_sombras':
        this.startCodiceSombrasSynth();
        break;
      case 'rastro_trevas':
        this.startRastroTrevasSynth();
        break;
      case 'despertar_dracula':
        this.startDraculaSynth();
        break;
      default:
        this.startLuzNaCupulaSynth();
        break;
    }

    // For synthesized audio fallback: automatically cycle to next track in playlist after 70 seconds
    if (this.synthTimerId) {
      window.clearTimeout(this.synthTimerId);
    }
    this.synthTimerId = window.setTimeout(() => {
      if (this.isPlayingMusic) {
        this.nextTrack();
      }
    }, 70000);
  }

  public toggleMusic(trackId?: TrackId) {
    if (this.isPlayingMusic) {
      this.stopMusic();
      this.notifyTrackChanged(this.currentTrackId);
      return false;
    } else {
      this.playTrack(trackId || this.currentTrackId);
      return true;
    }
  }

  // Sequential playlist ordering: Rastro nas Trevas -> A Luz na Cúpula -> Eu Vou Achar -> O Códice das Sombras -> O Despertar do Conde -> Loops
  public nextTrack() {
    const ids: TrackId[] = ['rastro_trevas', 'a_luz_na_cupula', 'eu_vou_achar', 'codice_sombras', 'despertar_dracula'];
    const currentIndex = ids.indexOf(this.currentTrackId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % ids.length;
    const nextId = ids[nextIndex];
    this.playTrack(nextId);
    return nextId;
  }

  public prevTrack() {
    const ids: TrackId[] = ['rastro_trevas', 'a_luz_na_cupula', 'eu_vou_achar', 'codice_sombras', 'despertar_dracula'];
    const currentIndex = ids.indexOf(this.currentTrackId);
    const prevIndex = currentIndex === -1 ? 0 : (currentIndex - 1 + ids.length) % ids.length;
    const prevId = ids[prevIndex];
    this.playTrack(prevId);
    return prevId;
  }

  public stopMusic() {
    this.isPlayingMusic = false;

    if (this.synthTimerId) {
      window.clearTimeout(this.synthTimerId);
      this.synthTimerId = null;
    }

    // Clear all scheduled timers
    this.sequenceTimers.forEach((t) => clearTimeout(t));
    this.sequenceTimers = [];

    // Stop active synth nodes
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        }
        node.disconnect();
      } catch {
        // ignore cleanup
      }
    });
    this.activeNodes = [];

    // Pause audio element if playing
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }

  // Support for user uploading MP3 / WAV with permanent storage (IndexedDB + Server)
  public async loadCustomAudioFile(file: File, targetTrackId?: TrackId): Promise<boolean> {
    try {
      const blobUrl = URL.createObjectURL(file);
      const trackKey = targetTrackId && targetTrackId !== 'custom' ? targetTrackId : 'custom';
      
      if (trackKey !== 'custom') {
        this.customTrackMap[trackKey] = blobUrl;
      } else {
        if (this.customAudioBlobUrl) {
          URL.revokeObjectURL(this.customAudioBlobUrl);
        }
        this.customAudioBlobUrl = blobUrl;
        this.customAudioFileName = file.name;
      }

      // Save to IndexedDB for offline / cross-session persistence
      await this.saveToIndexedDB(trackKey, file);

      // Also attempt background sync to server /public/audio/ for published deployment
      this.syncToServer(trackKey, file).catch(() => {});

      this.playTrack(trackKey);
      return true;
    } catch (e) {
      console.error('Error loading custom audio file:', e);
      return false;
    }
  }

  // Batch load multiple MP3s and auto-map them to the 5 gothic tracks
  public async batchLoadAudioFiles(files: FileList | File[]): Promise<Record<TrackId, boolean>> {
    const fileArray = Array.from(files);
    const results: Partial<Record<TrackId, boolean>> = {};
    const unassignedTracks: TrackId[] = [
      'rastro_trevas',
      'a_luz_na_cupula',
      'eu_vou_achar',
      'codice_sombras',
      'despertar_dracula',
    ];

    for (const file of fileArray) {
      const name = file.name.toLowerCase();
      let matchedTrack: TrackId | null = null;

      if (name.includes('luz') || name.includes('cupula') || name.includes('cúpula')) {
        matchedTrack = 'a_luz_na_cupula';
      } else if (name.includes('achar') || name.includes('marca') || name.includes('vou')) {
        matchedTrack = 'eu_vou_achar';
      } else if (name.includes('codice') || name.includes('códice') || name.includes('sombra') || name.includes('sombras')) {
        matchedTrack = 'codice_sombras';
      } else if (name.includes('rastro') || name.includes('treva') || name.includes('trevas')) {
        matchedTrack = 'rastro_trevas';
      } else if (name.includes('dracula') || name.includes('drácula') || name.includes('despertar') || name.includes('vampiro') || name.includes('conde')) {
        matchedTrack = 'despertar_dracula';
      }

      // If name didn't match keyword, pick next available unassigned track
      if (!matchedTrack && unassignedTracks.length > 0) {
        matchedTrack = unassignedTracks[0];
      }

      if (matchedTrack) {
        const ok = await this.loadCustomAudioFile(file, matchedTrack);
        results[matchedTrack] = ok;
        const idx = unassignedTracks.indexOf(matchedTrack);
        if (idx !== -1) unassignedTracks.splice(idx, 1);
      }
    }

    return results as Record<TrackId, boolean>;
  }

  private async saveToIndexedDB(trackKey: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open('GothicSoundtracksDB', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('tracks')) {
            db.createObjectStore('tracks');
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('tracks', 'readwrite');
          const store = tx.objectStore('tracks');
          store.put(file, trackKey);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  public async loadTracksFromIndexedDB(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('GothicSoundtracksDB', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('tracks')) {
            db.createObjectStore('tracks');
          }
        };
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction('tracks', 'readonly');
          const store = tx.objectStore('tracks');
          const keys = [
            'rastro_trevas',
            'a_luz_na_cupula',
            'eu_vou_achar',
            'codice_sombras',
            'despertar_dracula',
            'custom',
          ];
          
          keys.forEach((key) => {
            const getReq = store.get(key);
            getReq.onsuccess = () => {
              if (getReq.result instanceof Blob || getReq.result instanceof File) {
                const url = URL.createObjectURL(getReq.result);
                if (key === 'custom') {
                  this.customAudioBlobUrl = url;
                  this.customAudioFileName = (getReq.result as File).name || 'Áudio Customizado';
                } else {
                  this.customTrackMap[key as TrackId] = url;
                }
              }
            };
          });
          tx.oncomplete = () => resolve();
        };
        request.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  private async syncToServer(trackKey: string, file: File): Promise<void> {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        await fetch('/api/tracks/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: trackKey, base64Data }),
        });
      };
      reader.readAsDataURL(file);
    } catch {
      // ignore
    }
  }

  // --- SYNTHESIZED MUSIC BACKUPS ---

  private startLuzNaCupulaSynth() {
    if (!this.ctx || !this.musicGain) return;

    const chords = [
      { notes: [73.42, 110.0, 146.83, 174.61, 220.0], root: 'D2' }, // D minor (D2, A2, D3, F3, A3)
      { notes: [58.27, 87.31, 116.54, 146.83, 174.61], root: 'Bb1' }, // Bb Major (Bb1, F2, Bb2, D3, F3)
      { notes: [65.41, 98.0, 130.81, 164.81, 196.0], root: 'C2' }, // C Major (C2, G2, C3, E3, G3)
      { notes: [55.0, 82.41, 110.0, 130.81, 164.81], root: 'A1' }, // A minor (A1, E2, A2, C3, E3)
    ];

    let chordStep = 0;
    const stepDuration = 6.5;

    const masterFilter = this.ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(650, this.ctx.currentTime);
    masterFilter.Q.setValueAtTime(3.5, this.ctx.currentTime);
    masterFilter.connect(this.musicGain);
    this.activeNodes.push(masterFilter);

    const choirFilter = this.ctx.createBiquadFilter();
    choirFilter.type = 'bandpass';
    choirFilter.frequency.setValueAtTime(750, this.ctx.currentTime);
    choirFilter.Q.setValueAtTime(5.0, this.ctx.currentTime);
    choirFilter.connect(masterFilter);
    this.activeNodes.push(choirFilter);

    const playChordCycle = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      const current = chords[chordStep % chords.length];
      chordStep++;

      const now = this.ctx.currentTime;

      // Pipe Organ Voice
      current.notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        osc.type = i % 2 === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08 / (i + 1), now + 1.2);
        gain.gain.setValueAtTime(0.08 / (i + 1), now + stepDuration - 1.0);
        gain.gain.linearRampToValueAtTime(0.0001, now + stepDuration);

        osc.connect(gain);
        gain.connect(masterFilter);

        osc.start(now);
        osc.stop(now + stepDuration);
        this.activeNodes.push(osc, gain);
      });

      // Choral Vocal Drone
      [220.0, 329.63, 440.0].forEach((vocalFreq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(vocalFreq, now);

        const vibrato = this.ctx!.createOscillator();
        vibrato.frequency.setValueAtTime(4.8, now);
        const vibratoGain = this.ctx!.createGain();
        vibratoGain.gain.setValueAtTime(2.5, now);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start(now);
        vibrato.stop(now + stepDuration);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.035 / (idx + 1), now + 2.0);
        gain.gain.linearRampToValueAtTime(0.0001, now + stepDuration);

        osc.connect(gain);
        gain.connect(choirFilter);

        osc.start(now);
        osc.stop(now + stepDuration);
        this.activeNodes.push(osc, gain, vibrato, vibratoGain);
      });

      // Timpani Drum Strike
      const drumOsc = this.ctx.createOscillator();
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(80, now);
      drumOsc.frequency.exponentialRampToValueAtTime(35, now + 0.8);

      const drumGain = this.ctx.createGain();
      drumGain.gain.setValueAtTime(0.22, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      drumOsc.connect(drumGain);
      drumGain.connect(masterFilter);
      drumOsc.start(now);
      drumOsc.stop(now + 1.3);
      this.activeNodes.push(drumOsc, drumGain);

      if (chordStep % chords.length === 1) {
        this.playCathedralBell();
      }

      const timerId = window.setTimeout(playChordCycle, (stepDuration - 0.4) * 1000);
      this.sequenceTimers.push(timerId);
    };

    playChordCycle();
  }

  private startEuVouAcharSynth() {
    if (!this.ctx || !this.musicGain) return;

    const bpm = 120;
    const beatSec = 60 / bpm;
    let beatCount = 0;

    const melodyPattern = [
      { note: 220.0, dur: 1 },
      { note: 261.63, dur: 1 },
      { note: 293.66, dur: 1.5 },
      { note: 329.63, dur: 0.5 },
      { note: 293.66, dur: 1 },
      { note: 261.63, dur: 1 },
      { note: 220.0, dur: 2 },
      { note: 196.0, dur: 1 },
      { note: 220.0, dur: 3 },
    ];

    const playRockStep = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      const now = this.ctx.currentTime;
      const barStep = beatCount % 16;
      beatCount++;

      // Kick
      if (barStep % 4 === 0) {
        const kick = this.ctx.createOscillator();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(120, now);
        kick.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        const kickGain = this.ctx.createGain();
        kickGain.gain.setValueAtTime(0.35, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        kick.connect(kickGain);
        kickGain.connect(this.musicGain!);
        kick.start(now);
        kick.stop(now + 0.35);
        this.activeNodes.push(kick, kickGain);
      }

      // Snare
      if (barStep % 4 === 2) {
        const snare = this.ctx.createOscillator();
        snare.type = 'triangle';
        snare.frequency.setValueAtTime(180, now);
        snare.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        const snareGain = this.ctx.createGain();
        snareGain.gain.setValueAtTime(0.25, now);
        snareGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        snare.connect(snareGain);
        snareGain.connect(this.musicGain!);
        snare.start(now);
        snare.stop(now + 0.25);
        this.activeNodes.push(snare, snareGain);
      }

      // Bass
      const bassNotes = [110.0, 110.0, 130.81, 110.0, 146.83, 130.81, 110.0, 98.0];
      const bassFreq = bassNotes[barStep % bassNotes.length];
      const bass = this.ctx.createOscillator();
      bass.type = 'sawtooth';
      bass.frequency.setValueAtTime(bassFreq, now);

      const bassFilter = this.ctx.createBiquadFilter();
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(450, now);
      bassFilter.Q.setValueAtTime(2.5, now);

      const bassGain = this.ctx.createGain();
      bassGain.gain.setValueAtTime(0.16, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatSec * 0.9);

      bass.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.musicGain!);
      bass.start(now);
      bass.stop(now + beatSec);
      this.activeNodes.push(bass, bassFilter, bassGain);

      // Lead
      const melodyIdx = Math.floor(barStep / 2) % melodyPattern.length;
      if (barStep % 2 === 0) {
        const item = melodyPattern[melodyIdx];
        const lead = this.ctx.createOscillator();
        lead.type = 'sawtooth';
        lead.frequency.setValueAtTime(item.note, now);

        const leadFilter = this.ctx.createBiquadFilter();
        leadFilter.type = 'bandpass';
        leadFilter.frequency.setValueAtTime(item.note * 2.2, now);
        leadFilter.Q.setValueAtTime(2.0, now);

        const leadGain = this.ctx.createGain();
        leadGain.gain.setValueAtTime(0.12, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + beatSec * item.dur * 0.9);

        lead.connect(leadFilter);
        leadFilter.connect(leadGain);
        leadGain.connect(this.musicGain!);
        lead.start(now);
        lead.stop(now + beatSec * item.dur);
        this.activeNodes.push(lead, leadFilter, leadGain);
      }

      const timerId = window.setTimeout(playRockStep, beatSec * 1000);
      this.sequenceTimers.push(timerId);
    };

    playRockStep();
  }

  private startCodiceSombrasSynth() {
    if (!this.ctx || !this.musicGain) return;

    const boxScale = [587.33, 698.46, 880.0, 1108.73, 1174.66, 880.0, 698.46, 830.61];
    let noteStep = 0;

    const cello = this.ctx.createOscillator();
    cello.type = 'sawtooth';
    cello.frequency.setValueAtTime(73.42, this.ctx.currentTime);

    const celloFilter = this.ctx.createBiquadFilter();
    celloFilter.type = 'lowpass';
    celloFilter.frequency.setValueAtTime(220, this.ctx.currentTime);

    const celloGain = this.ctx.createGain();
    celloGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    cello.connect(celloFilter);
    celloFilter.connect(celloGain);
    celloGain.connect(this.musicGain);
    cello.start();
    this.activeNodes.push(cello, celloFilter, celloGain);

    const playBoxNote = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = boxScale[noteStep % boxScale.length];
      noteStep++;

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(now);
      osc.stop(now + 1.9);
      this.activeNodes.push(osc, gain);

      const stepDelay = 650 + Math.random() * 200;
      const timerId = window.setTimeout(playBoxNote, stepDelay);
      this.sequenceTimers.push(timerId);
    };

    playBoxNote();
  }

  private startRastroTrevasSynth() {
    if (!this.ctx || !this.musicGain) return;

    const tempo = 135;
    const sixteenthSec = (60 / tempo) / 4;
    const arpNotes = [
      146.83, 220.0, 293.66, 349.23, 440.0, 349.23, 293.66, 220.0,
      130.81, 196.0, 261.63, 329.63, 392.0, 329.63, 261.63, 196.0,
    ];
    let arpIndex = 0;

    const playArpStep = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      const now = this.ctx.currentTime;
      const freq = arpNotes[arpIndex % arpNotes.length];
      arpIndex++;

      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + Math.sin(arpIndex * 0.2) * 600, now);
      filter.Q.setValueAtTime(5, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + sixteenthSec * 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);

      osc.start(now);
      osc.stop(now + sixteenthSec * 2);
      this.activeNodes.push(osc, filter, gain);

      const timerId = window.setTimeout(playArpStep, sixteenthSec * 1000);
      this.sequenceTimers.push(timerId);
    };

    playArpStep();
  }

  private startDraculaSynth() {
    if (!this.ctx || !this.musicGain) return;

    const chords = [
      { notes: [65.41, 98.0, 130.81, 155.56, 196.0], name: 'C minor' }, // C2, G2, C3, Eb3, G3
      { notes: [61.74, 92.5, 123.47, 155.56, 185.0], name: 'B dim/maj7' }, // B1, F#2, B2, Eb3, F#3
      { notes: [58.27, 87.31, 116.54, 146.83, 174.61], name: 'Bb minor' }, // Bb1, F2, Bb2, D3, F3
      { notes: [55.0, 82.41, 110.0, 138.59, 164.81], name: 'A dim' }, // A1, E2, A2, C#3, E3
    ];

    let chordStep = 0;
    const stepDuration = 6.0;

    const masterFilter = this.ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(500, this.ctx.currentTime);
    masterFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);
    masterFilter.connect(this.musicGain);
    this.activeNodes.push(masterFilter);

    const playDraculaCycle = () => {
      if (!this.isPlayingMusic || !this.ctx) return;
      const current = chords[chordStep % chords.length];
      chordStep++;
      const now = this.ctx.currentTime;

      current.notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = idx === 0 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const gain = this.ctx!.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09 / (idx + 1), now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration - 0.2);

        osc.connect(gain);
        gain.connect(masterFilter);
        osc.start(now);
        osc.stop(now + stepDuration);
        this.activeNodes.push(osc, gain);
      });

      if (chordStep % 2 === 0) {
        this.playCathedralBell();
      }

      const timerId = window.setTimeout(playDraculaCycle, (stepDuration - 0.3) * 1000);
      this.sequenceTimers.push(timerId);
    };

    playDraculaCycle();
  }

  // --- SOUND ENGINE SETTINGS & CONTROLS ---

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.audioEl && !this.isMuted) {
      this.audioEl.volume = this.musicVolume;
    }
    if (this.musicGain && this.ctx && !this.isMuted) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.1);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && !this.isMuted) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.1);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.audioEl) {
      this.audioEl.volume = this.isMuted ? 0 : this.musicVolume;
    }
    if (this.ctx) {
      if (this.musicGain) {
        this.musicGain.gain.setTargetAtTime(this.isMuted ? 0 : this.musicVolume, this.ctx.currentTime, 0.05);
      }
      if (this.sfxGain) {
        this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime, 0.05);
      }
    }
    return this.isMuted;
  }

  public getSettings() {
    return {
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      isMuted: this.isMuted,
      isPlayingMusic: this.isPlayingMusic,
      currentTrackId: this.currentTrackId,
      customFileName: this.customAudioFileName,
    };
  }

  // --- GOTHIC SOUND EFFECTS (SFX) ---

  public playCathedralBell() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(196, this.ctx.currentTime);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(392, this.ctx.currentTime);

      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 4.6);
      osc2.stop(now + 4.6);
    } catch {
      // ignore
    }
  }

  public playMarkerChime() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // ignore
    }
  }

  public playCardFlip() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const bufferSize = this.ctx.sampleRate * 0.15;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4 * this.sfxVolume, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start();
    } catch {
      // ignore
    }
  }

  public playRoundStart() {
    this.playCathedralBell();
  }

  public playGavelStrike() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.4);

      gain.gain.setValueAtTime(0.8 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {
      // ignore
    }
  }

  public playEventStinger() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      [220, 261.63, 311.13].forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + idx * 0.08);
        osc.stop(now + 1.3);
      });
    } catch {
      // ignore
    }
  }

  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.05);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }

  public playVictory() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      const notes = [293.66, 369.99, 440.0, 587.33];

      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);

        gain.gain.setValueAtTime(0.3 * this.sfxVolume, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 1.8);

        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 1.9);
      });
    } catch {
      // ignore
    }
  }

  public playFanfare() {
    this.playVictory();
  }

  public playCelebrationFanfare() {
    this.playVictory();
  }

  public playError() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.32);
    } catch {
      // ignore
    }
  }

  public playDramaticSting() {
    this.playEventStinger();
  }
}

export const soundEngine = new GothicSoundEngine();
