import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, AlertCircle } from 'lucide-react';

interface WhatsAppAudioPlayerProps {
  audioUrl: string;
  duration?: number;
  isMe?: boolean;
}

export const WhatsAppAudioPlayer: React.FC<WhatsAppAudioPlayerProps> = ({
  audioUrl,
  duration = 0,
  isMe = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [error, setError] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState<number>(duration);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = audioUrl;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setError('Erro ao carregar áudio');
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [audioUrl]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setError(null);
        })
        .catch((err) => {
          console.warn('Playback blocked or failed:', err);
          setError('Toque para permitir áudio');
          setIsPlaying(false);
        });
    }
  };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const speeds = [1.0, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current || totalDuration <= 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = percent * totalDuration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const formatTime = (secs: number) => {
    const s = Math.max(0, Math.floor(secs));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Fixed pseudorandom bar heights to look like a realistic WhatsApp soundwave
  const barHeights = [
    35, 60, 45, 80, 50, 95, 70, 40, 85, 65, 100, 75, 45, 85, 90, 60, 40, 75, 55, 35,
  ];

  return (
    <div
      className={`flex items-center gap-2.5 py-1.5 px-2 rounded-xl select-none ${
        isMe ? 'text-[#f5e7c8]' : 'text-[#e6dfd5]'
      }`}
    >
      {/* Play / Pause Circular Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all shrink-0 active:scale-95 shadow-md ${
          isPlaying
            ? isMe
              ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-black border border-amber-300'
              : 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-black border border-emerald-300'
            : isMe
            ? 'bg-amber-950/80 hover:bg-amber-900 border border-amber-500/60 text-amber-200'
            : 'bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-200'
        }`}
        title={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current translate-x-0.5" />
        )}
      </button>

      {/* Waveform and Timers Container */}
      <div className="flex-1 flex flex-col justify-center min-w-[130px] sm:min-w-[170px] gap-1">
        {/* Clickable Sound Wave Bars */}
        <div
          onClick={handleWaveformClick}
          className="h-6 flex items-center gap-[2.5px] sm:gap-[3px] cursor-pointer py-1 group"
          title="Clique para avançar/retroceder"
        >
          {barHeights.map((h, i) => {
            const barPercent = (i / barHeights.length) * 100;
            const isFilled = progressPercent >= barPercent;

            return (
              <div
                key={i}
                className="flex-1 flex items-center justify-center h-full"
              >
                <div
                  className={`w-full rounded-full transition-colors duration-100 ${
                    isFilled
                      ? isMe
                        ? 'bg-gradient-to-t from-amber-400 to-amber-200'
                        : 'bg-gradient-to-t from-emerald-400 to-emerald-200'
                      : isMe
                      ? 'bg-amber-900/60 group-hover:bg-amber-800/80'
                      : 'bg-zinc-700/60 group-hover:bg-zinc-600/80'
                  }`}
                  style={{ height: `${h}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Timers & Speed indicator */}
        <div className="flex items-center justify-between text-[10px] font-mono leading-none opacity-85">
          <span>{isPlaying ? formatTime(currentTime) : formatTime(totalDuration || duration)}</span>
          <div className="flex items-center gap-1.5">
            {error && (
              <span className="text-red-400 text-[9px] flex items-center gap-0.5">
                <AlertCircle className="w-2.5 h-2.5" /> {error}
              </span>
            )}
            {/* Speed Toggle */}
            <button
              type="button"
              onClick={toggleSpeed}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                playbackRate > 1.0
                  ? isMe
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                  : 'bg-black/30 text-zinc-400 border-white/5 hover:text-white'
              }`}
              title="Velocidade de reprodução"
            >
              {playbackRate}x
            </button>
          </div>
        </div>
      </div>

      <Volume2 className="w-3.5 h-3.5 text-zinc-500 shrink-0 hidden sm:block opacity-60" />
    </div>
  );
};
