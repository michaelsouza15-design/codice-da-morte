import React, { useState, useRef, useEffect } from 'react';
import { RoomState } from '../types/game';
import { CHARACTERS } from '../data/gameData';
import { GothicAvatar } from './GothicAvatar';
import { voiceManager, VoiceParticipant } from '../utils/voiceManager';
import { soundEngine } from '../utils/soundEngine';
import { CrossPlatformAudioRecorder } from '../utils/audioRecorder';
import { WhatsAppAudioPlayer } from './WhatsAppAudioPlayer';
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  ShieldAlert,
  Flame,
  FileText,
  CheckCircle2,
  XCircle,
  Volume2,
  Radio,
  Activity,
  Trash2,
  Check,
  StopCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ChatAndVoiceProps {
  room: RoomState;
  myPlayerId: string;
  onSendMessage: (
    text: string,
    isWhisper?: boolean,
    audioOptions?: { audioUrl?: string; audioDuration?: number; audioMimeType?: string }
  ) => void;
  onOpenAccusationsModal?: () => void;
}

export const ChatAndVoice: React.FC<ChatAndVoiceProps> = ({
  room,
  myPlayerId,
  onSendMessage,
  onOpenAccusationsModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakingLocal, setIsSpeakingLocal] = useState(false);
  const [localVolume, setLocalVolume] = useState(0);
  const [participants, setParticipants] = useState<Map<string, VoiceParticipant>>(new Map());
  const [activeTab, setActiveTab] = useState<'chat' | 'accusations' | 'voice' | 'logs'>('chat');
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const userSentMessageRef = useRef<boolean>(false);

  // WhatsApp-style Voice Note Audio Recording state
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingVolume, setRecordingVolume] = useState(0);
  const [audioErrorNotice, setAudioErrorNotice] = useState<string | null>(null);
  const audioRecorderRef = useRef<CrossPlatformAudioRecorder | null>(null);

  const myPlayer = room.players.find((p) => p.id === myPlayerId);
  const isOracle = myPlayer?.role === 'oraculo';
  const accusations = room.accusationHistory || [];

  // Listen to voiceManager state (Live room voice streaming)
  useEffect(() => {
    setIsMicActive(voiceManager.getIsMicActive());

    const unsubParticipants = voiceManager.onParticipantsChange((updatedMap) => {
      setParticipants(updatedMap);
    });

    const unsubSpeaking = voiceManager.onLocalSpeaking((speaking, vol) => {
      setIsSpeakingLocal(speaking);
      setLocalVolume(vol);
    });

    const unsubMic = voiceManager.onMicStatus((muted) => {
      setIsMicActive(!muted);
    });

    return () => {
      unsubParticipants();
      unsubSpeaking();
      unsubMic();
    };
  }, []);

  const [micNotice, setMicNotice] = useState<string | null>(null);

  const handleToggleMic = async () => {
    soundEngine.playClick();
    if (!isMicActive) {
      const granted = await voiceManager.startMicrophone();
      if (granted) {
        setIsMicActive(true);
        setMicNotice('Microfone de voz da sala ativado! Fale agora para os outros ouvirem.');
        setTimeout(() => setMicNotice(null), 4000);
      } else {
        setMicNotice('Permissão de microfone não concedida ou bloqueada pelo navegador.');
        setTimeout(() => setMicNotice(null), 5000);
      }
    } else {
      voiceManager.mute();
      setIsMicActive(false);
      setMicNotice('Microfone desligado.');
      setTimeout(() => setMicNotice(null), 2500);
    }
  };

  // Safely scroll ONLY the inner chat box without moving the window/page
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollContainerRef.current) {
      const el = chatScrollContainerRef.current;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      if (isNearBottom || userSentMessageRef.current) {
        el.scrollTop = el.scrollHeight;
        userSentMessageRef.current = false;
      }
    }
  }, [room.messages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (isOracle && room.phase === 'INVESTIGACAO') {
      alert('O Oráculo está sob voto de silêncio místico durante a investigação!');
      return;
    }
    userSentMessageRef.current = true;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickChip = (chipText: string) => {
    if (isOracle && room.phase === 'INVESTIGACAO') return;
    userSentMessageRef.current = true;
    onSendMessage(chipText);
  };

  // WhatsApp-style Voice Note Audio Handlers (Works on PC, Android, iPhone Safari)
  const handleStartVoiceNote = async () => {
    soundEngine.playClick();
    if (isOracle && room.phase === 'INVESTIGACAO') {
      alert('O Oráculo está sob voto de silêncio místico durante a investigação!');
      return;
    }

    if (!audioRecorderRef.current) {
      audioRecorderRef.current = new CrossPlatformAudioRecorder();
    }

    setRecordingSeconds(0);
    setRecordingVolume(0);
    setAudioErrorNotice(null);

    const started = await audioRecorderRef.current.start({
      onVolume: (vol) => setRecordingVolume(vol),
      onTime: (sec) => setRecordingSeconds(sec),
    });

    if (started) {
      setIsRecordingVoiceNote(true);
    } else {
      setAudioErrorNotice('Microfone bloqueado. Permita o acesso ao microfone no navegador.');
      setTimeout(() => setAudioErrorNotice(null), 4000);
    }
  };

  const handleCancelVoiceNote = () => {
    soundEngine.playClick();
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancel();
    }
    setIsRecordingVoiceNote(false);
    setRecordingSeconds(0);
    setRecordingVolume(0);
  };

  const handleFinishAndSendVoiceNote = async () => {
    if (!audioRecorderRef.current) return;
    soundEngine.playClick();

    const result = await audioRecorderRef.current.stop();
    setIsRecordingVoiceNote(false);
    setRecordingSeconds(0);
    setRecordingVolume(0);

    if (result && result.base64Url) {
      userSentMessageRef.current = true;
      onSendMessage('', false, {
        audioUrl: result.base64Url,
        audioDuration: result.duration,
        audioMimeType: result.mimeType,
      });
    }
  };

  const formatTimer = (secs: number) => {
    const s = Math.max(0, secs);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div
      id="game-chat-box"
      className="rounded-3xl border-2 border-[#b88c3a] bg-gradient-to-b from-[#180b06] via-[#100502] to-[#080201] shadow-[0_0_40px_rgba(0,0,0,0.85)] flex flex-col h-[480px] overflow-hidden text-[#f7e4ba] relative"
    >
      {/* Filigranas douradas nos cantos superiores */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#e5b358] pointer-events-none" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#e5b358] pointer-events-none" />

      {/* Header Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#a67c32]/40 bg-[#120c08] gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {/* Chat Escrito / Áudio */}
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-b from-[#6e1010] to-[#3a0808] border border-[#e5b358] text-[#f7e4ba] shadow-sm'
                : 'text-[#9c8464] hover:text-[#f7e4ba]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#e5b358]" />
            <span>Chat ({room.messages.length})</span>
          </button>

          {/* Registro de Acusações */}
          <button
            onClick={() => setActiveTab('accusations')}
            className={`flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'accusations'
                ? 'bg-gradient-to-b from-red-950 to-red-900 border border-red-400/80 text-red-200 shadow-sm'
                : 'text-[#9c8464] hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Acusações ({accusations.length})</span>
          </button>

          {/* Canal de Voz ao Vivo */}
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-gradient-to-b from-blue-950 to-blue-900 border border-blue-400/80 text-blue-200 shadow-sm'
                : 'text-[#9c8464] hover:text-zinc-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Voz ao Vivo {isMicActive && '🎙️'}</span>
          </button>

          {/* Logs */}
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 text-xs font-serif font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-gradient-to-b from-amber-950 to-amber-900 border border-amber-400/80 text-amber-200 shadow-sm'
                : 'text-[#9c8464] hover:text-zinc-200'
            }`}
          >
            <span>Logs</span>
          </button>
        </div>

        {/* Quick Voice Mic Toggle Button with live indicator */}
        <button
          type="button"
          onClick={handleToggleMic}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-serif transition-all border shrink-0 ${
            isMicActive
              ? isSpeakingLocal
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40 animate-pulse'
                : 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 shadow-sm'
              : 'bg-black/60 text-zinc-300 border-amber-500/40 hover:text-white hover:border-amber-400'
          }`}
          title={isMicActive ? 'Microfone Ativo (Clique para Desligar / Mutar)' : 'Ligar Microfone ao Vivo'}
        >
          {isMicActive ? (
            <>
              <Mic className={`w-3.5 h-3.5 ${isSpeakingLocal ? 'text-white' : 'text-emerald-400'}`} />
              <span className="text-[10px] font-bold uppercase font-mono tracking-wider">
                {isSpeakingLocal ? 'FALANDO' : 'VOZ ON'}
              </span>
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-amber-300">VOZ AO VIVO</span>
            </>
          )}
        </button>
      </div>

      {/* Main Tab View */}
      <div ref={chatScrollContainerRef} className="flex-1 p-3.5 overflow-y-auto space-y-3">
        {/* TAB 1: CHAT ESCRITO & ÁUDIO WHATSAPP */}
        {activeTab === 'chat' && (
          <div className="space-y-3">
            {room.messages.map((msg) => {
              const isMe = msg.senderId === myPlayerId;
              const senderPlayer = room.players.find((p) => p.id === msg.senderId);
              const senderChar = CHARACTERS.find((c) => c.id === senderPlayer?.characterId);

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 items-start ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <GothicAvatar
                    characterId={senderPlayer?.characterId}
                    avatarSeed={senderChar?.avatarSeed}
                    name={msg.senderName}
                    size="xs"
                  />
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] sm:max-w-[75%] text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-br from-[#3b200b] via-[#241306] to-[#120903] border border-[#d4a033]/60 text-[#f7e4ba] rounded-tr-none shadow-md'
                        : 'bg-[#150d0a] border border-[#a67c32]/30 text-[#e6dfd5] rounded-tl-none shadow'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-serif font-bold text-[11px] text-[#e5b358]">
                        {msg.senderName}
                      </span>
                      <span className="text-[9px] font-mono text-[#9c8464] opacity-80">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Render WhatsApp Audio Player if audio message */}
                    {msg.audioUrl ? (
                      <div className="mt-1">
                        <WhatsAppAudioPlayer
                          audioUrl={msg.audioUrl}
                          duration={msg.audioDuration}
                          isMe={isMe}
                        />
                        {msg.text && msg.text !== '🎵 Nota de voz' && (
                          <p className="mt-1 text-[11px] font-sans opacity-90">{msg.text}</p>
                        )}
                      </div>
                    ) : (
                      <p className="break-words font-sans">{msg.text}</p>
                    )}
                  </div>
                </div>
              );
            })}

            {room.messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-[#9c8464] font-serif">
                <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-[#e5b358]" />
                <p className="text-xs">Nenhuma mensagem ainda no salão.</p>
                <p className="text-[10px] opacity-70">Envie mensagens escritas ou grave áudio estilo WhatsApp abaixo!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ACUSAÇÕES FORMAIS */}
        {activeTab === 'accusations' && (
          <div className="space-y-3">
            {accusations.map((acc, index) => {
              const accUser = room.players.find((p) => p.id === acc.accuserId);
              const targetUser = room.players.find((p) => p.id === acc.targetPlayerId);

              return (
                <div
                  key={index}
                  className={`p-3 rounded-2xl border text-xs font-serif space-y-2 ${
                    acc.isCorrect
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/40 text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold">
                      {acc.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span>
                        {accUser?.name || 'Investigador'} acusou {targetUser?.name || 'Suspeito'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono opacity-75">{acc.timestamp}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-white/5 font-sans">
                    <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30">
                      <div className="text-[9px] font-mono font-bold text-red-300 uppercase flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-400" /> Método
                      </div>
                      <span className="font-bold text-red-100 block truncate">{acc.methodName}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-blue-950/40 border border-blue-500/30">
                      <div className="text-[9px] font-mono font-bold text-blue-300 uppercase flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-400" /> Objeto
                      </div>
                      <span className="font-bold text-blue-100 block truncate">{acc.objectName}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {accusations.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 font-serif">
                <ShieldAlert className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-xs">Nenhuma acusação judicial registrada.</p>
                <p className="text-[10px] opacity-70">Jogadores podem acusar a qualquer momento durante a fase de investigação.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CANAL DE VOZ REAL-TIME */}
        {activeTab === 'voice' && (
          <div className="space-y-3.5">
            <div className="p-4 rounded-2xl bg-[#120805] border border-[#a67c32]/40 text-[#f7e4ba] text-xs font-serif leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-2xl ${
                    isMicActive ? 'bg-emerald-900/60 border border-emerald-400/60' : 'bg-black/40 border border-white/10'
                  }`}
                >
                  <Radio className={`w-5 h-5 ${isMicActive ? 'text-emerald-400 animate-pulse' : 'text-[#e5b358]'}`} />
                </div>
                <div>
                  <span className="font-bold block uppercase tracking-wider text-[#e5b358]">
                    Canal de Áudio em Tempo Real (Cross-Platform)
                  </span>
                  <span className="text-[11px] text-zinc-300">
                    {isMicActive
                      ? isSpeakingLocal
                        ? '🟢 Você está falando agora (todos na sala ouvem)...'
                        : '🎙️ Seu microfone está ativo e transmitindo em tempo real.'
                      : '🔇 Seu microfone está desligado. Clique no botão ao lado para falar com os outros jogadores.'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleToggleMic}
                className={`px-4 py-2 rounded-xl font-serif text-xs font-bold border transition-all active:scale-95 flex items-center gap-2 shrink-0 ${
                  isMicActive
                    ? 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 border-red-400 text-white shadow-md'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border-emerald-300 text-white shadow-md'
                }`}
              >
                {isMicActive ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Silenciar Mic</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Ligar Microfone</span>
                  </>
                )}
              </button>
            </div>

            {/* Local Audio Spectrum Bar */}
            {isMicActive && (
              <div className="p-3 rounded-xl bg-black/60 border border-emerald-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-300 uppercase">Captação da sua voz:</span>
                </div>
                <div className="flex-1 max-w-xs h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-75"
                    style={{ width: `${Math.max(5, localVolume)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Investigadores Conectados ({room.players.length}):
              </span>
              <span className="text-[9px] font-serif text-amber-300/80 italic">
                Compatível com PC, Android & iPhone
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {room.players.map((p) => {
                const char = CHARACTERS.find((c) => c.id === p.characterId);
                const isMe = p.id === myPlayerId;
                const participantData = participants.get(p.id);
                const isSpeaking = isMe ? isSpeakingLocal : Boolean(participantData?.isSpeaking);
                const isMuted = isMe ? !isMicActive : Boolean(participantData?.isMuted);

                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isSpeaking
                        ? 'bg-emerald-950/40 border-emerald-400 shadow-md shadow-emerald-950/80'
                        : isMe
                        ? 'bg-amber-950/30 border-amber-500/30'
                        : 'bg-black/40 border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative">
                        <GothicAvatar
                          characterId={p.characterId}
                          avatarSeed={char?.avatarSeed}
                          name={p.name}
                          size="xs"
                          glow={isSpeaking}
                        />
                        {isSpeaking && (
                          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black animate-ping" />
                        )}
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-serif font-bold text-zinc-200 block truncate flex items-center gap-1">
                          <span>{p.name}</span>
                          {isMe && <span className="text-amber-400 font-mono text-[9px]">(Você)</span>}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-serif block truncate">
                          {p.role === 'oraculo' ? 'Oráculo Sagrado' : char?.title || 'Investigador'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isSpeaking ? (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-[10px] font-mono shadow-sm">
                          <Mic className="w-3 h-3 text-emerald-400 animate-bounce" />
                          <span className="font-bold">FALANDO</span>
                        </div>
                      ) : isMuted ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/5 text-zinc-500 text-[10px] font-mono">
                          <MicOff className="w-3 h-3" />
                          <span>Mudo</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/50 border border-blue-500/30 text-blue-300 text-[10px] font-mono">
                          <Volume2 className="w-3 h-3 text-blue-400" />
                          <span>Ouvindo</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: LOGS / REGISTRO COMPLETO */}
        {activeTab === 'logs' && (
          <div className="space-y-2">
            {room.logs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-zinc-300 flex items-start gap-2.5"
              >
                <span className="text-zinc-500 shrink-0 opacity-75">{log.timestamp}</span>
                <span className="leading-snug">{log.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick deduction chips in Chat Tab */}
      {activeTab === 'chat' && !isOracle && (
        <div className="px-3 py-1.5 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-black/30">
          <button
            type="button"
            onClick={() => handleQuickChip('🔴 Atenção aos marcadores de perigo!')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-serif bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 whitespace-nowrap"
          >
            🔴 Atenção ao perigo
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip('🔍 Examinem as cartas deste suspeito!')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-serif bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 whitespace-nowrap"
          >
            🔍 Examinem as cartas
          </button>
          <button
            type="button"
            onClick={() => handleQuickChip('🔵 Qual objeto encaixa com a pista azul?')}
            className="px-2.5 py-1 rounded-lg text-[10px] font-serif bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 whitespace-nowrap"
          >
            🔵 Dúvida no Objeto
          </button>
        </div>
      )}

      {/* Notice / Feedback Bar */}
      {(micNotice || audioErrorNotice) && (
        <div className="px-3 py-1.5 bg-black/90 border-t border-amber-500/30 flex items-center justify-between text-[11px] font-serif text-amber-200">
          <span className="flex items-center gap-1.5">
            {audioErrorNotice ? (
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
            ) : isMicActive ? (
              <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <MicOff className="w-3.5 h-3.5 text-zinc-400" />
            )}
            {audioErrorNotice || micNotice}
          </span>
          <button
            type="button"
            onClick={() => {
              setMicNotice(null);
              setAudioErrorNotice(null);
            }}
            className="text-zinc-400 hover:text-white text-xs px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* WHATSAPP STYLE AUDIO RECORDING BAR OR TEXT INPUT BAR */}
      <div className="p-2.5 sm:p-3 border-t border-[#a67c32]/40 bg-[#0d0604]">
        {isRecordingVoiceNote ? (
          /* WhatsApp Recording Active Bar */
          <div className="flex items-center justify-between gap-2 p-1 bg-[#1a0f0a] border border-red-500/60 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-fade-in">
            {/* Discard / Trash Button */}
            <button
              type="button"
              onClick={handleCancelVoiceNote}
              className="p-2 rounded-xl bg-red-950 hover:bg-red-900 border border-red-500/40 text-red-300 transition-all active:scale-90 flex items-center gap-1"
              title="Cancelar gravação (Lixeira)"
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-[10px] font-serif uppercase hidden sm:inline">Cancelar</span>
            </button>

            {/* Recording Indicator, Timer & Live Waves */}
            <div className="flex-1 flex items-center justify-center gap-3 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-red-300">
                  {formatTimer(recordingSeconds)}
                </span>
              </div>

              {/* Animated Live Voice Bars */}
              <div className="flex items-center gap-1 h-5 max-w-[140px] sm:max-w-[200px] flex-1">
                {[15, 35, 55, 80, 45, 95, 70, 40, 85, 60, 30].map((baseHeight, idx) => {
                  const dynamicScale = Math.min(100, Math.max(20, baseHeight * (recordingVolume / 40 + 0.3)));
                  return (
                    <div
                      key={idx}
                      className="flex-1 bg-gradient-to-t from-red-600 to-amber-400 rounded-full transition-all duration-75"
                      style={{ height: `${dynamicScale}%` }}
                    />
                  );
                })}
              </div>

              <span className="text-[10px] font-serif text-zinc-400 hidden sm:inline italic">
                Gravando áudio...
              </span>
            </div>

            {/* Send Recorded Audio Button */}
            <button
              type="button"
              onClick={handleFinishAndSendVoiceNote}
              className="p-2 sm:px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 border border-emerald-300 text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
              title="Enviar áudio gravado"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        ) : (
          /* Normal Chat Input Bar with WhatsApp Audio Record Button */
          <form onSubmit={handleSend} className="flex items-center gap-2">
            {/* Microfone ao Vivo Toggle Button */}
            <button
              type="button"
              onClick={handleToggleMic}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all shrink-0 active:scale-95 ${
                isMicActive
                  ? isSpeakingLocal
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-md animate-pulse'
                    : 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                  : 'bg-black/60 border-[#a67c32]/40 text-[#9c8464] hover:text-[#e5b358] hover:border-[#e5b358]'
              }`}
              title={isMicActive ? 'Voz ao Vivo Ativa (Clique para silenciar)' : 'Ligar Transmissão de Voz ao Vivo'}
            >
              {isMicActive ? (
                <Radio className={`w-4 h-4 ${isSpeakingLocal ? 'text-white' : 'text-emerald-400'}`} />
              ) : (
                <MicOff className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isOracle && room.phase === 'INVESTIGACAO'
                  ? 'Oráculo em silêncio sagrado...'
                  : 'Digite uma mensagem ou grave um áudio...'
              }
              disabled={isOracle && room.phase === 'INVESTIGACAO'}
              className="flex-1 bg-black/60 border border-[#a67c32]/40 text-xs text-[#f7e4ba] placeholder-[#9c8464]/80 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#e5b358]"
            />

            {/* If user typed text, show Send button; otherwise show WhatsApp Audio Record Button */}
            {inputText.trim().length > 0 ? (
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-gradient-to-b from-[#8f2b18] to-[#591407] hover:from-[#a6341e] hover:to-[#6d1a0b] border border-[#e5b358]/80 text-[#f7e4ba] transition-all active:scale-95 shadow-md shrink-0"
                title="Enviar Mensagem Escrita"
              >
                <Send className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartVoiceNote}
                disabled={isOracle && room.phase === 'INVESTIGACAO'}
                className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 border border-emerald-400/80 text-white transition-all active:scale-95 shadow-md shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-40"
                title="Gravar Áudio estilo WhatsApp (Clique para gravar e enviar para a sala)"
              >
                <Mic className="w-4 h-4 text-white" />
                <span className="text-[11px] font-serif font-bold uppercase hidden md:inline">Áudio</span>
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
