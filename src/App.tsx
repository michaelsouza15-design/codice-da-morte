import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomState,
  Player,
  CharacterInfo,
  CardMethod,
  CardObject,
  MarkerColor,
} from './types/game';
import { CHARACTERS, ABILITIES, MARKER_INFOS } from './data/gameData';
import {
  createNewRoom,
  fillWithAIBots,
  populateLobbyInvestigators,
  startGameDistribution,
  handleNightChoice,
  handleOracleMark,
  finishOraclePhase,
  handleAccusation,
  handleAbilityUse,
  handleDrawRandomEvent,
  handleDrawNewEvidence,
  handleAddSpecificEvidence,
  handleDiscardEvidence,
  handleAdvanceRound,
  autoProcessBotOracleNextRound,
  autoMarkOracleAI,
  handleUpdateStoryNarrative,
  adjustTimer,
  toggleTimer,
  generateAIBotDialogue,
  performAIBotAccusation,
} from './engine/gameLogic';

import { Table2D } from './components/Table2D';
import { InvestigationRoomView } from './components/InvestigationRoomView';
import { LobbyView } from './components/LobbyView';
import { NightPhaseView } from './components/NightPhaseView';
import { OracleView } from './components/OracleView';
import { AccusationModal } from './components/AccusationModal';
import { AccusationsHistoryModal } from './components/AccusationsHistoryModal';
import { CrimeNarrativeModal } from './components/CrimeNarrativeModal';
import { CinematicRevelation } from './components/CinematicRevelation';
import { RulesReferenceModal } from './components/RulesReferenceModal';
import { CharacterSelectModal } from './components/CharacterSelectModal';
import { ChatAndVoice } from './components/ChatAndVoice';
import { SettingsModal } from './components/SettingsModal';
import { DiscardedEvidencesModal } from './components/DiscardedEvidencesModal';
import { MobileAppGuideModal } from './components/MobileAppGuideModal';
import { GothicAvatar } from './components/GothicAvatar';
import { HomeScreen } from './components/HomeScreen';
import { GrimoireModal } from './components/GrimoireModal';
import { CollectionModal } from './components/CollectionModal';
import { ShopModal } from './components/ShopModal';
import { ProfileModal } from './components/ProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { PlayModal } from './components/PlayModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { InGameQuickMenuModal } from './components/InGameQuickMenuModal';
import { RoleRevealCutscene } from './components/RoleRevealCutscene';
import { soundEngine } from './utils/soundEngine';
import { voiceManager } from './utils/voiceManager';
import { GameZoomProvider, GameZoomContainer } from './context/GameZoomContext';
import codiceMorteLivroImg from './assets/images/codice_morte_livro_1787918785943.jpg';
import codiceEmblemaCaveiraImg from './assets/images/codice_emblema_caveira_1787918811337.jpg';
import { EventCard, AbilityCard, MethodCard, ObjectCard } from './components/GothicCard';
import {
  PassAndPlaySetupModal,
  PassDeviceScreen,
  LocalRoleRevealModal,
} from './components/PassAndPlayModal';

import {
  Skull,
  BookOpen,
  Sparkles,
  Shield,
  Eye,
  Volume2,
  VolumeX,
  ShieldAlert,
  Clock,
  Flame,
  UserCheck,
  RefreshCw,
  Smartphone,
  Plus,
  Minus,
  CheckCircle,
  Zap,
  PlusCircle,
  ArrowRight,
  Sliders,
  Archive,
  LogOut,
  Sun,
  Moon,
  Settings,
  Menu,
  AlertTriangle,
  X,
  Mic,
  MicOff,
} from 'lucide-react';

function GameApp() {
  // Connection & Player State
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string>('');
  const [isVoiceMicActive, setIsVoiceMicActive] = useState<boolean>(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('codice_player_name') || 'Investigador 1';
  });
  const [roomCodeInput, setRoomCodeInput] = useState<string>('');
  const [selectedCharId, setSelectedCharId] = useState<string>(() => {
    return localStorage.getItem('codice_char_id') || CHARACTERS[0].id;
  });
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // Mobile App & PWA state
  const [showMobileGuide, setShowMobileGuide] = useState<boolean>(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

  // UI Modals
  const [showRules, setShowRules] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showDiscardedModal, setShowDiscardedModal] = useState<boolean>(false);
  const [showAccuseModal, setShowAccuseModal] = useState<boolean>(false);
  const [showAccusationsModal, setShowAccusationsModal] = useState<boolean>(false);
  const [showStoryModal, setShowStoryModal] = useState<boolean>(false);
  const [showCharModal, setShowCharModal] = useState<boolean>(false);
  const [showGrimoire, setShowGrimoire] = useState<boolean>(false);
  const [showCollection, setShowCollection] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showPlayModal, setShowPlayModal] = useState<boolean>(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState<boolean>(false);
  const [playModalMode, setPlayModalMode] = useState<'all' | 'create' | 'join'>('all');
  const [inspectCard, setInspectCard] = useState<{
    player: Player;
    type: 'method' | 'object';
    card: CardMethod | CardObject;
  } | null>(null);
  const [observationNotice, setObservationNotice] = useState<{
    targetPlayerId?: string;
    targetName: string;
    observation: string;
  } | null>(null);

  // Sound effects toggle
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Pure Gothic Dark Mode enforcement (No light mode)
  useEffect(() => {
    document.body.classList.remove('theme-light');
    localStorage.setItem('codice_theme', 'dark');
  }, []);

  // Local Offline Simulation mode fallback
  const isLocalModeRef = useRef<boolean>(false);

  // Save preferences
  useEffect(() => {
    if (playerName) localStorage.setItem('codice_player_name', playerName);
  }, [playerName]);

  useEffect(() => {
    if (selectedCharId) localStorage.setItem('codice_char_id', selectedCharId);
  }, [selectedCharId]);

  // Helper to extract room code from URL
  const getRoomCodeFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('room') || params.get('join');
    if (fromQuery) return fromQuery.trim().toUpperCase();

    const hash = window.location.hash;
    if (hash.includes('room=')) {
      return hash.split('room=')[1].split('&')[0].trim().toUpperCase();
    }
    if (hash.includes('join=')) {
      return hash.split('join=')[1].split('&')[0].trim().toUpperCase();
    }
    return '';
  };

  // Check URL query parameters for ?room=CODE or ?join=CODE
  useEffect(() => {
    const roomFromUrl = getRoomCodeFromUrl();
    if (roomFromUrl) {
      setRoomCodeInput(roomFromUrl);
    }
  }, []);

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleTriggerInstall = async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredInstallPrompt(null);
    }
  };

  // Pass-and-Play Mode State
  const [isPassAndPlayMode, setIsPassAndPlayMode] = useState<boolean>(false);
  const [showPassAndPlaySetup, setShowPassAndPlaySetup] = useState<boolean>(false);
  const [passAndPlayPhase, setPassAndPlayPhase] = useState<'REVEAL' | 'NIGHT' | 'ORACLE' | 'INVESTIGATION'>('REVEAL');
  const [revealPlayerIndex, setRevealPlayerIndex] = useState<number>(0);
  const [showCurtain, setShowCurtain] = useState<boolean>(false);
  const [curtainConfig, setCurtainConfig] = useState<{
    name: string;
    title?: string;
    description: string;
    onReady: () => void;
  } | null>(null);
  const [showLocalActionModal, setShowLocalActionModal] = useState<boolean>(false);
  const [activeLocalPlayerId, setActiveLocalPlayerId] = useState<string>('');
  const [showInGameMenu, setShowInGameMenu] = useState<boolean>(false);
  const [showRoleRevealCutscene, setShowRoleRevealCutscene] = useState<boolean>(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);
  const lastPhaseRef = useRef<string>('LOBBY');

  // Real-time Voice Chat State and Subscriptions
  useEffect(() => {
    const unsubStatus = voiceManager.onMicStatus((isMuted) => {
      setIsVoiceMicActive(!isMuted);
    });
    const unsubSpeaking = voiceManager.onLocalSpeaking((isSpeaking) => {
      setIsVoiceSpeaking(isSpeaking);
    });
    return () => {
      unsubStatus();
      unsubSpeaking();
    };
  }, []);

  const handleToggleVoiceMic = async () => {
    soundEngine.playClick();
    voiceManager.toggleMute();
  };

  // Prevent accidental page reload or exit during active match
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (room && room.phase !== 'LOBBY' && room.phase !== 'FIM_DE_JOGO') {
        e.preventDefault();
        e.returnValue = 'Deseja realmente sair da partida? Seu progresso será perdido.';
        return 'Deseja realmente sair da partida? Seu progresso será perdido.';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [room?.phase]);

  // Intercept browser / mobile Back button when in app/game
  useEffect(() => {
    const isModalOpen =
      showPlayModal ||
      showCreateRoomModal ||
      showGrimoire ||
      showCollection ||
      showShop ||
      showProfile ||
      showCharModal ||
      showPassAndPlaySetup ||
      showSettings ||
      showNotifications ||
      showRules ||
      showInGameMenu ||
      showLocalActionModal ||
      showAccusationsModal ||
      showStoryModal ||
      showMobileGuide ||
      inspectCard !== null;

    if (isModalOpen || room) {
      window.history.pushState({ inApp: true }, '');
      const handlePop = () => {
        if (showExitConfirmModal) {
          setShowExitConfirmModal(false);
          return;
        }
        if (inspectCard) { setInspectCard(null); return; }
        if (showInGameMenu) { setShowInGameMenu(false); return; }
        if (showLocalActionModal) { setShowLocalActionModal(false); return; }
        if (showStoryModal) { setShowStoryModal(false); return; }
        if (showAccusationsModal) { setShowAccusationsModal(false); return; }
        if (showMobileGuide) { setShowMobileGuide(false); return; }
        if (showPlayModal) { setShowPlayModal(false); return; }
        if (showCreateRoomModal) { setShowCreateRoomModal(false); return; }
        if (showGrimoire) { setShowGrimoire(false); return; }
        if (showCollection) { setShowCollection(false); return; }
        if (showShop) { setShowShop(false); return; }
        if (showProfile) { setShowProfile(false); return; }
        if (showCharModal) { setShowCharModal(false); return; }
        if (showPassAndPlaySetup) { setShowPassAndPlaySetup(false); return; }
        if (showSettings) { setShowSettings(false); return; }
        if (showNotifications) { setShowNotifications(false); return; }
        if (showRules) { setShowRules(false); return; }

        // If in an active game and no floating modal open, prompt exit confirmation!
        if (room && room.phase !== 'FIM_DE_JOGO') {
          setShowExitConfirmModal(true);
        }
      };
      window.addEventListener('popstate', handlePop);
      return () => window.removeEventListener('popstate', handlePop);
    }
  }, [
    room,
    showPlayModal,
    showCreateRoomModal,
    showGrimoire,
    showCollection,
    showShop,
    showProfile,
    showCharModal,
    showPassAndPlaySetup,
    showSettings,
    showNotifications,
    showRules,
    showInGameMenu,
    showLocalActionModal,
    showAccusationsModal,
    showStoryModal,
    showMobileGuide,
    inspectCard,
    showExitConfirmModal,
  ]);

  // Trigger Role Reveal cutscene when match starts
  useEffect(() => {
    if (!room) {
      lastPhaseRef.current = 'LOBBY';
      setShowRoleRevealCutscene(false);
      return;
    }

    if (lastPhaseRef.current === 'LOBBY' && room.phase !== 'LOBBY' && room.phase !== 'FIM_DE_JOGO') {
      if (!isPassAndPlayMode) {
        setShowRoleRevealCutscene(true);
      }
    }
    lastPhaseRef.current = room.phase;
  }, [room?.phase, isPassAndPlayMode]);

  // Connect to Socket.IO backend
  useEffect(() => {
    setConnectionStatus('connecting');
    const s = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      console.log('Connected to Códice da Morte server');
      setConnectionStatus('connected');

      // Auto-join room from URL invite or QR code if present
      const roomFromUrl = getRoomCodeFromUrl();
      if (roomFromUrl) {
        const savedName = localStorage.getItem('codice_player_name') || playerName || 'Investigador Convidado';
        const savedCharId = localStorage.getItem('codice_char_id') || selectedCharId || CHARACTERS[0].id;
        s.emit('join_room', {
          roomCode: roomFromUrl,
          playerName: savedName,
          characterId: savedCharId,
        });
      }
    });

    s.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnectionStatus('disconnected');
    });

    s.on('reconnect_attempt', () => {
      setConnectionStatus('connecting');
    });

    s.on('joined_success', ({ playerId, assignedName }: { playerId: string; roomCode?: string; assignedName?: string }) => {
      setMyPlayerId(playerId);
      if (assignedName) {
        setPlayerName(assignedName);
        localStorage.setItem('codice_player_name', assignedName);
      }
      setConnectionStatus('connected');
      voiceManager.init(s, playerId);
    });

    s.on('room_update', (updatedRoom: RoomState) => {
      setRoom(updatedRoom);
    });

    s.on('ability_observation_result', (data: { targetPlayerId: string; targetName: string; observation: string }) => {
      soundEngine.playDramaticSting();
      setObservationNotice(data);
    });

    s.on('error_message', (msg: string) => {
      alert(`[Aviso do Códice]: ${msg}`);
    });

    setSocket(s);
    voiceManager.init(s, myPlayerId);

    // Auto-enable "A Luz na Cúpula" soundtrack on first interaction
    soundEngine.enableAutoTheme();

    return () => {
      s.disconnect();
    };
  }, []);

  // Timer countdown loop - optimized to avoid excessive interval recreation
  useEffect(() => {
    if (!room || !room.phaseTimerActive || room.phaseTimerRemaining <= 0) return;

    const timer = setInterval(() => {
      setRoom((prev) => {
        if (!prev || !prev.phaseTimerActive || prev.phaseTimerRemaining <= 0) return prev;
        const newRemaining = prev.phaseTimerRemaining - 1;

        if (newRemaining <= 0) {
          const oracle = prev.players.find((p) => p.role === 'oraculo');
          if (oracle?.isAI && isLocalModeRef.current) {
            return handleAdvanceRound({
              ...prev,
              phaseTimerRemaining: 0,
              phaseTimerActive: false,
            });
          }
          return {
            ...prev,
            phaseTimerRemaining: 0,
            phaseTimerActive: false,
          };
        }

        return { ...prev, phaseTimerRemaining: newRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room?.phaseTimerActive]);

  // AI Oracle Bot auto-handler when in ORACULO phase (local mode fallback)
  useEffect(() => {
    if (!room || room.phase !== 'ORACULO' || !isLocalModeRef.current) return;
    const oracle = room.players.find((p) => p.role === 'oraculo');
    if (oracle?.isAI) {
      const oracleTimer = setTimeout(() => {
        setRoom((prev) => {
          if (!prev || prev.phase !== 'ORACULO') return prev;
          return autoProcessBotOracleNextRound(prev);
        });
      }, 1200);
      return () => clearTimeout(oracleTimer);
    }
  }, [room?.phase, room?.round]);

  // AI Bots Local simulation loop (when in local mode or solo with bots)
  useEffect(() => {
    if (!room || room.phase !== 'INVESTIGACAO' || !isLocalModeRef.current) return;
    const hasAIBots = room.players.some((p) => p.isAI);
    if (!hasAIBots) return;

    const botInterval = setInterval(() => {
      // 1. Bot Dialogue chance
      if (Math.random() < 0.18) {
        setRoom((prev) => {
          if (!prev || prev.phase !== 'INVESTIGACAO') return prev;
          const updated = generateAIBotDialogue(prev);
          return updated || prev;
        });
      }

      // 2. Bot Accusation chance
      if (Math.random() < 0.06) {
        setRoom((prev) => {
          if (!prev || prev.phase !== 'INVESTIGACAO') return prev;
          const updated = performAIBotAccusation(prev);
          return updated || prev;
        });
      }
    }, 3500);

    return () => clearInterval(botInterval);
  }, [room?.phase]);

  // Handler: Quick Host Online Room
  const handleHostRoom = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    if (socket && socket.connected) {
      socket.emit('join_room', {
        roomCode: code,
        playerName: playerName || 'Investigador Líder',
        characterId: selectedCharId,
      });
    } else {
      // Local fallback
      isLocalModeRef.current = true;
      const initial = createNewRoom(code, playerName, selectedCharId);
      setMyPlayerId(initial.players[0].id);
      setRoom(initial);
    }
  };

  // Handler: Custom Create Room with settings (Second Image Layout)
  const handleConfirmCreateRoom = (config: {
    roomName: string;
    gameMode: 'CASUAL' | 'COMPETITIVO' | 'HISTÓRIA' | 'PERSONALIZADO';
    maxPlayers: number;
    roundDuration: number;
    maxRounds: number;
    difficulty: 'FÁCIL' | 'NORMAL' | 'DIFÍCIL' | 'ESPECIALISTA';
    botAccuracy?: number;
    oracleSelection?: 'random' | 'host' | 'custom';
    hasAccomplice?: boolean;
    hasSaboteur?: boolean;
    allowEvents?: boolean;
    allowAbilities?: boolean;
    includeBots?: boolean;
  }) => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase();
    const diffMap: Record<string, 'facil' | 'normal' | 'dificil' | 'especialista'> = {
      'FÁCIL': 'facil',
      'NORMAL': 'normal',
      'DIFÍCIL': 'dificil',
      'ESPECIALISTA': 'especialista',
    };
    const mappedDiff = diffMap[config.difficulty] || 'normal';

    if (socket && socket.connected) {
      socket.emit('join_room', {
        roomCode: code,
        playerName: playerName || 'Investigador Líder',
        characterId: selectedCharId,
        includeBots: config.includeBots ?? false,
        roomSettings: {
          maxPlayers: config.maxPlayers,
          roundTimerSeconds: config.roundDuration,
          maxRounds: config.maxRounds,
          aiDifficulty: mappedDiff,
          botAccuracyPercent: config.botAccuracy !== undefined ? config.botAccuracy : 20,
          oracleSelectionMode: config.oracleSelection,
          hasAccomplice: config.hasAccomplice ?? true,
          hasSaboteur: config.hasSaboteur ?? false,
          allowEvents: config.allowEvents ?? true,
          allowAbilities: config.allowAbilities ?? true,
        },
        roomName: config.roomName,
        gameMode: config.gameMode,
      });
    } else {
      isLocalModeRef.current = true;
      const initial = createNewRoom(code, playerName || 'Oráculo', selectedCharId || 'char_oraculo');
      initial.roomName = config.roomName;
      initial.gameMode = config.gameMode;
      initial.settings.maxPlayers = config.maxPlayers;
      initial.settings.roundTimerSeconds = config.roundDuration;
      initial.settings.maxRounds = config.maxRounds;
      initial.maxRounds = config.maxRounds;
      initial.settings.aiDifficulty = mappedDiff;
      initial.settings.botAccuracyPercent = config.botAccuracy !== undefined ? config.botAccuracy : 20;
      initial.settings.oracleSelectionMode = config.oracleSelection;
      initial.settings.hasAccomplice = config.hasAccomplice ?? true;
      initial.settings.hasSaboteur = config.hasSaboteur ?? false;
      initial.settings.allowEvents = config.allowEvents ?? true;
      initial.settings.allowAbilities = config.allowAbilities ?? true;
      if (config.oracleSelection === 'host') {
        initial.designatedOraclePlayerId = initial.players[0].id;
      }
      initial.players[0].roleTitle = 'Líder da Sala';
      if (config.includeBots) {
        const populated = populateLobbyInvestigators(initial, config.maxPlayers || 10);
        setMyPlayerId(populated.players[0].id);
        setRoom(populated);
      } else {
        setMyPlayerId(initial.players[0].id);
        setRoom(initial);
      }
    }
  };

  // Handler: Join Room by Code
  const handleJoinRoom = (customCode?: string) => {
    const code = (customCode || roomCodeInput).trim().toUpperCase();
    if (!code) return;
    if (socket && socket.connected) {
      socket.emit('join_room', {
        roomCode: code,
        playerName: playerName || 'Investigador',
        characterId: selectedCharId,
      });
    } else {
      isLocalModeRef.current = true;
      const initial = createNewRoom(code, playerName || 'Investigador', selectedCharId);
      setMyPlayerId(initial.players[0].id);
      setRoom(initial);
    }
  };

  // Handler: Instant Solo Bot Game (Play immediately with 6 AI players)
  const handleStartSoloGame = () => {
    isLocalModeRef.current = true;
    const code = 'SOLO';
    const initial = createNewRoom(code, playerName || 'Detetive Principal', selectedCharId);
    const withBots = fillWithAIBots(initial, 6);
    setMyPlayerId(withBots.players[0].id);
    const started = startGameDistribution(withBots);
    setRoom(started);
  };

  // Actions
  const handleAddBot = () => {
    soundEngine.playClick();
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('add_bot');
    } else if (room) {
      const updated = fillWithAIBots(room, Math.min(room.players.length + 1, room.settings.maxPlayers));
      setRoom(updated);
    }
  };

  const handleRemoveBot = () => {
    soundEngine.playClick();
    if (!room) return;
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('remove_bot');
    } else {
      const lastBotIndex = [...room.players].reverse().findIndex((p) => p.isAI);
      if (lastBotIndex !== -1) {
        const realIndex = room.players.length - 1 - lastBotIndex;
        const updatedPlayers = room.players.filter((_, idx) => idx !== realIndex);
        setRoom({ ...room, players: updatedPlayers });
      }
    }
  };

  const handleFillBots = (targetCount: number = 4) => {
    soundEngine.playClick();
    if (socket && socket.connected && !isLocalModeRef.current) {
      const needed = Math.max(0, targetCount - (room?.players.length || 0));
      for (let i = 0; i < needed; i++) {
        socket.emit('add_bot');
      }
    } else if (room) {
      const updated = fillWithAIBots(room, Math.min(targetCount, room.settings?.maxPlayers || 10));
      setRoom(updated);
    }
  };

  const handleClearBots = () => {
    soundEngine.playClick();
    if (socket && socket.connected && !isLocalModeRef.current) {
      const botCount = room?.players.filter((p) => p.isAI).length || 0;
      for (let i = 0; i < botCount; i++) {
        socket.emit('remove_bot');
      }
    } else if (room) {
      const nonBots = room.players.filter((p) => !p.isAI);
      setRoom({ ...room, players: nonBots });
    }
  };

  const handleUpdatePlayerName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setPlayerName(trimmed);
    localStorage.setItem('codice_player_name', trimmed);
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('update_player_name', { newName: trimmed });
    } else if (room) {
      let candidate = trimmed;
      const isNameTaken = (nameToCheck: string) =>
        room.players.some((p) => p.id !== myPlayerId && p.name.trim().toLowerCase() === nameToCheck.trim().toLowerCase());
      if (isNameTaken(candidate)) {
        let counter = 2;
        while (isNameTaken(`${candidate} (${counter})`)) {
          counter++;
        }
        candidate = `${candidate} (${counter})`;
      }
      setRoom({
        ...room,
        players: room.players.map((p) => (p.id === myPlayerId ? { ...p, name: candidate } : p)),
      });
    }
  };

  const handleLeaveRoom = () => {
    soundEngine.playClick();
    if (socket && socket.connected) {
      socket.emit('leave_room');
      socket.disconnect();
      socket.connect();
    }
    setRoom(null);
    setIsPassAndPlayMode(false);
    setShowInGameMenu(false);
    setShowSettings(false);
  };

  const handleAdjustTimer = (deltaSeconds: number) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('adjust_timer', { deltaSeconds });
    } else if (room) {
      const updated = adjustTimer(room, deltaSeconds, myPlayer?.name || 'Oráculo');
      setRoom(updated);
    }
  };

  // Handler: Start Pass-and-Play (Local hotseat room on same phone)
  const handleStartPassAndPlay = (playersConfig: { name: string; characterId: string }[]) => {
    setShowPassAndPlaySetup(false);
    setIsPassAndPlayMode(true);
    isLocalModeRef.current = true;

    const code = 'LOCAL';
    const firstChar = CHARACTERS.find((c) => c.id === playersConfig[0].characterId) || CHARACTERS[0];
    const initial = createNewRoom(code, playersConfig[0].name, firstChar.id);

    // Create player objects for all local participants
    const localPlayers: Player[] = playersConfig.map((cfg, idx) => {
      const char = CHARACTERS.find((c) => c.id === cfg.characterId) || CHARACTERS[idx % CHARACTERS.length];
      return {
        id: `p_local_${idx + 1}`,
        name: cfg.name || `Investigador ${idx + 1}`,
        characterId: char.id,
        isHost: idx === 0,
        isReady: true,
        isAI: false,
        seatNumber: idx,
        methods: [],
        objects: [],
        ability: ABILITIES[idx % ABILITIES.length],
        abilityUsed: false,
        hasAccused: false,
      };
    });

    initial.players = localPlayers;
    const distributed = startGameDistribution(initial);

    setRoom(distributed);
    setRevealPlayerIndex(0);
    setPassAndPlayPhase('REVEAL');

    // Show initial privacy curtain for Player 1
    const p1 = distributed.players[0];
    const p1Char = CHARACTERS.find((c) => c.id === p1.characterId);
    setCurtainConfig({
      name: p1.name,
      title: p1Char?.title,
      description: 'Passe o dispositivo para você ver em sigilo seu Papel Secreto, suas 4 Cartas de Método e 4 de Objeto.',
      onReady: () => setShowCurtain(false),
    });
    setShowCurtain(true);
  };

  // Handler: Advance to next player during Role Reveal in Pass-and-Play
  const handleNextRevealPlayer = () => {
    if (!room) return;
    const nextIdx = revealPlayerIndex + 1;

    if (nextIdx < room.players.length) {
      setRevealPlayerIndex(nextIdx);
      const nextP = room.players[nextIdx];
      const nextChar = CHARACTERS.find((c) => c.id === nextP.characterId);
      setCurtainConfig({
        name: nextP.name,
        title: nextChar?.title,
        description: 'Passe o dispositivo para ver em sigilo seu Papel Secreto e suas Cartas de Investigação.',
        onReady: () => setShowCurtain(false),
      });
      setShowCurtain(true);
    } else {
      // All players have seen their secret identities!
      // The Killer already selected their crime in complete secret during their turn.
      // Transition directly to the Oracle (Public role) so no identity is leaked!
      setPassAndPlayPhase('ORACLE');
      const oracle = room.players.find((p) => p.role === 'oraculo') || room.players[0];
      const oracleChar = CHARACTERS.find((c) => c.id === oracle.characterId);
      setMyPlayerId(oracle.id);

      setCurtainConfig({
        name: `${oracle.name} (O Oráculo Sagrado)`,
        title: oracleChar?.title,
        description: 'Passe o dispositivo para o Oráculo Sagrado. O Oráculo examinará a solução do crime e posicionará os marcadores de pistas nas tábuas de evidência do Códice.',
        onReady: () => setShowCurtain(false),
      });
      setShowCurtain(true);
    }
  };

  const handleKillerPassAndPlaySelect = (methodId: string, objectId: string) => {
    if (!room) return;
    const killer = room.players.find((p) => p.role === 'assassino');
    if (killer) {
      try {
        const updated = handleNightChoice(room, killer.id, methodId, objectId);
        setRoom(updated);
      } catch (err) {
        console.error('Error recording night choice in pass and play', err);
      }
    }
  };

  const handleStartGame = () => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('start_game');
    } else if (room) {
      try {
        const updated = startGameDistribution(room);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleNightChoiceConfirm = (methodId: string, objectId: string) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('night_choice', { methodId, objectId });
    } else if (room) {
      try {
        const updated = handleNightChoice(room, myPlayerId, methodId, objectId);
        setRoom(updated);

        if (isPassAndPlayMode) {
          setPassAndPlayPhase('ORACLE');
          const oracle = updated.players.find((p) => p.role === 'oraculo') || updated.players[0];
          const oracleChar = CHARACTERS.find((c) => c.id === oracle.characterId);
          setMyPlayerId(oracle.id);

          setCurtainConfig({
            name: `${oracle.name} (O Oráculo)`,
            title: oracleChar?.title,
            description: 'Passe o dispositivo para o Oráculo. Ele examinará a solução secreta e posicionará as gemas místicas de evidência no Códice da mesa central.',
            onReady: () => setShowCurtain(false),
          });
          setShowCurtain(true);
        }
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSuggestNightChoice = (methodId: string, objectId: string) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('suggest_night_choice', { methodId, objectId });
    } else if (room) {
      const sender = room.players.find((p) => p.id === myPlayerId);
      const updated = {
        ...room,
        nightSuggestion: {
          methodId,
          objectId,
          suggestedByPlayerId: myPlayerId,
          suggestedByPlayerName: sender?.name || 'Cúmplice',
        },
        secretSolution: room.secretSolution
          ? {
              ...room.secretSolution,
              suggestedMethodId: methodId,
              suggestedObjectId: objectId,
              suggestedByPlayerName: sender?.name || 'Cúmplice',
            }
          : undefined,
      };
      setRoom(updated);
    }
  };

  const handleOracleMarkOption = (
    evidenceId: string,
    optionIdx: number,
    color: MarkerColor,
    coords?: { x: number; y: number }
  ) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('oracle_mark', { evidenceId, optionIdx, color, coords });
    } else if (room) {
      try {
        const updated = handleOracleMark(room, evidenceId, optionIdx, color, coords);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleFinishOracle = () => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('finish_oracle');
    } else if (room) {
      const updated = finishOraclePhase(room);
      setRoom(updated);

      if (isPassAndPlayMode) {
        setPassAndPlayPhase('INVESTIGATION');
        setCurtainConfig({
          name: 'TODOS OS INVESTIGADORES REUNIDOS',
          description: 'O Oráculo selou as evidências do Códice! Posicionem o celular no centro da mesa para que todos examinem a mesa 3D e debatam a tríade fatal.',
          onReady: () => setShowCurtain(false),
        });
        setShowCurtain(true);
      }
    }
  };

  const handleAccusationConfirm = (targetId: string, methodId: string, objectId: string) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('make_accusation', { targetPlayerId: targetId, methodId, objectId });
    } else if (room) {
      try {
        const updated = handleAccusation(room, myPlayerId, targetId, methodId, objectId);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleUseAbility持 = (abilityId: string, extraPayload?: any) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('use_ability', { abilityId, extraPayload });
    } else if (room) {
      try {
        const updated = handleAbilityUse(room, myPlayerId, abilityId, extraPayload);
        setRoom(updated);
        if (abilityId === 'H06' && extraPayload?.targetPlayerId) {
          const target = updated.players.find((p) => p.id === extraPayload.targetPlayerId);
          if (target) {
            const isKillerOrAccomplice思想 = target.role === 'assassino' || target.role === 'cumplice';
            setObservationNotice({
              targetPlayerId: target.id,
              targetName: target.name,
              observation: isKillerOrAccomplice思想
                ? `🩸 Revelação Secreta: ${target.name} possui a aura do crime e conspira nas sombras!`
                : `🕊️ Revelação Secreta: ${target.name} parece inocente das artimanhas do Códice.`,
            });
          }
        }
      } catch (err: any) {
        alert(err.message);
      }
    }
  };
  const handleUseAbility = handleUseAbility持;

  const handleDrawEventAction = () => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('draw_event');
    } else if (room) {
      try {
        const updated = handleDrawRandomEvent(room);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDrawEvidenceAction = () => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('draw_evidence');
    } else if (room) {
      try {
        const updated = handleDrawNewEvidence(room);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleAddSpecificEvidenceAction = (evidenceId: string) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('add_evidence', { evidenceId });
    } else if (room) {
      try {
        const updated = handleAddSpecificEvidence(room, evidenceId);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDiscardEvidenceAction = (evidenceId: string) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('discard_evidence', { evidenceId });
    } else if (room) {
      try {
        const updated = handleDiscardEvidence(room, evidenceId);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleAdvanceRoundAction = () => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('advance_round');
    } else if (room) {
      try {
        const updated = handleAdvanceRound(room);
        setRoom(updated);
        if (isPassAndPlayMode && updated.phase === 'ORACULO') {
          const oracle = updated.players.find((p) => p.role === 'oraculo');
          setPassAndPlayPhase('ORACLE');
          setCurtainConfig({
            name: oracle?.name || 'O ORÁCULO',
            description: `Início da Rodada ${updated.round} de ${updated.maxRounds || updated.settings.maxRounds || 3}! Passe o aparelho ao Oráculo para marcar ou atualizar pistas no Códice.`,
            onReady: () => setShowCurtain(false),
          });
          setShowCurtain(true);
        }
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleUpdateStoryAction = (newNarrative: string) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('update_narrative', { narrative: newNarrative });
    } else if (room) {
      try {
        const updated = handleUpdateStoryNarrative(room, myPlayerId, newNarrative);
        setRoom(updated);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSetTimerDuration = (durationSeconds: number) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('set_timer_duration', { durationSeconds });
    } else if (room) {
      const updated = {
        ...room,
        settings: {
          ...room.settings,
          discussionTimerSeconds: durationSeconds,
        },
      };
      if (room.phase === 'INVESTIGACAO') {
        updated.phaseTimerRemaining = durationSeconds;
        updated.phaseTimerActive = durationSeconds > 0;
      }
      setRoom(updated);
    }
  };

  const handleSendMessage = (
    text: string,
    isWhisper?: boolean,
    audioOptions?: { audioUrl?: string; audioDuration?: number; audioMimeType?: string }
  ) => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('send_message', {
        text,
        isWhisper,
        audioUrl: audioOptions?.audioUrl,
        audioDuration: audioOptions?.audioDuration,
        audioMimeType: audioOptions?.audioMimeType,
      });
    } else if (room) {
      const sender = room.players.find((p) => p.id === myPlayerId);
      const isConspirator = sender?.role === 'assassino' || sender?.role === 'cumplice';
      const effectiveIsWhisper = Boolean(isWhisper && isConspirator);
      const updated = {
        ...room,
        messages: [
          ...room.messages,
          {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            senderId: myPlayerId,
            senderName: sender?.name || 'Investigador',
            senderRole: effectiveIsWhisper ? sender?.role : undefined,
            text: text || (audioOptions?.audioUrl ? '🎵 Nota de voz' : ''),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isWhisper: effectiveIsWhisper,
            audioUrl: audioOptions?.audioUrl,
            audioDuration: audioOptions?.audioDuration,
            audioMimeType: audioOptions?.audioMimeType,
          },
        ],
      };
      setRoom(updated);
    }
  };

  const handleRestartGame = () => {
    if (socket && socket.connected && !isLocalModeRef.current) {
      socket.emit('restart_game');
    } else if (room) {
      const updated = { ...room, phase: 'LOBBY' as const, winner: undefined };
      setRoom(updated);
    }
  };

  const myPlayer = room?.players.find((p) => p.id === myPlayerId);
  const myRole = myPlayer?.role;
  const myChar = CHARACTERS.find((c) => c.id === myPlayer?.characterId) || CHARACTERS[0];

  // ----------------------------------------------------
  // VIEW 1: HOME / LANDING SCREEN (If not in any room)
  // ----------------------------------------------------
  if (!room) {
    return (
      <div
        id="app-root-home"
        className="app-container min-h-[100dvh] font-serif flex flex-col justify-between selection:bg-[#ff4444] selection:text-white relative overflow-hidden transition-colors duration-300 bg-cover bg-center"
        style={{ backgroundImage: `url(${codiceMorteLivroImg})` }}
      >
        {/* Main Floating Gothic Home Screen matching the image */}
        <HomeScreen
          playerName={playerName}
          setPlayerName={setPlayerName}
          selectedCharId={selectedCharId}
          setSelectedCharId={setSelectedCharId}
          onQuickPlaySolo={handleStartSoloGame}
          onOpenCreateRoom={() => setShowCreateRoomModal(true)}
          onOpenJoinRoom={() => {
            setPlayModalMode('join');
            setShowPlayModal(true);
          }}
          onOpenPassAndPlay={() => setShowPassAndPlaySetup(true)}
          onOpenCharacters={() => setShowCharModal(true)}
          onOpenGrimoire={() => setShowGrimoire(true)}
          onOpenCollection={() => setShowCollection(true)}
          onOpenShop={() => setShowShop(true)}
          onOpenProfile={() => setShowProfile(true)}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenSettings={() => setShowSettings(true)}
        />

        {/* Create Room Modal matching 2nd screenshot with custom art & rounds selector */}
        {showCreateRoomModal && (
          <CreateRoomModal
            isOpen={showCreateRoomModal}
            onClose={() => setShowCreateRoomModal(false)}
            onConfirmCreate={handleConfirmCreateRoom}
          />
        )}

        {/* Play & Room Choice Modal */}
        {showPlayModal && (
          <PlayModal
            isOpen={showPlayModal}
            onClose={() => setShowPlayModal(false)}
            onStartSoloGame={handleStartSoloGame}
            onStartPassAndPlay={() => setShowPassAndPlaySetup(true)}
            onHostOnlineRoom={handleHostRoom}
            onJoinRoom={handleJoinRoom}
            roomCodeInput={roomCodeInput}
            setRoomCodeInput={setRoomCodeInput}
            mode={playModalMode}
          />
        )}

        {/* Grimoire Modal (Stories of Dracula, Codex Lore & Rules) */}
        {showGrimoire && (
          <GrimoireModal
            isOpen={showGrimoire}
            onClose={() => setShowGrimoire(false)}
          />
        )}

        {/* Collection Modal (Cards, Suspects, Methods, Objects) */}
        {showCollection && (
          <CollectionModal
            isOpen={showCollection}
            onClose={() => setShowCollection(false)}
          />
        )}

        {/* Shop Modal (Frames, Card Backs, Gold Store) */}
        {showShop && (
          <ShopModal
            isOpen={showShop}
            onClose={() => setShowShop(false)}
          />
        )}

        {/* Profile Modal (Level 10, Stats, Name) */}
        {showProfile && (
          <ProfileModal
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
            playerName={playerName}
            setPlayerName={setPlayerName}
            selectedCharId={selectedCharId}
            onOpenCharacterSelect={() => setShowCharModal(true)}
          />
        )}

        {/* Notifications Modal (Daily Quests, Updates) */}
        {showNotifications && (
          <NotificationsModal
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}

        {/* Pass-and-Play Setup Modal */}
        {showPassAndPlaySetup && (
          <PassAndPlaySetupModal
            isOpen={showPassAndPlaySetup}
            onClose={() => setShowPassAndPlaySetup(false)}
            onStartLocalGame={handleStartPassAndPlay}
          />
        )}

        {/* Rules Modal */}
        {showRules && <RulesReferenceModal onClose={() => setShowRules(false)} />}

        {/* Character Modal */}
        {showCharModal && (
          <CharacterSelectModal
            selectedCharId={selectedCharId}
            onSelect={(char) => setSelectedCharId(char.id)}
            onClose={() => setShowCharModal(false)}
          />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Mobile App & Online Host Guide Modal */}
        {showMobileGuide && (
          <MobileAppGuideModal
            isOpen={showMobileGuide}
            onClose={() => setShowMobileGuide(false)}
            deferredPrompt={deferredInstallPrompt}
            onTriggerInstall={handleTriggerInstall}
          />
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: LOBBY (Dedicated Full-Screen Gothic Lobby)
  // ----------------------------------------------------
  if (room.phase === 'LOBBY') {
    return (
      <LobbyView
        room={room}
        myPlayerId={myPlayerId}
        onUpdateCharacter={(charId) => {
          setSelectedCharId(charId);
          localStorage.setItem('codice_char_id', charId);
          if (socket && socket.connected && !isLocalModeRef.current) {
            socket.emit('update_character', { characterId: charId });
          }
          // Update immediately in state so avatar updates with zero delay
          setRoom((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              players: prev.players.map((p) => (p.id === myPlayerId ? { ...p, characterId: charId } : p)),
            };
          });
        }}
        onToggleReady={() => {
          if (socket && socket.connected && !isLocalModeRef.current) {
            socket.emit('toggle_ready');
          } else {
            const updated = {
              ...room,
              players: room.players.map((p) => (p.id === myPlayerId ? { ...p, isReady: !p.isReady } : p)),
            };
            setRoom(updated);
          }
        }}
        onAddBot={handleAddBot}
        onRemoveBot={handleRemoveBot}
        onFillBots={handleFillBots}
        onClearBots={handleClearBots}
        onUpdatePlayerName={handleUpdatePlayerName}
        onStartGame={handleStartGame}
        onUpdateSettings={(settings) => {
          if (socket && socket.connected && !isLocalModeRef.current) {
            socket.emit('update_settings', { settings });
          } else {
            setRoom({ ...room, settings: { ...room.settings, ...settings }, designatedOraclePlayerId: settings.designatedOraclePlayerId !== undefined ? settings.designatedOraclePlayerId : room.designatedOraclePlayerId });
          }
        }}
        onDesignateOracle={(playerId) => {
          if (socket && socket.connected && !isLocalModeRef.current) {
            socket.emit('designate_oracle', { playerId });
          } else {
            setRoom({ ...room, designatedOraclePlayerId: playerId || undefined, settings: { ...room.settings, designatedOraclePlayerId: playerId || undefined, oracleSelectionMode: playerId ? 'custom' : 'random' } });
          }
        }}
        onOpenRules={() => setShowRules(true)}
        onLeaveRoom={() => {
          if (socket && socket.connected) {
            socket.emit('leave_room');
          }
          setRoom(null);
        }}
      />
    );
  }

  // ----------------------------------------------------
  // VIEW 2: ACTIVE IN-GAME TABLE
  // ----------------------------------------------------
  return (
    <div
      id="app-root-game"
      className="app-container min-h-screen w-full font-serif flex flex-col justify-between selection:bg-[#ff4444] selection:text-white relative overflow-x-hidden overflow-y-auto transition-colors duration-300 bg-cover bg-center"
      style={{ backgroundImage: `url(${codiceMorteLivroImg})` }}
    >
      {/* Ambient atmospheric backdrop */}
      <div className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-0 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-black/85 via-black/60 to-[#0c0404]/90 z-0 pointer-events-none" />

      {/* Top Navbar - Clean and Consolidated to a Single Menu in Top Right */}
      <header
        style={{ height: '39px' }}
        className="relative z-40 px-3 sm:px-6 flex items-center justify-between backdrop-blur-xl bg-black/85 border-b border-amber-900/40 sticky top-0 gap-2 select-none shadow-xl origin-top transition-all duration-300 ease-out hover:scale-105 active:scale-105 hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] hover:border-amber-500/70 active:shadow-[0_4px_25px_rgba(245,158,11,0.4)] active:border-amber-500/70"
      >
        {/* Left Title & Room Info */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-black/80 transition-all duration-300 ${
              room.phase === 'INVESTIGACAO'
                ? 'ring-1 ring-amber-400/90 animate-soft-skull-glow'
                : 'ring-1 ring-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
            }`}
          >
            <img
              src={codiceEmblemaCaveiraImg}
              alt="Códice da Morte"
              className={`w-full h-full object-cover filter contrast-110 transition-transform ${
                room.phase === 'INVESTIGACAO' ? 'animate-soft-skull-pulse' : ''
              }`}
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-950/90 to-black border border-amber-500/40 text-[10px] sm:text-xs font-mono font-bold text-amber-300 tracking-wider shrink-0 shadow-sm">
                {room.code === 'LOCAL' ? 'LOCAL' : `SALA: ${room.code}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Secret Role Badge, Voice Chat Toggle & Single Menu Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Real-time Voice Chat Toggle in Main Header */}
          <button
            onClick={handleToggleVoiceMic}
            className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl font-serif text-xs font-bold transition-all border active:scale-95 shadow-md ${
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
                <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider">
                  {isVoiceSpeaking ? 'Falando' : 'Voz On'}
                </span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline text-[10px] font-mono uppercase tracking-wider">Voz Off</span>
              </>
            )}
          </button>

          {/* My Secret Role Badge (Clickable to view Cutscene/Lore) */}
          {myRole && (
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowRoleRevealCutscene(true);
              }}
              style={{ width: '105.64099999999999px' }}
              className={`flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-xl text-xs font-serif border shadow-md shrink-0 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                myRole === 'oraculo'
                  ? 'bg-amber-950/90 border-amber-400/80 text-amber-300 shadow-amber-950/60'
                  : myRole === 'assassino'
                  ? 'bg-red-950/90 border-red-500/80 text-red-300 shadow-red-950/60'
                  : myRole === 'cumplice'
                  ? 'bg-purple-950/90 border-purple-400/80 text-purple-300 shadow-purple-950/60'
                  : 'bg-zinc-900/90 border-zinc-500/60 text-zinc-200'
              }`}
              title="Clique para ver sua Revelação de Papel e Missão Secreta"
            >
              <Shield className="w-3.5 h-3.5 shrink-0" />
              <span
                style={{ width: '65.6406px', fontSize: '7px', textAlign: 'left' }}
                className="font-bold uppercase tracking-wider text-[10px] sm:text-xs"
              >
                {myRole}
              </span>
            </button>
          )}

          {/* SINGLE TOP RIGHT MENU BUTTON (Contains Settings, Rules, Leave, Audio, etc.) */}
          <button
            onClick={() => {
              soundEngine.playClick();
              setShowInGameMenu(true);
            }}
            style={{ width: '73.8125px', height: '27px' }}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 border border-amber-300 text-black text-xs font-serif font-black uppercase tracking-wider transition-all shadow-lg shadow-amber-950/80 shrink-0 group active:scale-95 hover:scale-105 hover:shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            title="Menu Geral da Partida (Configurações, Áudio, Regras e Sair)"
          >
            <Menu className="w-3.5 h-3.5 text-black group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-[10px] sm:text-xs font-serif font-black tracking-widest text-black">MENU</span>
          </button>
        </div>
      </header>

      {/* Sub-Header on Small/Medium screens: Phase & Timer Status */}
      {room.phase !== 'LOBBY' && (
        <div className="lg:hidden flex items-center justify-between px-3 sm:px-6 py-1.5 bg-black/80 border-b border-white/10 text-[10px] sm:text-xs font-mono z-30">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span>RODADA {room.round}/{room.maxRounds || room.settings?.maxRounds || 3}</span>
            <span>•</span>
            <span className="text-amber-300 uppercase font-bold">{room.phase}</span>
          </div>

          <div className="flex items-center gap-2">
            {room.phaseTimerActive && (
              <div className="flex items-center gap-1.5 text-red-300 bg-red-950/90 px-2 py-0.5 rounded-lg border border-red-500/40 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span>
                  {Math.floor(room.phaseTimerRemaining / 60).toString().padStart(2, '0')}:
                  {(room.phaseTimerRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {!room.phaseTimerActive && room.phase === 'INVESTIGACAO' && (room.phaseTimerRemaining === 0) && (
              <div className="flex items-center gap-1.5 text-red-300 bg-red-950/90 px-2 py-0.5 rounded-lg border border-red-500/80 font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                <span>00:00 ESGOTADO</span>
              </div>
            )}

            {(myRole === 'oraculo' || isPassAndPlayMode) && room.phase === 'INVESTIGACAO' && (
              <div className="flex items-center gap-1">
                {room.phaseTimerRemaining === 0 && (
                  <button
                    onClick={() => {
                      soundEngine.playRoundStart();
                      handleAdvanceRoundAction();
                    }}
                    className="px-2 py-0.5 bg-gradient-to-r from-amber-500 to-red-500 text-black rounded border border-amber-300 text-[9px] font-black uppercase animate-pulse shadow-sm"
                    title="Passar para próxima rodada"
                  >
                    Passar Rodada
                  </button>
                )}
                <button
                  onClick={() => handleAdjustTimer(-30)}
                  title="Diminuir 30s"
                  className="px-1.5 py-0.5 bg-red-950 text-red-300 rounded border border-red-500/40 text-[9px] font-bold"
                >
                  -30s
                </button>
                <button
                  onClick={() => handleAdjustTimer(30)}
                  title="Adicionar 30s"
                  className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 rounded border border-emerald-500/40 text-[9px] font-bold"
                >
                  +30s
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Body with moldura_04 gothic luxury frame */}
      <main className="moldura_04 relative z-10 max-w-7xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 pb-28 sm:pb-16 w-full flex-1 flex flex-col my-2 sm:my-4 shadow-2xl">
        {/* PROMINENT ACTIVE EVENT BANNER - ALWAYS VISIBLE WHEN AN EVENT IS ACTIVE */}
        {room.activeEvent && (
          <div className="mb-4 w-full p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-950/90 via-black to-red-950/90 border-2 border-orange-500/80 shadow-[0_0_30px_rgba(249,115,22,0.35)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in z-20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-orange-950/80 border border-orange-500 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-orange-500/30 border border-orange-400 text-orange-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    EVENTO ATIVO NO CÓDICE
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {room.activeEvent.event.category}
                  </span>
                </div>
                <h4 className="font-serif font-black text-sm sm:text-base text-amber-200 uppercase tracking-wide truncate">
                  {room.activeEvent.event.name}
                </h4>
                <p className="text-xs font-serif text-zinc-300 line-clamp-2 leading-relaxed">
                  {room.activeEvent.event.effect}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1 rounded-xl bg-orange-950 border border-orange-500/60 text-orange-300 font-mono text-xs font-bold">
                {room.activeEvent.remainingSeconds ? `${room.activeEvent.remainingSeconds}s` : 'Ativo'}
              </span>
            </div>
          </div>
        )}

        {/* PROMINENT ACTIVE ABILITY BANNER - ALWAYS VISIBLE WHEN AN ABILITY IS ACTIVATED */}
        {room.activeAbility && (
          <div className="mb-4 w-full p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-950/90 via-black to-teal-950/90 border-2 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.35)] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in z-20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 border border-emerald-500 flex items-center justify-center shrink-0 shadow-lg animate-pulse">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/30 border border-emerald-400 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                    HABILIDADE ATIVA
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

        {/* 1. NIGHT PHASE */}
        {room.phase === 'NOITE' && (
          <NightPhaseView
            room={room}
            myPlayerId={myPlayerId}
            onConfirmChoice={handleNightChoiceConfirm}
            onSuggestChoice={handleSuggestNightChoice}
          />
        )}

        {/* 3. ORACLE PHASE */}
        {room.phase === 'ORACULO' && (
          <>
            {myRole === 'oraculo' ? (
              <OracleView
                room={room}
                myPlayerId={myPlayerId}
                onMarkOption={handleOracleMarkOption}
                onFinishOraclePhase={handleFinishOracle}
                onUpdateStory={handleUpdateStoryAction}
                onAdjustTimer={handleAdjustTimer}
                onSetTimerDuration={handleSetTimerDuration}
                onDrawEvidence={handleDrawEvidenceAction}
                onAddSpecificEvidence={handleAddSpecificEvidenceAction}
                onDiscardEvidence={handleDiscardEvidenceAction}
                onDrawEvent={handleDrawEventAction}
                onOpenMenu={() => setShowInGameMenu(true)}
                onOpenRules={() => setShowRules(true)}
                onOpenSettings={() => setShowInGameMenu(true)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full glass-ui-blue border-blue-400/40 flex items-center justify-center shadow-2xl">
                  <Eye className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <h2 className="text-2xl font-serif font-black text-white uppercase tracking-[0.2em]">
                  O ORÁCULO ESTÁ EXAMINANDO O CÓDICE
                </h2>
                <p className="text-sm text-zinc-300 font-serif max-w-md opacity-80 leading-relaxed">
                  O Oráculo está posicionando as gemas místicas de evidência na mesa central (Rodada {room.round} de {room.maxRounds || 3}). Aguardem o fim do transe revelatório...
                </p>
                {room.phaseTimerActive && (
                  <div className="inline-flex items-center gap-2 glass-ui px-4 py-2 rounded-full border-blue-500/30">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                    <span className="text-xs font-mono text-blue-300 tracking-wider">
                      Tempo restante: {room.phaseTimerRemaining}s
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* 4. INVESTIGATION PHASE (Matching ChatGPT Layout with 2D Bonequinhos & Floating Action Buttons) */}
        {room.phase === 'INVESTIGACAO' && (
          <div className="w-full flex-1 flex flex-col">
            <InvestigationRoomView
              room={room}
              myPlayerId={myPlayerId}
              isPassAndPlayMode={isPassAndPlayMode}
              onSelectPlayerCard={(player, type, card) => setInspectCard({ player, type, card })}
              onAccuseClick={() => setShowAccuseModal(true)}
              onAccuseSuspect={() => setShowAccuseModal(true)}
              onOpenChat={() => setShowInGameMenu(true)}
              onOpenHistory={() => setShowAccusationsModal(true)}
              onOpenRules={() => setShowRules(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenMenu={() => setShowInGameMenu(true)}
              onAdjustTimer={handleAdjustTimer}
              onSendMessage={handleSendMessage}
              onOpenStoryModal={() => setShowStoryModal(true)}
              onOpenLobbyModal={() => handleLeaveRoom()}
              onOpenShopModal={() => setShowShop(true)}
              onOpenProfileModal={() => setShowProfile(true)}
              onAdvanceRound={handleAdvanceRoundAction}
              onDrawEvidence={handleDrawEvidenceAction}
              onDiscardEvidence={handleDiscardEvidenceAction}
              onOpenDiscarded={() => setShowDiscardedModal(true)}
              onUseAbility={handleUseAbility}
            />
          </div>
        )}

        {/* 5. CINEMATIC REVELATION PHASE */}
        {room.phase === 'REVELACAO' && (
          <CinematicRevelation
            room={room}
            myPlayerId={myPlayerId}
            onRestartGame={handleRestartGame}
            onReturnToMainMenu={() => {
              setRoom(null);
              setIsPassAndPlayMode(false);
            }}
          />
        )}
      </main>

      {/* Pass-and-Play Privacy Curtain */}
      {showCurtain && curtainConfig && (
        <PassDeviceScreen
          targetPlayerName={curtainConfig.name}
          targetPlayerTitle={curtainConfig.title}
          actionDescription={curtainConfig.description}
          onReady={curtainConfig.onReady}
        />
      )}

      {/* Pass-and-Play Secret Role Reveal Sequence */}
      {isPassAndPlayMode && passAndPlayPhase === 'REVEAL' && !showCurtain && (
        <LocalRoleRevealModal
          player={room.players[revealPlayerIndex]}
          isLastPlayer={revealPlayerIndex === room.players.length - 1}
          onNext={handleNextRevealPlayer}
          onKillerSelect={handleKillerPassAndPlaySelect}
          selectedMethodId={room.secretSolution?.methodId}
          selectedObjectId={room.secretSolution?.objectId}
        />
      )}

      {/* Card Inspection Popup (High-Resolution Full Screen Display) */}
      {inspectCard && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 backdrop-blur-xl animate-fade-in overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setInspectCard(null);
          }}
        >
          <div className="rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-5 text-center relative my-auto bg-[#0d0604]/95 border border-amber-500/40 shadow-2xl text-[#e0d8d0] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
              <span className="text-xs sm:text-sm font-serif font-bold text-amber-300 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rotate-45 bg-amber-400" />
                MESA DO INVESTIGADOR • {inspectCard.player.name}
              </span>
              <button
                onClick={() => setInspectCard(null)}
                className="p-1.5 rounded-xl text-zinc-300 hover:text-white bg-black/70 border border-amber-500/40 hover:border-amber-400 transition-all active:scale-95 shadow-md"
                title="Fechar Inspeção"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
              <div className="flex justify-center shrink-0 w-full max-w-[280px] sm:max-w-[320px] shadow-2xl">
                {(() => {
                  const isSolutionCard =
                    (myRole === 'oraculo' || myRole === 'cumplice' || isPassAndPlayMode || inspectCard.player.id === myPlayerId) &&
                    (inspectCard.player.role === 'assassino' || inspectCard.player.id === room.secretSolution?.killerPlayerId) &&
                    (inspectCard.type === 'method'
                      ? inspectCard.card.id === room.secretSolution?.methodId
                      : inspectCard.card.id === room.secretSolution?.objectId);

                  return inspectCard.type === 'method' ? (
                    <MethodCard
                      method={inspectCard.card as CardMethod}
                      size="lg"
                      isSolution={isSolutionCard}
                      badge={isSolutionCard ? '🔥 MÉTODO ESCOLHIDO PELO ASSASSINO' : undefined}
                    />
                  ) : (
                    <ObjectCard
                      object={inspectCard.card as CardObject}
                      size="lg"
                      isSolution={isSolutionCard}
                      badge={isSolutionCard ? '🔥 OBJETO ESCOLHIDO PELO ASSASSINO' : undefined}
                    />
                  );
                })()}
              </div>

              <div className="flex-1 w-full bg-black/60 p-4 sm:p-5 rounded-2xl border border-amber-900/40 text-left space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                    {inspectCard.type === 'method' ? 'MÉTODO DE CRIME' : 'OBJETO DO CRIME'}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40">
                    {inspectCard.card.id}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-black text-amber-100 uppercase">
                  {inspectCard.card.name}
                </h3>
                {inspectCard.card.category && (
                  <span className="text-xs font-serif text-amber-400 font-bold block">
                    Categoria: {inspectCard.card.category}
                  </span>
                )}
                {inspectCard.card.description && (
                  <p className="text-xs sm:text-sm text-zinc-300 font-serif leading-relaxed italic">
                    "{inspectCard.card.description}"
                  </p>
                )}
                <div className="pt-2 border-t border-white/10 text-[10px] text-zinc-400 font-serif italic">
                  💡 Pressione duas vezes para vincular arte personalizada
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectCard(null)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-serif font-black text-xs sm:text-sm uppercase tracking-[0.2em] rounded-xl transition-all shadow-lg active:scale-95 border border-amber-300"
            >
              FECHAR INSPEÇÃO
            </button>
          </div>
        </div>
      )}

      {/* Accusation Modal */}
      {showAccuseModal && (
        <AccusationModal
          room={room}
          myPlayerId={myPlayerId}
          onClose={() => setShowAccuseModal(false)}
          onConfirmAccusation={handleAccusationConfirm}
        />
      )}

      {/* Official Accusations History Modal */}
      {showAccusationsModal && (
        <AccusationsHistoryModal
          room={room}
          onClose={() => setShowAccusationsModal(false)}
        />
      )}

      {/* Crime Diary & Narrative with Oracle Edit Modal */}
      {showStoryModal && (
        <CrimeNarrativeModal
          room={room}
          myPlayerId={myPlayerId}
          onClose={() => setShowStoryModal(false)}
          onSaveNarrative={handleUpdateStoryAction}
        />
      )}

      {/* Rules Modal */}
      {showRules && <RulesReferenceModal onClose={() => setShowRules(false)} />}

      {/* In-Game Quick Menu Modal */}
      {showInGameMenu && room && (
        <InGameQuickMenuModal
          isOpen={showInGameMenu}
          onClose={() => setShowInGameMenu(false)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenRules={() => setShowRules(true)}
          onOpenHistory={() => setShowAccusationsModal(true)}
          onOpenStory={() => setShowStoryModal(true)}
          onOpenMobileGuide={() => setShowMobileGuide(true)}
          onLeaveRoom={handleLeaveRoom}
          isHost={room.players[0]?.id === myPlayerId || isPassAndPlayMode || room.code === 'SOLO'}
          onRestartGame={handleRestartGame}
          roomCode={room.code}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          isInRoom={!!room}
          onLeaveRoom={handleLeaveRoom}
          onOpenRules={() => setShowRules(true)}
          onOpenMobileGuide={() => setShowMobileGuide(true)}
        />
      )}

      {/* Mobile App & Online Host Guide Modal */}
      {showMobileGuide && (
        <MobileAppGuideModal
          isOpen={showMobileGuide}
          onClose={() => setShowMobileGuide(false)}
          deferredPrompt={deferredInstallPrompt}
          onTriggerInstall={handleTriggerInstall}
        />
      )}

      {/* Role Reveal Opening Cinematic Cutscene */}
      {showRoleRevealCutscene && myPlayer && room && (
        <RoleRevealCutscene
          player={myPlayer}
          room={room}
          onFinish={() => setShowRoleRevealCutscene(false)}
        />
      )}

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirmModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#140704] border-2 border-red-600/80 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-red-600/20 rounded-full blur-2xl pointer-events-none" />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-950/80 border border-red-500/60 flex items-center justify-center mb-4 shadow-lg">
              <AlertTriangle className="w-7 h-7 text-red-400 animate-pulse" />
            </div>
            <h3 className="font-serif text-lg font-black text-amber-200 uppercase tracking-wider mb-2">
              ABANDONAR INVESTIGAÇÃO?
            </h3>
            <p className="text-xs font-serif text-zinc-300 leading-relaxed mb-6">
              Você está prestes a sair da partida em andamento e retornar à tela inicial. O progresso e o estado da sala serão interrompidos.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowExitConfirmModal(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-serif font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                CONTINUAR JOGANDO
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowExitConfirmModal(false);
                  handleLeaveRoom();
                }}
                className="w-full py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 hover:text-white font-serif text-xs font-bold uppercase tracking-wider active:scale-95 transition-all"
              >
                SAIR DA PARTIDA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Observation Secret Result Modal */}
      {observationNotice && (
        <div className="fixed inset-0 z-[105] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-[#1c0a06] via-[#100402] to-black border-2 border-amber-500/80 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-950/90 border border-amber-400 flex items-center justify-center mb-4 shadow-lg">
              <Eye className="w-7 h-7 text-amber-300 animate-pulse" />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block mb-1 font-bold">
              VISÃO DO OBSERVADOR
            </span>
            <h3 className="font-serif text-lg font-black text-amber-100 uppercase tracking-wider mb-2">
              {observationNotice.targetName}
            </h3>
            <p className="text-xs font-serif text-zinc-200 leading-relaxed mb-6 bg-black/60 p-3 rounded-xl border border-amber-900/60 italic">
              {observationNotice.observation}
            </p>
            <button
              onClick={() => {
                soundEngine.playClick();
                setObservationNotice(null);
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-serif font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all"
            >
              COMPREENDIDO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameZoomProvider>
      <GameApp />
    </GameZoomProvider>
  );
}
