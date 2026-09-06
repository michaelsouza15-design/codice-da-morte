import React, { useState, useEffect, useRef } from 'react';
import { soundEngine, TrackId, SOUNDTRACK_PLAYLIST } from '../utils/soundEngine';
import { voiceManager } from '../utils/voiceManager';
import {
  loadVisualSettings,
  applyVisualSettings,
  DEFAULT_VISUAL_SETTINGS,
  VisualSettings,
} from '../utils/visualSettings';
import {
  isUploadsUnlocked,
  unlockUploads,
  lockUploads,
  useUploadSecurity,
} from '../utils/uploadSecurity';
import {
  Volume2,
  VolumeX,
  Music,
  Sliders,
  X,
  Monitor,
  Info,
  LogOut,
  BookOpen,
  Smartphone,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  Flame,
  Shield,
  Check,
  Lock,
  Unlock,
  KeyRound,
  Play,
  Pause,
  Upload,
  FolderUp,
  FileAudio,
  Disc,
  Trash2,
  Sun,
  Mic,
  Palette,
  Eye,
  RotateCcw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInRoom?: boolean;
  onLeaveRoom?: () => void;
  onOpenRules?: () => void;
  onOpenMobileGuide?: () => void;
  allowEvents?: boolean;
  onToggleEvents?: (enabled: boolean) => void;
  allowAbilities?: boolean;
  onToggleAbilities?: (enabled: boolean) => void;
  isHost?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isInRoom = false,
  onLeaveRoom,
  onOpenRules,
  onOpenMobileGuide,
  allowEvents = true,
  onToggleEvents,
  allowAbilities = true,
  onToggleAbilities,
}) => {
  const [activeTab, setActiveTab] = useState<'AUDIO' | 'VISUAL' | 'SEGURANCA' | 'REGRAS_JOGO'>('AUDIO');
  const [musicVol, setMusicVol] = useState<number>(0.45);
  const [sfxVol, setSfxVol] = useState<number>(0.7);
  const [voiceVol, setVoiceVol] = useState<number>(() => voiceManager.getMasterVoiceVolume());
  const [visualSettings, setVisualSettings] = useState<VisualSettings>(() => loadVisualSettings());
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [currentTrackId, setCurrentTrackId] = useState<TrackId>('rastro_trevas');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [confirmLeave, setConfirmLeave] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Native tracks status on server
  const [serverTracks, setServerTracks] = useState<Record<string, boolean>>({});
  const [isUploadingTrack, setIsUploadingTrack] = useState<boolean>(false);

  // Security password state
  const { isUnlocked: isUploadUnlocked, unlock, lock } = useUploadSecurity();
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [securityFeedback, setSecurityFeedback] = useState<string | null>(null);

  const checkTracksStatus = async () => {
    try {
      const res = await fetch('/api/tracks/status');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks) {
          setServerTracks(data.tracks);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    soundEngine.loadTracksFromIndexedDB().then(() => {
      const s = soundEngine.getSettings();
      setMusicVol(s.musicVolume);
      setSfxVol(s.sfxVolume);
      setIsMuted(s.isMuted);
      setIsMusicPlaying(s.isPlayingMusic);
      setCurrentTrackId(s.currentTrackId);
    });

    checkTracksStatus();

    const handleTrackChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ trackId: TrackId; isPlaying: boolean }>;
      if (customEvt.detail) {
        if (customEvt.detail.trackId) setCurrentTrackId(customEvt.detail.trackId);
        if (typeof customEvt.detail.isPlaying === 'boolean') setIsMusicPlaying(customEvt.detail.isPlaying);
      }
    };
    window.addEventListener('gothic_track_changed', handleTrackChange);

    setConfirmLeave(false);

    return () => {
      window.removeEventListener('gothic_track_changed', handleTrackChange);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMusicChange = (val: number) => {
    setMusicVol(val);
    soundEngine.setMusicVolume(val);
  };

  const handleSfxChange = (val: number) => {
    setSfxVol(val);
    soundEngine.setSfxVolume(val);
    soundEngine.playMarkerChime();
  };

  const handleVoiceVolChange = (val: number) => {
    setVoiceVol(val);
    voiceManager.setMasterVoiceVolume(val);
  };

  const handleVisualChange = (partial: Partial<VisualSettings>) => {
    const updated = { ...visualSettings, ...partial };
    setVisualSettings(updated);
    applyVisualSettings(updated);
  };

  const handleResetVisual = () => {
    soundEngine.playClick();
    setVisualSettings(DEFAULT_VISUAL_SETTINGS);
    applyVisualSettings(DEFAULT_VISUAL_SETTINGS);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleMusic = () => {
    const playing = soundEngine.toggleMusic(currentTrackId);
    setIsMusicPlaying(playing);
  };

  const handleSelectTrack = (trackId: TrackId) => {
    soundEngine.playClick();
    setCurrentTrackId(trackId);
    soundEngine.playTrack(trackId);
    setIsMusicPlaying(true);
  };

  const handleUploadSingleTrack = async (trackId: TrackId, file: File) => {
    soundEngine.playClick();
    setIsUploadingTrack(true);
    try {
      const ok = await soundEngine.loadCustomAudioFile(file, trackId);
      if (ok) {
        setUploadMessage(`🎵 Faixa '${file.name}' vinculada com sucesso ao slot ${trackId}!`);
        await checkTracksStatus();
      } else {
        setUploadMessage(`❌ Falha ao processar áudio.`);
      }
    } catch {
      setUploadMessage(`❌ Erro ao vincular áudio.`);
    } finally {
      setIsUploadingTrack(false);
      setTimeout(() => setUploadMessage(null), 4000);
    }
  };

  const handleBatchAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundEngine.playClick();
    setIsUploadingTrack(true);
    try {
      const results = await soundEngine.batchLoadAudioFiles(files);
      const count = Object.values(results).filter(Boolean).length;
      setUploadMessage(`🎵 ${count} de ${files.length} músicas foram vinculadas e salvas para publicação!`);
      await checkTracksStatus();
    } catch {
      setUploadMessage(`❌ Erro no envio do lote de músicas.`);
    } finally {
      setIsUploadingTrack(false);
      setTimeout(() => setUploadMessage(null), 4000);
    }
  };

  const handleToggleFullscreen = () => {
    soundEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // --- SECURITY PASSWORD HANDLER ---
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEngine.playClick();
    const res = unlock(passwordInput);
    if (res.success) {
      soundEngine.playVictory();
      setSecurityFeedback('✅ Acesso concedido! Permissões de administrador ativadas.');
      setPasswordInput('');
    } else {
      soundEngine.playError();
      setSecurityFeedback('❌ Senha incorreta. Tente novamente.');
    }
  };

  const handleLockUploads = () => {
    soundEngine.playClick();
    lock();
    setSecurityFeedback('🔒 Modo de Administrador bloqueado com segurança.');
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          soundEngine.playClick();
          onClose();
        }
      }}
    >
      <div
        id="settings-card"
        className="w-full max-w-lg rounded-3xl border-2 border-[#b88c3a] bg-gradient-to-b from-[#180b06] via-[#100502] to-[#080201] text-[#f7e4ba] p-5 sm:p-6 flex flex-col gap-4 shadow-[0_0_60px_rgba(0,0,0,0.95)] relative overflow-hidden max-h-[92vh]"
      >
        {/* Filigranas douradas nos 4 cantos */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#e5b358] pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#e5b358] pointer-events-none" />

        {/* Top Ornament Bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-800 via-[#e5b358] to-red-800" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#a67c32]/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#241708] border border-[#b88c3a]/50 flex items-center justify-center shadow-inner">
              <Sliders className="w-4 h-4 text-[#e5b358]" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-black text-[#f7e4ba] uppercase tracking-[0.2em]">
                CONFIGURAÇÕES DO JOGO
              </h2>
              <span className="text-[10px] font-mono text-[#c9a75e]">
                CÓDICE DA MORTE • CONTROLES GERAIS
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-[#120c08] border border-[#a67c32]/40 hover:border-[#e5b358] text-[#a89070] hover:text-white transition-all cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (4 Tabs) */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#120c08] rounded-2xl border border-[#a67c32]/40 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('AUDIO');
            }}
            className={`py-2 px-1 rounded-xl text-[9px] sm:text-xs font-serif font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'AUDIO'
                ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] text-[#f7e4ba] shadow border border-[#e5b358]'
                : 'text-[#9c8464] hover:text-[#f7e4ba]'
            }`}
          >
            <Music className="w-3 h-3" />
            <span className="hidden sm:inline">Áudio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('VISUAL');
            }}
            className={`py-2 px-1 rounded-xl text-[9px] sm:text-xs font-serif font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'VISUAL'
                ? 'bg-gradient-to-b from-amber-700 to-amber-950 text-[#f7e4ba] shadow border border-[#e5b358]'
                : 'text-[#9c8464] hover:text-[#f7e4ba]'
            }`}
          >
            <Sun className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Visual</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('SEGURANCA');
            }}
            className={`py-2 px-1 rounded-xl text-[9px] sm:text-xs font-serif font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'SEGURANCA'
                ? isUploadUnlocked
                  ? 'bg-gradient-to-b from-emerald-800 to-emerald-950 text-white shadow border border-emerald-400'
                  : 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] text-[#f7e4ba] shadow border border-[#e5b358]'
                : isUploadUnlocked
                ? 'text-emerald-400 hover:text-emerald-200'
                : 'text-[#9c8464] hover:text-[#f7e4ba]'
            }`}
          >
            {isUploadUnlocked ? <Unlock className="w-3 h-3 text-emerald-300" /> : <Lock className="w-3 h-3" />}
            <span className="hidden sm:inline">Senha</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('REGRAS_JOGO');
            }}
            className={`py-2 px-1 rounded-xl text-[9px] sm:text-xs font-serif font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'REGRAS_JOGO'
                ? 'bg-gradient-to-r from-purple-800 to-purple-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Regras</span>
          </button>
        </div>

        {/* Global Success / Feedback Alert */}
        {uploadMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-400/60 text-emerald-200 text-xs font-serif flex items-center gap-2 animate-fade-in shadow-lg shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{uploadMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar min-h-0">
          {/* ==================================================== */}
          {/* TAB 1: ÁUDIO & MÚSICA */}
          {/* ==================================================== */}
          {activeTab === 'AUDIO' && (
            <div className="space-y-3 animate-fade-in">
              {/* Soundtrack Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl glass-ui border-white/10">
                <div className="flex items-center gap-3">
                  <Music className={`w-5 h-5 ${isMusicPlaying ? 'text-amber-400 animate-pulse' : 'text-zinc-500'}`} />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-zinc-200 block">Trilha Sonora Gótica Sequencial</span>
                    <span className="text-[10px] text-zinc-400">
                      {isMusicPlaying ? 'Auto-avanço de faixas ativo' : 'Música desligada'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToggleMusic}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                    isMusicPlaying
                      ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-950'
                      : 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {isMusicPlaying ? 'LIGADA' : 'DESLIGADA'}
                </button>
              </div>

              {/* Volume Sliders */}
              <div className="space-y-3 p-3.5 rounded-2xl glass-ui border-white/10">
                {/* Music Volume */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Volume da Música
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(musicVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={musicVol}
                    onChange={(e) => handleMusicChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* SFX Volume */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Efeitos Sonoros (SFX)
                    </span>
                    <span className="font-mono text-amber-400 font-bold">{Math.round(sfxVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sfxVol}
                    onChange={(e) => handleSfxChange(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Voice Chat Master Volume */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-blue-400" /> Volume Geral do Chat de Voz
                    </span>
                    <span className="font-mono text-blue-400 font-bold">{Math.round(voiceVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.05"
                    value={voiceVol}
                    onChange={(e) => handleVoiceVolChange(parseFloat(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Mudo (0%)</span>
                    <span>Padrão (100%)</span>
                    <span>Amplificado (150%)</span>
                  </div>
                </div>
              </div>

              {/* Quick Controls: Mute & Fullscreen */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleToggleMute}
                  className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                    isMuted
                      ? 'bg-red-950/80 border-red-500/60 text-red-200'
                      : 'glass-ui border-white/10 hover:bg-white/5 text-zinc-200'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  <span>{isMuted ? 'Áudio Mudo' : 'Silenciar'}</span>
                </button>

                <button
                  onClick={handleToggleFullscreen}
                  className="p-2.5 sm:p-3 rounded-xl glass-ui border border-white/10 hover:bg-white/5 text-zinc-200 flex items-center justify-center gap-2 text-xs font-bold transition-all"
                >
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>{isFullscreen ? 'Janela' : 'Tela Cheia'}</span>
                </button>
              </div>

              {/* ==================================================== */}
              {/* VINCULAR MÚSICAS (ATÉ 5 FAIXAS PARA PUBLICAÇÃO) */}
              {/* ==================================================== */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gradient-to-r from-amber-950/40 via-black to-zinc-950 border border-amber-500/30">
                  <div className="flex items-center gap-2.5">
                    <Disc className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-serif font-black text-amber-200 uppercase tracking-wide">
                        Vincular Músicas da Trilha (Até 5 Músicas)
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-serif">
                        Envie os arquivos MP3 para ficarem vinculados e serem distribuídos na versão publicada.
                      </p>
                    </div>
                  </div>

                  {/* Batch Upload Button */}
                  <label className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs cursor-pointer border border-amber-400/60 shadow-lg shadow-amber-950 transition-all shrink-0">
                    <FolderUp className="w-3.5 h-3.5" />
                    <span>Subir Lote (Até 5)</span>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg"
                      multiple
                      onChange={handleBatchAudioUpload}
                      disabled={isUploadingTrack}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 5 Track Slots List */}
                <div className="space-y-2">
                  {SOUNDTRACK_PLAYLIST.map((track, idx) => {
                    const isSelected = currentTrackId === track.id;
                    const isPlayingThis = isSelected && isMusicPlaying;
                    const isLinkedOnServer = !!serverTracks[track.id];

                    return (
                      <div
                        key={track.id}
                        className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-400 ring-1 ring-amber-400/40'
                            : 'glass-ui border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Play/Preview Button */}
                          <button
                            onClick={() => {
                              if (isSelected && isMusicPlaying) {
                                handleToggleMusic();
                              } else {
                                handleSelectTrack(track.id);
                              }
                            }}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                              isPlayingThis
                                ? 'bg-amber-600 border-amber-300 text-white shadow-md shadow-amber-950 animate-pulse'
                                : 'bg-black/60 border-white/10 text-amber-300 hover:border-amber-400'
                            }`}
                            title={isPlayingThis ? 'Pausar' : `Ouvir ${track.title}`}
                          >
                            {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                          </button>

                          {/* Track Details */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono text-amber-400 font-bold">
                                FAIXA #{idx + 1}
                              </span>
                              <span className="font-serif font-bold text-xs sm:text-sm text-zinc-100 truncate">
                                {track.title}
                              </span>
                              {track.isInitialTheme && (
                                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[9px] font-mono">
                                  Tema Inicial
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-400 font-serif truncate">
                              {track.subtitle} • <span className="italic text-zinc-500">{track.genre}</span>
                            </p>
                          </div>
                        </div>

                        {/* Actions: Status Badge & Upload file */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          {isLinkedOnServer ? (
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono flex items-center gap-1">
                              <Check className="w-3 h-3" /> Vinculada (MP3)
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg bg-zinc-800/80 border border-white/10 text-zinc-400 text-[10px] font-mono">
                              Sintetizador
                            </span>
                          )}

                          <label className="px-2.5 py-1 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-white/20 hover:border-amber-400/60 text-xs font-serif font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                            <Upload className="w-3 h-3 text-amber-400" />
                            <span>Subir MP3</span>
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.ogg"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleUploadSingleTrack(track.id, file);
                              }}
                              disabled={isUploadingTrack}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: VISUAL & LAMPIÃO DA SALA */}
          {/* ==================================================== */}
          {activeTab === 'VISUAL' && (
            <div className="space-y-3.5 animate-fade-in font-serif">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-black to-zinc-950 border border-amber-500/40 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                    Lampião & Atmosfera Gótica
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                  Ajuste a intensidade da luz das velas, o contraste gótico e a tonalidade de papiro antigo em tempo real.
                </p>
              </div>

              {/* Sliders Box */}
              <div className="space-y-3 p-3.5 rounded-2xl glass-ui border-white/10">
                {/* Brightness (Lampião) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" /> Brilho do Lampião
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {Math.round(visualSettings.brightness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.4"
                    step="0.05"
                    value={visualSettings.brightness}
                    onChange={(e) => handleVisualChange({ brightness: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                    <span>Penumbra (60%)</span>
                    <span>Padrão (100%)</span>
                    <span>Luminoso (140%)</span>
                  </div>
                </div>

                {/* Contrast */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-orange-400" /> Contraste Gótico
                    </span>
                    <span className="font-mono text-orange-400 font-bold">
                      {Math.round(visualSettings.contrast * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    value={visualSettings.contrast}
                    onChange={(e) => handleVisualChange({ contrast: parseFloat(e.target.value) })}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                {/* Sepia */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex justify-between text-xs text-zinc-300">
                    <span className="flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-yellow-500" /> Papiro Envelhecido (Sépia)
                    </span>
                    <span className="font-mono text-yellow-400 font-bold">
                      {Math.round(visualSettings.sepia * 200)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.05"
                    value={visualSettings.sepia}
                    onChange={(e) => handleVisualChange({ sepia: parseFloat(e.target.value) })}
                    className="w-full accent-yellow-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">
                  Atmosferas Rápidas
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleVisualChange({ brightness: 1.0, contrast: 1.0, sepia: 0 })}
                    className="p-2.5 rounded-xl border border-amber-500/30 bg-black/60 hover:border-amber-400 text-left transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-amber-200 block">🕯️ Clássica</span>
                    <span className="text-[10px] text-zinc-400 font-sans">Brilho equilibrado original</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVisualChange({ brightness: 0.75, contrast: 1.15, sepia: 0.05 })}
                    className="p-2.5 rounded-xl border border-amber-500/30 bg-black/60 hover:border-amber-400 text-left transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-amber-200 block">🌑 Penumbra</span>
                    <span className="text-[10px] text-zinc-400 font-sans">Misterioso e focado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVisualChange({ brightness: 1.25, contrast: 1.05, sepia: 0 })}
                    className="p-2.5 rounded-xl border border-amber-500/30 bg-black/60 hover:border-amber-400 text-left transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-amber-200 block">💡 Lampião Vivo</span>
                    <span className="text-[10px] text-zinc-400 font-sans">Máxima visibilidade</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVisualChange({ brightness: 0.95, contrast: 1.05, sepia: 0.35 })}
                    className="p-2.5 rounded-xl border border-amber-500/30 bg-black/60 hover:border-amber-400 text-left transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-amber-200 block">📜 Papiro Ancestral</span>
                    <span className="text-[10px] text-zinc-400 font-sans">Aspecto de pergaminho</span>
                  </button>
                </div>
              </div>

              {/* Reset button */}
              <button
                type="button"
                onClick={handleResetVisual}
                className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-white/10 hover:border-amber-400 text-zinc-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Valores Padrão</span>
              </button>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: SEGURANÇA (SENHA PROTEGIDA COM TYPE PASSWORD) */}
          {/* ==================================================== */}
          {activeTab === 'SEGURANCA' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-black to-red-950/60 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                    Acesso de Administrador
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-300 font-serif leading-relaxed">
                  Digite a senha de administrador para autorizar permissões avançadas do sistema. O campo é mascarado por segurança.
                </p>
              </div>

              {/* Status Indicator */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${isUploadUnlocked ? 'bg-emerald-950/40 border-emerald-500/60' : 'bg-black/60 border-amber-500/40'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isUploadUnlocked ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400'}`}>
                    {isUploadUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="font-serif font-bold text-xs sm:text-sm text-white block">
                      Status: {isUploadUnlocked ? 'ADMINISTRADOR ATIVO' : 'BLOQUEADO'}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {isUploadUnlocked
                        ? 'Permissões de administrador concedidas.'
                        : 'Senha necessária para acessar controles restritos.'}
                    </span>
                  </div>
                </div>

                {isUploadUnlocked && (
                  <button
                    type="button"
                    onClick={handleLockUploads}
                    className="px-3 py-1.5 rounded-xl bg-red-900/80 hover:bg-red-800 border border-red-500 text-red-200 text-xs font-serif font-bold uppercase tracking-wider shrink-0 transition-all"
                  >
                    Bloquear
                  </button>
                )}
              </div>

              {/* Password Unlock Form (Guaranteed MASKED type="password") */}
              {!isUploadUnlocked ? (
                <form onSubmit={handleUnlockSubmit} className="p-3.5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <label className="text-xs font-serif font-bold text-amber-200 block">
                    Senha de Administrador:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="current-password"
                      className="flex-1 bg-zinc-900/90 border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-amber-200 font-mono tracking-widest focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!passwordInput.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-serif font-bold text-xs uppercase tracking-wider disabled:opacity-40 transition-all shadow-md shrink-0 flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Desbloquear</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs font-serif flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Acesso concedido com sucesso.</span>
                </div>
              )}

              {/* Feedback Note */}
              {securityFeedback && (
                <div className="p-2.5 rounded-xl bg-black/90 border border-white/10 text-xs font-serif text-amber-200 animate-fade-in">
                  {securityFeedback}
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: OPÇÕES DE SALA (EVENTOS & HABILIDADES) */}
          {/* ==================================================== */}
          {activeTab === 'REGRAS_JOGO' && (
            <div className="space-y-3.5 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-black to-red-950/60 border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <h3 className="font-serif font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                    Módulos e Regras Opcionais
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-300 font-serif leading-relaxed">
                  Configure quais módulos extras de jogo estarão ativos durante as investigações no Códice da Morte.
                </p>
              </div>

              {/* Eventos Toggle */}
              <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-orange-950 border border-orange-500/40 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-serif font-bold text-white block">
                      Eventos Aleatórios da Rodada
                    </span>
                    <span className="text-[10px] text-zinc-400 font-serif">
                      Reviravoltas no início de cada rodada (ex: apagão, testemunho secreto).
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    if (onToggleEvents) onToggleEvents(!allowEvents);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-serif font-black uppercase tracking-wider transition-all border shrink-0 ${
                    allowEvents
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-400 text-white shadow-lg'
                      : 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {allowEvents ? 'ATIVADO' : 'DESATIVADO'}
                </button>
              </div>

              {/* Habilidades Toggle */}
              <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-serif font-bold text-white block">
                      Habilidades Especiais dos Investigadores
                    </span>
                    <span className="text-[10px] text-zinc-400 font-serif">
                      Cada jogador recebe uma carta de poder único de dedução utilizável na partida.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    if (onToggleAbilities) onToggleAbilities(!allowAbilities);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-serif font-black uppercase tracking-wider transition-all border shrink-0 ${
                    allowAbilities
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-600 border-emerald-400 text-white shadow-lg'
                      : 'bg-zinc-800 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {allowAbilities ? 'ATIVADO' : 'DESATIVADO'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Guides & Quick Links */}
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10 font-serif shrink-0">
          {onOpenRules && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenRules();
              }}
              className="p-2.5 rounded-xl glass-ui-amber border-amber-400/40 hover:border-amber-400 text-amber-200 flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>Manual Regras</span>
            </button>
          )}

          {onOpenMobileGuide && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
                onOpenMobileGuide();
              }}
              className="p-2.5 rounded-xl glass-ui border-white/10 hover:border-white/30 text-zinc-200 flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Guia Celular</span>
            </button>
          )}
        </div>

        {/* In-Room Leave Action */}
        {isInRoom && onLeaveRoom && (
          <div className="pt-2 border-t border-white/10 font-serif shrink-0">
            {!confirmLeave ? (
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setConfirmLeave(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl glass-ui-red border-red-500/50 hover:bg-red-900/60 text-red-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>Sair da Sala de Jogo</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl glass-ui-red border-red-500/70 bg-red-950/40 space-y-2.5 animate-scale-up">
                <div className="flex items-center gap-2 text-red-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>Deseja realmente sair e retornar ao menu inicial?</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setConfirmLeave(false)}
                    className="py-1.5 px-3 rounded-xl glass-ui text-zinc-300 text-xs font-bold border border-white/10 hover:border-white/30"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onClose();
                      onLeaveRoom();
                    }}
                    className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold border border-red-400 shadow-md uppercase tracking-wider"
                  >
                    Sim, Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 font-serif shrink-0">
          <span className="flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-amber-400" /> Códice da Morte v2.5
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all uppercase tracking-wider"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
