import React, { useState, useEffect, useRef } from 'react';
import {
  RoomState,
  Player,
  CardMethod,
  CardObject,
  CardEvidence,
  CardEvent,
  CardAbility,
  MarkerColor,
} from '../types/game';
import { CHARACTERS, MARKER_INFOS, METHODS, OBJECTS, EVENTS, ABILITIES } from '../data/gameData';
import { GothicAvatar } from './GothicAvatar';
import { CharacterToken2D } from './CharacterToken2D';
import { QuestionsGuideModal } from './QuestionsGuideModal';
import { AccusationModal } from './AccusationModal';
import { MethodCard, ObjectCard, EvidenceCard, CharacterRoleCard, EventCard, AbilityCard } from './GothicCard';
import { HiddenRightSideMenu } from './HiddenRightSideMenu';
import { GameZoomHUD } from './GameZoomHUD';
import { GameFrame } from './GameFrame';
import gothicHallBg from '../assets/images/gothic_hall_investigation_1788010723428.jpg';
import codiceEmblemaCaveiraImg from '../assets/images/codice_emblema_caveira_1787918811337.jpg';
import { soundEngine } from '../utils/soundEngine';
import {
  Skull,
  Search,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Clock,
  Menu,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
  Eye,
  EyeOff,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flame,
  Home,
  UserCheck,
  Trophy,
  ShoppingCart,
  Paperclip,
  Check,
  PlusCircle,
  Trash2,
  Archive,
  AlertTriangle,
  SkipForward,
  Maximize2,
  Minimize2,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  Radio,
  Lock,
  LockOpen,
} from 'lucide-react';
import { voiceManager } from '../utils/voiceManager';
import { loadProgression, getActiveTableFrame, PlayerProgression } from '../utils/progression';
import { CrossPlatformAudioRecorder } from '../utils/audioRecorder';
import { WhatsAppAudioPlayer } from './WhatsAppAudioPlayer';
import { useDragScroll } from '../utils/useDragScroll';

interface InvestigationRoomViewProps {
  room: RoomState;
  myPlayerId: string;
  isPassAndPlayMode?: boolean;
  onSelectPlayerCard?: (player: Player, cardType: 'method' | 'object', card: CardMethod | CardObject) => void;
  onAccuseClick?: () => void;
  onAccuseSuspect?: (targetPlayer: Player) => void;
  onOpenChat?: () => void;
  onOpenHistory?: () => void;
  onOpenRules?: () => void;
  onOpenSettings?: () => void;
  onOpenMenu?: () => void;
  onAdjustTimer?: (seconds: number) => void;
  onSendMessage?: (
    text: string,
    isWhisper?: boolean,
    audioOptions?: { audioUrl?: string; audioDuration?: number; audioMimeType?: string }
  ) => void;
  onOpenStoryModal?: () => void;
  onOpenLobbyModal?: () => void;
  onOpenShopModal?: () => void;
  onOpenProfileModal?: () => void;
  onAdvanceRound?: () => void;
  onDrawEvidence?: () => void;
  onDiscardEvidence?: (evidenceId: string) => void;
  onOpenDiscarded?: () => void;
  onUseAbility?: (abilityId: string, extraPayload?: any) => void;
}

export const InvestigationRoomView: React.FC<InvestigationRoomViewProps> = ({
  room,
  myPlayerId,
  isPassAndPlayMode = false,
  onSelectPlayerCard,
  onAccuseClick,
  onAccuseSuspect,
  onOpenChat,
  onOpenHistory,
  onOpenRules,
  onOpenSettings,
  onOpenMenu,
  onAdjustTimer,
  onSendMessage,
  onOpenStoryModal,
  onOpenLobbyModal,
  onOpenShopModal,
  onOpenProfileModal,
  onAdvanceRound,
  onDrawEvidence,
  onDiscardEvidence,
  onOpenDiscarded,
  onUseAbility,
}) => {
  // Modal states for Right Floating Buttons
  const [activeFloatingModal, setActiveFloatingModal] = useState<'narrativa' | 'evidencias' | 'chat' | 'cartas' | 'eventos' | 'habilidades' | null>(null);
  const [selectedPlayerForDossier, setSelectedPlayerForDossier] = useState<Player | null>(null);
  const [showQuestionsGuide, setShowQuestionsGuide] = useState<boolean>(false);
  const [zoomedEvidence, setZoomedEvidence] = useState<CardEvidence | null>(null);
  const [zoomedEvent, setZoomedEvent] = useState<CardEvent | null>(null);
  const [zoomedAbility, setZoomedAbility] = useState<CardAbility | null>(null);
  const [zoomedMethod, setZoomedMethod] = useState<CardMethod | null>(null);
  const [zoomedObject, setZoomedObject] = useState<CardObject | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Reusable horizontal drag-to-scroll for suspects carousel
  const { ref: suspectScrollRef, dragHandlers: suspectDragHandlers } = useDragScroll<HTMLDivElement>();

  // Interactive Ability Trigger Modal
  const [abilityTriggerModal, setAbilityTriggerModal] = useState<CardAbility | null>(null);
  const [h02TargetEvidenceId, setH02TargetEvidenceId] = useState<string>('');
  const [h02NewIndex, setH02NewIndex] = useState<number>(0);
  const [h04Card1, setH04Card1] = useState<string>('');
  const [h04Card2, setH04Card2] = useState<string>('');
  const [h06TargetPlayerId, setH06TargetPlayerId] = useState<string>('');
  const [h07Question, setH07Question] = useState<string>('');
  const [h08TargetEvidenceId, setH08TargetEvidenceId] = useState<string>('');
  const [h09TargetEvidenceId, setH09TargetEvidenceId] = useState<string>('');
  const [h11Keywords, setH11Keywords] = useState<string>('');
  const [h12TargetPlayerId, setH12TargetPlayerId] = useState<string>('');

  const handleTriggerAbilityFlow = (ability: CardAbility) => {
    if (myPlayer?.abilityUsed) return;
    if (room.evidencesOnTable?.length) {
      setH02TargetEvidenceId(room.evidencesOnTable[0].id);
      setH09TargetEvidenceId(room.evidencesOnTable[0].id);
    }
    if (room.discardedEvidences?.length) {
      setH08TargetEvidenceId(room.discardedEvidences[0].id);
    }
    const otherPlayers = room.players.filter((p) => p.id !== myPlayerId);
    if (otherPlayers.length > 0) {
      setH06TargetPlayerId(otherPlayers[0].id);
      setH12TargetPlayerId(otherPlayers[0].id);
    }
    setAbilityTriggerModal(ability);
  };

  // Layout states for Mobile/Fullscreen & Players List collapse
  const [isPlayersPanelCollapsed, setIsPlayersPanelCollapsed] = useState<boolean>(false);
  const [isTableFullscreen, setIsTableFullscreen] = useState<boolean>(false);

  // Search terms for Events and Abilities modals
  const [eventSearchTerm, setEventSearchTerm] = useState<string>('');
  const [abilitySearchTerm, setAbilitySearchTerm] = useState<string>('');

  // Evidence Modal filter tabs
  const [evidenceFilter, setEvidenceFilter] = useState<'TODAS' | 'FÍSICAS' | 'DIGITAIS' | 'DEPOIMENTOS'>('TODAS');

  // Chat Modal states
  const [chatTab, setChatTab] = useState<'PUBLICO' | 'SUSSURRO'>('PUBLICO');
  const [chatInputText, setChatInputText] = useState<string>('');

  // Cartas Modal active tab
  const [cardsModalTab, setCardsModalTab] = useState<'PERFIL' | 'CARTAS'>('CARTAS');
  const [suasCartasTab, setSuasCartasTab] = useState<'CRIME' | 'PERSONAGEM'>('CRIME');

  // Narrative chapter index
  const [activeChapterIndex, setActiveChapterIndex] = useState<number>(0);

  const myPlayer = room.players.find((p) => p.id === myPlayerId);
  const isOracle = myPlayer?.role === 'oraculo' || Boolean(isPassAndPlayMode);
  const isKiller = myPlayer?.role === 'assassino';
  const isAccomplice = myPlayer?.role === 'cumplice';
  const isConspirator = isKiller || isAccomplice;
  const canManipulateEvidence = isOracle || (myPlayer as any)?.canManipulateEvidence === true || (myPlayer as any)?.hasEvidencePrivilege === true;

  // Roles & secret crime solution discovery (visible to Oracle)
  const killerPlayer = room.players.find(
    (p) => p.role === 'assassino' || p.id === room.secretSolution?.killerPlayerId
  );
  const accomplicePlayer = room.players.find(
    (p) => p.role === 'cumplice' || room.secretSolution?.accomplicePlayerIds?.includes(p.id)
  );
  const saboteurPlayer = room.players.find(
    (p) => p.role === 'sabotador' || p.id === room.secretSolution?.saboteurPlayerId
  );

  const chosenMethodId = room.secretSolution?.methodId;
  const chosenObjectId = room.secretSolution?.objectId;
  const chosenMethod = killerPlayer?.methods?.find((m) => m.id === chosenMethodId) || METHODS.find((m) => m.id === chosenMethodId);
  const chosenObject = killerPlayer?.objects?.find((o) => o.id === chosenObjectId) || OBJECTS.find((o) => o.id === chosenObjectId);

  // Format countdown
  const timerSecs = room.phaseTimerRemaining ?? 0;
  const minutes = Math.floor(timerSecs / 60);
  const seconds = timerSecs % 60;
  const formattedTimer = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Timer is expired when investigation time runs out (phase is INVESTIGACAO, timer was configured > 0, and seconds reached 0)
  const isTimerConfigured = (room.settings?.discussionTimerSeconds === undefined || room.settings.discussionTimerSeconds > 0);
  const isTimerExpired = room.phase === 'INVESTIGACAO' && isTimerConfigured && timerSecs === 0;
  const maxRounds = room.maxRounds || room.settings?.maxRounds || 3;

  // Oracle Time-Up Notice Modal state
  const [showOracleTimeUpModal, setShowOracleTimeUpModal] = useState<boolean>(false);
  const hasTriggeredTimeUpAlertRef = useRef<boolean>(false);

  useEffect(() => {
    if (isTimerExpired) {
      if (!hasTriggeredTimeUpAlertRef.current) {
        hasTriggeredTimeUpAlertRef.current = true;
        if (isOracle) {
          setShowOracleTimeUpModal(true);
          soundEngine.playDramaticSting();
        }
      }
    } else {
      hasTriggeredTimeUpAlertRef.current = false;
      setShowOracleTimeUpModal(false);
    }
  }, [isTimerExpired, isOracle]);

  // Default player dossier to myPlayer if none selected when opening CARTAS
  const activeDossierPlayer = selectedPlayerForDossier || myPlayer || room.players[0];

  // Story excerpts
  const defaultStory = room.storyNarrative || 
    'Na mansão Velha, o corpo de um colecionador foi encontrado na biblioteca. Nada parece fora do lugar, mas algo não está certo... Os livros ancestrais escondem os vestígios da conspiração fatal.';

  const chapters = [
    {
      title: 'CAPÍTULO 1 • O SUMIÇO NA MANSÃO VELHA',
      text: defaultStory,
    },
    {
      title: 'CAPÍTULO 2 • OS PASSOS NA GALERIA',
      text: 'O relógio de pêndulo soou a meia-noite. As sombras no corredor revelam que alguém se moveu em direção aos arquivos proibidos minutos antes do grito abafado.',
    },
    {
      title: 'CAPÍTULO 3 • AS MARCAS DO PERGAMINHO',
      text: 'Gotas de cera e uma mancha de substância desconhecida foram deixadas sobre a mesa de carvalho. O assassino tentou encobrir seu rastro, mas o Códice preserva a verdade.',
    },
  ];

  // Filtered evidence items for Evidences Modal
  const allEvidences = room.evidencesOnTable.length > 0 ? room.evidencesOnTable : [
    { id: 'E01', title: 'Impressão Digital', subtitle: 'Pistas Dactiloscópicas', options: ['Mesa de Carvalho', 'Cálice de Prata', 'Trinco da Porta', 'Adaga'], category: 'Físico' },
    { id: 'E02', title: 'Mancha de Sangue', subtitle: 'Vestígios Biológicos', options: ['Tapete Persa', 'Punho da Vítima', 'Página do Livro', 'Chão de Pedra'], category: 'Físico' },
    { id: 'E03', title: 'Câmera de Segurança', subtitle: 'Registro Digital', options: ['Corredor Norte', 'Janela dos Fundos', 'Sem Gravação', 'Vulto Mascarado'], category: 'Digital' },
    { id: 'E04', title: 'Bilhete Rasgado', subtitle: 'Documento Escrito', options: ['Ameaça em Latim', 'Cifra Alquímica', 'Hora Marcada', 'Lista de Nomes'], category: 'Depoimento' },
    { id: 'E05', title: 'Fio de Cabelo', subtitle: 'Vestígio Físico', options: ['Fio Escuro', 'Fio Prateado', 'Fio Loiro', 'Fio Ruivo'], category: 'Físico' },
    { id: 'E06', title: 'Luva Descartável', subtitle: 'Indício Forense', options: ['Queimada na Lareira', 'Sob o Sofá', 'Manchada de Tinta', 'Intacta'], category: 'Físico' },
    { id: 'E07', title: 'Pé de Cabra', subtitle: 'Ferramenta Forçada', options: ['Fechadura Violada', 'Gaveta Secreta', 'Janela Quebrada', 'Cofre'], category: 'Físico' },
    { id: 'E08', title: 'Pegadas', subtitle: 'Marcas de Lama', options: ['Botas Pesadas', 'Sapatos Elegantes', 'Passos Descalços', 'Sem Rastro'], category: 'Físico' },
    { id: 'E09', title: 'Gravação de Áudio', subtitle: 'Depoimento Sonoro', options: ['Sussurro Ríspido', 'Passos Rápidos', 'Ruído Metálico', 'Silêncio Súbito'], category: 'Digital' },
    { id: 'E10', title: 'Print de Conversa', subtitle: 'Mensagens Criptografadas', options: ['Última Mensagem', 'Chantagem', 'Código Secreto', 'Confissão'], category: 'Digital' },
    { id: 'E11', title: 'Laudo Forense', subtitle: 'Relatório Médico', options: ['Morte Instantânea', 'Envenenamento Lento', 'Fratura Oculta', 'Indeterminado'], category: 'Depoimento' },
    { id: 'E12', title: 'Relatório Tóxico', subtitle: 'Análise Química', options: ['Veneno Botânico', 'Gás Irritante', 'Substância Rara', 'Sem Toxina'], category: 'Depoimento' },
  ];

  const filteredEvidences = allEvidences.filter((ev) => {
    if (evidenceFilter === 'TODAS') return true;
    if (evidenceFilter === 'FÍSICAS') return ev.category?.toLowerCase().includes('físic') || !ev.category;
    if (evidenceFilter === 'DIGITAIS') return ev.category?.toLowerCase().includes('digit') || ev.title.toLowerCase().includes('câmera') || ev.title.toLowerCase().includes('áudio') || ev.title.toLowerCase().includes('print');
    if (evidenceFilter === 'DEPOIMENTOS') return ev.category?.toLowerCase().includes('depoiment') || ev.title.toLowerCase().includes('bilhete') || ev.title.toLowerCase().includes('laudo') || ev.title.toLowerCase().includes('relatório');
    return true;
  });

  // Handle Send Chat
  const handleSendChatMessage = () => {
    if (!chatInputText.trim()) return;
    soundEngine.playClick();
    if (onSendMessage) {
      onSendMessage(chatInputText, chatTab === 'SUSSURRO');
    }
    setChatInputText('');
  };

  // Voice-to-Text (SpeechRecognition / Ditado por Voz)
  const [isVoiceToTextActive, setIsVoiceToTextActive] = useState(false);
  const [voiceToTextError, setVoiceToTextError] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  const startVoiceToText = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceToTextError('Reconhecimento de fala não suportado neste navegador. Use a gravação de mensagem de voz.');
      setTimeout(() => setVoiceToTextError(null), 5000);
      return;
    }

    if (isRecordingAudioNote) {
      handleCancelAudioNote();
    }

    try {
      soundEngine.playClick();
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      let lastFinalTranscript = '';

      recognition.onstart = () => {
        setIsVoiceToTextActive(true);
        setVoiceToTextError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        if (final && final !== lastFinalTranscript) {
          lastFinalTranscript = final;
          setChatInputText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${final.trim()}` : final.trim();
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceToTextError('Permissão do microfone negada. Permita o microfone no navegador para ditar.');
        } else if (event.error !== 'no-speech') {
          setVoiceToTextError(`Erro no ditado: ${event.error}`);
        }
        setIsVoiceToTextActive(false);
      };

      recognition.onend = () => {
        setIsVoiceToTextActive(false);
      };

      speechRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setVoiceToTextError('Não foi possível iniciar o ditado por voz.');
      setIsVoiceToTextActive(false);
    }
  };

  const stopVoiceToText = () => {
    soundEngine.playClick();
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
    setIsVoiceToTextActive(false);
  };

  const toggleVoiceToText = () => {
    if (isVoiceToTextActive) {
      stopVoiceToText();
    } else {
      startVoiceToText();
    }
  };

  // WhatsApp-style Voice Note Audio Recording (Cross-Platform PC & Mobile)
  const [isRecordingAudioNote, setIsRecordingAudioNote] = useState(false);
  const [audioNoteSeconds, setAudioNoteSeconds] = useState(0);
  const [audioNoteVolume, setAudioNoteVolume] = useState(0);
  const [isHoldingMic, setIsHoldingMic] = useState(false);
  const [isLockedRecording, setIsLockedRecording] = useState(false);
  const [isCancellingBySlide, setIsCancellingBySlide] = useState(false);
  const [slideX, setSlideX] = useState(0);
  const [slideY, setSlideY] = useState(0);

  const audioRecorderRef = useRef<CrossPlatformAudioRecorder | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const holdStartTimeRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const isLockedRef = useRef<boolean>(false);

  const handleHoldStart = async (clientX: number, clientY: number) => {
    if (isRecordingAudioNote && isLockedRef.current) return;

    if (isVoiceToTextActive) {
      stopVoiceToText();
    }

    touchStartPosRef.current = { x: clientX, y: clientY };
    holdStartTimeRef.current = Date.now();
    isHoldingRef.current = true;
    isLockedRef.current = false;
    setIsHoldingMic(true);
    setIsLockedRecording(false);
    setIsCancellingBySlide(false);
    setSlideX(0);
    setSlideY(0);

    soundEngine.playClick();
    if (!audioRecorderRef.current) {
      audioRecorderRef.current = new CrossPlatformAudioRecorder();
    }
    setAudioNoteSeconds(0);
    setAudioNoteVolume(0);

    const started = await audioRecorderRef.current.start({
      onVolume: (v) => setAudioNoteVolume(v),
      onTime: (t) => setAudioNoteSeconds(t),
    });

    if (started) {
      setIsRecordingAudioNote(true);
    } else {
      setIsHoldingMic(false);
      isHoldingRef.current = false;
      setVoiceToTextError('Microfone bloqueado. Permita o acesso ao microfone no navegador.');
      setTimeout(() => setVoiceToTextError(null), 4000);
    }
  };

  const handleHoldMove = (clientX: number, clientY: number) => {
    if (!isHoldingRef.current || isLockedRef.current) return;

    const deltaX = clientX - touchStartPosRef.current.x;
    const deltaY = clientY - touchStartPosRef.current.y;

    setSlideX(deltaX);
    setSlideY(deltaY);

    // Slide up by 50px or more to lock hands-free (WhatsApp style)
    if (deltaY < -50) {
      isLockedRef.current = true;
      setIsLockedRecording(true);
      setIsHoldingMic(false);
      setIsCancellingBySlide(false);
      soundEngine.playClick();
      return;
    }

    // Slide left by 60px or more to cancel (WhatsApp style)
    if (deltaX < -60) {
      setIsCancellingBySlide(true);
    } else {
      setIsCancellingBySlide(false);
    }
  };

  const handleHoldEnd = async () => {
    if (!isHoldingRef.current) return;
    isHoldingRef.current = false;
    setIsHoldingMic(false);

    // If locked hands-free, continue recording until user explicitly hits Send or Cancel
    if (isLockedRef.current) {
      return;
    }

    const duration = Date.now() - holdStartTimeRef.current;

    // Slid to cancel
    if (isCancellingBySlide) {
      handleCancelAudioNote();
      return;
    }

    // Quick tap (< 450ms) locks hands-free so user has time to record comfortably
    if (duration < 450) {
      isLockedRef.current = true;
      setIsLockedRecording(true);
      return;
    }

    // Held for >= 450ms -> Release-to-send (WhatsApp style)
    await handleFinishAndSendAudioNote();
  };

  const handleCancelAudioNote = () => {
    soundEngine.playClick();
    if (audioRecorderRef.current) {
      audioRecorderRef.current.cancel();
    }
    isHoldingRef.current = false;
    isLockedRef.current = false;
    setIsHoldingMic(false);
    setIsLockedRecording(false);
    setIsCancellingBySlide(false);
    setIsRecordingAudioNote(false);
    setAudioNoteSeconds(0);
    setAudioNoteVolume(0);
    setSlideX(0);
    setSlideY(0);
  };

  const handleFinishAndSendAudioNote = async () => {
    if (!audioRecorderRef.current) return;
    soundEngine.playClick();
    const res = await audioRecorderRef.current.stop();
    isHoldingRef.current = false;
    isLockedRef.current = false;
    setIsHoldingMic(false);
    setIsLockedRecording(false);
    setIsCancellingBySlide(false);
    setIsRecordingAudioNote(false);
    setAudioNoteSeconds(0);
    setAudioNoteVolume(0);
    setSlideX(0);
    setSlideY(0);
    if (res && res.base64Url && onSendMessage) {
      onSendMessage('', chatTab === 'SUSSURRO', {
        audioUrl: res.base64Url,
        audioDuration: res.duration,
        audioMimeType: res.mimeType,
      });
    }
  };

  // Global mouse tracking for desktop PC hold-to-record
  useEffect(() => {
    if (!isHoldingMic) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      handleHoldMove(e.clientX, e.clientY);
    };

    const handleWindowMouseUp = () => {
      handleHoldEnd();
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isHoldingMic, isCancellingBySlide]);

  // Clean up recording and recognition on unmount
  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
      }
      if (audioRecorderRef.current) {
        audioRecorderRef.current.cancel();
      }
    };
  }, []);

  // Mobile back button popstate interception to close modals
  useEffect(() => {
    const isAnyModalOpen =
      activeFloatingModal !== null ||
      selectedPlayerForDossier !== null ||
      showQuestionsGuide ||
      zoomedEvidence !== null ||
      zoomedEvent !== null ||
      zoomedAbility !== null ||
      zoomedMethod !== null ||
      zoomedObject !== null ||
      isMobileSidebarOpen;

    if (isAnyModalOpen) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePop = () => {
        if (zoomedMethod) { setZoomedMethod(null); return; }
        if (zoomedObject) { setZoomedObject(null); return; }
        if (zoomedEvidence) { setZoomedEvidence(null); return; }
        if (zoomedEvent) { setZoomedEvent(null); return; }
        if (zoomedAbility) { setZoomedAbility(null); return; }
        if (selectedPlayerForDossier) { setSelectedPlayerForDossier(null); return; }
        if (showQuestionsGuide) { setShowQuestionsGuide(false); return; }
        if (activeFloatingModal) { setActiveFloatingModal(null); return; }
        if (isMobileSidebarOpen) { setIsMobileSidebarOpen(false); return; }
      };
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
    }
  }, [
    activeFloatingModal,
    selectedPlayerForDossier,
    showQuestionsGuide,
    zoomedEvidence,
    zoomedEvent,
    zoomedAbility,
    zoomedMethod,
    zoomedObject,
    isMobileSidebarOpen,
  ]);

  // Real-time Voice Chat state for instant microphone access from investigation stage
  const [isVoiceMicActive, setIsVoiceMicActive] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);

  // Dynamic Table Zoom & Pinch-to-zoom state
  const [tableZoom, setTableZoom] = useState<number>(1);
  const touchDistanceRef = useRef<number | null>(null);

  // Player Progression & Active Table Frame (2D Table Molduras)
  const [progression, setProgression] = useState<PlayerProgression>(() => loadProgression());
  useEffect(() => {
    const handleUpdate = () => {
      setProgression(loadProgression());
    };
    window.addEventListener('codice_progression_updated', handleUpdate);
    return () => window.removeEventListener('codice_progression_updated', handleUpdate);
  }, []);
  const activeTableFrame = getActiveTableFrame(progression);

  // Dedicated Narrative Zoom System (zoom na narrativa)
  const [narrativeZoom, setNarrativeZoom] = useState<number>(1);
  const narrativeTouchDistRef = useRef<number | null>(null);

  const handleNarrativeZoomIn = () => {
    setNarrativeZoom((prev) => Math.min(2.4, +(prev + 0.15).toFixed(2)));
  };

  const handleNarrativeZoomOut = () => {
    setNarrativeZoom((prev) => Math.max(0.7, +(prev - 0.15).toFixed(2)));
  };

  const handleNarrativeZoomReset = () => {
    setNarrativeZoom(1);
  };

  const handleNarrativeWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleNarrativeZoomIn();
      } else {
        handleNarrativeZoomOut();
      }
    }
  };

  const handleNarrativeTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      narrativeTouchDistRef.current = dist;
    }
  };

  const handleNarrativeTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && narrativeTouchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - narrativeTouchDistRef.current;
      if (Math.abs(diff) > 8) {
        if (diff > 0) {
          handleNarrativeZoomIn();
        } else {
          handleNarrativeZoomOut();
        }
        narrativeTouchDistRef.current = dist;
      }
    }
  };

  const handleNarrativeTouchEnd = () => {
    narrativeTouchDistRef.current = null;
  };

  // Dedicated Evidence Inspection Zoom System (zoom ao examinar carta de evidência)
  const [evidenceZoom, setEvidenceZoom] = useState<number>(1);
  const evidenceTouchDistRef = useRef<number | null>(null);

  const handleEvidenceZoomIn = () => {
    setEvidenceZoom((prev) => Math.min(2.8, +(prev + 0.2).toFixed(2)));
  };

  const handleEvidenceZoomOut = () => {
    setEvidenceZoom((prev) => Math.max(0.6, +(prev - 0.2).toFixed(2)));
  };

  const handleEvidenceZoomReset = () => {
    setEvidenceZoom(1);
  };

  const handleEvidenceWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      handleEvidenceZoomIn();
    } else if (e.deltaY > 0) {
      handleEvidenceZoomOut();
    }
  };

  const handleEvidenceTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      evidenceTouchDistRef.current = dist;
    }
  };

  const handleEvidenceTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && evidenceTouchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - evidenceTouchDistRef.current;
      if (Math.abs(diff) > 8) {
        if (diff > 0) {
          handleEvidenceZoomIn();
        } else {
          handleEvidenceZoomOut();
        }
        evidenceTouchDistRef.current = dist;
      }
    }
  };

  const handleEvidenceTouchEnd = () => {
    evidenceTouchDistRef.current = null;
  };

  const handleZoomIn = () => {
    setTableZoom((prev) => Math.min(2.2, +(prev + 0.15).toFixed(2)));
  };

  const handleZoomOut = () => {
    setTableZoom((prev) => Math.max(0.7, +(prev - 0.15).toFixed(2)));
  };

  const handleZoomReset = () => {
    setTableZoom(1);
  };

  // Wheel zoom handler on the table area
  const handleTableWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // Touch pinch-to-zoom handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - touchDistanceRef.current;
      if (Math.abs(diff) > 8) {
        if (diff > 0) {
          handleZoomIn();
        } else {
          handleZoomOut();
        }
        touchDistanceRef.current = dist;
      }
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  useEffect(() => {
    setIsVoiceMicActive(voiceManager.getIsMicActive());
    const unsubSpeaking = voiceManager.onLocalSpeaking((speaking) => {
      setIsVoiceSpeaking(speaking);
    });
    const unsubMic = voiceManager.onMicStatus((muted) => {
      setIsVoiceMicActive(!muted);
    });
    return () => {
      unsubSpeaking();
      unsubMic();
    };
  }, []);

  const handleToggleVoiceMic = async () => {
    if (!isVoiceMicActive) {
      const granted = await voiceManager.startMicrophone();
      if (granted) {
        setIsVoiceMicActive(true);
      } else {
        alert('Permissão de microfone necessária para conversar por voz com os outros jogadores.');
      }
    } else {
      voiceManager.mute();
      setIsVoiceMicActive(false);
    }
  };

  // 4 Methods + 4 Objects for "SUAS CARTAS" bottom section
  const myObjects = myPlayer?.objects?.length ? myPlayer.objects : OBJECTS.slice(0, 4);
  const myMethods = myPlayer?.methods?.length ? myPlayer.methods : METHODS.slice(0, 4);

  return (
    <div
      id="investigation-room-chatgpt-container"
      className="app-container relative w-full flex flex-col bg-transparent text-[#e0d8d0] select-none gothic-floating-layout space-y-3.5"
    >
      {/* ---------------------------------------------------- */}
      {/* 1. ROUND CREST & PHASE BANNER */}
      {/* ---------------------------------------------------- */}
      <div className="relative z-20 py-2.5 px-4 flex flex-col items-center justify-center text-center rounded-2xl bg-black/75 backdrop-blur-xl shadow-lg border border-amber-500/20">
        {/* Round Badge */}
        <div className="flex items-center gap-2 mb-0.5">
          <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-500/50" />
          <div className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 shadow-inner">
            <span className="text-[9px] font-mono font-bold text-amber-300 tracking-[0.2em] uppercase">
              RODADA
            </span>
            <span className="text-xs sm:text-sm font-serif font-black text-amber-100">
              {room.round} / {maxRounds}
            </span>
          </div>
          <div className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-500/50" />
        </div>

        {/* Phase Subtitle */}
        <h2 className="font-serif text-sm sm:text-base font-bold text-amber-200/90 tracking-[0.2em] uppercase drop-shadow">
          FASE DE INVESTIGAÇÃO
        </h2>
        <span className="text-[10px] sm:text-[11px] font-serif italic text-zinc-400">
          Tempo de Discussão e Análise dos Fatos
        </span>

        {/* Live Discussion Countdown & Round Advance Button */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-1.5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/80 border border-amber-500/40 text-amber-300 shadow-lg">
            <Clock className={`w-3.5 h-3.5 ${isTimerExpired ? 'text-red-500 animate-ping' : 'text-amber-400 animate-pulse'}`} />
            <span className={`text-xs sm:text-sm font-mono font-bold tracking-widest ${isTimerExpired ? 'text-red-400 font-black' : ''}`}>
              {formattedTimer}
            </span>
          </div>

          {/* Quick Voice Mic Toggle Button in Stage */}
          <button
            onClick={handleToggleVoiceMic}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-serif text-xs font-bold transition-all border active:scale-95 shadow-md ${
              isVoiceMicActive
                ? isVoiceSpeaking
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/40 animate-pulse'
                  : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                : 'bg-black/60 text-zinc-400 hover:text-zinc-200 border-white/10 hover:border-amber-400/40'
            }`}
            title={isVoiceMicActive ? 'Microfone de Voz Ativo (Clique para Mutar)' : 'Ligar Microfone de Voz'}
          >
            {isVoiceMicActive ? (
              <>
                <Mic className={`w-3.5 h-3.5 ${isVoiceSpeaking ? 'text-white' : 'text-emerald-400'}`} />
                <span className="text-[10px] font-mono uppercase tracking-wider">
                  {isVoiceSpeaking ? 'Falando' : 'Voz On'}
                </span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[10px] font-mono uppercase tracking-wider">Ligar Mic</span>
              </>
            )}
          </button>

          {/* Quick Oracle-Only Timer Adjusters */}
          {onAdjustTimer && isOracle && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAdjustTimer(-30);
                }}
                className="px-2 py-1 rounded-lg bg-red-950/80 hover:bg-red-800 text-red-200 border border-red-500/40 text-[10px] font-mono font-bold transition-all active:scale-95 shadow"
                title="Menos 30 segundos (Exclusivo do Oráculo)"
              >
                -30s
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAdjustTimer(30);
                }}
                className="px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/40 text-[10px] font-mono font-bold transition-all active:scale-95 shadow"
                title="Mais 30 segundos (Exclusivo do Oráculo)"
              >
                +30s
              </button>
            </div>
          )}

          {/* PASSAR PARA A PRÓXIMA RODADA Button (Strictly Oracle only interactive) */}
          {onAdvanceRound && (
            isOracle ? (
              <button
                onClick={() => {
                  soundEngine.playRoundStart();
                  onAdvanceRound();
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-serif text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 border ${
                  isTimerExpired
                    ? 'bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-black border-amber-300 shadow-amber-500/40 animate-pulse font-black ring-2 ring-amber-400/80'
                    : 'bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 border-amber-400 text-white font-bold'
                }`}
                title={room.round < maxRounds ? `Avançar para Rodada ${room.round + 1}` : 'Encerrar Investigação / Revelação Final'}
              >
                <SkipForward className="w-3.5 h-3.5 text-amber-200" />
                <span>
                  {room.round < maxRounds ? `PASSAR P/ RODADA ${room.round + 1}` : 'ENCERRAR RODADAS'}
                </span>
              </button>
            ) : (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-zinc-400 text-[11px] font-serif cursor-not-allowed shadow-inner"
                title="Apenas o Oráculo pode alterar o tempo e avançar para a próxima rodada."
              >
                <Eye className="w-3 h-3 text-purple-400 shrink-0" />
                <span>Aguardando Oráculo avançar</span>
              </div>
            )
          )}
        </div>

        {/* PROMINENT TIMER EXPIRED ALERT BANNER */}
        {isTimerExpired && onAdvanceRound && (
          <div className="mt-2 w-full max-w-xl p-3 rounded-2xl bg-gradient-to-r from-red-950 via-black to-red-950 border-2 border-red-500/90 shadow-[0_0_25px_rgba(239,68,68,0.45)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5 text-left min-w-0">
              <div className="w-9 h-9 rounded-xl bg-red-900/80 border border-red-400 flex items-center justify-center shrink-0 shadow">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-serif font-black text-amber-300 uppercase tracking-wider">
                    TEMPO DE DISCUSSÃO ESGOTADO!
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-red-900/60 border border-red-400/50 text-red-200">
                    Rodada {room.round}/{maxRounds}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-300 font-serif block leading-snug">
                  {isOracle
                    ? 'Atenção Oráculo: o tempo acabou! Você precisa passar para a próxima rodada para atualizar o Códice.'
                    : 'O tempo da rodada acabou! Aguarde o Oráculo avançar a rodada para continuar a investigação.'}
                </span>
              </div>
            </div>
            {isOracle ? (
              <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setShowOracleTimeUpModal(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-black/80 hover:bg-zinc-800 text-amber-300 border border-amber-500/60 font-serif text-[11px] font-bold transition-all active:scale-95"
                  title="Abrir aviso completo do Oráculo"
                >
                  Ver Mensagem
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playRoundStart();
                    onAdvanceRound();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-serif font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center gap-1.5 border border-amber-300 ring-2 ring-amber-400/70 animate-bounce"
                >
                  <SkipForward className="w-4 h-4 text-black" />
                  <span>{room.round < maxRounds ? `PASSAR P/ RODADA ${room.round + 1}` : 'ENCERRAR RODADAS'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 text-xs font-serif shrink-0">
                <Eye className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Aguardando Oráculo...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* INTEL BAR - SECRET CRIME TRUTH (ORACLE, ASSASSIN & ACCOMPLICE) */}
      {/* ---------------------------------------------------- */}
      {Boolean(room.secretSolution && (isOracle || isConspirator)) && (
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 mb-3">
          <div className="p-2 sm:p-3 rounded-2xl bg-gradient-to-r from-red-950/85 via-black/90 to-purple-950/85 border-2 border-amber-500/60 shadow-[0_0_24px_rgba(245,158,11,0.25)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 backdrop-blur-md">
            {/* Left: Role identification badges */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/95 border border-purple-400/70 shadow">
                <Eye className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-mono font-black text-purple-200 uppercase tracking-wider">
                  {isOracle
                    ? 'VISÃO DO ORÁCULO'
                    : isAccomplice
                    ? 'PACTO DAS SOMBRAS • CÚMPLICE'
                    : 'CRIME FORJADO • ASSASSINO'}
                </span>
              </div>

              {/* Assassino */}
              {killerPlayer && (isOracle || isAccomplice) ? (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setSelectedPlayerForDossier(killerPlayer);
                    setCardsModalTab('CARTAS');
                    setActiveFloatingModal('cartas');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] transition-all active:scale-95 group"
                  title="Clique para abrir as cartas do Assassino"
                >
                  <span className="text-[10px] font-serif text-red-300 font-bold">
                    {isAccomplice ? 'Assassino (Parceiro):' : 'Assassino:'}
                  </span>
                  <span className="text-xs font-serif font-black text-white group-hover:text-amber-200 flex items-center gap-1">
                    <span className="text-sm">🔪</span>
                    <span className="underline">{killerPlayer.name}</span>
                  </span>
                </button>
              ) : null}

              {/* Cúmplice */}
              {accomplicePlayer && (isOracle || isKiller) && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setSelectedPlayerForDossier(accomplicePlayer);
                    setCardsModalTab('CARTAS');
                    setActiveFloatingModal('cartas');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-950/90 hover:bg-violet-900 border border-violet-500/80 shadow-[0_0_10px_rgba(139,92,246,0.35)] transition-all active:scale-95 group"
                  title="Clique para abrir as cartas do Cúmplice"
                >
                  <span className="text-[10px] font-serif text-violet-300 font-bold">
                    {isKiller ? 'Seu Cúmplice:' : 'Cúmplice:'}
                  </span>
                  <span className="text-xs font-serif font-black text-violet-100 group-hover:text-amber-200 flex items-center gap-1">
                    <span className="text-sm">👁️</span>
                    <span className="underline">{accomplicePlayer.name}</span>
                  </span>
                </button>
              )}

              {/* Sabotador */}
              {saboteurPlayer && isOracle && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setSelectedPlayerForDossier(saboteurPlayer);
                    setCardsModalTab('CARTAS');
                    setActiveFloatingModal('cartas');
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/90 hover:bg-amber-900 border border-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.35)] transition-all active:scale-95 group"
                  title="Clique para abrir as cartas do Sabotador"
                >
                  <span className="text-[10px] font-serif text-amber-300 font-bold">Sabotador:</span>
                  <span className="text-xs font-serif font-black text-amber-100 group-hover:text-amber-200 flex items-center gap-1">
                    <span className="text-sm">💣</span>
                    <span className="underline">{saboteurPlayer.name}</span>
                  </span>
                </button>
              )}
            </div>

            {/* Right: Chosen Crime Cards */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider hidden sm:inline">
                Cartas Escolhidas:
              </span>

              {/* Método */}
              {chosenMethod && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setZoomedMethod(chosenMethod);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/90 hover:bg-red-950/90 border-2 border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.55)] transition-all active:scale-95 group"
                  title="Clique para inspecionar o Método escolhido pelo assassino"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-red-300">Método:</span>
                  <span className="text-xs font-serif font-black text-amber-200 group-hover:text-white underline">
                    {chosenMethod.name}
                  </span>
                </button>
              )}

              {/* Objeto */}
              {chosenObject && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setZoomedObject(chosenObject);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/90 hover:bg-amber-950/90 border-2 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.55)] transition-all active:scale-95 group"
                  title="Clique para inspecionar o Objeto escolhido pelo assassino"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-amber-300">Objeto:</span>
                  <span className="text-xs font-serif font-black text-amber-200 group-hover:text-white underline">
                    {chosenObject.name}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. MAIN INVESTIGATION STAGE (LEFT PLAYERS + CENTER 2D HALL + RIGHT FLOATING BUTTONS) */}
      {/* ---------------------------------------------------- */}
      <GameFrame
        variant="screen"
        className="relative w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 bg-black/75 backdrop-blur-xl border border-amber-900/30"
        contentClassName="flex-col lg:flex-row min-h-[460px] sm:min-h-[520px] p-0"
        padding="p-0"
      >
        {/* LEFT PANEL: MINI SUSPECTS LIST (COLLAPSIBLE / MINIMIZABLE) */}
        <aside
          className={`transition-all duration-300 shrink-0 bg-gradient-to-b from-[#120804]/95 via-[#0b0402]/95 to-[#080201]/95 border-r border-amber-900/30 flex flex-col justify-between z-20 ${
            isPlayersPanelCollapsed
              ? 'w-full lg:w-48 p-2 h-auto lg:h-full'
              : 'w-full lg:w-56 xl:w-64 p-3 h-[180px] sm:h-[220px] lg:h-full'
          }`}
        >
          <div>
            {/* Header: count + Collapse/Expand Toggle Button */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20 text-xs font-serif font-bold text-amber-300">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-mono text-xs font-bold text-amber-300">
                  {room.players.length} / {room.settings?.maxPlayers || 12}
                </span>
                <span className="text-[10px] text-zinc-400 font-serif hidden sm:inline">Jogadores</span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsPlayersPanelCollapsed(!isPlayersPanelCollapsed);
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 hover:bg-amber-950/80 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-[10px] font-mono transition-all active:scale-95"
                title={isPlayersPanelCollapsed ? 'Expandir lista de jogadores' : 'Recolher/Ocultar lista de jogadores'}
              >
                {isPlayersPanelCollapsed ? (
                  <>
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>Expandir</span>
                    <ChevronDown className="w-3 h-3 text-amber-400" />
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-zinc-400" />
                    <span>Recolher</span>
                    <ChevronUp className="w-3 h-3 text-zinc-400" />
                  </>
                )}
              </button>
            </div>

            {/* Collapsed State Summary */}
            {isPlayersPanelCollapsed ? (
              <div className="py-1 px-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                <span className="text-[10px] font-serif text-zinc-400 italic">
                  Lista recolhida ({room.players.length} jogadores)
                </span>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsPlayersPanelCollapsed(false);
                  }}
                  className="text-[10px] font-mono text-amber-300 underline hover:text-amber-200"
                >
                  Ver todos
                </button>
              </div>
              /* Players List */
              <div className="space-y-1.5 max-h-[110px] sm:max-h-[150px] lg:max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {room.players.map((player, idx) => {
                  const char = CHARACTERS.find((c) => c.id === player.characterId);
                  const isMe = player.id === myPlayerId;
                  const numStr = String(idx + 1).padStart(2, '0');

                  const isThisPlayerOracle = player.role === 'oraculo';
                  const isThisPlayerKiller = player.role === 'assassino' || player.id === room.secretSolution?.killerPlayerId;
                  const isThisPlayerAccomplice = player.role === 'cumplice' || room.secretSolution?.accomplicePlayerIds?.includes(player.id);
                  const isThisPlayerSaboteur = player.role === 'sabotador' || player.id === room.secretSolution?.saboteurPlayerId;

                  let displayRoleName = 'Suspeito';
                  let roleTextColor = 'text-zinc-400';
                  let dotColor = 'bg-amber-500/50 shadow-[0_0_6px_rgba(245,158,11,0.2)]';
                  let cardBorderBg = 'bg-black/40 border-white/5 hover:border-amber-500/40 hover:bg-black/60';

                  if (isMe) {
                    cardBorderBg = 'bg-amber-950/40 border-amber-500/50 hover:border-amber-400';
                    if (player.role === 'oraculo') {
                      displayRoleName = 'Oráculo (Você)';
                      roleTextColor = 'text-purple-400 font-bold';
                      dotColor = 'bg-purple-500 shadow-[0_0_8px_#a855f7]';
                    } else if (player.role === 'assassino') {
                      displayRoleName = 'Assassino (Você)';
                      roleTextColor = 'text-red-400 font-bold';
                      dotColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
                    } else if (player.role === 'cumplice') {
                      displayRoleName = 'Cúmplice (Você)';
                      roleTextColor = 'text-violet-400 font-bold';
                      dotColor = 'bg-violet-500 shadow-[0_0_8px_#8b5cf6]';
                    } else if (player.role === 'sabotador') {
                      displayRoleName = 'Sabotador (Você)';
                      roleTextColor = 'text-amber-400 font-bold';
                      dotColor = 'bg-amber-500 shadow-[0_0_8px_#f59e0b]';
                    } else {
                      displayRoleName = `${char?.roleTag || 'Investigador'} (Você)`;
                      roleTextColor = 'text-emerald-400';
                      dotColor = 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
                    }
                  } else if (isThisPlayerOracle) {
                    displayRoleName = 'Oráculo';
                    roleTextColor = 'text-purple-400 font-bold';
                    dotColor = 'bg-purple-500 shadow-[0_0_8px_#a855f7]';
                  } else if (isOracle) {
                    // ORACLE SEES WHO IS ASSASSINO, CUMPLICE, AND SABOTADOR!
                    if (isThisPlayerKiller) {
                      displayRoleName = '🔪 ASSASSINO';
                      roleTextColor = 'text-red-400 font-black tracking-wide drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]';
                      dotColor = 'bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse';
                      cardBorderBg = 'bg-red-950/40 border-red-500/70 hover:border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.35)] ring-1 ring-red-500/40';
                    } else if (isThisPlayerAccomplice) {
                      displayRoleName = '👁️ CÚMPLICE';
                      roleTextColor = 'text-violet-400 font-black tracking-wide drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]';
                      dotColor = 'bg-violet-500 shadow-[0_0_10px_#8b5cf6]';
                      cardBorderBg = 'bg-violet-950/40 border-violet-500/70 hover:border-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.3)] ring-1 ring-violet-500/40';
                    } else if (isThisPlayerSaboteur) {
                      displayRoleName = '💣 SABOTADOR';
                      roleTextColor = 'text-amber-400 font-black tracking-wide drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]';
                      dotColor = 'bg-amber-500 shadow-[0_0_10px_#f59e0b]';
                      cardBorderBg = 'bg-amber-950/40 border-amber-500/70 hover:border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/40';
                    } else {
                      displayRoleName = 'Investigador (Inocente)';
                      roleTextColor = 'text-zinc-400';
                      dotColor = 'bg-emerald-500/40 shadow-[0_0_4px_rgba(16,185,129,0.2)]';
                    }
                  } else if (myPlayer?.role === 'assassino' && isThisPlayerAccomplice) {
                    displayRoleName = '👁️ Cúmplice';
                    roleTextColor = 'text-violet-400 font-bold';
                    dotColor = 'bg-violet-500 shadow-[0_0_8px_#8b5cf6]';
                    cardBorderBg = 'bg-violet-950/30 border-violet-500/40';
                  } else if (myPlayer?.role === 'cumplice' && isThisPlayerKiller) {
                    displayRoleName = '🔪 Assassino';
                    roleTextColor = 'text-red-400 font-bold';
                    dotColor = 'bg-red-500 shadow-[0_0_8px_#ef4444]';
                    cardBorderBg = 'bg-red-950/30 border-red-500/40';
                  }

                  return (
                    <div
                      key={player.id}
                      onClick={() => {
                        soundEngine.playCardFlip();
                        setSelectedPlayerForDossier(player);
                        setCardsModalTab('CARTAS');
                        setActiveFloatingModal('cartas');
                      }}
                      className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer group ${cardBorderBg}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GothicAvatar
                          characterId={player.characterId}
                          avatarSeed={char?.avatarSeed}
                          name={player.name}
                          size="xs"
                          glow={isMe}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            {idx === 0 && <span className="text-[10px] text-amber-400">👑</span>}
                            <span className="text-xs font-serif font-bold text-zinc-200 truncate group-hover:text-amber-200">
                              {player.name}
                            </span>
                          </div>
                          <span className={`text-[10px] font-serif block truncate ${roleTextColor}`}>
                            {displayRoleName}
                          </span>
                        </div>
                      </div>

                      {/* Colored Status Dot */}
                      <div className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* VER PERGUNTAS Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowQuestionsGuide(true);
            }}
            className="mt-2 w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-950/80 to-[#1e0d05] hover:from-amber-900 hover:to-[#2e1509] border border-amber-500/40 text-amber-200 text-[11px] font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md group"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
            <span>VER PERGUNTAS</span>
          </button>
        </aside>

        {/* CENTER 2D GOTHIC HALL STAGE */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] flex flex-col justify-between overflow-hidden">
          {/* Gothic Hall Ambient Background */}
          <div className="absolute inset-0 z-0">
            <img
              src={gothicHallBg}
              alt="Gothic Investigation Hall"
              className="w-full h-full object-cover object-center opacity-85"
              referrerPolicy="no-referrer"
            />
            {/* Cinematic Vignette & Shadow Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070302] via-transparent to-[#0a0402]/60 pointer-events-none" />
            <div className="absolute inset-0 bg-radial from-transparent via-[#070302]/30 to-[#070302]/85 pointer-events-none" />

            {/* Active 2D Table Frame Ambient Tint Overlay */}
            {activeTableFrame && activeTableFrame.previewGradient && (
              <div className={`absolute inset-0 bg-gradient-to-b ${activeTableFrame.previewGradient} opacity-25 pointer-events-none`} />
            )}

            {/* Table Frame Ornate Decorative Corners */}
            {activeTableFrame && (
              <>
                <div
                  className={`absolute top-2 left-2 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 ${activeTableFrame.cornerAccent} pointer-events-none drop-shadow`}
                  style={{ borderColor: activeTableFrame.borderColor }}
                />
                <div
                  className={`absolute top-2 right-2 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 ${activeTableFrame.cornerAccent} pointer-events-none drop-shadow`}
                  style={{ borderColor: activeTableFrame.borderColor }}
                />
                <div
                  className={`absolute bottom-2 left-2 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 ${activeTableFrame.cornerAccent} pointer-events-none drop-shadow`}
                  style={{ borderColor: activeTableFrame.borderColor }}
                />
                <div
                  className={`absolute bottom-2 right-2 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 ${activeTableFrame.cornerAccent} pointer-events-none drop-shadow`}
                  style={{ borderColor: activeTableFrame.borderColor }}
                />
              </>
            )}
          </div>

          {/* TOP STAGE CONTROLS BAR (MENU 2D, TELA CHEIA & OCULTAR JOGADORES TOGGLES) */}
          <div className="relative z-20 px-2 sm:px-4 pt-2 flex items-center justify-between gap-2 pointer-events-auto">
            {/* Left: Quick Menu & Toggle Players */}
            <div className="flex items-center gap-1.5">
              {onOpenMenu && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenMenu();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-700/80 to-[#240e06] hover:from-amber-600 hover:to-[#38160a] border border-amber-400/60 text-amber-100 text-[10px] font-serif font-black tracking-wider uppercase shadow-md transition-all active:scale-95 backdrop-blur-xs"
                  title="Abrir Menu Principal (2D)"
                >
                  <Menu className="w-3.5 h-3.5 text-amber-300" />
                  <span>MENU</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsPlayersPanelCollapsed(!isPlayersPanelCollapsed);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/75 hover:bg-amber-950/80 border border-amber-500/40 hover:border-amber-400 text-amber-200 text-[10px] font-serif font-bold tracking-wider shadow-md transition-all active:scale-95 backdrop-blur-xs"
                title={isPlayersPanelCollapsed ? 'Mostrar lista de jogadores' : 'Recolher/Minimizar lista de jogadores'}
              >
                {isPlayersPanelCollapsed ? (
                  <>
                    <Users className="w-3 h-3 text-amber-400" />
                    <span className="hidden sm:inline">Mostrar Jogadores</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-zinc-400" />
                    <span className="hidden sm:inline">Recolher Jogadores</span>
                  </>
                )}
              </button>
            </div>

            {/* Center: Global & Table Zoom Controls */}
            <div className="flex items-center gap-1.5">
              <GameZoomHUD />
            </div>

            {/* Right: Fullscreen 2D Table Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsTableFullscreen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-900/90 to-[#2e1509] hover:from-amber-800 hover:to-[#451f0d] border border-amber-400/60 text-amber-100 text-[10px] font-serif font-black tracking-wider uppercase shadow-lg transition-all active:scale-95 backdrop-blur-xs group"
              title="Abrir Mesa 2D em Modo Tela Cheia"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">TELA CHEIA</span>
            </button>
          </div>

          {/* Active Ability Notification on Table */}
          {room.activeAbility && (
            <div className="relative z-15 mx-2 sm:mx-4 my-1 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 via-black to-teal-950/90 border border-emerald-500/70 shadow-lg flex items-center justify-between gap-2 animate-fade-in">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                      HABILIDADE ATIVA: {room.activeAbility.ability.name}
                    </span>
                    <span className="text-[8.5px] font-mono text-emerald-300/70 hidden sm:inline">
                      ({room.activeAbility.userName})
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-300 font-serif truncate">
                    {room.activeAbility.ability.description}
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-mono text-[10px] font-bold shrink-0">
                {room.activeAbility.remainingSeconds ? `${room.activeAbility.remainingSeconds}s` : 'Ativa'}
              </span>
            </div>
          )}

          {/* DYNAMIC 2D Bonequinhos Circular Tokens positioned in the room with Zoom & Pinch-to-Zoom */}
          <div
            onWheel={handleTableWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="relative z-10 w-full flex-1 py-2 sm:py-4 px-2 sm:px-4 flex flex-col justify-around gap-2 sm:gap-3 overflow-y-auto overflow-x-hidden no-scrollbar max-h-[500px]"
          >
            <div
              style={{
                transform: `scale(${tableZoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.12s ease-out',
              }}
              className="w-full flex flex-col justify-around gap-2 sm:gap-3"
            >
              {(() => {
                const players = room.players;
                const total = players.length;

                // Split dynamically into rows where characters inside each row are ALWAYS side-by-side horizontally
                let rows: Player[][] = [];
                if (total <= 4) {
                  rows = [players];
                } else if (total <= 8) {
                  const mid = Math.ceil(total / 2);
                  rows = [players.slice(0, mid), players.slice(mid)];
                } else {
                  // 9-12 players: 3 balanced rows
                  const r1 = Math.ceil(total / 3);
                  const r2 = Math.ceil((total - r1) / 2);
                  rows = [
                    players.slice(0, r1),
                    players.slice(r1, r1 + r2),
                    players.slice(r1 + r2),
                  ];
                }

                return rows.map((rowPlayers, rIdx) => (
                  <div
                    key={`dynamic-row-${rIdx}`}
                    className="flex items-center justify-start sm:justify-around gap-1.5 sm:gap-3 flex-nowrap overflow-x-auto no-scrollbar w-full px-1 sm:px-2 py-0.5"
                  >
                    {rowPlayers.map((player) => {
                      const seatNum = players.findIndex((p) => p.id === player.id) + 1;
                      const isSelected = selectedPlayerForDossier?.id === player.id && activeFloatingModal === 'cartas';
                      const isThisPlayerKiller = player.role === 'assassino' || player.id === room.secretSolution?.killerPlayerId;
                      const isThisPlayerAccomplice = player.role === 'cumplice' || room.secretSolution?.accomplicePlayerIds?.includes(player.id);
                      const isThisPlayerSaboteur = player.role === 'sabotador' || player.id === room.secretSolution?.saboteurPlayerId;

                      let tokenRoleOverride: string | undefined = undefined;
                      let tokenRoleColorOverride: string | undefined = undefined;

                      if (isOracle) {
                        if (isThisPlayerKiller) {
                          tokenRoleOverride = '🔪 Assassino';
                          tokenRoleColorOverride = 'text-red-400 border-red-500/80 bg-red-950/90 font-bold';
                        } else if (isThisPlayerAccomplice) {
                          tokenRoleOverride = '👁️ Cúmplice';
                          tokenRoleColorOverride = 'text-violet-400 border-violet-500/80 bg-violet-950/90 font-bold';
                        } else if (isThisPlayerSaboteur) {
                          tokenRoleOverride = '💣 Sabotador';
                          tokenRoleColorOverride = 'text-amber-400 border-amber-500/80 bg-amber-950/90 font-bold';
                        }
                      }

                      return (
                        <CharacterToken2D
                          key={player.id}
                          player={player}
                          seatNumber={seatNum}
                          isSelected={isSelected}
                          isMe={player.id === myPlayerId}
                          isAssassin={isOracle && isThisPlayerKiller}
                          isAccomplice={isOracle && isThisPlayerAccomplice}
                          isSaboteur={isOracle && isThisPlayerSaboteur}
                          roleOverride={tokenRoleOverride}
                          roleColorOverride={tokenRoleColorOverride}
                          onClick={() => {
                            soundEngine.playCardFlip();
                            setSelectedPlayerForDossier(player);
                            setCardsModalTab('CARTAS');
                            setActiveFloatingModal('cartas');
                          }}
                        />
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* HIDDEN RIGHT SIDE MENU (HOVER / TOUCH SLIDE-OUT) */}
          {/* ---------------------------------------------------- */}
          <HiddenRightSideMenu
            onOpenNarrative={() => setActiveFloatingModal('narrativa')}
            onOpenEvidence={() => setActiveFloatingModal('evidencias')}
            onOpenEvents={() => setActiveFloatingModal('eventos')}
            onOpenAbilities={() => setActiveFloatingModal('habilidades')}
            onOpenChat={() => setActiveFloatingModal('chat')}
            onOpenCards={() => {
              setSelectedPlayerForDossier(myPlayer || room.players[0]);
              setCardsModalTab('CARTAS');
              setActiveFloatingModal('cartas');
            }}
            onOpenQuestions={() => setShowQuestionsGuide(true)}
            onOpenRules={() => {
              if (onOpenRules) onOpenRules();
            }}
            hasActiveEvent={Boolean(room.activeEvent)}
            hasActiveAbility={Boolean(room.activeAbility)}
            hasUnreadNarrative={true}
          />
        </div>
      </GameFrame>

      {/* ---------------------------------------------------- */}
      {/* 4. NARRATIVA DO ORÁCULO BANNER CARD */}
      {/* ---------------------------------------------------- */}
      <section className="relative z-20 px-3 sm:px-6 py-3 rounded-3xl bg-black/85 border border-amber-900/40 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
        {/* Left: Round Book Seal + Narrative Excerpt */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-12 h-12 rounded-full bg-gradient-to-b from-red-950 to-black border-2 border-red-500/60 flex items-center justify-center shrink-0 shadow-lg">
            <BookOpen className="w-6 h-6 text-amber-300" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-xs font-serif font-black text-amber-300 uppercase tracking-widest">
              NARRATIVA DO ORÁCULO
            </h3>
            <p className="text-[11px] font-serif text-zinc-300 line-clamp-2 leading-relaxed italic">
              "{defaultStory}"
            </p>
            <button
              onClick={() => {
                soundEngine.playCardFlip();
                setActiveFloatingModal('narrativa');
              }}
              className="mt-1 px-3 py-1 rounded-lg bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 border border-red-500/50 text-amber-100 text-[10px] font-serif font-bold uppercase tracking-wider transition-all shadow active:scale-95"
            >
              VER DETALHES
            </button>
          </div>
        </div>

        {/* Right: Vintage Crime Scene Polaroid Photo with Paperclip */}
        <div
          onClick={() => {
            soundEngine.playCardFlip();
            setActiveFloatingModal('narrativa');
          }}
          className="relative w-36 sm:w-44 h-24 rounded-lg overflow-hidden border-2 border-amber-900/60 shadow-2xl cursor-pointer hover:scale-105 transition-all shrink-0 bg-black"
        >
          <img
            src={gothicHallBg}
            alt="Foto da Cena do Crime"
            className="w-full h-full object-cover grayscale opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Brass Paperclip */}
          <div className="absolute top-1 right-2 w-3 h-6 border-2 border-amber-400 rounded-full rotate-12 shadow" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. SUAS CARTAS SECTION (4 OBJETOS + 4 MÉTODOS + CARTA DE PERSONAGEM) */}
      {/* ---------------------------------------------------- */}
      <section className="relative z-20 px-3 sm:px-6 py-3.5 rounded-3xl bg-black/85 border border-amber-900/40 backdrop-blur-xl flex flex-col gap-2.5 shadow-xl">
        <div className="flex items-center justify-between max-w-6xl mx-auto w-full px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setSuasCartasTab('CRIME');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-black tracking-wider uppercase transition-all ${
                suasCartasTab === 'CRIME'
                  ? 'bg-amber-600 text-black shadow-md'
                  : 'text-zinc-400 hover:text-amber-200 bg-white/5'
              }`}
            >
              SUAS CARTAS (8)
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                setSuasCartasTab('PERSONAGEM');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-serif font-black tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                suasCartasTab === 'PERSONAGEM'
                  ? 'bg-red-900 text-amber-100 border border-red-500 shadow-md'
                  : 'text-zinc-400 hover:text-amber-200 bg-white/5'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>SEU PERSONAGEM</span>
            </button>
          </div>

          <span className="text-[10px] font-serif text-amber-400/80 uppercase tracking-widest hidden sm:inline">
            {suasCartasTab === 'CRIME' ? '4 Objetos • 4 Métodos' : 'Identidade & Habilidade do Códice'}
          </span>
        </div>

        {suasCartasTab === 'CRIME' ? (
          /* Horizontal Row of 8 Cards: 4 Objetos (Red/Gold) + 4 Métodos (Dark Red) */
          <div className="flex overflow-x-auto pb-2 gap-2 max-w-6xl mx-auto w-full no-scrollbar snap-x snap-mandatory">
            <div className="flex gap-2 min-w-max mx-auto px-2">
              {/* 4 Objetos Cards */}
              {myObjects.slice(0, 4).map((obj) => (
                <div key={obj.id} className="snap-center">
                  <ObjectCard
                    object={obj}
                    size="sm"
                    onClick={() => {
                      soundEngine.playCardFlip();
                      if (onSelectPlayerCard && myPlayer) {
                        onSelectPlayerCard(myPlayer, 'object', obj);
                      }
                    }}
                  />
                </div>
              ))}

              {/* 4 Métodos Cards */}
              {myMethods.slice(0, 4).map((meth) => (
                <div key={meth.id} className="snap-center">
                  <MethodCard
                    method={meth}
                    size="sm"
                    onClick={() => {
                      soundEngine.playCardFlip();
                      if (onSelectPlayerCard && myPlayer) {
                        onSelectPlayerCard(myPlayer, 'method', meth);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Single Character Role Card View */
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            {(() => {
              const myChar = CHARACTERS.find((c) => c.id === myPlayer?.characterId) || CHARACTERS[0];
              return (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/60 p-3 rounded-2xl border border-amber-900/60 max-w-md w-full">
                  <div className="shrink-0">
                    <CharacterRoleCard
                      role={myChar.roleTag || myChar.title || 'Investigador'}
                      name={myChar.name}
                      description={myChar.bio || myChar.lore || 'Membro da investigação da abadia.'}
                      avatarUrl={myChar.avatarUrl}
                      size="sm"
                    />
                  </div>
                  <div className="text-left space-y-1.5 min-w-0">
                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                      {myPlayer?.role === 'assassino' ? 'Seu Papel Secreto: Assassino' : myPlayer?.role === 'oraculo' ? 'Seu Papel Secreto: Oráculo' : 'Seu Papel: Investigador'}
                    </span>
                    <h5 className="font-serif font-black text-white text-sm">
                      {myChar.name}
                    </h5>
                    <p className="text-[11px] text-zinc-300 font-serif leading-relaxed italic">
                      "{myChar.lore || myChar.bio}"
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. BOTTOM NAVIGATION BAR (LOBBY - PERSONAGENS - PARTIDA - RANKING - LOJA) */}
      {/* ---------------------------------------------------- */}
      <nav className="relative z-20 px-4 sm:px-8 py-2.5 bg-black/90 border border-amber-950/80 backdrop-blur-xl rounded-2xl flex items-center justify-between text-zinc-400 text-xs font-serif select-none shadow-xl">
        {/* LOBBY */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenLobbyModal) onOpenLobbyModal();
          }}
          className="flex flex-col items-center gap-1 hover:text-amber-200 transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-wider">LOBBY</span>
        </button>

        {/* PERSONAGENS */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenProfileModal) onOpenProfileModal();
          }}
          className="flex flex-col items-center gap-1 hover:text-amber-200 transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-wider">PERSONAGENS</span>
        </button>

        {/* PARTIDA (ACTIVE HIGHLIGHT) */}
        <button
          className="flex flex-col items-center gap-1 text-amber-300 font-black relative px-3 py-1 rounded-xl bg-amber-950/60 border border-amber-500/50 shadow-lg"
        >
          <Skull className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-[9px] uppercase tracking-widest text-amber-200">PARTIDA</span>
        </button>

        {/* RANKING */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenHistory) onOpenHistory();
          }}
          className="flex flex-col items-center gap-1 hover:text-amber-200 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-wider">RANKING</span>
        </button>

        {/* LOJA */}
        <button
          onClick={() => {
            soundEngine.playClick();
            if (onOpenShopModal) onOpenShopModal();
          }}
          className="flex flex-col items-center gap-1 hover:text-amber-200 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-[9px] font-bold uppercase tracking-wider">LOJA</span>
        </button>
      </nav>

      {/* ==================================================== */}
      {/* FLOATING MODAL 1: EVIDÊNCIAS (MATCHING IMAGEM 3) */}
      {/* ==================================================== */}
      {activeFloatingModal === 'evidencias' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Sticky Top Header */}
          <div className="sticky top-0 z-30 shrink-0 w-full bg-[#180a06] border-b border-amber-500/40 px-3 sm:px-6 py-2.5 shadow-xl flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveFloatingModal(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-amber-400" />
              <span>Voltar</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-serif tracking-[0.2em] text-red-500 font-bold uppercase">
                CÓDICE DA MORTE
              </span>
              <h2 className="font-serif text-xs sm:text-sm font-black text-amber-200 tracking-wider uppercase">
                EVIDÊNCIAS NA MESA
              </h2>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveFloatingModal(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
              title="Fechar"
            >
              <span>Fechar</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-3">

            {/* Quick Actions Bar: Puxar Nova Evidência & Arquivo Morto */}
            <div className="flex items-center justify-between gap-2 p-2 bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40 rounded-xl border border-amber-500/30">
              {onDrawEvidence && canManipulateEvidence ? (
                <button
                  onClick={() => {
                    soundEngine.playCardFlip();
                    onDrawEvidence();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-serif font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 group"
                  title="Puxar uma nova carta de evidência para a mesa de investigação"
                >
                  <PlusCircle className="w-4 h-4 text-black group-hover:rotate-90 transition-transform" />
                  <span>PUXAR NOVA EVIDÊNCIA</span>
                </button>
              ) : (
                <div className="text-[11px] font-serif text-zinc-400 italic px-1">
                  {isOracle ? 'Oráculo no comando' : 'Apenas o Oráculo pode puxar/descartar evidências'}
                </div>
              )}

              {onOpenDiscarded && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onOpenDiscarded();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white font-serif text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95"
                >
                  <Archive className="w-3.5 h-3.5 text-zinc-400" />
                  <span>ARQUIVO MORTO ({room.discardedEvidences?.length || 0})</span>
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-center gap-2 p-1 bg-black/60 rounded-xl border border-white/10">
              {(['TODAS', 'FÍSICAS', 'DIGITAIS', 'DEPOIMENTOS'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    soundEngine.playClick();
                    setEvidenceFilter(tab);
                  }}
                  className={`flex-1 py-1.5 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
                    evidenceFilter === tab
                      ? 'bg-red-900 text-white border border-red-500/60 shadow'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Evidence Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-2">
              {filteredEvidences.map((ev) => {
                const isMarked = ev.markedOptionIndex !== undefined;
                const marker = isMarked && ev.markedColor ? MARKER_INFOS[ev.markedColor] : null;
                const isProtected = ev.id === 'E01' || ev.id === 'E02';

                return (
                  <div
                    key={ev.id}
                    className={`aspect-[3/4] rounded-2xl p-2.5 border flex flex-col justify-between transition-all shadow-lg relative group ${
                      isMarked
                        ? 'bg-gradient-to-b from-amber-950/80 to-black border-amber-400'
                        : 'bg-gradient-to-b from-[#140a06] to-[#080302] border-amber-950/80 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-1">
                      <span className="text-[8px] font-mono text-amber-400 font-bold uppercase">
                        {ev.id} {isProtected ? '• PRINCIPAL' : ''}
                      </span>
                      <div className="flex items-center gap-1">
                        {isMarked && (
                          <div className={`w-2 h-2 rounded-full ${marker?.bgClass || 'bg-amber-400'}`} />
                        )}
                        {!isProtected && onDiscardEvidence && canManipulateEvidence && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.playClick();
                              onDiscardEvidence(ev.id);
                            }}
                            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/60 transition-colors"
                            title="Descartar esta evidência"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        soundEngine.playCardFlip();
                        setEvidenceZoom(1);
                        setZoomedEvidence(ev);
                      }}
                      className="my-auto flex flex-col items-center text-center cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-black/60 border border-amber-500/30 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                        <Search className="w-5 h-5 text-amber-300" />
                      </div>
                      <span className="text-[11px] font-serif font-black text-white leading-tight line-clamp-2">
                        {ev.title}
                      </span>
                      {isMarked && (
                        <span className="text-[9px] font-serif text-amber-300 font-bold mt-1 flex items-center justify-center gap-1 flex-wrap px-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full inline-block shrink-0 shadow-xs"
                            style={{ backgroundColor: ev.markedColor && MARKER_INFOS[ev.markedColor] ? MARKER_INFOS[ev.markedColor].hex : '#eab308' }}
                          />
                          <span>{ev.options[ev.markedOptionIndex!]}</span>
                          {ev.markedColor && MARKER_INFOS[ev.markedColor] && (
                            <span className="text-[8px] text-zinc-400 font-sans font-normal">
                              ({MARKER_INFOS[ev.markedColor].shortRole || MARKER_INFOS[ev.markedColor].meaning})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[8px] font-mono">
                      <button
                        onClick={() => {
                          soundEngine.playCardFlip();
                          setEvidenceZoom(1);
                          setZoomedEvidence(ev);
                        }}
                        className="text-amber-400 hover:text-amber-200 uppercase"
                      >
                        Examinar
                      </button>
                      {!isProtected && onDiscardEvidence && canManipulateEvidence && (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onDiscardEvidence(ev.id);
                          }}
                          className="text-red-400 hover:text-red-300 uppercase"
                        >
                          Descartar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Counter and Filter */}
            <div className="flex items-center justify-between pt-2 border-t border-amber-950 text-xs font-mono text-zinc-400">
              <span className="bg-black/80 px-2.5 py-1 rounded-lg border border-white/10 text-amber-300 font-bold">
                {filteredEvidences.length} Evidências na Mesa
              </span>
              <button
                onClick={() => soundEngine.playClick()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-200 text-xs font-serif font-bold uppercase"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>FILTRAR</span>
              </button>
            </div>
          </div>

          {/* Quick Floating Tabs at bottom */}
          <div className="max-w-md mx-auto w-full pt-4 flex items-center justify-around border-t border-white/10">
            <button
              onClick={() => setActiveFloatingModal('evidencias')}
              className="flex flex-col items-center text-amber-400 text-[9px] font-serif font-bold uppercase"
            >
              <Search className="w-4 h-4" />
              <span>EVIDÊNCIAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('cartas')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Layers className="w-4 h-4" />
              <span>CARTAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('eventos')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Flame className="w-4 h-4" />
              <span>EVENTOS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('habilidades')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Shield className="w-4 h-4" />
              <span>HABILIDADES</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('chat')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('narrativa')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <BookOpen className="w-4 h-4" />
              <span>NARRATIVA</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FLOATING MODAL 2: CHAT (MATCHING IMAGEM 4) */}
      {/* ==================================================== */}
      {activeFloatingModal === 'chat' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 overflow-hidden animate-fade-in">
          <div className="max-w-xl mx-auto w-full flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-950 pb-2 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveFloatingModal(null);
                }}
                className="flex items-center gap-1 text-amber-300 hover:text-white text-xs font-serif uppercase tracking-wider"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Voltar</span>
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-serif tracking-[0.2em] text-red-500 font-bold uppercase">
                  CÓDICE DA MORTE
                </span>
                <h2 className="font-serif text-base sm:text-lg font-black text-amber-200 tracking-wider uppercase">
                  CHAT
                </h2>
              </div>
              <button
                onClick={() => setActiveFloatingModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Public vs Sussurro Tabs */}
            <div className="flex items-center justify-center gap-2 p-1 bg-black/60 rounded-xl border border-white/10 my-2 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setChatTab('PUBLICO');
                }}
                className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all ${
                  chatTab === 'PUBLICO'
                    ? 'bg-red-900 text-white border border-red-500/60 shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                PÚBLICO ({room.messages?.filter((m) => !m.isWhisper).length || 0})
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setChatTab('SUSSURRO');
                }}
                className={`flex-1 py-1.5 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  chatTab === 'SUSSURRO'
                    ? 'bg-gradient-to-r from-purple-950 via-red-950 to-purple-950 text-amber-200 border border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'text-zinc-400 hover:text-purple-300'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                <span>SUSSURRO ({room.messages?.filter((m) => m.isWhisper).length || 0})</span>
              </button>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-black/40 rounded-2xl border border-white/5 no-scrollbar">
              {chatTab === 'SUSSURRO' && !isConspirator && !isPassAndPlayMode ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-lg">
                    <EyeOff className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-purple-200 text-sm uppercase tracking-wider">
                      CANAL DE SUSSURRO RESTRITO
                    </h4>
                    <p className="text-xs font-serif text-zinc-400 mt-1 max-w-xs leading-relaxed">
                      Apenas o <strong>Assassino</strong> e seu <strong>Cúmplice</strong> compartilham o pacto das sombras para trocar sussurros em segredo.
                    </p>
                  </div>
                  <div className="text-[10px] font-mono text-purple-400 bg-purple-950/50 px-3 py-1 rounded-full border border-purple-500/30">
                    ✦ Canal invisível para Investigadores & Oráculo
                  </div>
                </div>
              ) : (
                <>
                  {chatTab === 'SUSSURRO' && (
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-950/80 via-black to-red-950/80 border border-purple-500/50 text-xs font-serif flex items-center justify-between shadow-md mb-2">
                      <div className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-purple-300 animate-pulse" />
                        <div>
                          <span className="font-bold text-purple-200 block text-[11px]">
                            PACTO DAS SOMBRAS (Canal Clandestino)
                          </span>
                          <span className="text-[9px] text-zinc-400">
                            Mensagens visíveis exclusivamente para Assassino e Cúmplice.
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-900 border border-purple-400 text-purple-200 shrink-0">
                        {isKiller ? 'Parceiro: Cúmplice' : 'Parceiro: Assassino'}
                      </span>
                    </div>
                  )}

                  {(() => {
                    const activeList = (room.messages || []).filter((msg) =>
                      chatTab === 'SUSSURRO' ? Boolean(msg.isWhisper) : !msg.isWhisper
                    );

                    if (activeList.length === 0) {
                      return (
                        <div className="text-center py-8 text-xs font-serif text-zinc-500 space-y-1">
                          <p>Nenhuma mensagem {chatTab === 'SUSSURRO' ? 'de sussurro' : 'pública'} ainda.</p>
                          {chatTab === 'SUSSURRO' && (
                            <p className="text-[11px] text-purple-400/80">
                              Use este canal secreto para alinhar estratégias com seu parceiro do crime!
                            </p>
                          )}
                        </div>
                      );
                    }

                    return activeList.map((msg) => {
                      const isOraculo =
                        msg.senderName.toLowerCase().includes('oráculo') ||
                        msg.senderName.toLowerCase().includes('oraculo');
                      const isWhisper = Boolean(msg.isWhisper);

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl text-xs font-serif transition-all ${
                            isWhisper
                              ? 'bg-gradient-to-r from-purple-950/70 via-black to-red-950/60 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                              : isOraculo
                              ? 'bg-red-950/50 border border-red-500/50 text-red-200'
                              : 'bg-black/60 border border-white/5 text-zinc-200'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                              isWhisper
                                ? 'bg-purple-900/90 border-purple-400 shadow'
                                : 'bg-amber-950/80 border-amber-500/40'
                            }`}
                          >
                            <span
                              className={`text-xs font-bold ${
                                isWhisper ? 'text-purple-200' : 'text-amber-300'
                              }`}
                            >
                              {isWhisper ? '🤫' : msg.senderName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`font-bold ${
                                    isWhisper
                                      ? 'text-purple-300'
                                      : isOraculo
                                      ? 'text-red-400'
                                      : 'text-amber-300'
                                  }`}
                                >
                                  {msg.senderName}
                                </span>
                                {isWhisper && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-900/80 border border-purple-400 text-purple-200 font-bold uppercase">
                                    {msg.senderRole === 'assassino' ? 'Assassino' : msg.senderRole === 'cumplice' ? 'Cúmplice' : 'Sussurro'}
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-zinc-500 shrink-0">
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            {msg.audioUrl ? (
                              <div className="mt-1">
                                <WhatsAppAudioPlayer
                                  audioUrl={msg.audioUrl}
                                  duration={msg.audioDuration}
                                  isMe={msg.senderId === myPlayerId}
                                />
                                {msg.text && msg.text !== '🎵 Nota de voz' && (
                                  <p className="mt-1 text-[11px] font-sans opacity-90">{msg.text}</p>
                                )}
                              </div>
                            ) : (
                              <p
                                className={`mt-0.5 leading-relaxed break-words ${
                                  isWhisper ? 'text-purple-100 font-medium' : ''
                                }`}
                              >
                                {msg.text}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </>
              )}
            </div>

            {/* Chat Input Bar with Voice-to-Text & WhatsApp Audio Note Recording */}
            {(chatTab !== 'SUSSURRO' || isConspirator || isPassAndPlayMode) && (
              <div className="mt-2 shrink-0 flex flex-col gap-1.5">
                {/* Notice / Feedback Bar if error or Voice-to-Text is active */}
                {voiceToTextError && (
                  <div className="px-3 py-1.5 rounded-xl bg-red-950/90 border border-red-500/50 text-red-200 text-xs flex items-center justify-between gap-2 animate-fade-in shadow-md">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>{voiceToTextError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVoiceToTextError(null)}
                      className="text-red-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isVoiceToTextActive && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between gap-2 shadow-lg shadow-amber-950/50 animate-pulse">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                      <span className="font-serif font-bold text-amber-300">🎙️ Ditado por Voz Ativo:</span>
                      <span className="text-[11px] text-zinc-300 truncate">Fale ao microfone para transcrever no chat...</span>
                    </div>
                    <button
                      type="button"
                      onClick={stopVoiceToText}
                      className="px-2 py-0.5 rounded-lg bg-red-800 hover:bg-red-700 text-white text-[10px] font-mono font-bold uppercase transition-all"
                    >
                      Parar
                    </button>
                  </div>
                )}

                {isRecordingAudioNote ? (
                  /* Active WhatsApp Audio Recording Bar */
                  <div
                    className={`flex items-center justify-between gap-2 p-1.5 rounded-2xl border transition-all select-none ${
                      isCancellingBySlide
                        ? 'border-red-500 bg-red-950/80 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'border-red-500/60 bg-[#1a0f0a] shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                    }`}
                  >
                    {/* Left side: Cancel / Trash Button or trash indicator */}
                    <button
                      type="button"
                      onClick={handleCancelAudioNote}
                      className={`p-2 rounded-xl border transition-all active:scale-90 flex items-center gap-1 ${
                        isCancellingBySlide
                          ? 'bg-red-700 border-red-400 text-white scale-110 shadow-lg'
                          : 'bg-red-950 hover:bg-red-900 border-red-500/40 text-red-300'
                      }`}
                      title="Cancelar gravação (Lixeira)"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="text-[10px] font-serif uppercase hidden sm:inline">
                        {isCancellingBySlide ? 'Solte p/ Cancelar' : 'Cancelar'}
                      </span>
                    </button>

                    {/* Middle: Timer, dynamic waves, and slide guidance */}
                    <div className="flex-1 flex items-center justify-center gap-2 px-1 min-w-0">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                        <span className="text-xs font-mono font-bold text-red-300">
                          {Math.floor(audioNoteSeconds / 60)}:{(audioNoteSeconds % 60).toString().padStart(2, '0')}
                        </span>
                      </div>

                      {/* Animated Live Voice Waves */}
                      <div className="flex items-center gap-1 h-5 max-w-[120px] flex-1">
                        {[20, 45, 65, 90, 50, 95, 70, 35, 80, 55, 30].map((h, i) => {
                          const dynamic = Math.min(100, Math.max(20, h * (audioNoteVolume / 40 + 0.3)));
                          return (
                            <div
                              key={i}
                              className="flex-1 bg-gradient-to-t from-red-600 to-amber-400 rounded-full transition-all duration-75"
                              style={{ height: `${dynamic}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* WhatsApp slide guidance if currently holding */}
                      {isHoldingMic && !isLockedRecording && (
                        <div className="flex items-center gap-1 text-[11px] font-serif shrink-0">
                          {isCancellingBySlide ? (
                            <span className="text-red-300 font-bold animate-pulse">Solte para cancelar!</span>
                          ) : (
                            <span className="text-zinc-400 flex items-center gap-0.5 animate-pulse">
                              <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
                              <span className="hidden xs:inline">Deslize p/ cancelar</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right side: Lock button or Send button */}
                    {isHoldingMic && !isLockedRecording ? (
                      /* Currently Holding - Shows Hold-active button with lock guidance */
                      <div className="relative flex items-center">
                        {/* Slide up to lock indicator */}
                        <div
                          onClick={() => {
                            isLockedRef.current = true;
                            setIsLockedRecording(true);
                            setIsHoldingMic(false);
                            soundEngine.playClick();
                          }}
                          className="absolute -top-11 right-0 px-2 py-1 rounded-xl bg-black/90 border border-emerald-500/50 text-emerald-300 text-[10px] font-serif flex items-center gap-1 shadow-lg cursor-pointer animate-bounce whitespace-nowrap"
                          title="Clique ou deslize para cima para travar gravação em mãos-livres"
                        >
                          <Lock className="w-3 h-3" />
                          <span>↑ Travar</span>
                        </div>

                        <div
                          className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-emerald-300 text-white shadow-[0_0_20px_rgba(16,185,129,0.7)] scale-110 flex items-center justify-center animate-pulse"
                          title="Gravando... Solte para enviar ou deslize para cancelar"
                        >
                          <Mic className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      /* Locked / Hands-free Mode - Shows explicit Send button */
                      <button
                        type="button"
                        onClick={handleFinishAndSendAudioNote}
                        className="p-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 border border-emerald-300 text-white font-serif font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform shrink-0"
                        title="Enviar mensagem de voz"
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Enviar</span>
                      </button>
                    )}
                  </div>
                ) : (
                  /* Standard Input Bar with Voice-to-Text and WhatsApp Hold-to-Record */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage();
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl border shrink-0 transition-colors ${
                      chatTab === 'SUSSURRO'
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                        : 'bg-black/80 border-amber-900/50'
                    }`}
                  >
                    {/* Voice-to-Text (Speech-to-Text) Button */}
                    <button
                      type="button"
                      onClick={toggleVoiceToText}
                      className={`p-2 rounded-xl border transition-all active:scale-95 shrink-0 flex items-center gap-1 ${
                        isVoiceToTextActive
                          ? 'bg-red-600 border-red-300 text-white shadow-[0_0_15px_rgba(239,68,68,0.7)] animate-pulse'
                          : 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-500/40 text-amber-300 hover:text-white'
                      }`}
                      title={
                        isVoiceToTextActive
                          ? 'Parar Ditado por Voz'
                          : 'Ditado por Voz (Voz para Texto) - Fale para digitar automaticamente'
                      }
                    >
                      <Mic className={`w-4 h-4 ${isVoiceToTextActive ? 'animate-bounce text-white' : ''}`} />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider hidden sm:inline">
                        {isVoiceToTextActive ? 'Ouvindo' : 'Voz→Texto'}
                      </span>
                    </button>

                    {/* Text Input */}
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder={
                        isVoiceToTextActive
                          ? '🎙️ Ouvindo sua voz... Fale agora!'
                          : chatTab === 'SUSSURRO'
                          ? 'Sussurrar em segredo para o cúmplice/assassino...'
                          : 'Mensagem ou segure o microfone...'
                      }
                      className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-serif min-w-0"
                    />

                    {/* Action Button: If text entered -> Send button; Else -> WhatsApp Hold-to-Record button */}
                    {chatInputText.trim().length > 0 ? (
                      <button
                        type="submit"
                        className={`p-2 rounded-xl border transition-all active:scale-95 shrink-0 ${
                          chatTab === 'SUSSURRO'
                            ? 'bg-purple-900 hover:bg-purple-800 border-purple-400 text-purple-200'
                            : 'bg-red-950 hover:bg-red-900 border-red-500/50 text-red-200'
                        }`}
                        title={chatTab === 'SUSSURRO' ? 'Enviar Sussurro Secreto' : 'Enviar Mensagem Pública'}
                      >
                        <Send className={`w-4 h-4 ${chatTab === 'SUSSURRO' ? 'text-purple-200' : 'text-amber-300'}`} />
                      </button>
                    ) : (
                      /* WhatsApp-style Hold-to-Record Mic Button (Works across PC & Mobile) */
                      <button
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleHoldStart(e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault();
                          const touch = e.touches[0];
                          handleHoldStart(touch.clientX, touch.clientY);
                        }}
                        onTouchMove={(e) => {
                          const touch = e.touches[0];
                          handleHoldMove(touch.clientX, touch.clientY);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          handleHoldEnd();
                        }}
                        onTouchCancel={(e) => {
                          e.preventDefault();
                          handleHoldEnd();
                        }}
                        onContextMenu={(e) => e.preventDefault()}
                        className="p-2 sm:px-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 border border-emerald-400/80 text-white transition-all active:scale-95 shadow shrink-0 flex items-center justify-center gap-1 select-none touch-none"
                        title="Segure para gravar áudio estilo WhatsApp (solte para enviar, deslize para cancelar)"
                      >
                        <Mic className="w-4 h-4 text-white" />
                        <span className="text-[10px] font-serif font-bold uppercase hidden sm:inline">
                          Áudio
                        </span>
                      </button>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Quick Floating Tabs at bottom */}
          <div className="max-w-md mx-auto w-full pt-3 flex items-center justify-around border-t border-white/10 shrink-0">
            <button
              onClick={() => setActiveFloatingModal('evidencias')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Search className="w-4 h-4" />
              <span>EVIDÊNCIAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('cartas')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Layers className="w-4 h-4" />
              <span>CARTAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('eventos')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Flame className="w-4 h-4" />
              <span>EVENTOS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('habilidades')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Shield className="w-4 h-4" />
              <span>HABILIDADES</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('chat')}
              className="flex flex-col items-center text-amber-400 text-[9px] font-serif font-bold uppercase"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('narrativa')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <BookOpen className="w-4 h-4" />
              <span>NARRATIVA</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FLOATING MODAL 3: NARRATIVA DO ORÁCULO (WITH FULL ZOOM SUPPORT) */}
      {/* ==================================================== */}
      {activeFloatingModal === 'narrativa' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Sticky Top Header with Zoom Controls */}
          <div className="sticky top-0 z-30 shrink-0 w-full bg-[#180a06] border-b border-amber-500/40 px-3 sm:px-6 py-2 shadow-xl flex items-center justify-between gap-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveFloatingModal(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Voltar</span>
            </button>

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-serif tracking-[0.2em] text-red-500 font-bold uppercase">
                CÓDICE DA MORTE
              </span>
              <h2 className="font-serif text-xs sm:text-sm font-black text-amber-200 tracking-wider uppercase">
                NARRATIVA DO ORÁCULO
              </h2>
            </div>

            {/* Narrative Zoom & Close Controls */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-black/80 border border-amber-500/40 text-amber-200">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    handleNarrativeZoomOut();
                  }}
                  disabled={narrativeZoom <= 0.7}
                  className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
                  title="Diminuir Zoom da Narrativa"
                >
                  -
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    handleNarrativeZoomReset();
                  }}
                  className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-amber-300 hover:text-white"
                  title="Redefinir Zoom para 100%"
                >
                  {Math.round(narrativeZoom * 100)}%
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    handleNarrativeZoomIn();
                  }}
                  disabled={narrativeZoom >= 2.4}
                  className="w-5 h-5 flex items-center justify-center rounded text-amber-300 hover:text-white hover:bg-amber-950/80 disabled:opacity-40 transition-all font-mono font-bold text-xs"
                  title="Aumentar Zoom da Narrativa"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveFloatingModal(null);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
                title="Fechar"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Narrative Scrollable Body with Zoom & Touch pinch-to-zoom */}
          <div
            onWheel={handleNarrativeWheel}
            onTouchStart={handleNarrativeTouchStart}
            onTouchMove={handleNarrativeTouchMove}
            onTouchEnd={handleNarrativeTouchEnd}
            className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 w-full flex flex-col items-center no-scrollbar"
          >
            <div
              style={{
                transform: `scale(${narrativeZoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.12s ease-out',
              }}
              className="max-w-lg w-full flex flex-col items-center gap-4 text-center py-2"
            >
              {/* Chapter Header */}
              <div className="space-y-1">
                <span className="text-xs font-serif font-black text-amber-300 uppercase tracking-widest block">
                  {chapters[activeChapterIndex]?.title || 'CAPÍTULO 1 • O SUMIÇO NA MANSÃO VELHA'}
                </span>
              </div>

              {/* Big Framed Vintage Photograph with Paperclip */}
              <div className="relative w-full max-w-sm h-52 sm:h-60 rounded-2xl overflow-hidden border-2 border-amber-800/80 shadow-2xl bg-black">
                <img
                  src={gothicHallBg}
                  alt="Fotografia da Cena do Crime"
                  className="w-full h-full object-cover grayscale brightness-90 contrast-125"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                {/* Paperclip */}
                <div className="absolute top-2 right-3 w-4 h-8 border-2 border-amber-400 rounded-full rotate-12 shadow-lg" />
              </div>

              {/* Narrative Story Description */}
              <p className="text-xs sm:text-sm font-serif text-zinc-200 leading-relaxed max-w-md italic px-2">
                "{chapters[activeChapterIndex]?.text || defaultStory}"
              </p>

              {/* VER DETALHES / EDITAR NARRATIVA */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  if (onOpenStoryModal) onOpenStoryModal();
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-950 via-red-900 to-red-950 hover:from-red-900 hover:to-red-800 border border-red-500/60 text-amber-200 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-xl active:scale-95"
              >
                VER DETALHES COMPLETOS
              </button>

              {/* Chapter Pagination Dots */}
              <div className="flex items-center gap-2 pt-2">
                {chapters.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundEngine.playClick();
                      setActiveChapterIndex(idx);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      activeChapterIndex === idx
                        ? 'bg-amber-400 ring-2 ring-amber-400/40 w-4'
                        : 'bg-zinc-600 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Floating Tabs at bottom */}
          <div className="max-w-md mx-auto w-full pt-4 flex items-center justify-around border-t border-white/10">
            <button
              onClick={() => setActiveFloatingModal('evidencias')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Search className="w-4 h-4" />
              <span>EVIDÊNCIAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('cartas')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Layers className="w-4 h-4" />
              <span>CARTAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('eventos')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Flame className="w-4 h-4" />
              <span>EVENTOS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('habilidades')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Shield className="w-4 h-4" />
              <span>HABILIDADES</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('chat')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('narrativa')}
              className="flex flex-col items-center text-amber-400 text-[9px] font-serif font-bold uppercase"
            >
              <BookOpen className="w-4 h-4" />
              <span>NARRATIVA</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FLOATING MODAL 4: CARTAS DE TODOS & DOSSIÊ DOS SUSPEITOS */}
      {/* ==================================================== */}
      {activeFloatingModal === 'cartas' && (() => {
        const suspectPlayers = room.players.length > 0 ? room.players : (myPlayer ? [myPlayer] : []);
        const currentDossierIndex = Math.max(0, suspectPlayers.findIndex((p) => p.id === activeDossierPlayer.id));
        const totalSuspects = suspectPlayers.length;

        return (
          <div className="fixed inset-0 z-[100] bg-[#080302]/98 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-fade-in">
            {/* Sticky Top Header */}
            <div className="sticky top-0 z-30 shrink-0 w-full bg-[#180a06] border-b border-amber-500/40 px-3 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveFloatingModal(null);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4 text-amber-400" />
                <span>Voltar</span>
              </button>

              <div className="flex flex-col items-center text-center">
                <span className="text-[10px] font-serif tracking-[0.2em] text-red-500 font-bold uppercase">
                  CÓDICE DA MORTE • INVESTIGAÇÃO
                </span>
                <h2 className="font-serif text-xs sm:text-sm font-black text-amber-200 tracking-wider uppercase flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>CARTAS DE TODOS OS SUSPEITOS</span>
                </h2>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveFloatingModal(null);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
                title="Fechar"
              >
                <span>Fechar</span>
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-4">

              {/* 1. SUSPECTS THUMBNAIL CAROUSEL (Smooth Drag Scroll with Mouse or Touch) */}
              <div className="p-3 bg-gradient-to-b from-[#1c0804] via-black to-[#120502] rounded-2xl border border-amber-600/70 shadow-2xl">
                <div className="flex items-center justify-between px-1 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-serif font-black tracking-wider text-amber-300 uppercase">
                      TODOS OS JOGADORES & SUSPEITOS ({totalSuspects})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold">
                      {currentDossierIndex + 1} de {totalSuspects}
                    </span>
                    <span className="text-[10px] text-amber-400/90 font-mono">
                      ↔ Arraste para rolar
                    </span>
                  </div>
                </div>

                {/* Lateral Scrollable Suspects Strip with Drag Scroll */}
                <div
                  ref={suspectScrollRef}
                  {...suspectDragHandlers}
                  className="flex items-stretch gap-2.5 overflow-x-auto overflow-y-hidden pb-3 pt-1 px-1 scroll-smooth overscroll-x-contain touch-pan-x cursor-grab active:cursor-grabbing select-none"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#d97706 #180804',
                    WebkitOverflowScrolling: 'touch',
                  }}
                >
                  {suspectPlayers.map((player, idx) => {
                    const isSelected = player.id === activeDossierPlayer.id;
                    const isMe = player.id === myPlayerId;
                    const isPlayerOracle = player.role === 'oraculo';
                    return (
                      <button
                        key={`carousel-player-${player.id}`}
                        onClick={(e) => {
                          soundEngine.playCardFlip();
                          setSelectedPlayerForDossier(player);
                          (e.currentTarget as HTMLElement).scrollIntoView({
                            behavior: 'smooth',
                            inline: 'center',
                            block: 'nearest',
                          });
                        }}
                        className={`flex flex-col items-center justify-between gap-1.5 p-2.5 rounded-xl transition-all shrink-0 min-w-[86px] sm:min-w-[96px] border relative select-none ${
                          isSelected
                            ? 'bg-gradient-to-b from-amber-900 via-[#2a0c05] to-black border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.7)] ring-2 ring-amber-400/80 scale-[1.04] z-10'
                            : 'bg-zinc-950/90 hover:bg-zinc-900 border-white/10 hover:border-amber-500/50 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="relative mt-0.5">
                          <GothicAvatar
                            characterId={player.characterId}
                            name={player.name}
                            size="md"
                            glow={isSelected}
                          />
                          <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full border text-[10px] font-mono font-bold flex items-center justify-center shadow-md ${
                            isSelected
                              ? 'bg-amber-400 text-black border-amber-100'
                              : 'bg-black/90 text-amber-300 border-amber-500/40'
                          }`}>
                            {idx + 1}
                          </span>
                          {isMe && (
                            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-red-800 border border-red-400 text-[7.5px] font-black text-white uppercase tracking-tighter shadow">
                              VOCÊ
                            </span>
                          )}
                        </div>

                        <span className={`text-xs font-serif font-black truncate max-w-[80px] sm:max-w-[90px] mt-0.5 ${
                          isSelected ? 'text-amber-100' : 'text-zinc-300'
                        }`}>
                          {player.name}
                        </span>

                        {(() => {
                          const isPOracle = player.role === 'oraculo';
                          const isPKiller = player.role === 'assassino' || player.id === room.secretSolution?.killerPlayerId;
                          const isPAccomplice = player.role === 'cumplice' || room.secretSolution?.accomplicePlayerIds?.includes(player.id);
                          const isPSaboteur = player.role === 'sabotador' || player.id === room.secretSolution?.saboteurPlayerId;

                          if (isPOracle) {
                            return (
                              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border text-purple-300 bg-purple-950/80 border-purple-500/50">
                                Oráculo
                              </span>
                            );
                          }
                          if (isOracle) {
                            if (isPKiller) {
                              return (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border text-red-200 bg-red-950/90 border-red-500/80 font-black shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse">
                                  🔪 Assassino
                                </span>
                              );
                            }
                            if (isPAccomplice) {
                              return (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border text-violet-200 bg-violet-950/90 border-violet-500/80 font-black">
                                  👁️ Cúmplice
                                </span>
                              );
                            }
                            if (isPSaboteur) {
                              return (
                                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border text-amber-200 bg-amber-950/90 border-amber-500/80 font-black">
                                  💣 Sabotador
                                </span>
                              );
                            }
                          }
                          return (
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md border ${
                              isSelected
                                ? 'text-amber-300 bg-amber-950/80 border-amber-500/50 font-bold'
                                : 'text-zinc-400 bg-zinc-900/60 border-white/10'
                            }`}>
                              Suspeito
                            </span>
                          );
                        })()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. TABS: CARTAS vs PERFIL */}
              <div className="flex items-center justify-center gap-2 p-1 bg-black/80 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setCardsModalTab('CARTAS');
                  }}
                  className={`flex-1 py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    cardsModalTab === 'CARTAS'
                      ? 'bg-gradient-to-r from-red-950 via-amber-900 to-red-950 text-amber-100 border border-amber-500/80 shadow-lg'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>CARTAS DO SUSPEITO (8)</span>
                </button>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setCardsModalTab('PERFIL');
                  }}
                  className={`flex-1 py-2 text-xs font-serif font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    cardsModalTab === 'PERFIL'
                      ? 'bg-gradient-to-r from-red-950 via-amber-900 to-red-950 text-amber-100 border border-amber-500/80 shadow-lg'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>BIOGRAFIA DO PERSONAGEM</span>
                </button>
              </div>

              {/* 5. TAB CONTENT */}
              {cardsModalTab === 'CARTAS' ? (
                activeDossierPlayer.role === 'oraculo' ? (
                  /* ORACLE SPECIAL VIEW */
                  <div className="p-5 sm:p-7 bg-gradient-to-b from-purple-950/80 via-black to-zinc-950 rounded-2xl border border-purple-500/60 text-center space-y-3.5 shadow-2xl">
                    <div className="w-14 h-14 rounded-full bg-purple-900/80 border-2 border-purple-400 flex items-center justify-center mx-auto shadow-lg shadow-purple-950">
                      <Eye className="w-7 h-7 text-purple-300 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase font-bold block">
                        MESTRE DA CENA & TESTEMUNHA FORENSE
                      </span>
                      <h3 className="font-serif text-lg font-black text-purple-100">
                        {activeDossierPlayer.name} (Oráculo)
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm font-serif text-purple-200/90 leading-relaxed max-w-md mx-auto">
                      O Oráculo não possui cartas de métodos ou objetos sob sua guarda. Ele conhece a verdade secreta e posiciona os selos de cera nas evidências da mesa para guiar a dedução dos investigadores.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-purple-500/30 text-xs font-mono text-purple-300">
                      <span>✦ Guia de Evidências</span>
                      <span>•</span>
                      <span>✦ Não Pode Ser Acusado</span>
                      <span>•</span>
                      <span>✦ Conhece a Verdade</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* ORACLE / CONSPIRATOR INTEL ROLE BANNER FOR THIS DOSSIER PLAYER */}
                    {(isOracle || isAccomplice) && (() => {
                      const isDossierPlayerAssassin =
                        activeDossierPlayer.role === 'assassino' ||
                        activeDossierPlayer.id === room.secretSolution?.killerPlayerId;
                      const isDossierPlayerAccomplice =
                        activeDossierPlayer.role === 'cumplice' ||
                        room.secretSolution?.accomplicePlayerIds?.includes(activeDossierPlayer.id);
                      const isDossierPlayerSaboteur =
                        activeDossierPlayer.role === 'sabotador' ||
                        activeDossierPlayer.id === room.secretSolution?.saboteurPlayerId;

                      if (isDossierPlayerAssassin) {
                        return (
                          <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950 via-black to-red-950 border-2 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-red-900/90 border border-red-400 flex items-center justify-center shrink-0 shadow">
                                <Skull className="w-5 h-5 text-amber-300" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-serif font-black text-red-300 uppercase tracking-widest">
                                    {isAccomplice ? 'ESTE É SEU PARCEIRO (O ASSASSINO)' : 'ESTE É O ASSASSINO (CULPADO)'}
                                  </span>
                                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-red-900 border border-red-400 text-red-100 font-bold">
                                    {isAccomplice ? 'Pacto das Sombras' : 'Visão do Oráculo'}
                                  </span>
                                </div>
                                <p className="text-xs font-serif text-amber-200 mt-0.5 leading-snug">
                                  As cartas que ele escolheu durante o crime estão destacadas abaixo com borda dourada pulsante e o selo <strong>ESCOLHA DO CRIME</strong>.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                              <span className="text-[10px] font-mono text-red-300 bg-black/60 px-2.5 py-1 rounded-lg border border-red-500/40">
                                🩸 Crime Oculto
                              </span>
                            </div>
                          </div>
                        );
                      }

                      if (isDossierPlayerAccomplice) {
                        return (
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-950 via-black to-violet-950 border border-violet-500/80 shadow-[0_0_16px_rgba(139,92,246,0.35)] flex items-center gap-3 animate-fade-in">
                            <div className="w-9 h-9 rounded-xl bg-violet-900/90 border border-violet-400 flex items-center justify-center shrink-0 shadow">
                              <Eye className="w-5 h-5 text-violet-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-serif font-black text-violet-300 uppercase tracking-widest block">
                                  CÚMPLICE DO CRIME
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-900 text-violet-200 border border-violet-400 font-bold">
                                  Visão do Oráculo
                                </span>
                              </div>
                              <p className="text-xs font-serif text-zinc-300 leading-snug">
                                Este jogador conhece a identidade do assassino e trabalha secretamente para confundir a mesa.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      if (isDossierPlayerSaboteur) {
                        return (
                          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950 via-black to-amber-950 border border-amber-500/80 shadow-[0_0_16px_rgba(245,158,11,0.35)] flex items-center gap-3 animate-fade-in">
                            <div className="w-9 h-9 rounded-xl bg-amber-900/90 border border-amber-400 flex items-center justify-center shrink-0 shadow">
                              <Sparkles className="w-5 h-5 text-amber-300" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-serif font-black text-amber-300 uppercase tracking-widest block">
                                  SABOTADOR DA ABADIA
                                </span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-900 text-amber-200 border border-amber-400 font-bold">
                                  Visão do Oráculo
                                </span>
                              </div>
                              <p className="text-xs font-serif text-zinc-300 leading-snug">
                                Este jogador busca manipular pistas para despistar as deduções dos investigadores.
                              </p>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })()}

                    {/* OBJETOS SECTION (Red/Amber) */}
                    <div className="p-3 bg-black/60 rounded-2xl border border-amber-900/40 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-serif font-black text-amber-400 uppercase tracking-widest px-1">
                        <span className="flex items-center gap-1.5">
                          <span>✦</span>
                          <span>OBJETOS SOB CUSTÓDIA ({activeDossierPlayer.objects?.length || 4})</span>
                        </span>
                        <span className="text-[10px] font-sans text-zinc-400 font-normal">
                          Toque para inspecionar
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 justify-items-center">
                        {(activeDossierPlayer.objects?.length ? activeDossierPlayer.objects : OBJECTS.slice(0, 4)).map((obj) => {
                          const isThisObjectSolution =
                            (isOracle || isAccomplice || activeDossierPlayer.id === myPlayerId) &&
                            (activeDossierPlayer.role === 'assassino' || activeDossierPlayer.id === room.secretSolution?.killerPlayerId) &&
                            obj.id === room.secretSolution?.objectId;

                          return (
                            <div key={obj.id} className="relative flex flex-col items-center w-full">
                              {isThisObjectSolution && (
                                <div className="mb-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-black font-serif font-black text-[9px] uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.9)] border border-amber-200 z-10 animate-bounce">
                                  <span>🔥</span>
                                  <span>OBJETO DO CRIME</span>
                                </div>
                              )}
                              <div className={`w-full flex justify-center ${isThisObjectSolution ? 'ring-4 ring-amber-400 rounded-2xl shadow-[0_0_24px_rgba(245,158,11,0.9)] p-0.5 bg-gradient-to-b from-amber-500/40 to-red-900/40' : ''}`}>
                                <ObjectCard
                                  object={obj}
                                  size="sm"
                                  isSolution={isThisObjectSolution}
                                  badge={isThisObjectSolution ? 'OBJETO DO CRIME' : undefined}
                                  onClick={() => {
                                    soundEngine.playCardFlip();
                                    if (onSelectPlayerCard) {
                                      onSelectPlayerCard(activeDossierPlayer, 'object', obj);
                                    } else {
                                      setZoomedObject(obj);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* MÉTODOS SECTION (Red) */}
                    <div className="p-3 bg-black/60 rounded-2xl border border-red-900/40 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-serif font-black text-red-400 uppercase tracking-widest px-1">
                        <span className="flex items-center gap-1.5">
                          <span>✦</span>
                          <span>MÉTODOS SOB CUSTÓDIA ({activeDossierPlayer.methods?.length || 4})</span>
                        </span>
                        <span className="text-[10px] font-sans text-zinc-400 font-normal">
                          Toque para inspecionar
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 justify-items-center">
                        {(activeDossierPlayer.methods?.length ? activeDossierPlayer.methods : METHODS.slice(0, 4)).map((meth) => {
                          const isThisMethodSolution =
                            (isOracle || isAccomplice || activeDossierPlayer.id === myPlayerId) &&
                            (activeDossierPlayer.role === 'assassino' || activeDossierPlayer.id === room.secretSolution?.killerPlayerId) &&
                            meth.id === room.secretSolution?.methodId;

                          return (
                            <div key={meth.id} className="relative flex flex-col items-center w-full">
                              {isThisMethodSolution && (
                                <div className="mb-1.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-black font-serif font-black text-[9px] uppercase tracking-wider shadow-[0_0_12px_rgba(239,68,68,0.9)] border border-amber-200 z-10 animate-bounce">
                                  <span>🔥</span>
                                  <span>MÉTODO DO CRIME</span>
                                </div>
                              )}
                              <div className={`w-full flex justify-center ${isThisMethodSolution ? 'ring-4 ring-amber-400 rounded-2xl shadow-[0_0_24px_rgba(239,68,68,0.9)] p-0.5 bg-gradient-to-b from-red-500/40 to-red-900/40' : ''}`}>
                                <MethodCard
                                  method={meth}
                                  size="sm"
                                  isSolution={isThisMethodSolution}
                                  badge={isThisMethodSolution ? 'MÉTODO DO CRIME' : undefined}
                                  onClick={() => {
                                    soundEngine.playCardFlip();
                                    if (onSelectPlayerCard) {
                                      onSelectPlayerCard(activeDossierPlayer, 'method', meth);
                                    } else {
                                      setZoomedMethod(meth);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* HABILIDADE ESPECIAL SECTION */}
                    {activeDossierPlayer.ability && room.settings?.allowAbilities !== false && (
                      <div className="p-3 bg-black/60 rounded-2xl border border-emerald-900/40 space-y-2.5">
                        <div className="flex items-center justify-between gap-1.5 text-xs font-serif font-black text-emerald-400 uppercase tracking-widest px-1">
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5" />
                            <span>HABILIDADE ESPECIAL DO INVESTIGADOR</span>
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            activeDossierPlayer.abilityUsed
                              ? 'bg-zinc-900 border-zinc-700 text-zinc-500'
                              : 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                          }`}>
                            {activeDossierPlayer.abilityUsed ? 'UTILIZADA' : 'DISPONÍVEL'}
                          </span>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                          <AbilityCard
                            ability={activeDossierPlayer.ability}
                            isUsed={activeDossierPlayer.abilityUsed}
                            canUse={activeDossierPlayer.id === myPlayerId && !activeDossierPlayer.abilityUsed}
                            onUse={() => {
                              soundEngine.playClick();
                              handleTriggerAbilityFlow(activeDossierPlayer.ability!);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                /* PERFIL & BIOGRAFIA VIEW */
                (() => {
                  const dossierChar = CHARACTERS.find((c) => c.id === activeDossierPlayer.characterId) || CHARACTERS[0];
                  return (
                    <div className="flex flex-col items-center justify-center p-5 space-y-4 bg-black/70 rounded-2xl border border-amber-900/60 shadow-xl">
                      <CharacterRoleCard
                        role={activeDossierPlayer.role === 'oraculo' ? 'Oráculo do Crime' : (dossierChar.roleTag || dossierChar.title || 'Suspeito')}
                        name={dossierChar.name}
                        description={activeDossierPlayer.role === 'oraculo' ? 'Guia forense que conhece a verdade e posiciona as pistas da cena do crime.' : (dossierChar.bio || dossierChar.lore || 'Suspeito investigado nos autos da Abadia.')}
                        avatarUrl={dossierChar.avatarUrl}
                        size="md"
                      />
                      <div className="flex items-center justify-between w-full max-w-sm pt-3 border-t border-white/10 text-xs text-zinc-400">
                        <span>Cartas sob Custódia:</span>
                        <span className="text-amber-300 font-bold font-serif">
                          {activeDossierPlayer.role === 'oraculo' ? 'Nenhuma (Mestre Forense)' : '4 Métodos • 4 Objetos'}
                        </span>
                      </div>
                    </div>
                  );
                })()
              )}

              {/* 6. BOTTOM ACTION (Accuse button) */}
              <div className="pt-2 space-y-2">
                {/* ACUSAR SUSPEITO BUTTON */}
                {activeDossierPlayer.id !== myPlayerId && activeDossierPlayer.role !== 'oraculo' && !isOracle && (
                  <button
                    onClick={() => {
                      soundEngine.playDramaticSting();
                      setActiveFloatingModal(null);
                      if (onAccuseSuspect) {
                        onAccuseSuspect(activeDossierPlayer);
                      } else if (onAccuseClick) {
                        onAccuseClick();
                      }
                    }}
                    disabled={myPlayer?.hasAccused}
                    className={`w-full py-3 rounded-2xl font-serif font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 border ${
                      myPlayer?.hasAccused
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 hover:from-red-900 hover:to-red-800 text-red-100 border-red-500/80 shadow-red-950/80 animate-pulse'
                    }`}
                  >
                    <Skull className="w-4 h-4 text-red-400" />
                    <span>{myPlayer?.hasAccused ? 'ACUSAÇÃO JÁ UTILIZADA' : `ACUSAR ${activeDossierPlayer.name.toUpperCase()}`}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Floating Tabs at bottom */}
            <div className="max-w-md mx-auto w-full py-2 px-3 flex items-center justify-around border-t border-white/10 bg-[#0d0503] shrink-0">
              <button
                onClick={() => setActiveFloatingModal('evidencias')}
                className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
              >
                <Search className="w-4 h-4" />
                <span>EVIDÊNCIAS</span>
              </button>
              <button
                onClick={() => setActiveFloatingModal('cartas')}
                className="flex flex-col items-center text-amber-400 text-[9px] font-serif font-bold uppercase"
              >
                <Layers className="w-4 h-4" />
                <span>CARTAS</span>
              </button>
              <button
                onClick={() => setActiveFloatingModal('eventos')}
                className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
              >
                <Flame className="w-4 h-4" />
                <span>EVENTOS</span>
              </button>
              <button
                onClick={() => setActiveFloatingModal('habilidades')}
                className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
              >
                <Shield className="w-4 h-4" />
                <span>HABILIDADES</span>
              </button>
              <button
                onClick={() => setActiveFloatingModal('chat')}
                className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
              >
                <MessageSquare className="w-4 h-4" />
                <span>CHAT</span>
              </button>
              <button
                onClick={() => setActiveFloatingModal('narrativa')}
                className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
              >
                <BookOpen className="w-4 h-4" />
                <span>NARRATIVA</span>
              </button>
            </div>
          </div>
        );
      })()}

      {/* ==================================================== */}
      {/* FLOATING MODAL 5: EVENTOS DA PARTIDA */}
      {/* ==================================================== */}
      {activeFloatingModal === 'eventos' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Sticky Top Header */}
          <div className="sticky top-0 z-30 shrink-0 w-full bg-[#180a06] border-b border-orange-500/40 px-3 sm:px-6 py-2.5 shadow-xl flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveFloatingModal(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/80 hover:bg-orange-900 border border-orange-500/40 text-orange-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-orange-400" />
              <span>Voltar</span>
            </button>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-serif tracking-[0.2em] text-orange-500 font-bold uppercase">
                CÓDICE DA MORTE
              </span>
              <h2 className="font-serif text-xs sm:text-sm font-black text-orange-200 tracking-wider uppercase">
                CARTAS DE EVENTOS
              </h2>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveFloatingModal(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
              title="Fechar"
            >
              <span>Fechar</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-4">

            {/* Active Event Highlight Banner */}
            {room.activeEvent?.event && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-950/80 via-black to-red-950/80 border border-orange-500/60 shadow-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-950 border border-orange-500/50 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-orange-400 font-bold uppercase tracking-wider block">
                      EVENTO ATIVO NA RODADA {room.round}
                    </span>
                    <h3 className="font-serif text-sm font-black text-white">
                      {room.activeEvent.event.name}
                    </h3>
                    <p className="text-xs text-orange-200/90 font-serif italic line-clamp-1">
                      {room.activeEvent.event.effect}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setZoomedEvent(room.activeEvent?.event || null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-black font-serif text-xs font-black uppercase tracking-wider shrink-0 transition-all shadow"
                >
                  Examinar
                </button>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar evento por nome ou efeito..."
                value={eventSearchTerm}
                onChange={(e) => setEventSearchTerm(e.target.value)}
                className="w-full bg-black/60 border border-orange-900/40 rounded-xl px-3 py-2 pl-9 text-xs text-orange-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-serif"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>

            {/* Event Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-1 justify-items-center">
              {EVENTS.filter((ev) =>
                ev.name.toLowerCase().includes(eventSearchTerm.toLowerCase()) ||
                ev.effect.toLowerCase().includes(eventSearchTerm.toLowerCase())
              ).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setZoomedEvent(ev);
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <EventCard
                    event={ev}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Floating Tabs at bottom */}
          <div className="max-w-md mx-auto w-full pt-4 flex items-center justify-around border-t border-white/10">
            <button
              onClick={() => setActiveFloatingModal('evidencias')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Search className="w-4 h-4" />
              <span>EVIDÊNCIAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('cartas')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Layers className="w-4 h-4" />
              <span>CARTAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('eventos')}
              className="flex flex-col items-center text-orange-400 text-[9px] font-serif font-bold uppercase"
            >
              <Flame className="w-4 h-4" />
              <span>EVENTOS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('habilidades')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Shield className="w-4 h-4" />
              <span>HABILIDADES</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('chat')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('narrativa')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <BookOpen className="w-4 h-4" />
              <span>NARRATIVA</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* FLOATING MODAL 6: HABILIDADES ESPECIAIS DOS PERSONAGENS */}
      {/* ==================================================== */}
      {activeFloatingModal === 'habilidades' && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden animate-fade-in">
          {/* Sticky Top Header */}
          <div className="sticky top-0 z-30 shrink-0 w-full bg-[#180a06] border-b border-emerald-500/40 px-3 sm:px-6 py-2.5 shadow-xl flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveFloatingModal(null);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-emerald-400" />
              <span>Voltar</span>
            </button>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-serif tracking-[0.2em] text-emerald-500 font-bold uppercase">
                CÓDICE DA MORTE
              </span>
              <h2 className="font-serif text-xs sm:text-sm font-black text-emerald-200 tracking-wider uppercase">
                HABILIDADES
              </h2>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setActiveFloatingModal(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95"
              title="Fechar"
            >
              <span>Fechar</span>
              <X className="w-4 h-4 text-red-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-6 max-w-2xl mx-auto w-full flex flex-col gap-4">

            {/* If Abilities are disabled by Room Settings */}
            {room.settings?.allowAbilities === false && (
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-zinc-300 text-xs font-serif text-center">
                <span className="text-zinc-400 font-bold uppercase tracking-wider block mb-1">Módulo Desativado</span>
                As Habilidades Especiais foram desativadas nas configurações desta sala.
              </div>
            )}

            {/* ROOM ACTIVE ABILITY NOTIFICATION */}
            {room.activeAbility && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950 via-black to-teal-950 border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-950 border border-emerald-400 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                    <Zap className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                        HABILIDADE ATIVA NO JOGO
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300/80 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                        Ativada por: {room.activeAbility.userName}
                      </span>
                      {room.activeAbility.ability.category && (
                        <span className="text-[10px] font-mono text-zinc-400">
                          {room.activeAbility.ability.category}
                        </span>
                      )}
                    </div>
                    <h4 className="font-serif font-black text-sm sm:text-base text-emerald-200 uppercase tracking-wide truncate">
                      {room.activeAbility.ability.name}
                    </h4>
                    <p className="text-xs font-serif text-zinc-300 line-clamp-2 leading-relaxed">
                      {room.activeAbility.ability.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold">
                    {room.activeAbility.remainingSeconds ? `${room.activeAbility.remainingSeconds}s` : 'Ativa'}
                  </span>
                </div>
              </div>
            )}

            {/* MY ACTIVE ABILITY HIGHLIGHT CARD */}
            {myPlayer?.ability && room.settings?.allowAbilities !== false && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-black to-teal-950/90 border border-emerald-500/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                  <div className="shrink-0 scale-75 sm:scale-90 md:scale-100 origin-center">
                    <AbilityCard
                      ability={myPlayer.ability}
                      isUsed={myPlayer.abilityUsed}
                      canUse={!myPlayer.abilityUsed}
                      onUse={() => {
                        soundEngine.playClick();
                        handleTriggerAbilityFlow(myPlayer.ability!);
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        SUA HABILIDADE ATRIBUÍDA
                      </span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded ${
                        myPlayer.abilityUsed
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {myPlayer.abilityUsed ? 'UTILIZADA' : 'DISPONÍVEL'}
                      </span>
                    </div>
                    <h3 className="font-serif text-sm sm:text-base font-black text-white uppercase tracking-wide">
                      {myPlayer.ability.name}
                    </h3>
                    <p className="text-xs text-emerald-200/90 font-serif italic leading-relaxed mt-1">
                      "{myPlayer.ability.effect}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center gap-2 w-full md:w-auto justify-center shrink-0">
                  <button
                    onClick={() => {
                      soundEngine.playCardFlip();
                      setZoomedAbility(myPlayer.ability || null);
                    }}
                    className="flex-1 md:w-full px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-serif text-xs font-bold uppercase tracking-wider transition-all border border-white/10"
                  >
                    Examinar
                  </button>
                  {!myPlayer.abilityUsed && onUseAbility && (
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        handleTriggerAbilityFlow(myPlayer.ability!);
                      }}
                      className="flex-1 md:w-full px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-serif text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950 border border-emerald-400 active:scale-95"
                    >
                      Ativar
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar habilidade por nome ou efeito..."
                value={abilitySearchTerm}
                onChange={(e) => setAbilitySearchTerm(e.target.value)}
                className="w-full bg-black/60 border border-emerald-900/40 rounded-xl px-3 py-2 pl-9 text-xs text-emerald-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-serif"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            </div>

            {/* Ability Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 py-1 justify-items-center">
              {ABILITIES.filter((ab) =>
                ab.name.toLowerCase().includes(abilitySearchTerm.toLowerCase()) ||
                ab.effect.toLowerCase().includes(abilitySearchTerm.toLowerCase())
              ).map((ab) => (
                <div
                  key={ab.id}
                  onClick={() => {
                    soundEngine.playCardFlip();
                    setZoomedAbility(ab);
                  }}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <AbilityCard
                    ability={ab}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Floating Tabs at bottom */}
          <div className="max-w-md mx-auto w-full pt-4 flex items-center justify-around border-t border-white/10">
            <button
              onClick={() => setActiveFloatingModal('evidencias')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Search className="w-4 h-4" />
              <span>EVIDÊNCIAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('cartas')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Layers className="w-4 h-4" />
              <span>CARTAS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('eventos')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <Flame className="w-4 h-4" />
              <span>EVENTOS</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('habilidades')}
              className="flex flex-col items-center text-emerald-400 text-[9px] font-serif font-bold uppercase"
            >
              <Shield className="w-4 h-4" />
              <span>HABILIDADES</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('chat')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CHAT</span>
            </button>
            <button
              onClick={() => setActiveFloatingModal('narrativa')}
              className="flex flex-col items-center text-zinc-400 hover:text-white text-[9px] font-serif uppercase"
            >
              <BookOpen className="w-4 h-4" />
              <span>NARRATIVA</span>
            </button>
          </div>
        </div>
      )}

      {/* QUESTIONS GUIDE MODAL */}
      {showQuestionsGuide && (
        <QuestionsGuideModal
          onClose={() => setShowQuestionsGuide(false)}
          onSelectQuestion={(q) => {
            setActiveFloatingModal('chat');
            setChatInputText(q);
          }}
        />
      )}

      {/* EVIDENCE ZOOM & EXAMINATION MODAL */}
      {zoomedEvidence && (() => {
        const currentExaminedEvidence =
          room.evidencesOnTable.find((e) => e.id === zoomedEvidence.id) ||
          room.discardedEvidences.find((e) => e.id === zoomedEvidence.id) ||
          zoomedEvidence;
        const isProtected = currentExaminedEvidence.id === 'E01' || currentExaminedEvidence.id === 'E02';
        const isConcealed = Boolean(currentExaminedEvidence.isConcealed);
        const isMarked = !isConcealed && currentExaminedEvidence.markedOptionIndex !== undefined;

        return (
          <div
            className="fixed inset-0 z-[120] flex flex-col items-center justify-between bg-black/95 backdrop-blur-md animate-fade-in select-none"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                soundEngine.playClick();
                setZoomedEvidence(null);
              }
            }}
          >
            {/* Top Examination Bar with Title, Status and Zoom HUD */}
            <div className="w-full shrink-0 bg-[#120704] border-b border-amber-500/40 px-3 sm:px-6 py-2.5 shadow-2xl flex items-center justify-between gap-2 z-20">
              {/* Left: Card Title & ID */}
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-b from-[#1a3354] to-[#081220] border border-sky-400/70 flex items-center justify-center shrink-0 shadow">
                  <Search className="w-3.5 h-3.5 text-sky-300" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest">
                      EVIDÊNCIA [{currentExaminedEvidence.id}]
                    </span>
                    {isConcealed ? (
                      <span className="text-[8.5px] font-mono font-bold bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/70 flex items-center gap-1">
                        <EyeOff className="w-2.5 h-2.5 text-purple-400" />
                        <span>OCULTADA</span>
                      </span>
                    ) : isMarked ? (
                      <span className="text-[8.5px] font-mono font-bold bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/70">
                        MARCADA
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-xs sm:text-sm font-serif font-black text-[#f3e5d3] uppercase tracking-wider truncate">
                    {currentExaminedEvidence.title}
                  </h3>
                </div>
              </div>

              {/* Center: Dedicated Zoom Controls HUD for Examining Evidence */}
              <div className="flex items-center gap-1 sm:gap-1.5 bg-black/80 p-1 rounded-xl border border-amber-500/40 shadow-inner shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playClick();
                    handleEvidenceZoomOut();
                  }}
                  disabled={evidenceZoom <= 0.6}
                  className="p-1 sm:p-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-200 hover:text-white disabled:opacity-40 disabled:hover:bg-amber-950/70 transition-all border border-amber-500/30 active:scale-95"
                  title="Diminuir Zoom (Zoom Out)"
                >
                  <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playClick();
                    handleEvidenceZoomReset();
                  }}
                  className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-black text-amber-300 hover:text-amber-100 font-mono text-[10px] sm:text-xs font-bold border border-amber-500/40 hover:border-amber-400 transition-all flex items-center gap-1"
                  title="Redefinir Zoom para 100%"
                >
                  <RotateCcw className="w-2.5 h-2.5 opacity-70" />
                  <span>{Math.round(evidenceZoom * 100)}%</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playClick();
                    handleEvidenceZoomIn();
                  }}
                  disabled={evidenceZoom >= 2.8}
                  className="p-1 sm:p-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-200 hover:text-white disabled:opacity-40 disabled:hover:bg-amber-950/70 transition-all border border-amber-500/30 active:scale-95"
                  title="Aumentar Zoom (Zoom In)"
                >
                  <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              {/* Right: Close button */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setZoomedEvidence(null);
                }}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 hover:text-white text-xs font-serif uppercase tracking-wider font-bold shadow-md transition-all active:scale-95 shrink-0"
                title="Fechar Exame"
              >
                <span className="hidden sm:inline">Fechar</span>
                <X className="w-4 h-4 text-red-400" />
              </button>
            </div>

            {/* Central Stage: Zoomable Evidence Card Viewport */}
            <div
              onWheel={handleEvidenceWheel}
              onTouchStart={handleEvidenceTouchStart}
              onTouchMove={handleEvidenceTouchMove}
              onTouchEnd={handleEvidenceTouchEnd}
              className="flex-1 w-full overflow-auto flex items-center justify-center p-4 sm:p-8 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
            >
              <div
                style={{
                  transform: `scale(${evidenceZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="w-full max-w-[300px] sm:max-w-[340px] shrink-0 transition-transform flex flex-col items-center justify-center"
              >
                <EvidenceCard
                  evidence={currentExaminedEvidence}
                  isOracleInteractive={false}
                />
              </div>
            </div>

            {/* Bottom Bar: Instructions and Optional Actions */}
            <div className="w-full shrink-0 bg-[#120704]/95 border-t border-amber-500/30 px-3 sm:px-6 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 z-20">
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-serif text-zinc-400 text-center sm:text-left">
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0 hidden sm:block" />
                <span>
                  Use os botões de zoom, a roda do mouse (scroll) ou pinça de toque na tela para examinar detalhes minuciosos desta carta.
                </span>
              </div>

              {!isProtected && onDiscardEvidence && canManipulateEvidence && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onDiscardEvidence(currentExaminedEvidence.id);
                    setZoomedEvidence(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-950/90 hover:bg-red-900 border border-red-500/70 text-red-200 text-xs font-serif font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Descartar Evidência</span>
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* EVENT CARD ZOOM MODAL */}
      {zoomedEvent && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomedEvent(null);
          }}
        >
          <div className="w-full max-w-xs flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                onClick={() => setZoomedEvent(null)}
                className="p-1.5 rounded-full bg-black/80 text-zinc-300 hover:text-white border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <EventCard
              event={zoomedEvent}
            />
          </div>
        </div>
      )}

      {/* METHOD CARD ZOOM MODAL */}
      {zoomedMethod && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomedMethod(null);
          }}
        >
          <div className="w-full max-w-xs flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                onClick={() => setZoomedMethod(null)}
                className="p-1.5 rounded-full bg-black/80 text-zinc-300 hover:text-white border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {(() => {
              const isSolutionMethod =
                (isOracle || myPlayer?.role === 'assassino' || myPlayer?.role === 'cumplice') &&
                zoomedMethod.id === room.secretSolution?.methodId;

              return (
                <MethodCard
                  method={zoomedMethod}
                  size="lg"
                  isSolution={isSolutionMethod}
                  badge={isSolutionMethod ? '🔥 MÉTODO ESCOLHIDO PELO ASSASSINO' : undefined}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* OBJECT CARD ZOOM MODAL */}
      {zoomedObject && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomedObject(null);
          }}
        >
          <div className="w-full max-w-xs flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                onClick={() => setZoomedObject(null)}
                className="p-1.5 rounded-full bg-black/80 text-zinc-300 hover:text-white border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {(() => {
              const isSolutionObject =
                (isOracle || myPlayer?.role === 'assassino' || myPlayer?.role === 'cumplice') &&
                zoomedObject.id === room.secretSolution?.objectId;

              return (
                <ObjectCard
                  object={zoomedObject}
                  size="lg"
                  isSolution={isSolutionObject}
                  badge={isSolutionObject ? '🔥 OBJETO ESCOLHIDO PELO ASSASSINO' : undefined}
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* FULLSCREEN 2D TABLE OVERLAY */}
      {isTableFullscreen && (
        <div className="fixed inset-0 z-[60] bg-[#060201] flex flex-col overflow-hidden animate-fade-in">
          {/* Top Fullscreen Control Bar */}
          <div className="relative z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between border-b border-amber-950/80 bg-gradient-to-b from-[#140804] to-[#0a0402]/95 backdrop-blur-md">
            {/* Left: Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-950/80 border border-red-500/60 flex items-center justify-center shadow">
                <Skull className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-serif tracking-[0.2em] text-amber-500 font-bold uppercase block">
                  MESA 2D EM TELA CHEIA
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xs sm:text-sm font-black text-amber-200 uppercase">
                    Rodada {room.currentRound} de {maxRounds}
                  </span>
                  <span className="text-zinc-500">•</span>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formattedTimer}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Quick actions & Exit Fullscreen Button */}
            <div className="flex items-center gap-2">
              {isOracle && onAdvanceRound && (
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    onAdvanceRound();
                  }}
                  className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-500/60 text-purple-200 text-xs font-serif font-bold uppercase transition-all shadow active:scale-95"
                >
                  <SkipForward className="w-3.5 h-3.5 text-purple-300" />
                  <span>Avançar Rodada</span>
                </button>
              )}

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsTableFullscreen(false);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-950 to-red-900 hover:from-red-900 hover:to-red-800 border border-red-500/80 text-amber-100 text-xs font-serif font-bold uppercase tracking-wider transition-all shadow-lg active:scale-95 group"
              >
                <Minimize2 className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
                <span>SAIR DA TELA CHEIA</span>
              </button>
            </div>
          </div>

          {/* Center 2D Stage in Fullscreen */}
          <div className="relative flex-1 w-full flex flex-col justify-between overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
              <img
                src={gothicHallBg}
                alt="Gothic Hall Fullscreen"
                className="w-full h-full object-cover object-center opacity-85"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070302] via-transparent to-[#0a0402]/60 pointer-events-none" />
              <div className="absolute inset-0 bg-radial from-transparent via-[#070302]/25 to-[#070302]/90 pointer-events-none" />
            </div>

            {/* Side-by-Side Tokens Row Container */}
            <div className="relative z-10 w-full flex-1 py-4 sm:py-8 pl-2 sm:pl-6 pr-18 sm:pr-24 flex flex-col justify-around gap-3 sm:gap-6 overflow-y-auto no-scrollbar">
              {(() => {
                const players = room.players;
                const total = players.length;

                let rows: Player[][] = [];
                if (total <= 4) {
                  rows = [players];
                } else if (total <= 8) {
                  const mid = Math.ceil(total / 2);
                  rows = [players.slice(0, mid), players.slice(mid)];
                } else {
                  const r1 = Math.ceil(total / 3);
                  const r2 = Math.ceil((total - r1) / 2);
                  rows = [
                    players.slice(0, r1),
                    players.slice(r1, r1 + r2),
                    players.slice(r1 + r2),
                  ];
                }

                return rows.map((rowPlayers, rIdx) => (
                  <div
                    key={`fs-row-${rIdx}`}
                    className="flex items-center justify-start sm:justify-around gap-2 sm:gap-4 flex-nowrap overflow-x-auto no-scrollbar w-full px-2 py-1"
                  >
                    {rowPlayers.map((player) => {
                      const seatNum = players.findIndex((p) => p.id === player.id) + 1;
                      const isSelected = selectedPlayerForDossier?.id === player.id && activeFloatingModal === 'cartas';
                      const isThisPlayerKiller = player.role === 'assassino' || player.id === room.secretSolution?.killerPlayerId;
                      const isThisPlayerAccomplice = player.role === 'cumplice' || room.secretSolution?.accomplicePlayerIds?.includes(player.id);
                      const isThisPlayerSaboteur = player.role === 'sabotador' || player.id === room.secretSolution?.saboteurPlayerId;

                      let tokenRoleOverride: string | undefined = undefined;
                      let tokenRoleColorOverride: string | undefined = undefined;

                      if (isOracle) {
                        if (isThisPlayerKiller) {
                          tokenRoleOverride = '🔪 Assassino';
                          tokenRoleColorOverride = 'text-red-400 border-red-500/80 bg-red-950/90 font-bold';
                        } else if (isThisPlayerAccomplice) {
                          tokenRoleOverride = '👁️ Cúmplice';
                          tokenRoleColorOverride = 'text-violet-400 border-violet-500/80 bg-violet-950/90 font-bold';
                        } else if (isThisPlayerSaboteur) {
                          tokenRoleOverride = '💣 Sabotador';
                          tokenRoleColorOverride = 'text-amber-400 border-amber-500/80 bg-amber-950/90 font-bold';
                        }
                      }

                      return (
                        <CharacterToken2D
                          key={`fs-token-${player.id}`}
                          player={player}
                          seatNumber={seatNum}
                          isSelected={isSelected}
                          isMe={player.id === myPlayerId}
                          isAssassin={isOracle && isThisPlayerKiller}
                          isAccomplice={isOracle && isThisPlayerAccomplice}
                          isSaboteur={isOracle && isThisPlayerSaboteur}
                          roleOverride={tokenRoleOverride}
                          roleColorOverride={tokenRoleColorOverride}
                          onClick={() => {
                            soundEngine.playCardFlip();
                            setSelectedPlayerForDossier(player);
                            setCardsModalTab('CARTAS');
                            setActiveFloatingModal('cartas');
                          }}
                        />
                      );
                    })}
                  </div>
                ));
              })()}
            </div>

            {/* Right Floating Action Buttons */}
            <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto">
              <button
                onClick={() => {
                  soundEngine.playCardFlip();
                  setActiveFloatingModal('narrativa');
                }}
                className="flex flex-col items-center justify-center gap-0.5 group active:scale-95"
                title="Ver Narrativa do Oráculo"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#2a0d05] to-[#120502] border-2 border-red-500/70 hover:border-amber-400 flex items-center justify-center shadow-2xl relative group-hover:scale-105 transition-all">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-black animate-pulse" />
                </div>
                <span className="text-[9px] font-serif font-bold text-amber-200 uppercase tracking-widest drop-shadow">
                  NARRATIVA
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCardFlip();
                  setActiveFloatingModal('evidencias');
                }}
                className="flex flex-col items-center justify-center gap-0.5 group active:scale-95"
                title="Abrir Tabela de Evidências"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#0a1824] to-[#040b12] border-2 border-sky-500/70 hover:border-sky-300 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all">
                  <Search className="w-5 h-5 text-sky-300" />
                </div>
                <span className="text-[9px] font-serif font-bold text-sky-200 uppercase tracking-widest drop-shadow">
                  EVIDÊNCIAS
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCardFlip();
                  setActiveFloatingModal('eventos');
                }}
                className="flex flex-col items-center justify-center gap-0.5 group active:scale-95"
                title="Ver Cartas de Eventos"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#240808] to-[#100303] border-2 border-orange-500/70 hover:border-orange-300 flex items-center justify-center shadow-2xl relative group-hover:scale-105 transition-all">
                  <Flame className="w-5 h-5 text-orange-400" />
                  {room.activeEvent && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-black animate-ping" />
                  )}
                </div>
                <span className="text-[9px] font-serif font-bold text-orange-200 uppercase tracking-widest drop-shadow">
                  EVENTOS
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCardFlip();
                  setActiveFloatingModal('habilidades');
                }}
                className="flex flex-col items-center justify-center gap-0.5 group active:scale-95"
                title="Ver Habilidades"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#061810] to-[#020b07] border-2 border-emerald-500/70 hover:border-emerald-300 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-[9px] font-serif font-bold text-emerald-200 uppercase tracking-widest drop-shadow">
                  HABILIDADES
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCardFlip();
                  setActiveFloatingModal('chat');
                }}
                className="flex flex-col items-center justify-center gap-0.5 group active:scale-95"
                title="Abrir Chat"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#1f0b24] to-[#0d0410] border-2 border-purple-500/70 hover:border-purple-300 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all">
                  <MessageSquare className="w-5 h-5 text-purple-300" />
                </div>
                <span className="text-[9px] font-serif font-bold text-purple-200 uppercase tracking-widest drop-shadow">
                  CHAT
                </span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playCardFlip();
                  setSelectedPlayerForDossier(myPlayer || room.players[0]);
                  setCardsModalTab('CARTAS');
                  setActiveFloatingModal('cartas');
                }}
                className="flex flex-col items-center justify-center gap-0.5 group active:scale-95"
                title="Ver Cartas e Dossiê"
              >
                <div className="w-11 h-11 rounded-full bg-gradient-to-b from-[#241706] to-[#100a02] border-2 border-amber-500/70 hover:border-amber-300 flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all">
                  <Layers className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-[9px] font-serif font-bold text-amber-200 uppercase tracking-widest drop-shadow">
                  CARTAS
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABILITY CARD ZOOM MODAL */}
      {zoomedAbility && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomedAbility(null);
          }}
        >
          <div className="w-full max-w-xs flex flex-col gap-2">
            <div className="flex justify-end">
              <button
                onClick={() => setZoomedAbility(null)}
                className="p-1.5 rounded-full bg-black/80 text-zinc-300 hover:text-white border border-white/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AbilityCard
              ability={zoomedAbility}
            />
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* INTERACTIVE ABILITY TRIGGER MODAL (FULL MECHANICS) */}
      {/* ==================================================== */}
      {abilityTriggerModal && (
        <div className="fixed inset-0 z-[115] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-gradient-to-b from-[#180a06] via-[#0f0402] to-black border-2 border-emerald-500/70 rounded-3xl p-4 sm:p-6 max-w-lg w-full text-zinc-200 shadow-2xl relative space-y-4 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-950 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center shadow-lg">
                  <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                    ATIVAR PODER DA CARTA
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-black text-amber-100">
                    {abilityTriggerModal.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setAbilityTriggerModal(null);
                }}
                className="p-1.5 rounded-full bg-black/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Effect Description */}
            <div className="p-3 bg-emerald-950/30 rounded-2xl border border-emerald-500/30 text-xs font-serif text-emerald-200 italic leading-relaxed">
              "{abilityTriggerModal.effect}"
            </div>

            {/* Specific Mechanic Forms */}
            {/* H01: Arquivista */}
            {abilityTriggerModal.id === 'H01' && (
              <div className="space-y-3">
                <span className="text-xs font-serif font-bold text-amber-300 block">
                  Cartas no Arquivo Morto ({room.discardedEvidences?.length || 0}):
                </span>
                {room.discardedEvidences && room.discardedEvidences.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {room.discardedEvidences.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-2 bg-black/60 rounded-xl border border-amber-900/40 text-[11px] font-serif"
                      >
                        <span className="font-bold text-amber-300 block">{ev.name}</span>
                        <span className="text-zinc-400 text-[10px]">{ev.category}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">Nenhuma evidência descartada ainda neste mistério.</p>
                )}
              </div>
            )}

            {/* H02: Paleógrafo */}
            {abilityTriggerModal.id === 'H02' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  1. Escolha a Evidência na Mesa:
                </label>
                <select
                  value={h02TargetEvidenceId}
                  onChange={(e) => setH02TargetEvidenceId(e.target.value)}
                  className="w-full bg-black/80 border border-amber-900/60 rounded-xl px-3 py-2 text-xs font-serif text-amber-100 focus:outline-none focus:border-amber-400"
                >
                  {room.evidencesOnTable?.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.category}) {ev.markedOptionIndex !== undefined ? `[Marcado: Opção ${ev.markedOptionIndex + 1}]` : '[Sem Marcador]'}
                    </option>
                  ))}
                </select>

                <label className="text-xs font-serif font-bold text-amber-300 block pt-1">
                  2. Escolha a Nova Opção para Deslocar o Marcador:
                </label>
                {(() => {
                  const targetEv = room.evidencesOnTable?.find((e) => e.id === h02TargetEvidenceId) || room.evidencesOnTable?.[0];
                  if (!targetEv) return null;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-1">
                      {targetEv.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setH02NewIndex(idx)}
                          className={`p-2 rounded-xl text-left text-xs font-serif transition-all border ${
                            h02NewIndex === idx
                              ? 'bg-amber-900/80 border-amber-400 text-white font-bold shadow'
                              : 'bg-black/60 border-white/10 text-zinc-300 hover:border-amber-500/50'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-amber-400 mr-1.5">{idx + 1}.</span>
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* H03: Bibliotecário */}
            {abilityTriggerModal.id === 'H03' && (
              <div className="p-3 bg-black/60 rounded-2xl border border-orange-900/50 text-center space-y-2">
                <Flame className="w-8 h-8 text-orange-400 mx-auto animate-pulse" />
                <p className="text-xs font-serif text-orange-200">
                  Deseja invocar imediatamente uma carta de Evento aleatória do Códice para a rodada atual?
                </p>
              </div>
            )}

            {/* H04: Analista */}
            {abilityTriggerModal.id === 'H04' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  Informe 2 pistas, métodos ou objetos para consulta comparativa:
                </label>
                <input
                  type="text"
                  value={h04Card1}
                  onChange={(e) => setH04Card1(e.target.value)}
                  placeholder="Primeira pista / objeto / método..."
                  className="w-full bg-black/80 border border-amber-900/60 rounded-xl px-3 py-2 text-xs font-serif text-amber-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={h04Card2}
                  onChange={(e) => setH04Card2(e.target.value)}
                  placeholder="Segunda pista / objeto / método..."
                  className="w-full bg-black/80 border border-amber-900/60 rounded-xl px-3 py-2 text-xs font-serif text-amber-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* H05: Cético */}
            {abilityTriggerModal.id === 'H05' && (
              <div className="p-3 bg-black/60 rounded-2xl border border-red-900/50 text-center space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto animate-pulse" />
                <p className="text-xs font-serif text-zinc-200">
                  {room.activeEvent?.event
                    ? `Deseja anular imediatamente o evento ativo "${room.activeEvent.event.name}"?`
                    : 'Nenhum evento ativo no momento para anular, mas a habilidade pode ser ativada preventivamente.'}
                </p>
              </div>
            )}

            {/* H06: Observador */}
            {abilityTriggerModal.id === 'H06' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  Escolha um Suspeito para Observação Secreta:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {room.players.filter((p) => p.id !== myPlayerId).map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setH06TargetPlayerId(player.id)}
                      className={`p-2 rounded-2xl flex items-center gap-2.5 transition-all border ${
                        h06TargetPlayerId === player.id
                          ? 'bg-amber-950/90 border-amber-400 text-white shadow-lg'
                          : 'bg-black/60 border-white/10 text-zinc-300 hover:border-amber-500/50'
                      }`}
                    >
                      <GothicAvatar
                        characterId={player.characterId}
                        name={player.name}
                        size="sm"
                      />
                      <div className="text-left min-w-0 flex-1">
                        <span className="font-serif font-bold text-xs block truncate">{player.name}</span>
                        <span className="text-[10px] text-zinc-400">Suspeito na Abadia</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* H07: Relator */}
            {abilityTriggerModal.id === 'H07' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  Formula sua pergunta direta (Sim/Não) ao Oráculo:
                </label>
                <input
                  type="text"
                  value={h07Question}
                  onChange={(e) => setH07Question(e.target.value)}
                  placeholder="Ex: O crime ocorreu na biblioteca? O método envolve veneno?"
                  className="w-full bg-black/80 border border-amber-900/60 rounded-xl px-3 py-2 text-xs font-serif text-amber-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* H08: Restaurador */}
            {abilityTriggerModal.id === 'H08' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  Escolha uma Evidência do Arquivo Morto para Restaurar:
                </label>
                {room.discardedEvidences && room.discardedEvidences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                    {room.discardedEvidences.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setH08TargetEvidenceId(ev.id)}
                        className={`p-2.5 rounded-2xl text-left transition-all border ${
                          h08TargetEvidenceId === ev.id
                            ? 'bg-amber-950/90 border-amber-400 text-white shadow-lg'
                            : 'bg-black/60 border-white/10 text-zinc-300 hover:border-amber-500/50'
                        }`}
                      >
                        <span className="font-serif font-bold text-xs block text-amber-300">{ev.name}</span>
                        <span className="text-[10px] text-zinc-400">{ev.category}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-400 italic">Nenhuma evidência no arquivo morto para restaurar.</p>
                )}
              </div>
            )}

            {/* H09: Guardião */}
            {abilityTriggerModal.id === 'H09' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  Escolha uma Evidência na Mesa para Proteger contra Descarte:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {room.evidencesOnTable?.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => setH09TargetEvidenceId(ev.id)}
                      className={`p-2.5 rounded-2xl text-left transition-all border ${
                        h09TargetEvidenceId === ev.id
                          ? 'bg-amber-950/90 border-amber-400 text-white shadow-lg'
                          : 'bg-black/60 border-white/10 text-zinc-300 hover:border-amber-500/50'
                      }`}
                    >
                      <span className="font-serif font-bold text-xs block text-amber-300">{ev.name}</span>
                      <span className="text-[10px] text-zinc-400">{ev.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* H10: Intérprete */}
            {abilityTriggerModal.id === 'H10' && (
              <div className="p-3 bg-black/60 rounded-2xl border border-amber-900/50 text-center space-y-2">
                <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
                <p className="text-xs font-serif text-amber-200">
                  Deseja solicitar o Marcador Dourado / Foco Central do Oráculo na evidência crucial?
                </p>
              </div>
            )}

            {/* H11: Cronista */}
            {abilityTriggerModal.id === 'H11' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  Registre 3 palavras-chave de depoimento para o caso:
                </label>
                <input
                  type="text"
                  value={h11Keywords}
                  onChange={(e) => setH11Keywords(e.target.value)}
                  placeholder="Ex: Escuridão, Sussurro, Vidro..."
                  className="w-full bg-black/80 border border-amber-900/60 rounded-xl px-3 py-2 text-xs font-serif text-amber-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}

            {/* H12: Vigilante */}
            {abilityTriggerModal.id === 'H12' && (
              <div className="space-y-3">
                <label className="text-xs font-serif font-bold text-amber-300 block">
                  Escolha um Suspeito para Impor Silêncio (60 segundos):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {room.players.filter((p) => p.id !== myPlayerId).map((player) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => setH12TargetPlayerId(player.id)}
                      className={`p-2 rounded-2xl flex items-center gap-2.5 transition-all border ${
                        h12TargetPlayerId === player.id
                          ? 'bg-amber-950/90 border-amber-400 text-white shadow-lg'
                          : 'bg-black/60 border-white/10 text-zinc-300 hover:border-amber-500/50'
                      }`}
                    >
                      <GothicAvatar
                        characterId={player.characterId}
                        name={player.name}
                        size="sm"
                      />
                      <div className="text-left min-w-0 flex-1">
                        <span className="font-serif font-bold text-xs block truncate">{player.name}</span>
                        <span className="text-[10px] text-zinc-400">Suspeito</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAbilityTriggerModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-serif text-xs font-bold uppercase transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playVictory();
                  const abId = abilityTriggerModal.id;
                  let payload: any = undefined;

                  if (abId === 'H02') {
                    payload = { targetEvidenceId: h02TargetEvidenceId, newOptionIndex: h02NewIndex };
                  } else if (abId === 'H04') {
                    payload = { itemNames: [h04Card1, h04Card2].filter(Boolean) };
                  } else if (abId === 'H06') {
                    payload = { targetPlayerId: h06TargetPlayerId };
                  } else if (abId === 'H07') {
                    payload = { question: h07Question };
                  } else if (abId === 'H08') {
                    payload = { targetEvidenceId: h08TargetEvidenceId };
                  } else if (abId === 'H09') {
                    payload = { targetEvidenceId: h09TargetEvidenceId };
                  } else if (abId === 'H11') {
                    payload = { keywords: h11Keywords };
                  } else if (abId === 'H12') {
                    payload = { targetPlayerId: h12TargetPlayerId };
                  }

                  if (onUseAbility) onUseAbility(abId, payload);
                  setAbilityTriggerModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-serif font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950 border border-emerald-400 active:scale-95 transition-all"
              >
                CONFIRMAR ATIVAÇÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORACLE TIME UP MODAL - MANDATORY PROMPT FOR ORACLE TO ADVANCE ROUND */}
      {showOracleTimeUpModal && isOracle && onAdvanceRound && (
        <div
          id="oracle-time-up-modal-backdrop"
          className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in"
        >
          <div
            id="oracle-time-up-modal-card"
            className="w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1f0e08] via-[#140604] to-[#0a0302] border-2 border-red-500/90 shadow-[0_0_60px_rgba(239,68,68,0.55)] p-5 sm:p-6 flex flex-col gap-4 text-center relative overflow-hidden animate-scale-up"
          >
            {/* Ambient Red/Amber Glow Behind Header */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-48 bg-red-600/25 blur-3xl pointer-events-none rounded-full" />

            {/* Top Indicator Badge */}
            <div className="flex items-center justify-between w-full relative z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/90 border border-red-500/70 shadow">
                <Clock className="w-3.5 h-3.5 text-red-400 animate-ping" />
                <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider text-red-300">
                  TEMPO ESGOTADO
                </span>
              </div>
              <span className="text-[11px] font-mono text-amber-400/90 px-2.5 py-0.5 rounded-lg bg-black/70 border border-amber-500/30 font-bold">
                RODADA {room.round} DE {maxRounds}
              </span>
            </div>

            {/* Skull / Alert Icon with Pulsing Effect */}
            <div className="relative z-10 flex flex-col items-center gap-2 pt-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-red-950 to-black border-2 border-red-500/90 shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center justify-center animate-bounce">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-300" />
              </div>
              <h3 className="font-serif font-black text-xl sm:text-2xl text-amber-200 uppercase tracking-wider drop-shadow-md">
                O TEMPO DA RODADA ACABOU!
              </h3>
              <p className="text-xs sm:text-sm font-serif text-zinc-300 leading-relaxed max-w-md">
                As discussões dos investigadores para a <strong className="text-amber-300">Rodada {room.round}</strong> foram finalizadas.
                Como <strong className="text-purple-300 font-bold">Oráculo da Verdade</strong>, você precisa passar para a próxima fase.
              </p>
            </div>

            {/* Explanatory Box */}
            <div className="relative z-10 p-3.5 rounded-2xl bg-black/70 border border-amber-500/30 text-left text-xs font-serif text-zinc-300 space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>O que você deve fazer agora?</span>
              </div>
              {room.round < maxRounds ? (
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Clique no botão abaixo para avançar para a <strong className="text-amber-200 font-bold">Rodada {room.round + 1}</strong>. Você voltará ao Códice do Oráculo para assinalar novos indícios, puxar novas pistas e orientar a dedução dos detetives.
                </p>
              ) : (
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                  Esta era a <strong className="text-red-400 font-bold">última rodada ({maxRounds}/{maxRounds})</strong>! Todas as evidências já foram expostas. Ao avançar, a partida será encerrada para a Revelação Final do culpado.
                </p>
              )}
            </div>

            {/* Primary Action Button: Pass Round */}
            <div className="relative z-10 flex flex-col gap-2.5 pt-1">
              <button
                type="button"
                id="btn-oracle-advance-round-modal"
                onClick={() => {
                  soundEngine.playRoundStart();
                  setShowOracleTimeUpModal(false);
                  onAdvanceRound();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 hover:from-amber-400 hover:to-amber-400 text-black font-serif font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-amber-300 active:scale-95 transition-all flex items-center justify-center gap-2 group ring-2 ring-amber-400/80 animate-pulse"
              >
                <SkipForward className="w-5 h-5 text-black group-hover:scale-125 transition-transform" />
                <span>
                  {room.round < maxRounds
                    ? `PASSAR PARA A RODADA ${room.round + 1}`
                    : 'ENCERRAR RODADAS & IR AO DESFECHO'}
                </span>
              </button>

              {/* Extra Time Controls (Oracle privilege) */}
              <div className="flex items-center gap-2">
                {onAdjustTimer && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onAdjustTimer(30);
                        setShowOracleTimeUpModal(false);
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-black/60 hover:bg-zinc-800 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold transition-all active:scale-95"
                      title="Dar mais 30 segundos de debate"
                    >
                      +30s Extra
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        onAdjustTimer(60);
                        setShowOracleTimeUpModal(false);
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-black/60 hover:bg-zinc-800 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold transition-all active:scale-95"
                      title="Dar mais 1 minuto de debate"
                    >
                      +1 Min Extra
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowOracleTimeUpModal(false)}
                  className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-zinc-200 font-serif text-xs transition-all shrink-0"
                  title="Fechar temporariamente para inspecionar a mesa"
                >
                  Olhar Mesa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
