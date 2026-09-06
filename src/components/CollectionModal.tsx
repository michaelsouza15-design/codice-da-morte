import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Layers,
  Search,
  Sparkles,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FolderArchive,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Skull,
  Sword,
  Shield,
  FileSearch,
  Flame,
  User,
  Users,
  HardDrive,
  RefreshCw,
  Download,
  FileCheck,
  BookOpen,
  Music,
  Play,
  Square,
  Volume2,
} from 'lucide-react';
import {
  METHODS,
  OBJECTS,
  SECRET_ROLES,
  EVIDENCES,
  EVENTS,
  ABILITIES,
  CHARACTERS,
  SecretRoleData,
} from '../data/gameData';
import {
  CharacterRoleCard,
  SecretRoleCard,
  MethodCard,
  ObjectCard,
  EvidenceCard,
  EventCard,
  AbilityCard,
} from './GothicCard';
import { GothicWaxSeal } from './GothicWaxSeal';
import { RulesReferenceCard } from './RulesReferenceCard';
import { soundEngine, SOUNDTRACK_PLAYLIST, TrackId } from '../utils/soundEngine';
import {
  useAllCustomCardArts,
  setCustomCardArt,
  setBatchCustomCardArts,
  persistCharacterToServer,
  persistAssetToServer,
  removeCustomCardArt,
  clearAllCustomCardArts,
  matchCardIdFromFileName,
  processImageUpload,
  syncCardsWithServer,
  downloadCardsBackupFile,
  importCardsBackupJSON,
  CardMatchResult,
} from '../utils/customCardArt';
import { useDragScroll } from '../utils/useDragScroll';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: CollectionCategory;
}

export type CollectionCategory =
  | 'metodos'
  | 'objetos'
  | 'papeis'
  | 'marcadores'
  | 'evidencias'
  | 'eventos'
  | 'habilidades'
  | 'personagens'
  | 'manual'
  | 'audio'
  | 'lote';

export interface OracleMarkerItem {
  id: string;
  name: string;
  color: 'dourado' | 'vermelho' | 'azul' | 'cinza' | 'preto';
  roleDescription: string;
  meaning: string;
  badge: string;
  badgeStyle: string;
}

export const ORACLE_MARKERS: OracleMarkerItem[] = [
  {
    id: 'seal_dourado',
    name: 'Marcador Dourado',
    color: 'dourado',
    roleDescription: 'Selo Real do Oráculo',
    meaning: 'Pista de máxima certeza absoluta ou conexão central de todo o mistério.',
    badge: 'Pista Central',
    badgeStyle: 'bg-amber-950/80 border-amber-500/50 text-amber-300',
  },
  {
    id: 'seal_vermelho',
    name: 'Marcador Vermelho',
    color: 'vermelho',
    roleDescription: 'Selo Escarlate da Morte',
    meaning: 'Indica conexão direta com a Causa Mortis fatal ou Método de Execução do homicídio.',
    badge: 'Método Fatal',
    badgeStyle: 'bg-red-950/80 border-red-500/50 text-red-300',
  },
  {
    id: 'seal_azul',
    name: 'Marcador Azul',
    color: 'azul',
    roleDescription: 'Selo de Aço Frio',
    meaning: 'Indica a Arma, Instrumento de Contato ou Objeto do Crime utilizado.',
    badge: 'Objeto do Crime',
    badgeStyle: 'bg-blue-950/80 border-blue-500/50 text-blue-300',
  },
  {
    id: 'seal_cinza',
    name: 'Marcador Cinza',
    color: 'cinza',
    roleDescription: 'Selo de Névoa',
    meaning: 'Indica incerteza, ambiguidade deliberada ou menor probabilidade de correlação.',
    badge: 'Incerteza / Névoa',
    badgeStyle: 'bg-zinc-900/80 border-zinc-500/50 text-zinc-300',
  },
  {
    id: 'seal_preto',
    name: 'Marcador Sombrio',
    color: 'preto',
    roleDescription: 'Selo Hermético das Trevas',
    meaning: 'Indica evidência adulterada pelo Assassino ou segredo hermético.',
    badge: 'Evidência Oculta',
    badgeStyle: 'bg-black/90 border-zinc-700/60 text-zinc-400',
  },
];

interface BatchUploadReport {
  matched: Array<{
    fileName: string;
    cardId: string;
    cardName: string;
    category: string;
  }>;
  unmatched: string[];
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'metodos',
}) => {
  const [category, setCategory] = useState<CollectionCategory>(initialCategory);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [batchReport, setBatchReport] = useState<BatchUploadReport | null>(null);
  const [isSyncingServer, setIsSyncingServer] = useState(false);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);

  const customArts = useAllCustomCardArts();
  const { ref: tabsScrollRef, dragHandlers: tabsDragHandlers } = useDragScroll<HTMLDivElement>();
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonBackupInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Single file upload handler
  const handleSingleFileUpload = async (cardId: string, e: React.ChangeEvent<HTMLInputElement>, charIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      soundEngine.playCardFlip();
      const dataUrl = await processImageUpload(file);
      const isChar = charIndex !== undefined || cardId.startsWith('char_') || cardId.startsWith('personagem_') || cardId.startsWith('crest_');
      
      if (isChar) {
        await persistCharacterToServer(charIndex !== undefined ? charIndex : cardId, dataUrl, file.name);
        setCustomCardArt(cardId, dataUrl);
        setUploadStatusMsg({
          text: `⚡ Imagem PNG do personagem substituída diretamente no servidor (/characters/) sem duplicações!`,
        });
      } else {
        await persistAssetToServer(cardId, dataUrl, file.name);
        setCustomCardArt(cardId, dataUrl);
        setUploadStatusMsg({
          text: `⚡ Arquivo PNG salvo e substituído com sucesso no servidor sem duplicações (${cardId})!`,
        });
      }
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } catch (err) {
      console.error('Failed to upload card art:', err);
      setUploadStatusMsg({ text: `Erro ao processar a imagem.`, isError: true });
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Single audio file upload handler
  const handleSingleAudioUpload = async (trackId: TrackId, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      soundEngine.playCardFlip();
      await soundEngine.loadCustomAudioFile(file, trackId);
      setUploadStatusMsg({
        text: `⚡ Trilha de áudio MP3 substituída com sucesso no servidor (/public/audio/) sem duplicações!`,
      });
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } catch (err) {
      console.error('Failed to upload audio track:', err);
      setUploadStatusMsg({ text: `Erro ao processar o arquivo de áudio.`, isError: true });
      setTimeout(() => setUploadStatusMsg(null), 4000);
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Batch file upload handler (handles 130+ files e.g. M01.png..M60.png, O01.png..O64.png, R01.png..R05.png, rules, audio)
  const handleBatchFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessingBatch(true);
    setUploadProgress({ current: 0, total: files.length });
    soundEngine.playCardFlip();

    const matchedEntries: Record<string, string> = {};
    const report: BatchUploadReport = {
      matched: [],
      unmatched: [],
    };

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress({ current: i + 1, total: files.length });

        const isAudio = file.type.startsWith('audio/') || file.name.toLowerCase().endsWith('.mp3') || file.name.toLowerCase().endsWith('.wav');
        const isImage = file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.png') || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.webp');

        if (!isAudio && !isImage) {
          report.unmatched.push(`${file.name} (tipo de arquivo não suportado)`);
          continue;
        }

        const match: CardMatchResult | null = matchCardIdFromFileName(file.name);
        if (match) {
          try {
            if (match.category === 'audio' || isAudio) {
              await soundEngine.loadCustomAudioFile(file, match.cardId as TrackId);
              report.matched.push({
                fileName: file.name,
                cardId: match.cardId,
                cardName: match.cardName,
                category: match.category,
              });
              continue;
            }

            const dataUrl = await processImageUpload(file);
            matchedEntries[match.cardId] = dataUrl;

            // When matching characters or crests, replace directly in /characters/ without duplicating card files
            if (match.category === 'personagens' || match.category === 'brasoes') {
              const bareId = match.cardId.replace(/^char_card_|^crest_/, '');
              const charObj = CHARACTERS.find((c) => c.id === bareId || `char_card_${c.id}` === match.cardId);
              const charSlot = charObj?.number ? charObj.number - 1 : undefined;
              
              await persistCharacterToServer(charSlot !== undefined ? charSlot : match.cardId, dataUrl, file.name);

              matchedEntries[`crest_${bareId}`] = dataUrl;
              matchedEntries[`char_card_${bareId}`] = dataUrl;
              matchedEntries[bareId] = dataUrl;
              matchedEntries[`char_${bareId}`] = dataUrl;

              if (charObj) {
                if (charObj.number) {
                  matchedEntries[`perso_${charObj.number}`] = dataUrl;
                  matchedEntries[`char_${(charObj.number - 1).toString().padStart(2, '0')}`] = dataUrl;
                }
                if (charObj.aliases) {
                  for (const a of charObj.aliases) {
                    matchedEntries[a] = dataUrl;
                  }
                }
              }
            } else if (match.category === 'manual') {
              await persistAssetToServer('rules_reference', dataUrl, file.name);
              matchedEntries['rules_reference'] = dataUrl;
              matchedEntries['codice_regras'] = dataUrl;
              matchedEntries['manual_regras'] = dataUrl;
            }

            report.matched.push({
              fileName: file.name,
              cardId: match.cardId,
              cardName: match.cardName,
              category: match.category,
            });
          } catch (err) {
            console.error(`Error processing file ${file.name}:`, err);
            report.unmatched.push(`${file.name} (erro ao processar)`);
          }
        } else {
          report.unmatched.push(file.name);
        }
      }

      if (Object.keys(matchedEntries).length > 0) {
        await setBatchCustomCardArts(matchedEntries, (curr, tot) => {
          setUploadProgress({ current: curr, total: tot });
        });
        soundEngine.playVictory();
        setUploadStatusMsg({
          text: `⚡ ${report.matched.length} itens vinculados e substituídos no servidor sem duplicações!`,
        });
      } else if (report.matched.length > 0) {
        soundEngine.playVictory();
        setUploadStatusMsg({
          text: `⚡ ${report.matched.length} arquivos de áudio / manuais substituídos no servidor com sucesso!`,
        });
      } else {
        soundEngine.playClick();
        setUploadStatusMsg({
          text: `Nenhum arquivo correspondeu aos nomes de cartas, personagens, manuais ou áudio.`,
          isError: true,
        });
      }

      setBatchReport(report);
    } catch (err) {
      console.error('Batch upload error:', err);
      setUploadStatusMsg({ text: `Erro durante o upload em lote.`, isError: true });
    } finally {
      setIsProcessingBatch(false);
      setUploadProgress(null);
      if (batchFileInputRef.current) batchFileInputRef.current.value = '';
    }
  };

  const handleRemoveArt = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playClick();
    removeCustomCardArt(cardId);
    setUploadStatusMsg({ text: `Arte da carta ${cardId} restaurada ao modelo original.` });
    setTimeout(() => setUploadStatusMsg(null), 3000);
  };

  // Export all custom arts as JSON backup
  const handleExportBackup = async () => {
    try {
      soundEngine.playClick();
      const count = await downloadCardsBackupFile();
      setUploadStatusMsg({ text: `Backup com ${count} artes exportado em JSON com sucesso!` });
      setTimeout(() => setUploadStatusMsg(null), 3500);
    } catch (err) {
      console.error('Failed to export backup:', err);
      setUploadStatusMsg({ text: 'Erro ao gerar arquivo de backup.', isError: true });
    }
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        setIsProcessingBatch(true);
        const result = await importCardsBackupJSON(ev.target?.result as string, (curr, tot) => {
          setUploadProgress({ current: curr, total: tot });
        });
        if (result.success) {
          soundEngine.playVictory();
          setUploadStatusMsg({ text: `⚡ Backup com ${result.count} artes restaurado e gravado no servidor (/public/cards/) com sucesso!` });
          setTimeout(() => setUploadStatusMsg(null), 4500);
        } else {
          setUploadStatusMsg({ text: 'Nenhuma carta válida encontrada no arquivo JSON.', isError: true });
        }
      } catch (err) {
        console.error('Error restoring backup:', err);
        setUploadStatusMsg({ text: 'Arquivo JSON inválido ou corrompido.', isError: true });
      } finally {
        setIsProcessingBatch(false);
        setUploadProgress(null);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  // Sync with server
  const handleSyncServer = async () => {
    setIsSyncingServer(true);
    soundEngine.playClick();
    try {
      const serverCards = await syncCardsWithServer();
      soundEngine.playVictory();
      const count = Object.keys(serverCards).length;
      setUploadStatusMsg({
        text: `Sincronização concluída! ${count} arquivos físicos verificados no servidor.`,
      });
      setTimeout(() => setUploadStatusMsg(null), 3500);
    } catch (err) {
      console.error(err);
      setUploadStatusMsg({ text: 'Erro ao sincronizar com servidor.', isError: true });
    } finally {
      setIsSyncingServer(false);
    }
  };

  // Filtered counts and lists
  const methodsCountLinked = METHODS.filter((m) => !!customArts[m.id]).length;
  const objectsCountLinked = OBJECTS.filter((o) => !!customArts[o.id]).length;
  const rolesCountLinked = SECRET_ROLES.filter(
    (r) => !!(customArts[`role_${r.role}`] || customArts[r.role] || customArts[r.id])
  ).length;
  const markersCountLinked = ORACLE_MARKERS.filter(
    (m) =>
      !!(
        customArts[m.id] ||
        customArts[`marcador_${m.color}`] ||
        customArts[`seal_${m.color}`] ||
        customArts[m.color] ||
        customArts[`selo_${m.color}`]
      )
  ).length;
  const evidencesCountLinked = EVIDENCES.filter((e) => !!customArts[e.id]).length;
  const eventsCountLinked = EVENTS.filter((ev) => !!customArts[ev.id]).length;
  const abilitiesCountLinked = ABILITIES.filter((h) => !!customArts[h.id]).length;
  const charactersCountLinked = CHARACTERS.filter(
    (c) =>
      !!(
        customArts[`char_card_${c.id}`] ||
        customArts[c.id] ||
        customArts[`crest_${c.id}`] ||
        (c.number && (customArts[`perso_${c.number}`] || customArts[`perso${c.number}`] || customArts[`char_${c.number}`])) ||
        (c.aliases && c.aliases.some((a) => customArts[`char_card_${a}`] || customArts[a] || customArts[`crest_${a}`]))
      )
  ).length;

  const totalDistinctLinked =
    methodsCountLinked +
    objectsCountLinked +
    rolesCountLinked +
    markersCountLinked +
    evidencesCountLinked +
    eventsCountLinked +
    abilitiesCountLinked +
    charactersCountLinked;
  const totalDistinctPossible = 60 + 64 + 5 + 5 + EVIDENCES.length + EVENTS.length + ABILITIES.length + CHARACTERS.length;

  const filteredCharacters = CHARACTERS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.roleTag && c.roleTag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoles = SECRET_ROLES.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMarkers = ORACLE_MARKERS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.badge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.color.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMethods = METHODS.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredObjects = OBJECTS.filter(
    (o) =>
      o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvidences = (EVIDENCES || []).filter(
    (e) =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = EVENTS.filter(
    (ev) =>
      ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.effect.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAbilities = ABILITIES.filter(
    (ab) =>
      ab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ab.effect.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ab.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories: {
    id: CollectionCategory;
    label: string;
    icon: React.ReactNode;
    count: number;
    linkedCount: number;
  }[] = [
    {
      id: 'metodos',
      label: 'Métodos (M01-M60)',
      icon: <Skull className="w-3.5 h-3.5 text-red-400" />,
      count: METHODS.length,
      linkedCount: methodsCountLinked,
    },
    {
      id: 'objetos',
      label: 'Objetos (O01-O64)',
      icon: <Sword className="w-3.5 h-3.5 text-blue-400" />,
      count: OBJECTS.length,
      linkedCount: objectsCountLinked,
    },
    {
      id: 'papeis',
      label: '5 Papéis Secretos',
      icon: <Shield className="w-3.5 h-3.5 text-purple-400" />,
      count: SECRET_ROLES.length,
      linkedCount: rolesCountLinked,
    },
    {
      id: 'marcadores',
      label: 'Marcadores (5 Selos)',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />,
      count: ORACLE_MARKERS.length,
      linkedCount: markersCountLinked,
    },
    {
      id: 'evidencias',
      label: 'Evidências (E01-E60)',
      icon: <FileSearch className="w-3.5 h-3.5 text-amber-400" />,
      count: (EVIDENCES || []).length,
      linkedCount: evidencesCountLinked,
    },
    {
      id: 'eventos',
      label: 'Eventos (EV01-EV16)',
      icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
      count: EVENTS.length,
      linkedCount: eventsCountLinked,
    },
    {
      id: 'habilidades',
      label: 'Habilidades (H01-H12)',
      icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400" />,
      count: ABILITIES.length,
      linkedCount: abilitiesCountLinked,
    },
    {
      id: 'personagens',
      label: 'Personagens (42)',
      icon: <User className="w-3.5 h-3.5 text-cyan-400" />,
      count: CHARACTERS.length,
      linkedCount: charactersCountLinked,
    },
    {
      id: 'manual',
      label: 'Manual de Regras',
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-300" />,
      count: 1,
      linkedCount: (customArts['rules_reference'] || customArts['codice_regras']) ? 1 : 0,
    },
    {
      id: 'audio',
      label: 'Trilhas MP3 (5)',
      icon: <Music className="w-3.5 h-3.5 text-rose-400" />,
      count: SOUNDTRACK_PLAYLIST.length,
      linkedCount: SOUNDTRACK_PLAYLIST.length,
    },
    {
      id: 'lote',
      label: '⚡ Upload em Lote & Servidor',
      icon: <FolderArchive className="w-3.5 h-3.5 text-amber-300 animate-pulse" />,
      count: Object.keys(customArts).length,
      linkedCount: Object.keys(customArts).length,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in text-[#e8dfd8]"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files) {
          handleBatchFiles(e.dataTransfer.files);
        }
      }}
    >
      {/* Hidden batch file input */}
      <input
        ref={batchFileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp, audio/mpeg, audio/mp3, audio/wav, .mp3, .wav"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleBatchFiles(e.target.files);
        }}
      />

      {/* Hidden backup json input */}
      <input
        ref={jsonBackupInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleImportBackup}
      />

      <div className="bg-gradient-to-b from-[#160c0c] via-[#0d0707] to-black border-2 border-amber-500/60 rounded-3xl max-w-6xl w-full p-3 sm:p-6 shadow-2xl shadow-black max-h-[94vh] flex flex-col space-y-3 sm:space-y-4 relative overflow-hidden">
        {/* Drag Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 bg-amber-950/90 border-4 border-dashed border-amber-400 rounded-3xl flex flex-col items-center justify-center gap-3 backdrop-blur-sm pointer-events-none animate-pulse">
            <Upload className="w-16 h-16 text-amber-300 animate-bounce" />
            <h3 className="text-xl font-serif font-black text-amber-200 uppercase tracking-widest text-center">
              Solte todos os PNGs para Vincular e Salvar no Servidor
            </h3>
            <p className="text-xs font-mono text-amber-300 text-center max-w-md">
              Arquivos nomeados M01 a M60 (Métodos), O01 a O64 (Objetos) e papéis secretos serão salvos permanentemente em /public/cards/!
            </p>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-md shrink-0">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-serif font-black text-amber-200 uppercase tracking-wider sm:tracking-widest truncate">
                  COLEÇÃO & VINCULAÇÃO PERMANENTE DE CARTAS
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                  <HardDrive className="w-3 h-3" /> /public/cards/ (Sem Limites)
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-amber-400/80 font-serif truncate">
                60 Métodos (M01-M60) • 64 Objetos (O01-O64) • 5 Papéis Secretos • Evidências • Salvos no Disco para a Versão Final
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Batch Upload Button */}
            <button
              onClick={() => {
                soundEngine.playClick();
                batchFileInputRef.current?.click();
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider border border-amber-300/80 shadow-md flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Upload em Lote (130+ PNGs)</span>
              <span className="sm:hidden">Lote</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/80 text-zinc-400 hover:text-white border border-white/10 hover:border-amber-400/50 shrink-0 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Progress Bar when uploading */}
        {isProcessingBatch && uploadProgress && (
          <div className="py-2 px-3 bg-amber-950/90 border border-amber-500/50 rounded-xl text-xs font-mono text-amber-300 space-y-1.5 animate-pulse shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                Processando e salvando PNGs no disco do servidor...
              </span>
              <span>
                {uploadProgress.current} / {uploadProgress.total} (
                {Math.round((uploadProgress.current / uploadProgress.total) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-amber-500/30">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-150"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Alert Message */}
        {uploadStatusMsg && (
          <div
            className={`py-1.5 px-3 rounded-xl text-xs font-mono flex items-center justify-between gap-2 animate-fade-in shadow-md ${
              uploadStatusMsg.isError
                ? 'bg-red-950/90 border border-red-500/50 text-red-300'
                : 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {uploadStatusMsg.isError ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{uploadStatusMsg.text}</span>
            </div>
            <button
              onClick={() => setUploadStatusMsg(null)}
              className="text-xs text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Batch Report Detail Modal/Pill if generated */}
        {batchReport && (
          <div className="p-2.5 rounded-2xl bg-black/80 border border-amber-500/40 text-xs font-mono space-y-1.5 animate-fade-in max-h-32 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <FolderArchive className="w-3.5 h-3.5 text-amber-400" /> Relatório do Upload: {batchReport.matched.length} cartas identificadas
              </span>
              <button
                onClick={() => setBatchReport(null)}
                className="text-[10px] text-zinc-400 hover:text-white"
              >
                Fechar
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {batchReport.matched.map((m) => (
                <span
                  key={m.cardId}
                  className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px]"
                >
                  ✅ {m.cardId}: {m.cardName}
                </span>
              ))}
              {batchReport.unmatched.length > 0 && (
                <div className="w-full text-amber-400/90 text-[10px] mt-1">
                  ⚠️ {batchReport.unmatched.length} arquivos não identificados: {batchReport.unmatched.slice(0, 8).join(', ')}
                  {batchReport.unmatched.length > 8 ? '...' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCROLLABLE CATEGORIES NAVIGATION ROW (Smooth Drag Scroll with Mouse or Touch) */}
        <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-2 shrink-0">
          <div className="relative flex items-center flex-1 min-w-0">
            <div
              ref={tabsScrollRef}
              {...tabsDragHandlers}
              className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1.5 px-2 rounded-2xl bg-black/70 border border-amber-500/30 w-full touch-pan-x select-none cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                const isComplete = cat.count > 0 && cat.linkedCount === cat.count;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setCategory(cat.id);
                    }}
                    className={`py-1.5 px-2.5 sm:px-3 text-[10px] sm:text-xs font-serif font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 snap-start cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md border border-amber-300 scale-102 font-black'
                        : 'text-zinc-400 hover:text-amber-200 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                        isComplete
                          ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                          : isSelected
                          ? 'bg-black/70 text-amber-200'
                          : 'bg-black/50 text-zinc-400'
                      }`}
                    >
                      {cat.id === 'lote' ? `${cat.linkedCount}` : `${cat.linkedCount}/${cat.count}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input */}
          {category !== 'lote' && (
            <div className="relative w-full md:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar (${category})...`}
                className="w-full bg-black/60 border border-amber-500/20 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* CARDS GRID & CATEGORY VIEWS */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* 1. MÉTODOS (60 Cartas M01 a M60) */}
          {category === 'metodos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-black/40 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-red-300 font-bold">
                  Todos os 60 Métodos de M01 a M60 ({methodsCountLinked}/60 vinculados)
                </span>
                <span className="text-zinc-400 text-[11px] hidden sm:inline">
                  {methodsCountLinked === 60 ? '✅ 100% Completo' : `Faltam ${60 - methodsCountLinked} métodos • Clique em "Subir PNG" no card`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-items-center">
                {filteredMethods.map((m) => {
                  const cardId = m.id;
                  const hasCustomArt = !!customArts[cardId];
                  return (
                    <div
                      key={m.id}
                      className="w-full flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-amber-500/10 hover:border-amber-500/30 transition-all relative group"
                    >
                      <MethodCard method={m} onClick={() => soundEngine.playCardFlip()} />
                      
                      <div className="flex items-center justify-between w-full px-0.5 gap-1 text-[9px] font-mono">
                        <label className="cursor-pointer flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-amber-950/80 hover:bg-amber-800 border border-amber-500/30 hover:border-amber-400 rounded-lg text-amber-200 transition-all text-center">
                          <Upload className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          <span className="truncate">{hasCustomArt ? 'Trocar' : 'Subir PNG'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSingleFileUpload(cardId, e)}
                          />
                        </label>
                        {hasCustomArt && (
                          <button
                            onClick={(e) => handleRemoveArt(cardId, e)}
                            className="p-1 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-lg border border-red-900/50 transition-all shrink-0"
                            title="Restaurar arte original"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. OBJETOS (64 Cartas O01 a O64) */}
          {category === 'objetos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-black/40 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-blue-300 font-bold">
                  Todos os 64 Objetos de O01 a O64 ({objectsCountLinked}/64 vinculados)
                </span>
                <span className="text-zinc-400 text-[11px]">
                  {objectsCountLinked === 64 ? '✅ 100% Completo' : `Faltam ${64 - objectsCountLinked} objetos`}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-items-center">
                {filteredObjects.map((o) => {
                  const cardId = o.id;
                  const hasCustomArt = !!customArts[cardId];
                  return (
                    <div
                      key={o.id}
                      className="w-full flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-amber-500/10 hover:border-blue-500/30 transition-all relative group"
                    >
                      <ObjectCard object={o} onClick={() => soundEngine.playCardFlip()} />
                      
                      <div className="flex items-center justify-between w-full px-0.5 gap-1 text-[9px] font-mono">
                        <label className="cursor-pointer flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-blue-950/80 hover:bg-blue-800 border border-blue-500/30 hover:border-blue-400 rounded-lg text-blue-200 transition-all text-center">
                          <Upload className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                          <span className="truncate">{hasCustomArt ? 'Trocar' : 'Subir PNG'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSingleFileUpload(cardId, e)}
                          />
                        </label>
                        {hasCustomArt && (
                          <button
                            onClick={(e) => handleRemoveArt(cardId, e)}
                            className="p-1 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-lg border border-red-900/50 transition-all shrink-0"
                            title="Restaurar arte original"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. 5 PAPÉIS SECRETOS */}
          {category === 'papeis' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-black/40 border border-purple-500/30 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-purple-300 font-bold">
                  Os 5 Papéis Secretos ({rolesCountLinked}/5 vinculados)
                </span>
                <span className="text-zinc-400 text-[11px] hidden sm:inline">
                  Assassino (R01) • Oráculo (R02) • Investigador (R03) • Cúmplice (R04) • Sabotador (R05)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 justify-items-center">
                {filteredRoles.map((r) => {
                  const cardId = `role_${r.role}`;
                  const hasCustomArt = !!(customArts[cardId] || customArts[r.role] || customArts[r.id]);
                  return (
                    <div
                      key={r.id}
                      className="w-full flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-purple-500/20 hover:border-purple-500/40 transition-all relative group"
                    >
                      <SecretRoleCard roleData={r} onClick={() => soundEngine.playCardFlip()} />
                      
                      <div className="flex items-center justify-between w-full px-0.5 gap-1 text-[9px] font-mono">
                        <label className="cursor-pointer flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-purple-950/80 hover:bg-purple-800 border border-purple-500/30 hover:border-purple-400 rounded-lg text-purple-200 transition-all text-center">
                          <Upload className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                          <span className="truncate">{hasCustomArt ? 'Trocar' : 'Subir PNG'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSingleFileUpload(cardId, e)}
                          />
                        </label>
                        {hasCustomArt && (
                          <button
                            onClick={(e) => handleRemoveArt(cardId, e)}
                            className="p-1 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-lg border border-red-900/50 transition-all shrink-0"
                            title="Restaurar arte original"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. MARCADORES / SELOS DO ORÁCULO (5 Selos) */}
          {category === 'marcadores' && (
            <div className="space-y-4 max-w-5xl mx-auto animate-fade-in">
              <div className="flex items-center justify-between bg-black/40 border border-amber-500/30 px-3.5 py-2 rounded-xl text-xs font-mono">
                <span className="text-amber-300 font-bold">
                  Os 5 Marcadores / Selos de Cera do Oráculo ({markersCountLinked}/5 personalizados)
                </span>
                <span className="text-zinc-400 text-[11px] hidden sm:inline">
                  Suba imagens PNG ou WebP para substituir o selo 3D original
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMarkers.map((marker) => {
                  const hasCustom = !!(
                    customArts[marker.id] ||
                    customArts[`marcador_${marker.color}`] ||
                    customArts[`seal_${marker.color}`] ||
                    customArts[marker.color] ||
                    customArts[`selo_${marker.color}`]
                  );
                  return (
                    <div
                      key={marker.id}
                      className="p-4 rounded-3xl bg-gradient-to-b from-zinc-900/90 via-black to-black border border-amber-500/20 hover:border-amber-400/50 flex flex-col items-center text-center gap-3 transition-all relative group shadow-xl"
                    >
                      {/* Live Seal Render */}
                      <div className="w-24 h-24 rounded-2xl bg-black/80 border border-white/10 flex items-center justify-center p-2 relative shadow-inner">
                        <GothicWaxSeal color={marker.color} size="xl" glow pulse={false} />
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 w-full">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-serif font-bold text-sm text-amber-200 uppercase tracking-wider">
                            {marker.name}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono border ${marker.badgeStyle}`}>
                            {marker.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed px-1">
                          {marker.meaning}
                        </p>
                      </div>

                      {/* Upload & Revert Controls */}
                      <div className="flex items-center gap-2 w-full pt-1">
                        <label className="flex-1 cursor-pointer py-2 px-3 rounded-xl bg-gradient-to-r from-amber-700/90 to-amber-600/90 hover:from-amber-600 hover:to-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider border border-amber-400/40 flex items-center justify-center gap-2 shadow transition-all">
                          <Upload className="w-3.5 h-3.5 text-amber-300" />
                          <span>{hasCustom ? 'Trocar Selo PNG' : 'Subir Selo PNG'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleSingleFileUpload(marker.id, e)}
                          />
                        </label>

                        {hasCustom && (
                          <button
                            onClick={(e) => handleRemoveArt(marker.id, e)}
                            className="p-2 text-red-400 hover:text-red-200 bg-red-950/80 hover:bg-red-900 rounded-xl border border-red-500/40 transition-all"
                            title="Restaurar selo padrão"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. EVIDÊNCIAS (60 Cartas E01 a E60) */}
          {category === 'evidencias' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center">
              {filteredEvidences.map((ev) => {
                const cardId = ev.id;
                const hasCustomArt = !!customArts[cardId];
                return (
                  <div key={ev.id} className="w-full flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-amber-500/10 hover:border-amber-500/30 transition-all relative group">
                    <EvidenceCard evidence={ev} isOracleInteractive={false} />
                    
                    <div className="flex items-center justify-between w-full px-0.5 gap-1 text-[9px] font-mono">
                      <label className="cursor-pointer flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-amber-950/80 hover:bg-amber-800 border border-amber-500/30 hover:border-amber-400 rounded-lg text-amber-200 transition-all text-center">
                        <Upload className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="truncate">{hasCustomArt ? 'Trocar' : 'Subir PNG'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSingleFileUpload(cardId, e)}
                        />
                      </label>
                      {hasCustomArt && (
                        <button
                          onClick={(e) => handleRemoveArt(cardId, e)}
                          className="p-1 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-lg border border-red-900/50 transition-all shrink-0"
                          title="Restaurar arte original"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 6. EVENTOS */}
          {category === 'eventos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center">
              {filteredEvents.map((event) => {
                const cardId = event.id;
                const hasCustomArt = !!customArts[cardId];
                return (
                  <div key={event.id} className="w-full flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-orange-500/10 hover:border-orange-500/30 transition-all relative group">
                    <EventCard event={event} />
                    
                    <div className="flex items-center justify-between w-full px-0.5 gap-1 text-[9px] font-mono">
                      <label className="cursor-pointer flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-orange-950/80 hover:bg-orange-800 border border-orange-500/30 hover:border-orange-400 rounded-lg text-orange-200 transition-all text-center">
                        <Upload className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                        <span className="truncate">{hasCustomArt ? 'Trocar' : 'Subir PNG'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSingleFileUpload(cardId, e)}
                        />
                      </label>
                      {hasCustomArt && (
                        <button
                          onClick={(e) => handleRemoveArt(cardId, e)}
                          className="p-1 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-lg border border-red-900/50 transition-all shrink-0"
                          title="Restaurar arte original"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 7. HABILIDADES */}
          {category === 'habilidades' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 justify-items-center">
              {filteredAbilities.map((ability) => {
                const cardId = ability.id;
                const hasCustomArt = !!customArts[cardId];
                return (
                  <div key={ability.id} className="w-full flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-emerald-500/10 hover:border-emerald-500/30 transition-all relative group">
                    <AbilityCard ability={ability} />
                    
                    <div className="flex items-center justify-between w-full px-0.5 gap-1 text-[9px] font-mono">
                      <label className="cursor-pointer flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-emerald-950/80 hover:bg-emerald-800 border border-emerald-500/30 hover:border-emerald-400 rounded-lg text-emerald-200 transition-all text-center">
                        <Upload className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{hasCustomArt ? 'Trocar' : 'Subir PNG'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleSingleFileUpload(cardId, e)}
                        />
                      </label>
                      {hasCustomArt && (
                        <button
                          onClick={(e) => handleRemoveArt(cardId, e)}
                          className="p-1 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-lg border border-red-900/50 transition-all shrink-0"
                          title="Restaurar arte original"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 8. PERSONAGENS */}
          {category === 'personagens' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 justify-items-center">
              {filteredCharacters.map((c) => {
                const cardId = `char_card_${c.id}`;
                const hasCustomArt = !!(
                  customArts[cardId] ||
                  customArts[`char_card_${c.number}`] ||
                  customArts[c.id] ||
                  (c.aliases && c.aliases.some((a) => customArts[`char_card_${a}`] || customArts[a]))
                );
                return (
                  <div key={c.id} className="w-full flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-black/40 border border-cyan-500/10 hover:border-cyan-500/30 transition-all relative group">
                    <CharacterRoleCard
                      id={cardId}
                      role={c.roleTag || c.title}
                      name={c.name}
                      description={c.bio || c.lore || 'Suspeito investigado nos autos da abadia.'}
                      avatarUrl={c.avatarUrl}
                      onClick={() => soundEngine.playCardFlip()}
                    />
                    
                    <div className="flex items-center justify-between w-full px-0.5 gap-1 text-[9px] font-mono">
                      <label className="cursor-pointer flex-1 flex items-center justify-center gap-1 py-1 px-1 bg-cyan-950/80 hover:bg-cyan-800 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-cyan-200 transition-all text-center">
                        <Upload className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{hasCustomArt ? 'Trocar' : 'Subir PNG'}</span>
                        <input
                          type="file"
                          accept="image/png, image/webp, image/*"
                          className="hidden"
                          onChange={(e) => handleSingleFileUpload(cardId, e, c.number ? c.number - 1 : undefined)}
                        />
                      </label>
                      {hasCustomArt && (
                        <button
                          onClick={(e) => handleRemoveArt(cardId, e)}
                          className="p-1 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-lg border border-red-900/50 transition-all shrink-0"
                          title="Restaurar arte original"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 9. MANUAL DE REGRAS (CÓDICE DA MORTE) */}
          {category === 'manual' && (
            <div className="space-y-4 max-w-2xl mx-auto py-2 animate-fade-in">
              <div className="flex items-center justify-between bg-black/40 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Manual de Regras: O Códice da Morte
                </span>
                <span className="text-zinc-400 text-[11px]">
                  {customArts['rules_reference'] ? '✅ Arte personalizada ativa' : 'Arte Padrão (Vetor) ativa'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-3xl bg-black/50 border border-amber-500/30">
                <div className="w-full max-w-[280px] drop-shadow-2xl">
                  <RulesReferenceCard />
                </div>

                <div className="flex flex-col gap-3 max-w-sm text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-black/70 border border-white/10 space-y-2">
                    <span className="text-amber-300 font-bold text-sm block">Substituição do Manual em PNG:</span>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">
                      Ao enviar uma imagem nomeada <code className="text-amber-200">manual_regras.png</code>, <code className="text-amber-200">rules_reference.png</code> ou <code className="text-amber-200">regras.png</code>, ela substitui a arte do manual diretamente no servidor sem duplicar arquivos.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-amber-950/80 hover:bg-amber-800 border border-amber-500/50 hover:border-amber-400 rounded-xl text-amber-200 transition-all font-serif font-bold text-xs uppercase tracking-wider text-center">
                      <Upload className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{customArts['rules_reference'] ? 'Substituir PNG' : 'Enviar PNG do Manual'}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        className="hidden"
                        onChange={(e) => handleSingleFileUpload('rules_reference', e)}
                      />
                    </label>

                    {customArts['rules_reference'] && (
                      <button
                        onClick={(e) => handleRemoveArt('rules_reference', e)}
                        className="px-3 py-2 text-red-400 hover:text-red-200 bg-red-950/60 hover:bg-red-900/80 rounded-xl border border-red-900/50 transition-all flex items-center gap-1.5"
                        title="Restaurar manual original"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Restaurar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. TRILHAS SONORAS (5 TRILHAS GÓTICAS MP3) */}
          {category === 'audio' && (
            <div className="space-y-4 max-w-4xl mx-auto py-2 animate-fade-in">
              <div className="flex items-center justify-between bg-black/40 border border-amber-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
                <span className="text-rose-300 font-bold flex items-center gap-2">
                  <Music className="w-4 h-4 text-rose-400" />
                  As 5 Trilhas Sonoras Góticas (MP3 / Áudio no Servidor)
                </span>
                <span className="text-zinc-400 text-[11px]">
                  Substituição direta em /public/audio/ sem duplicação
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SOUNDTRACK_PLAYLIST.map((track, idx) => {
                  const isCurrent = currentPlayingTrack === track.id;
                  return (
                    <div
                      key={track.id}
                      className="p-3.5 rounded-2xl bg-black/60 border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold">
                              Trilha {idx + 1}
                            </span>
                            <h4 className="text-sm font-serif font-bold text-amber-100">{track.title}</h4>
                          </div>
                          <p className="text-[11px] font-serif text-amber-400/80 mt-0.5">{track.subtitle}</p>
                          <p className="text-[10px] text-zinc-400 font-mono mt-1">{track.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => {
                            if (isCurrent) {
                              soundEngine.stopMusic();
                              setCurrentPlayingTrack(null);
                            } else {
                              soundEngine.playTrack(track.id);
                              setCurrentPlayingTrack(track.id);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                            isCurrent
                              ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                              : 'bg-zinc-900 hover:bg-zinc-800 text-amber-200 border border-zinc-700'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <Square className="w-3 h-3 text-red-400 fill-red-400" />
                              <span>Pausar</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
                              <span>Ouvir</span>
                            </>
                          )}
                        </button>

                        <label className="cursor-pointer flex items-center gap-1.5 py-1.5 px-3 bg-amber-950/80 hover:bg-amber-800 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-mono transition-all">
                          <Upload className="w-3 h-3 text-amber-400" />
                          <span>Subir MP3</span>
                          <input
                            type="file"
                            accept="audio/mpeg, audio/mp3, audio/wav, .mp3, .wav"
                            className="hidden"
                            onChange={(e) => handleSingleAudioUpload(track.id, e)}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. LOTE & SERVIDOR MANAGEMENT PANEL */}
          {category === 'lote' && (
            <div className="max-w-4xl mx-auto py-3 px-2 space-y-5 animate-fade-in">
              {/* Drag & Drop Big Card */}
              <div
                onClick={() => batchFileInputRef.current?.click()}
                className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-amber-500/60 bg-gradient-to-b from-amber-950/30 via-black to-black hover:border-amber-400 cursor-pointer flex flex-col items-center text-center gap-3 transition-all hover:bg-amber-950/50 shadow-xl"
              >
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 shadow-inner">
                  <FolderArchive className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-black text-amber-200 uppercase tracking-widest">
                    Clique aqui ou Arraste todos os 130+ PNGs de uma vez
                  </h3>
                  <p className="text-xs font-mono text-amber-400/90 mt-1 max-w-xl">
                    Suporta seleção de todos os Métodos (M01-M60), Objetos (O01-O64) e Papéis Secretos. Os arquivos são salvos diretamente em <code className="text-emerald-300">/public/cards/</code> e embutidos na compilação final!
                  </p>
                </div>
                <button className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-serif font-bold text-xs uppercase tracking-wider shadow-lg border border-amber-300 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Selecionar Todos os Arquivos PNG do Computador
                </button>
              </div>

              {/* Real-time Checklist Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Personagens status */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-amber-950/80 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-amber-200 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-amber-400" /> 42 Personagens
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {charactersCountLinked}/42
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all"
                      style={{ width: `${(charactersCountLinked / 42) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {charactersCountLinked === 42 ? '✅ Todos os 42 vinculados' : `Faltam ${42 - charactersCountLinked} arquivos (perso) (X)`}
                  </span>
                </div>

                {/* Métodos status */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-red-950/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-red-200 text-xs flex items-center gap-1.5">
                      <Skull className="w-4 h-4 text-red-400" /> 60 Métodos (M01-M60)
                    </span>
                    <span className="font-mono text-xs font-bold text-red-300">
                      {methodsCountLinked}/60
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-red-500 h-full transition-all"
                      style={{ width: `${(methodsCountLinked / 60) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {methodsCountLinked === 60 ? '✅ Todos os 60 vinculados' : `Faltam ${60 - methodsCountLinked} arquivos MXX.png`}
                  </span>
                </div>

                {/* Objetos status */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-blue-950/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-blue-200 text-xs flex items-center gap-1.5">
                      <Sword className="w-4 h-4 text-blue-400" /> 64 Objetos (O01-O64)
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-300">
                      {objectsCountLinked}/64
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all"
                      style={{ width: `${(objectsCountLinked / 64) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {objectsCountLinked === 64 ? '✅ Todos os 64 vinculados' : `Faltam ${64 - objectsCountLinked} arquivos OXX.png`}
                  </span>
                </div>

                {/* Papéis status */}
                <div className="p-3.5 rounded-2xl bg-black/60 border border-purple-950/60 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-purple-200 text-xs flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-purple-400" /> 5 Papéis Secretos
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-300">
                      {rolesCountLinked}/5
                    </span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full transition-all"
                      style={{ width: `${(rolesCountLinked / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {rolesCountLinked === 5 ? '✅ 5 papéis vinculados' : `Faltam ${5 - rolesCountLinked} papéis`}
                  </span>
                </div>
              </div>

              {/* Instructions on Filename Standards */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span>Padronização dos nomes para reconhecimento automático:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono text-zinc-300">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-amber-500/20 space-y-1">
                    <span className="font-bold text-amber-300 block">👤 Personagens (42):</span>
                    <p className="text-[11px] text-zinc-400">
                      Formatos aceitos: <code className="text-amber-200">(perso) (1).png</code> a <code className="text-amber-200">(perso) (42).png</code>, <code className="text-amber-200">perso1.png</code> ou <code className="text-amber-200">char_00.png</code>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                    <span className="font-bold text-red-300 block">🗡️ Métodos (M01 a M60):</span>
                    <p className="text-[11px] text-zinc-400">
                      Formatos aceitos: <code className="text-amber-200">M01.png</code>, <code className="text-amber-200">M60.png</code>, <code className="text-amber-200">metodo01.png</code> ou nome como <code className="text-amber-200">asfixia.png</code>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                    <span className="font-bold text-blue-300 block">🧪 Objetos (O01 a O64):</span>
                    <p className="text-[11px] text-zinc-400">
                      Formatos aceitos: <code className="text-amber-200">O01.png</code>, <code className="text-amber-200">O64.png</code>, <code className="text-amber-200">objeto01.png</code> ou nome como <code className="text-amber-200">caneta.png</code>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                    <span className="font-bold text-purple-300 block">🎭 Papéis Secretos (5):</span>
                    <p className="text-[11px] text-zinc-400">
                      Formatos aceitos: <code className="text-amber-200">assassino.png</code>, <code className="text-amber-200">oraculo.png</code>, <code className="text-amber-200">investigador.png</code>, <code className="text-amber-200">cumplice.png</code>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                    <span className="font-bold text-amber-300 block">📜 Manual de Regras:</span>
                    <p className="text-[11px] text-zinc-400">
                      Formatos aceitos: <code className="text-amber-200">manual_regras.png</code>, <code className="text-amber-200">rules_reference.png</code> ou <code className="text-amber-200">regras.png</code>
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-white/5 space-y-1">
                    <span className="font-bold text-rose-300 block">🎵 Trilhas de Áudio (5):</span>
                    <p className="text-[11px] text-zinc-400">
                      Formatos aceitos: <code className="text-amber-200">rastro_nas_trevas.mp3</code>, <code className="text-amber-200">a_luz_na_cupula.mp3</code>, <code className="text-amber-200">eu_vou_achar.mp3</code>, etc.
                    </p>
                  </div>
                </div>
              </div>

              {/* Persistence, Backup and Server Sync Toolbar */}
              <div className="p-4 rounded-2xl bg-black/70 border border-amber-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-serif font-bold text-amber-200 uppercase tracking-wider">
                      Gerenciamento de Arquivos do Servidor
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-500/40">
                      {totalDistinctLinked} / {totalDistinctPossible} cartas ativas
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                    Todos os PNGs enviados são gravados no disco em <code className="text-zinc-200">/public/cards/</code> e ficam na memória e build de publicação.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleSyncServer}
                    disabled={isSyncingServer}
                    className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs flex items-center gap-1.5 transition-all"
                    title="Sincronizar e recarregar arquivos de cartas do servidor"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingServer ? 'animate-spin text-amber-400' : ''}`} />
                    <span>Sincronizar</span>
                  </button>

                  <button
                    onClick={handleExportBackup}
                    className="px-3 py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-200 font-mono text-xs flex items-center gap-1.5 transition-all"
                    title="Baixar arquivo de backup JSON com todas as cartas enviadas"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Exportar Backup (.json)</span>
                  </button>

                  <button
                    onClick={() => jsonBackupInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-sky-950/70 hover:bg-sky-900 border border-sky-500/60 text-sky-200 font-mono text-xs flex items-center gap-1.5 transition-all"
                    title="Restaurar backup JSON com todas as cartas em outro computador"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-sky-300" />
                    <span>Restaurar Backup (.json)</span>
                  </button>

                  {totalDistinctLinked > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja apagar todas as artes customizadas do servidor e retornar às ilustrações originais?')) {
                          clearAllCustomCardArts();
                          soundEngine.playClick();
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-mono text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Limpar Todas</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              {totalDistinctLinked > 0
                ? `${totalDistinctLinked} / ${totalDistinctPossible} cartas distintas com PNG vinculado no servidor`
                : 'Nenhum PNG personalizado vinculado ainda (use a aba "Upload em Lote" ou suba em cada carta)'}
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportBackup}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-all"
              title="Baixar arquivo de backup JSON com todas as cartas para levar a outro computador"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup JSON</span>
            </button>
            <button
              onClick={() => jsonBackupInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-sky-300 font-mono text-xs flex items-center gap-1.5 transition-all"
              title="Restaurar backup JSON com todas as cartas"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar JSON</span>
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-serif font-bold text-xs uppercase tracking-wider transition-all"
            >
              Fechar Coleção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
