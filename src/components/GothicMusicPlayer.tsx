import React, { useState, useEffect, useRef } from 'react';
import { soundEngine, SOUNDTRACK_PLAYLIST, TrackId, SoundtrackTrack } from '../utils/soundEngine';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Upload,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface GothicMusicPlayerProps {
  variant?: 'hero' | 'compact' | 'mini';
  className?: string;
  onOpenSettings?: () => void;
}

export const GothicMusicPlayer: React.FC<GothicMusicPlayerProps> = ({
  variant = 'hero',
  className = '',
  onOpenSettings,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackId, setCurrentTrackId] = useState<TrackId>('rastro_trevas');
  const [volume, setVolume] = useState<number>(0.45);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [customFileName, setCustomFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateFromEngine = () => {
      const s = soundEngine.getSettings();
      setIsPlaying(s.isPlayingMusic);
      setCurrentTrackId(s.currentTrackId);
      setVolume(s.musicVolume);
      setIsMuted(s.isMuted);
      setCustomFileName(s.customFileName || null);
    };

    updateFromEngine();

    const handleTrackEvent = (e: Event) => {
      const customEvt = e as CustomEvent<{ trackId: TrackId; isPlaying: boolean }>;
      if (customEvt.detail) {
        if (customEvt.detail.trackId) setCurrentTrackId(customEvt.detail.trackId);
        if (typeof customEvt.detail.isPlaying === 'boolean') setIsPlaying(customEvt.detail.isPlaying);
      } else {
        updateFromEngine();
      }
    };

    window.addEventListener('gothic_track_changed', handleTrackEvent);
    return () => {
      window.removeEventListener('gothic_track_changed', handleTrackEvent);
    };
  }, []);

  const currentTrack: SoundtrackTrack =
    SOUNDTRACK_PLAYLIST.find((t) => t.id === currentTrackId) || {
      id: 'custom',
      title: customFileName || 'Faixa Personalizada',
      subtitle: 'Áudio Carregado pelo Jogador',
      description: 'Reproduzindo arquivo local importado para esta sessão.',
      genre: 'Personalizado',
      fileSrc: '',
    };

  const handleTogglePlay = () => {
    soundEngine.playClick();
    const playing = soundEngine.toggleMusic(currentTrackId);
    setIsPlaying(playing);
  };

  const handleSelectTrack = (trackId: TrackId) => {
    soundEngine.playClick();
    setCurrentTrackId(trackId);
    soundEngine.playTrack(trackId);
    setIsPlaying(true);
  };

  const handleNext = () => {
    soundEngine.playClick();
    const nextId = soundEngine.nextTrack();
    setCurrentTrackId(nextId);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    soundEngine.playClick();
    const prevId = soundEngine.prevTrack();
    setCurrentTrackId(prevId);
    setIsPlaying(true);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setMusicVolume(newVol);
  };

  const handleToggleMute = () => {
    soundEngine.playClick();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundEngine.playClick();
      const ok = soundEngine.loadCustomAudioFile(file);
      if (ok) {
        setCustomFileName(file.name);
        setCurrentTrackId('custom');
        setIsPlaying(true);
      }
    }
  };

  // 1. MINI VARIANT (for Header in-game)
  if (variant === 'mini') {
    return (
      <div className={`flex items-center gap-1.5 glass-ui px-2.5 py-1.5 rounded-xl border-amber-400/30 text-xs ${className}`}>
        <button
          onClick={handleTogglePlay}
          className={`p-1 rounded-lg ${
            isPlaying ? 'bg-amber-600 text-white animate-pulse' : 'bg-zinc-800 text-amber-300'
          }`}
          title={isPlaying ? 'Pausar Trilha Sonora' : 'Tocar Trilha Sonora'}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>

        <div className="flex flex-col min-w-0 max-w-[120px] sm:max-w-[160px]">
          <span className="font-serif font-bold text-amber-200 truncate text-[11px] leading-tight">
            {currentTrack.title}
          </span>
          <span className="text-[9px] font-mono text-zinc-400 truncate leading-tight">
            {isPlaying ? 'Tocando...' : 'Pausado'}
          </span>
        </div>

        <button
          onClick={handleNext}
          className="p-1 rounded text-zinc-400 hover:text-white"
          title="Próxima Faixa"
        >
          <SkipForward className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // 2. COMPACT VARIANT (for Lobby / Settings)
  if (variant === 'compact') {
    return (
      <div className={`glass-ui p-3.5 rounded-2xl border-amber-400/30 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className={`w-4 h-4 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-xs text-zinc-100">{currentTrack.title}</span>
                {currentTrack.isInitialTheme && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                    Tema Inicial
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 font-serif line-clamp-1">{currentTrack.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg glass-ui hover:border-amber-400/50 text-zinc-300"
              title="Faixa Anterior"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleTogglePlay}
              className={`p-2 rounded-xl border transition-all ${
                isPlaying
                  ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-950'
                  : 'bg-zinc-800 border-white/10 text-amber-300 hover:text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg glass-ui hover:border-amber-400/50 text-zinc-300"
              title="Próxima Faixa"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Track selector buttons */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {SOUNDTRACK_PLAYLIST.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelectTrack(track.id)}
              className={`px-2.5 py-1.5 rounded-xl text-left border text-[11px] font-serif transition-all ${
                currentTrackId === track.id
                  ? 'bg-amber-950/80 border-amber-400 text-amber-100 font-bold ring-1 ring-amber-400/40'
                  : 'glass-ui border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="truncate block">{track.title}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. HERO VARIANT (for Initial Home Screen)
  return (
    <div
      className={`w-full max-w-xl mx-auto glass-ui-dark border border-amber-400/40 card-shadow p-4 sm:p-5 rounded-3xl space-y-3.5 text-zinc-200 relative overflow-hidden ${className}`}
    >
      {/* Background glow ambiance */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top info badge & title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border transition-all ${
              isPlaying
                ? 'bg-amber-600/90 border-amber-400 text-white shadow-lg shadow-amber-950 animate-pulse'
                : 'glass-ui border-amber-400/30 text-amber-400'
            }`}
          >
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">
                TRILHA SONORA GÓTICA
              </span>
              {currentTrack.isInitialTheme && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  SOM DA TELA INICIAL
                </span>
              )}
            </div>
            <h3 className="font-serif font-black text-sm sm:text-base text-amber-100 tracking-wide">
              {currentTrack.title}
            </h3>
          </div>
        </div>

        {/* Equalizer animation when playing */}
        <div className="flex items-center gap-1 self-end sm:self-center">
          {isPlaying ? (
            <div className="flex items-end gap-1 h-5 px-2 py-1 glass-ui rounded-lg border-amber-400/30">
              <div className="w-1 bg-amber-400 rounded-full animate-bounce h-3" />
              <div className="w-1 bg-amber-400 rounded-full animate-bounce h-5" style={{ animationDelay: '0.15s' }} />
              <div className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0.3s' }} />
              <div className="w-1 bg-amber-400 rounded-full animate-bounce h-4" style={{ animationDelay: '0.45s' }} />
              <span className="text-[9px] font-mono text-amber-300 ml-1 font-bold">TOCANDO</span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-zinc-400 glass-ui px-2.5 py-1 rounded-lg border-white/10">
              Clique em Tocar
            </span>
          )}
        </div>
      </div>

      {/* Description & Track Subtitle */}
      <p className="text-xs text-zinc-300 font-serif italic leading-relaxed">
        {currentTrack.description}
      </p>

      {/* Primary Playback Controller */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Play / Next / Prev */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl glass-ui hover:border-amber-400/60 text-zinc-300 hover:text-white transition-all"
            title="Música Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-2xl flex items-center gap-2 font-serif font-bold text-xs uppercase tracking-wider transition-all border shadow-xl ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-white shadow-amber-950'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 border-amber-400/60 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 text-white" />
                <span>Pausar Música</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-amber-200 fill-amber-200" />
                <span>Ouvir "A Luz na Cúpula"</span>
              </>
            )}
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl glass-ui hover:border-amber-400/60 text-zinc-300 hover:text-white transition-all"
            title="Próxima Música"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Mute */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-950/80 border-red-500/50 text-red-300'
                : 'glass-ui border-white/10 text-zinc-300 hover:text-white'
            }`}
            title={isMuted ? 'Desmutar Áudio' : 'Mutar Áudio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <div className="flex items-center gap-1.5 w-24 sm:w-28">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-black/40 rounded-lg"
              title="Volume da Música"
            />
          </div>
        </div>
      </div>

      {/* Track Quick Select Pills (4 songs) */}
      <div className="pt-2 border-t border-white/10 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono uppercase">
          <span>Faixas da Trilha Sonora:</span>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-serif lowercase"
            >
              <Sliders className="w-3 h-3" />
              <span>ajustes de áudio</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SOUNDTRACK_PLAYLIST.map((track) => {
            const isSelected = currentTrackId === track.id;
            return (
              <button
                key={track.id}
                onClick={() => handleSelectTrack(track.id)}
                className={`p-2.5 rounded-2xl border text-left flex items-start justify-between gap-2 transition-all ${
                  isSelected
                    ? 'glass-ui-amber border-amber-400 text-white shadow-md ring-1 ring-amber-400/40 bg-amber-950/60'
                    : 'glass-ui border-white/10 text-zinc-300 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-xs truncate">{track.title}</span>
                    {track.isInitialTheme && (
                      <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Inicial
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 font-sans block truncate">{track.genre}</span>
                </div>
                {isSelected && isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mt-1 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Custom MP3 upload option */}
        <div className="pt-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-xl glass-ui hover:border-amber-400/40 text-[11px] font-serif text-zinc-400 hover:text-amber-200 flex items-center justify-center gap-1.5 transition-all border border-dashed border-white/15"
          >
            <Upload className="w-3 h-3 text-amber-400" />
            <span>
              {customFileName
                ? `Arquivo Carregado: ${customFileName} (clique para trocar)`
                : 'Carregar arquivo de áudio próprio (.mp3 / .wav)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
