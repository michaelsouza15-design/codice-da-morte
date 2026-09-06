import {
  RoomState,
  Player,
  RoomSettings,
  SecretSolution,
  GamePhase,
  RoleType,
  MarkerColor,
  CardEvidence,
  CardMethod,
  CardObject,
  CardEvent,
  CardAbility,
} from '../types/game';
import {
  METHODS,
  OBJECTS,
  EVIDENCES,
  EVENTS,
  ABILITIES,
  CHARACTERS,
} from '../data/gameData';

function secureShuffle<T>(array: T[]): T[] {
  const arr = [...array];
  // Triple-pass Fisher-Yates with salt for maximum randomness
  for (let pass = 0; pass < 3; pass++) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  return arr;
}

export function createDefaultSettings(): RoomSettings {
  return {
    maxPlayers: 12,
    minPlayers: 4,
    maxRounds: 3,
    hasAccomplice: false,
    accompliceCount: 1,
    hasSaboteur: false,
    roundTimerSeconds: 300,
    discussionTimerSeconds: 180,
    allowEvents: true,
    allowAbilities: true,
    aiDifficulty: 'normal',
  };
}

export function createNewRoom(code: string, hostName: string, hostCharId?: string): RoomState {
  const hostChar = CHARACTERS.find((c) => c.id === hostCharId) || CHARACTERS[0];
  const hostPlayer: Player = {
    id: `p_${Math.random().toString(36).substring(2, 9)}`,
    name: hostName || 'Investigador Líder',
    characterId: hostChar.id,
    isHost: true,
    isReady: true,
    isAI: false,
    seatNumber: 0,
    methods: [],
    objects: [],
    ability: ABILITIES[0],
    abilityUsed: false,
    hasAccused: false,
  };

  const initialEvidences = EVIDENCES.slice(0, 4).map((e) => ({ ...e }));

  return {
    code,
    hostId: hostPlayer.id,
    phase: 'LOBBY',
    round: 1,
    maxRounds: 3,
    settings: createDefaultSettings(),
    players: [hostPlayer],
    evidencesOnTable: initialEvidences,
    discardedEvidences: [],
    activeEvent: null,
    activeAbility: null,
    storyNarrative: '',
    phaseTimerRemaining: 0,
    phaseTimerActive: false,
    logs: [
      {
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Sala [${code}] criada por ${hostPlayer.name}. Aguardando investigadores na biblioteca...`,
        type: 'system',
      },
    ],
    messages: [
      {
        id: `msg_${Date.now()}`,
        senderId: 'system',
        senderName: 'Arquivo do Códice',
        text: 'Bem-vindo ao Códice da Morte. Escolha seu personagem e preparem-se para adentrar a biblioteca ancestral.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      },
    ],
  };
}

export const LOBBY_DEFAULT_INVESTIGATORS: Array<{
  name: string;
  roleTitle: string;
  characterId: string;
  isReady: boolean;
}> = [
  { name: 'Rafael', roleTitle: 'DETECTIVE', characterId: 'char_rafael', isReady: false },
  { name: 'Lia', roleTitle: 'PERITO FORENSE', characterId: 'char_lia', isReady: true },
  { name: 'Bruno', roleTitle: 'ADVOGADO', characterId: 'char_bruno', isReady: true },
  { name: 'Lucas', roleTitle: 'INVESTIGADOR', characterId: 'char_lucas', isReady: false },
  { name: 'Mia', roleTitle: 'JORNALISTA', characterId: 'char_mia', isReady: false },
  { name: 'Sofia', roleTitle: 'ARQUIVISTA', characterId: 'char_sofia', isReady: false },
  { name: 'Igor', roleTitle: 'POLICIAL', characterId: 'char_igor', isReady: false },
  { name: 'Enzo', roleTitle: 'INSPETOR', characterId: 'char_enzo', isReady: false },
  { name: 'Ana', roleTitle: 'CRIMINOLOGISTA', characterId: 'char_ana', isReady: false },
];

export function populateLobbyInvestigators(room: RoomState, targetCount: number = 10): RoomState {
  const updated = { ...room, players: [...room.players] };
  const currentCount = updated.players.length;

  if (currentCount >= targetCount) return updated;

  const usedCharIds = new Set(updated.players.map((p) => p.characterId));
  const usedNames = new Set(updated.players.map((p) => p.name.toLowerCase()));

  for (const inv of LOBBY_DEFAULT_INVESTIGATORS) {
    if (updated.players.length >= targetCount) break;
    if (usedNames.has(inv.name.toLowerCase()) || usedCharIds.has(inv.characterId)) continue;

    const char = CHARACTERS.find((c) => c.id === inv.characterId) || CHARACTERS[0];
    const botPlayer: Player = {
      id: `ai_${inv.name.toLowerCase()}_${Math.random().toString(36).substring(2, 6)}`,
      name: inv.name,
      characterId: inv.characterId,
      roleTitle: inv.roleTitle,
      isHost: false,
      isReady: inv.isReady,
      isAI: true,
      aiDifficulty: updated.settings.aiDifficulty,
      seatNumber: updated.players.length,
      methods: [],
      objects: [],
      ability: ABILITIES.find((a) => a.id === char.defaultAbilityId) || ABILITIES[0],
      abilityUsed: false,
      hasAccused: false,
    };
    updated.players.push(botPlayer);
    usedCharIds.add(inv.characterId);
    usedNames.add(inv.name.toLowerCase());
  }

  // If still need more to reach targetCount, fill with remaining characters
  if (updated.players.length < targetCount) {
    return fillWithAIBots(updated, targetCount);
  }

  return updated;
}

export function fillWithAIBots(room: RoomState, targetPlayerCount: number): RoomState {
  const updated = { ...room, players: [...room.players] };
  const usedCharIds = new Set(updated.players.map((p) => p.characterId));
  const availableChars = CHARACTERS.filter((c) => !usedCharIds.has(c.id));

  while (updated.players.length < targetPlayerCount && availableChars.length > 0) {
    const nextChar = availableChars.shift()!;
    const botPlayer: Player = {
      id: `ai_${Math.random().toString(36).substring(2, 9)}`,
      name: `${nextChar.name} (IA)`,
      characterId: nextChar.id,
      isHost: false,
      isReady: true,
      isAI: true,
      aiDifficulty: updated.settings.aiDifficulty,
      seatNumber: updated.players.length,
      methods: [],
      objects: [],
      ability: ABILITIES.find((a) => a.id === nextChar.defaultAbilityId) || ABILITIES[0],
      abilityUsed: false,
      hasAccused: false,
    };
    updated.players.push(botPlayer);
  }
  return updated;
}

export function startGameDistribution(room: RoomState): RoomState {
  const updated = { ...room };
  const players = [...updated.players];
  const count = players.length;

  if (count < 4) {
    throw new Error('São necessários no mínimo 4 jogadores para iniciar o Códice da Morte.');
  }

  // 1. Assign Roles
  // Always 1 Oracle, 1 Killer, remainder Investigators (with optional 1 Accomplice and/or 1 Saboteur)
  const allIndices = players.map((_, i) => i);
  let oracleIdx = -1;

  if (updated.designatedOraclePlayerId) {
    const foundIdx = players.findIndex((p) => p.id === updated.designatedOraclePlayerId);
    if (foundIdx !== -1) {
      oracleIdx = foundIdx;
    }
  } else if (updated.settings.oracleSelectionMode === 'host') {
    const hostIdx = players.findIndex((p) => p.isHost || p.id === updated.hostId);
    if (hostIdx !== -1) {
      oracleIdx = hostIdx;
    }
  }

  // If no fixed/designated oracle was set or found, select randomly
  if (oracleIdx === -1) {
    const shuffledAll = secureShuffle(allIndices);
    oracleIdx = shuffledAll[0];
  }

  // Non-oracle candidates for killer, accomplice, saboteur, investigators
  const nonOracleIndices = secureShuffle(allIndices.filter((idx) => idx !== oracleIdx));
  const killerIdx = nonOracleIndices[0];
  let accompliceIdx: number | null = null;
  let saboteurIdx: number | null = null;

  let nextIdx = 1;
  if (updated.settings.hasAccomplice && count >= 6 && nextIdx < nonOracleIndices.length) {
    accompliceIdx = nonOracleIndices[nextIdx++];
  }
  if (updated.settings.hasSaboteur && count >= 5 && nextIdx < nonOracleIndices.length) {
    saboteurIdx = nonOracleIndices[nextIdx++];
  }

  const shuffledAbilities = secureShuffle(ABILITIES);
  let nonOracleAbilityIdx = 0;
  players.forEach((p, idx) => {
    if (idx === oracleIdx) {
      p.role = 'oraculo';
      p.ability = undefined;
      p.abilityUsed = true;
    } else if (idx === killerIdx) {
      p.role = 'assassino';
    } else if (idx === accompliceIdx) {
      p.role = 'cumplice';
    } else if (idx === saboteurIdx) {
      p.role = 'sabotador';
    } else {
      p.role = 'investigador';
    }

    // Distribute fresh unique ability ONLY to non-Oracle players (Oracle has no cards or abilities)
    if (p.role !== 'oraculo') {
      p.ability = { ...(shuffledAbilities[nonOracleAbilityIdx % shuffledAbilities.length] || ABILITIES[0]) };
      p.abilityUsed = false;
      nonOracleAbilityIdx++;
    }
    p.hasAccused = false;
  });

  // 2. Distribute 4 Methods + 4 Objects ONLY to non-Oracle players (Oracle has 0 cards)
  const shuffledMethods = secureShuffle(METHODS);
  const shuffledObjects = secureShuffle(OBJECTS);

  let nonOracleIdx = 0;
  players.forEach((p) => {
    if (p.role === 'oraculo') {
      p.methods = [];
      p.objects = [];
    } else {
      p.methods = shuffledMethods.slice(nonOracleIdx * 4, nonOracleIdx * 4 + 4).map((m) => ({ ...m }));
      p.objects = shuffledObjects.slice(nonOracleIdx * 4, nonOracleIdx * 4 + 4).map((o) => ({ ...o }));
      nonOracleIdx++;
    }
  });

  // 3. Choose Evidences (Full dynamic shuffle from all 24 evidences E01-E24)
  // Ensure we include Cause of Death or Crime Scene plus 4 or 5 other totally random evidences
  const allShuffledEvidences = secureShuffle(EVIDENCES);
  // Pick Cause of Death (E01) or Crime Scene (E02) as anchor, plus 5 other diverse evidence cards
  const coreEvidence = allShuffledEvidences.find((e) => e.id === 'E01') || EVIDENCES[0];
  const secondaryEvidence = allShuffledEvidences.find((e) => e.id === 'E02') || EVIDENCES[1];
  const remainingEvidences = allShuffledEvidences.filter(
    (e) => e.id !== coreEvidence.id && e.id !== secondaryEvidence.id
  ).slice(0, 4);

  const tableEvidences: CardEvidence[] = secureShuffle([
    { ...coreEvidence },
    { ...secondaryEvidence },
    ...remainingEvidences.map((e) => ({ ...e })),
  ]);

  updated.players = players;
  updated.evidencesOnTable = tableEvidences;
  updated.phase = 'NOITE';
  updated.round = 1;
  updated.maxRounds = updated.settings.maxRounds || 3;
  updated.phaseTimerRemaining = 0;
  updated.phaseTimerActive = false;

  // Real match statistics tracking
  updated.startedAt = Date.now();
  updated.endedAt = undefined;
  updated.totalElapsedSeconds = undefined;
  updated.roundsPlayed = 1;
  updated.abilitiesUsedCount = 0;
  updated.eventsActivatedCount = 0;
  updated.presentedEvidenceIds = tableEvidences.map((e) => e.id);

  const killerPlayer = players[killerIdx];
  const accomplicePlayer = accompliceIdx !== null ? players[accompliceIdx] : null;

  updated.secretSolution = {
    killerPlayerId: killerPlayer.id,
    methodId: '',
    objectId: '',
    accomplicePlayerIds: accomplicePlayer ? [accomplicePlayer.id] : [],
    saboteurPlayerId: saboteurIdx !== null ? players[saboteurIdx].id : undefined,
  };

  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `A noite caiu sobre a biblioteca ancestral. Silêncio absoluto. Todos fecham os olhos enquanto o Assassino faz sua escolha macabra.`,
    type: 'night',
  });

  // If Killer is AI, auto-select immediately
  if (killerPlayer.isAI) {
    const randomMethod = killerPlayer.methods[Math.floor(Math.random() * killerPlayer.methods.length)];
    const randomObject = killerPlayer.objects[Math.floor(Math.random() * killerPlayer.objects.length)];
    return handleNightChoice(updated, killerPlayer.id, randomMethod.id, randomObject.id);
  }

  return updated;
}

export function generateDynamicCrimeNarrative(
  method: CardMethod,
  object: CardObject,
  killerPlayer?: Player
): string {
  const introSettings = [
    'Nas sombras gélidas da ala leste da biblioteca ancestral, entre pesadas estantes de carvalho e manuscritos centenários',
    'Sob o uivo constante da tempestade noturna que fustigava a claraboia do arquivo proibido',
    'Nas primeiras horas da madrugada, quando as chamas dos candelabros agonizavam na penumbra da abadia',
    'No silêncio sepulcral das galerias superiores, onde o aroma de cera derretida e pergaminho abafava os passos',
    'No santuário do Códice, entre pedestais de ferro e poeira alquímica em suspensão',
  ];
  const randomIntro = introSettings[Math.floor(Math.random() * introSettings.length)];

  return `${randomIntro}, o corpo da vítima foi encontrado inerte. A análise pericial e a visão mística revelam que a consumação ocorreu através de "${method.name}" — ${method.description.toLowerCase()}. Perto dali, repousava como prova crucial o objeto "${object.name}" (${object.description.toLowerCase()}), deixado na pressa da fuga. O Oráculo agora deve dispor os sinais sagrados no Códice para que os investigadores identifiquem o culpado.`;
}

export function handleNightChoice(
  room: RoomState,
  killerId: string,
  methodId: string,
  objectId: string
): RoomState {
  const updated = { ...room };
  if (!updated.secretSolution || updated.secretSolution.killerPlayerId !== killerId) {
    throw new Error('Apenas o Assassino pode confirmar a escolha secreta.');
  }

  const killer = updated.players.find((p) => p.id === killerId);
  const method = killer?.methods.find((m) => m.id === methodId);
  const object = killer?.objects.find((o) => o.id === objectId);

  if (!method || !object) {
    throw new Error('O Método e o Objeto escolhidos devem estar entre as 4 cartas à sua frente.');
  }

  updated.secretSolution.methodId = methodId;
  updated.secretSolution.objectId = objectId;

  // Build atmospheric dynamic story narrative directly related to chosen cards
  updated.storyNarrative = generateDynamicCrimeNarrative(method, object, killer);

  updated.phase = 'ORACULO';
  updated.phaseTimerRemaining = 0;
  updated.phaseTimerActive = false;

  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `O crime foi consumado nas trevas. O Oráculo desperta e agora deve examinar o Códice e marcar as evidências com as cores místicas (sem pressão de tempo).`,
    type: 'oracle',
  });

  // If Oracle is AI, auto mark evidence hints
  const oraclePlayer = updated.players.find((p) => p.role === 'oraculo');
  if (oraclePlayer?.isAI) {
    return autoMarkOracleAI(updated);
  }

  return updated;
}

export function autoMarkOracleAI(room: RoomState): RoomState {
  const updated = { ...room };
  const solution = updated.secretSolution;
  if (!solution) return updated;

  const killer = updated.players.find((p) => p.id === solution.killerPlayerId);
  const method = killer?.methods.find((m) => m.id === solution.methodId);
  const object = killer?.objects.find((o) => o.id === solution.objectId);

  // Mark Causa da Morte (E01) with Red / Blue
  const e01 = updated.evidencesOnTable.find((e) => e.id === 'E01');
  if (e01) {
    let bestIdx = 0;
    const nameLower = method?.name.toLowerCase() || '';
    if (nameLower.includes('veneno') || nameLower.includes('solvente') || nameLower.includes('tóxico') || nameLower.includes('tinta')) {
      bestIdx = 1; // Envenenamento
    } else if (nameLower.includes('crânio') || nameLower.includes('impacto') || nameLower.includes('golpe') || nameLower.includes('corte')) {
      bestIdx = 2; // Trauma
    } else if (nameLower.includes('choque') || nameLower.includes('curto')) {
      bestIdx = 3; // Choque
    } else if (nameLower.includes('queda') || nameLower.includes('empurrão') || nameLower.includes('estante')) {
      bestIdx = 4; // Queda
    } else if (nameLower.includes('frio') || nameLower.includes('gelo') || nameLower.includes('hipotermia')) {
      bestIdx = 5; // Exposição
    } else {
      bestIdx = 0; // Asfixia
    }
    e01.markedOptionIndex = bestIdx;
    e01.markedColor = 'vermelho';
  }

  // Mark E02 Cena Principal with Blue or Black
  const e02 = updated.evidencesOnTable.find((e) => e.id === 'E02');
  if (e02) {
    const objLower = object?.name.toLowerCase() || '';
    let bestIdx = 0;
    if (objLower.includes('corda') || objLower.includes('cordão') || objLower.includes('fita') || objLower.includes('pano') || objLower.includes('seda')) {
      bestIdx = 0; // Cordão / Tecido
    } else if (objLower.includes('livro') || objLower.includes('página') || objLower.includes('códice') || objLower.includes('mapa') || objLower.includes('pergaminho')) {
      bestIdx = 2; // Página rasgada
    } else if (objLower.includes('óleo') || objLower.includes('solvente') || objLower.includes('tinta') || objLower.includes('pó')) {
      bestIdx = 4; // Cheiro estranho
    } else {
      bestIdx = 1; // Arrasto
    }
    e02.markedOptionIndex = bestIdx;
    e02.markedColor = 'preto';
  }

  // Mark remaining evidences
  updated.evidencesOnTable.slice(2).forEach((ev, idx) => {
    if (ev.markedOptionIndex === undefined) {
      ev.markedOptionIndex = (idx * 2) % ev.options.length;
      ev.markedColor = idx % 2 === 0 ? 'dourado' : 'azul';
    }
  });

  return finishOraclePhase(updated);
}

export function handleOracleMark(
  room: RoomState,
  evidenceId: string,
  optionIndex: number,
  color: MarkerColor,
  coords?: { x: number; y: number }
): RoomState {
  const updated = { ...room };
  const ev = updated.evidencesOnTable.find((e) => e.id === evidenceId);
  if (!ev) throw new Error('Evidência não encontrada na mesa.');

  if (optionIndex < 0) {
    delete ev.markedOptionIndex;
    delete ev.markedColor;
    delete ev.markerX;
    delete ev.markerY;

    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `O Oráculo removeu o marcador de [${ev.title}].`,
      type: 'oracle',
    });
    return updated;
  }

  ev.markedOptionIndex = optionIndex;
  ev.markedColor = color;
  if (coords) {
    ev.markerX = Math.round(coords.x * 10) / 10;
    ev.markerY = Math.round(coords.y * 10) / 10;
  }

  const optText = ev.options[optionIndex] || `Opção ${optionIndex + 1}`;
  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `O Oráculo colocou um marcador [${color.toUpperCase()}] em [${ev.title} ➔ ${optText}].`,
    type: 'oracle',
  });

  return updated;
}

// ---------------------------------------------------------------------------
// EVIDENCE CONCEALMENT ENGINE (EV01 Apagão, EV14 Luz Fraca, etc.)
// Dynamically hides visual markers on affected cards and restores them after event completion
// ---------------------------------------------------------------------------

export function isEvidenceConcealmentEvent(event: CardEvent): boolean {
  const id = (event.id || '').toUpperCase();
  const name = (event.name || '').toLowerCase();
  const effect = (event.effect || '').toLowerCase();
  return (
    id === 'EV01' ||
    id === 'EV14' ||
    name.includes('apagão') ||
    name.includes('apagao') ||
    name.includes('luz fraca') ||
    effect.includes('ocultada') ||
    effect.includes('ocultad') ||
    effect.includes('virada e ocultada')
  );
}

export function applyConcealmentEvent(room: RoomState, event: CardEvent): RoomState {
  const updated = { ...room };
  const affectedIds: string[] = [];

  if (event.id === 'EV01' || event.name.toLowerCase().includes('apag')) {
    // Apagão (EV01): Uma evidência é virada e ocultada da mesa
    // Prioriza cartas na mesa com marcador que não estejam protegidas pelo Guardião (H09)
    const candidates = updated.evidencesOnTable.filter((e) => !e.isProtected);
    const withMarker = candidates.filter((e) => e.markedOptionIndex !== undefined);
    const target = withMarker.length > 0
      ? withMarker[Math.floor(Math.random() * withMarker.length)]
      : (candidates[0] || updated.evidencesOnTable[0]);

    if (target) {
      target.isConcealed = true;
      target.concealedReason = event.name;
      affectedIds.push(target.id);
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🌑 OCULTAÇÃO DE EVIDÊNCIA: O evento [${event.name}] mergulhou a evidência [${target.title}] em trevas! Seus marcadores visuais foram temporariamente desabilitados e permanecerão ocultos até o fim do evento.`,
        type: 'event',
      });
    }
  } else if (event.id === 'EV14' || event.name.toLowerCase().includes('luz fraca')) {
    // Luz Fraca (EV14): Apenas 3 evidências principais permanecem ativas na mesa
    const activeCount = 3;
    updated.evidencesOnTable.forEach((ev, idx) => {
      if (idx >= activeCount && !ev.isProtected) {
        ev.isConcealed = true;
        ev.concealedReason = event.name;
        affectedIds.push(ev.id);
      }
    });
    if (affectedIds.length > 0) {
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🕯️ LUZ FRACA: Apenas 3 evidências principais permanecem ativas. As demais foram ocultadas e seus marcadores visuais foram desabilitados temporariamente!`,
        type: 'event',
      });
    }
  } else {
    // Generic fallback for any other concealment event
    const target = updated.evidencesOnTable.find((e) => !e.isProtected && e.markedOptionIndex !== undefined) || updated.evidencesOnTable[0];
    if (target) {
      target.isConcealed = true;
      target.concealedReason = event.name;
      affectedIds.push(target.id);
    }
  }

  if (updated.activeEvent) {
    updated.activeEvent.affectedEvidenceIds = affectedIds;
  }

  return updated;
}

export function handleFinishActiveEvent(room: RoomState): RoomState {
  const updated = { ...room };
  const eventName = updated.activeEvent?.event.name || 'Evento';

  // Automatically re-enable all concealed visual markers on affected evidence cards
  const restoredTitles: string[] = [];
  updated.evidencesOnTable = updated.evidencesOnTable.map((ev) => {
    if (ev.isConcealed) {
      restoredTitles.push(ev.title);
      return {
        ...ev,
        isConcealed: false,
        concealedReason: undefined,
      };
    }
    return ev;
  });

  if (restoredTitles.length > 0) {
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `✨ O evento [${eventName}] foi concluído! A névoa se dissipou e os marcadores visuais de [${restoredTitles.join(', ')}] foram automaticamente reabilitados na mesa de investigação.`,
      type: 'event',
    });
  } else if (updated.activeEvent) {
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `⏳ O efeito do evento [${eventName}] cessou nos corredores da abadia.`,
      type: 'event',
    });
  }

  updated.activeEvent = null;
  return updated;
}

export function finishOraclePhase(room: RoomState): RoomState {
  let updated = { ...room };
  updated.phase = 'INVESTIGACAO';
  const duration = updated.settings.discussionTimerSeconds !== undefined ? updated.settings.discussionTimerSeconds : 180;
  updated.phaseTimerRemaining = duration;
  updated.phaseTimerActive = duration > 0;

  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `O Oráculo selou suas marcações. Os Investigadores agora devem cruzar a história, analisar as cores e debater os suspeitos!${duration > 0 ? ` [Cronômetro: ${Math.floor(duration / 60)}m]` : ' [Sem limite de tempo]'}`,
    type: 'system',
  });

  // Random event in round 2 or if enabled
  if (updated.settings.allowEvents && updated.round >= 2 && !updated.activeEvent) {
    const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    updated.activeEvent = {
      event: randomEvent,
      remainingSeconds: randomEvent.duration || 60,
    };
    updated.eventsActivatedCount = (updated.eventsActivatedCount || 0) + 1;
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `⚠️ EVENTO DESENCADEADO: [${randomEvent.name}] - ${randomEvent.effect}`,
      type: 'event',
    });

    // Check if this event causes concealment of evidence cards
    if (isEvidenceConcealmentEvent(randomEvent)) {
      updated = applyConcealmentEvent(updated, randomEvent);
    }
  }

  return updated;
}

export function finalizeGameMatchStats(
  room: RoomState,
  winner: 'investigadores' | 'assassino' | 'sabotador'
): RoomState {
  const updated = { ...room };
  updated.winner = winner;
  updated.phase = 'REVELACAO';
  updated.revelationStep = 0;
  updated.phaseTimerActive = false;

  if (!updated.endedAt) {
    updated.endedAt = Date.now();
  }
  const startTime = updated.startedAt || updated.endedAt;
  updated.totalElapsedSeconds = Math.max(1, Math.round((updated.endedAt - startTime) / 1000));
  updated.roundsPlayed = updated.round || 1;

  // Track all unique presented evidence IDs
  const currentEvIds = (updated.evidencesOnTable || []).map((e) => e.id);
  const discEvIds = (updated.discardedEvidences || []).map((e) => e.id);
  const trackedIds = updated.presentedEvidenceIds || [];
  updated.presentedEvidenceIds = Array.from(new Set([...trackedIds, ...currentEvIds, ...discEvIds]));

  return updated;
}

export function handleAccusation(
  room: RoomState,
  accuserPlayerId: string,
  targetPlayerId: string,
  methodId: string,
  objectId: string
): RoomState {
  let updated = { ...room };
  const accuser = updated.players.find((p) => p.id === accuserPlayerId);
  const target = updated.players.find((p) => p.id === targetPlayerId);
  const method = METHODS.find((m) => m.id === methodId);
  const object = OBJECTS.find((o) => o.id === objectId);
  const solution = updated.secretSolution;

  if (!accuser || !target || !method || !object || !solution) {
    throw new Error('Dados de acusação inválidos.');
  }

  if (accuser.role === 'oraculo') {
    throw new Error('O Oráculo é a testemunha silenciosa do Códice e NUNCA pode efetuar acusações.');
  }

  // Check Event EV04: Silêncio Forçado (Accusations blocked during event)
  if (updated.activeEvent?.event.id === 'EV04') {
    throw new Error('⚠️ O Evento [Silêncio Forçado] está ativo na biblioteca! Nenhuma acusação formal pode ser feita até o término do efeito.');
  }

  if (accuser.hasAccused) {
    throw new Error('Você já utilizou sua única ficha de acusação nesta partida.');
  }

  const isEarlyAccusationEvent = updated.activeEvent?.event.id === 'EV09';

  // Mark token as used unless protected by EV09
  if (!isEarlyAccusationEvent) {
    accuser.hasAccused = true;
  }

  const isCorrect =
    targetPlayerId === solution.killerPlayerId &&
    methodId === solution.methodId &&
    objectId === solution.objectId;

  const record = {
    id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    round: updated.round,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    accuserPlayerId: accuser.id,
    accuserName: accuser.name,
    accuserCharacterId: accuser.characterId,
    targetPlayerId: target.id,
    targetName: target.name,
    targetCharacterId: target.characterId,
    methodId: method.id,
    methodName: method.name,
    methodCategory: method.category,
    methodDescription: method.description,
    objectId: object.id,
    objectName: object.name,
    objectCategory: object.category,
    objectDescription: object.description,
    isCorrect,
  };

  if (!updated.accusationHistory) {
    updated.accusationHistory = [];
  }
  updated.accusationHistory = [record, ...updated.accusationHistory];

  updated.lastAccusation = {
    accuserPlayerId,
    targetPlayerId,
    methodId,
    objectId,
    isCorrect,
  };

  const outcomeBadge = isCorrect ? '✅ EXATA / PROCEDENTE' : '❌ INCORRETA / FALHA';

  // Broadcast to logs
  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `⚖️ ACUSAÇÃO FORMAL: ${accuser.name} acusou ${target.name} apontando [${method.name}] e [${object.name}]! Resultado: ${outcomeBadge}`,
    type: 'accusation',
  });

  // Broadcast as a special Chat message for all to see in written discussion
  updated.messages.push({
    id: `msg_acc_${Date.now()}`,
    senderId: 'system',
    senderName: 'Tribunal do Códice',
    text: `⚖️ ${accuser.name} fez uma acusação formal contra ${target.name}! Método: [${method.name}] | Objeto: [${object.name}] ➔ ${outcomeBadge}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSystem: true,
  });

  if (isCorrect) {
    updated = finalizeGameMatchStats(updated, 'investigadores');

    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🎉 A VERDADE FOI REVELADA! A acusação estava EXATA. Os Investigadores venceram o mistério!`,
      type: 'result',
    });
  } else {
    if (isEarlyAccusationEvent) {
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `❌ Acusação INCORRETA! Pelo efeito de [Acusação Antecipada], ${accuser.name} preservou sua ficha definitiva de acusação!`,
        type: 'accusation',
      });
    } else {
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `❌ Acusação INCORRETA! ${accuser.name} perdeu seu distintivo de acusação.`,
        type: 'accusation',
      });
    }

    // Check if all investigators have spent their accusations
    const remainingInvestigators = updated.players.filter(
      (p) => p.role === 'investigador' && !p.hasAccused
    );

    if (remainingInvestigators.length === 0) {
      updated = finalizeGameMatchStats(updated, 'assassino');

      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🩸 Todas as acusações falharam! O Assassino escapou impune pelas passagens secretas da biblioteca.`,
        type: 'result',
      });
    }
  }

  return updated;
}

export function handleAbilityUse(
  room: RoomState,
  playerId: string,
  abilityId: string,
  extraPayload?: {
    targetEvidenceId?: string;
    targetPlayerId?: string;
    newOptionIndex?: number;
    question?: string;
    keywords?: string;
    itemNames?: string[];
  }
): RoomState {
  let updated = { ...room };
  const player = updated.players.find((p) => p.id === playerId);
  if (!player || player.abilityUsed) {
    throw new Error('Habilidade já utilizada ou jogador inválido.');
  }

  const ability = ABILITIES.find((a) => a.id === abilityId);
  if (!ability) throw new Error('Habilidade não encontrada.');

  player.abilityUsed = true;
  updated.abilitiesUsedCount = (updated.abilitiesUsedCount || 0) + 1;

  // Set active ability so the public room displays "HABILIDADE ATIVA NA PARTIDA"
  updated.activeAbility = {
    ability,
    userId: player.id,
    userName: player.name,
    userCharacterId: player.characterId,
    activatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    remainingSeconds: 60,
    extraPayload,
  };

  // ---------------------------------------------------------------------------
  // ABILITY SPECIFIC MECHANICS
  // ---------------------------------------------------------------------------
  if (abilityId === 'H01') {
    // H01 - Arquivista: Examina evidências descartadas no Arquivo Morto
    const targetEvidence = extraPayload?.targetEvidenceId
      ? (updated.discardedEvidences || []).find((e) => e.id === extraPayload.targetEvidenceId)
      : (updated.discardedEvidences || [])[0];

    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `📜 ${player.name} [Arquivista] abriu o Arquivo Morto e examinou as tábuas de evidências descartadas${
        targetEvidence ? ` (${targetEvidence.title})` : ''
      }!`,
      type: 'ability',
    });
  } else if (abilityId === 'H02') {
    // H02 - Paleógrafo: Move 1 marcador para outra opção dentro da mesma evidência
    const targetEv = updated.evidencesOnTable.find((e) => e.id === extraPayload?.targetEvidenceId);
    if (!targetEv) {
      throw new Error('Selecione uma carta de evidência com marcador na mesa para mover.');
    }
    const newIdx = extraPayload?.newOptionIndex ?? 0;
    const oldOpt = targetEv.options[targetEv.markedOptionIndex ?? 0] || 'Opção anterior';
    const newOpt = targetEv.options[newIdx] || `Opção ${newIdx + 1}`;

    targetEv.markedOptionIndex = newIdx;
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🖋️ ${player.name} [Paleógrafo] decifrou um antigo pergaminho e moveu o marcador de [${targetEv.title}] de "${oldOpt}" para "${newOpt}"!`,
      type: 'ability',
    });
  } else if (abilityId === 'H03') {
    // H03 - Bibliotecário: Sorteia imediatamente 1 Evento extra
    const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    updated.activeEvent = {
      event: randomEvent,
      remainingSeconds: randomEvent.duration || 90,
    };
    updated.eventsActivatedCount = (updated.eventsActivatedCount || 0) + 1;
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `⚡ ${player.name} [Bibliotecário] invocou um novo evento nos corredores: [${randomEvent.name}] - ${randomEvent.effect}!`,
      type: 'event',
    });
    if (isEvidenceConcealmentEvent(randomEvent)) {
      updated = applyConcealmentEvent(updated, randomEvent);
    }
  } else if (abilityId === 'H04') {
    // H04 - Analista: Inquérito analítico de 2 itens
    const items = extraPayload?.itemNames?.join(' vs ') || 'itens de investigação';
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🔍 ${player.name} [Analista] realizou um inquérito comparativo formal sobre [${items}], solicitando confirmação do Oráculo!`,
      type: 'ability',
    });
  } else if (abilityId === 'H05') {
    // H05 - Cético: Anula imediatamente o efeito de 1 Evento ativo e reabilita marcadores ocultados
    if (updated.activeEvent || updated.evidencesOnTable.some((e) => e.isConcealed)) {
      const canceledName = updated.activeEvent?.event.name || 'Evento Ativo';
      const finished = handleFinishActiveEvent(updated);
      updated.evidencesOnTable = finished.evidencesOnTable;
      updated.activeEvent = null;
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🛡️ ${player.name} [Cético] desfez as superstições e anulou o evento ativo [${canceledName}]! Todos os marcadores visuais foram automaticamente reabilitados.`,
        type: 'ability',
      });
    } else {
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🛡️ ${player.name} [Cético] ativou seu poder de proteção contra eventos anômalos.`,
        type: 'ability',
      });
    }
  } else if (abilityId === 'H06') {
    // H06 - Observador: Revela secretamente a inocência ou papel do suspeito alvo
    const target = updated.players.find((p) => p.id === extraPayload?.targetPlayerId);
    if (!target) {
      throw new Error('Selecione um suspeito para observar secretamente.');
    }
    const isKillerOrAccomplice = target.role === 'assassino' || target.role === 'cumplice';
    const observationOutcome = isKillerOrAccomplice
      ? 'possui conexões altamente suspeitas com a cena do crime'
      : 'aparenta estar limpo e dedicado à investigação';

    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `👁️ ${player.name} [Observador] vigiou secretamente ${target.name} e obteve revelações cruciais sobre sua conduta!`,
      type: 'ability',
    });
  } else if (abilityId === 'H07') {
    // H07 - Relator: Pergunta direta de Sim/Não ao Oráculo
    const question = extraPayload?.question || 'Pergunta crucial sobre as evidências';
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `📜 ${player.name} [Relator] fez uma pergunta oficial ao Oráculo: "${question}".`,
      type: 'ability',
    });
  } else if (abilityId === 'H08') {
    // H08 - Restaurador: Recupera 1 evidência descartada de volta para a mesa
    const card = (updated.discardedEvidences || []).find((e) => e.id === extraPayload?.targetEvidenceId) || (updated.discardedEvidences || [])[0];
    if (card) {
      updated.discardedEvidences = (updated.discardedEvidences || []).filter((e) => e.id !== card.id);
      updated.evidencesOnTable = [...updated.evidencesOnTable, card];
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `✨ ${player.name} [Restaurador] recuperou a evidência perdida [${card.title}] de volta para a mesa de pistas!`,
        type: 'ability',
      });
    } else {
      throw new Error('Não há evidências no arquivo morto para recuperar.');
    }
  } else if (abilityId === 'H09') {
    // H09 - Guardião: Protege 1 evidência contra descarte ou alteração
    const targetEv = updated.evidencesOnTable.find((e) => e.id === extraPayload?.targetEvidenceId);
    if (!targetEv) {
      throw new Error('Selecione uma evidência na mesa para proteger com o Selo do Guardião.');
    }
    targetEv.isProtected = true;
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🛡️ ${player.name} [Guardião] aplicou um Selo de Proteção Inviolável sobre a evidência [${targetEv.title}]!`,
      type: 'ability',
    });
  } else if (abilityId === 'H10') {
    // H10 - Intérprete: Solicita marcador dourado de pista central
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🌟 ${player.name} [Intérprete] solicitou a bênção do Oráculo para iluminar o ponto focal do mistério com um Selo Dourado!`,
      type: 'ability',
    });
  } else if (abilityId === 'H11') {
    // H11 - Cronista: Registra 3 palavras ou notas do depoimento
    const words = extraPayload?.keywords || extraPayload?.question || 'Testemunho crucial dos autos';
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `✍️ ${player.name} [Cronista] registrou formalmente nos anais do tribunal as palavras: "${words}".`,
      type: 'ability',
    });
  } else if (abilityId === 'H12') {
    // H12 - Vigilante: Impõe silêncio total a um suspeito por 1 minuto
    const target = updated.players.find((p) => p.id === extraPayload?.targetPlayerId);
    if (target) {
      target.isMuted = true;
      updated.logs.push({
        id: `log_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🤫 ${player.name} [Vigilante] impôs silêncio absoluto a ${target.name} por 1 minuto!`,
        type: 'ability',
      });
    } else {
      throw new Error('Selecione um suspeito para silenciar.');
    }
  } else {
    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `✨ ${player.name} ativou a habilidade única: [${ability.name}] - ${ability.effect}`,
      type: 'ability',
    });
  }

  return updated;
}

export function handleRestoreEvidence(room: RoomState, evidenceId: string, actorPlayerId?: string): RoomState {
  const updated = { ...room };
  const card = (updated.discardedEvidences || []).find((e) => e.id === evidenceId);
  if (!card) throw new Error('Evidência não encontrada no arquivo morto.');

  updated.discardedEvidences = updated.discardedEvidences.filter((e) => e.id !== evidenceId);
  updated.evidencesOnTable = [...updated.evidencesOnTable, card];

  const actor = updated.players.find((p) => p.id === actorPlayerId);
  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `📜 A evidência [${card.title}] foi recuperada e colocada novamente na mesa de investigação ${actor ? `por ${actor.name}` : ''}!`,
    type: 'system',
  });

  return updated;
}

export function sanitizeRoomForPlayer(room: RoomState, playerId: string): RoomState {
  const me = room.players.find((p) => p.id === playerId);
  const isOracle = me?.role === 'oraculo';
  const isKiller = me?.role === 'assassino';
  const isAccomplice = me?.role === 'cumplice';
  const isGameOver = room.phase === 'REVELACAO' || room.phase === 'RESULTADO';

  const sanitized: RoomState = {
    ...room,
    // Filter whisper messages so only killer and accomplice can see them during the match
    messages: (room.messages || []).filter((msg) => {
      if (!msg.isWhisper) return true;
      if (isGameOver) return true;
      return isKiller || isAccomplice;
    }),
    players: room.players.map((p) => {
      // Hide roles of other players unless game is over, or killer sees accomplice / accomplice sees killer
      let visibleRole: RoleType | undefined = p.role;
      if (!isGameOver && p.id !== playerId) {
        if (isKiller && p.role === 'cumplice') {
          visibleRole = 'cumplice';
        } else if (isAccomplice && p.role === 'assassino') {
          visibleRole = 'assassino';
        } else if (isOracle && (p.role === 'assassino' || p.role === 'cumplice' || p.role === 'sabotador')) {
          visibleRole = p.role;
        } else {
          visibleRole = undefined;
        }
      }
      return {
        ...p,
        role: visibleRole,
      };
    }),
  };

  // Strip secret solution if player is not authorized (Oracle, Killer and Accomplice can see the crime solution)
  if (!isGameOver && !isOracle && !isKiller && !isAccomplice) {
    delete sanitized.secretSolution;
  } else if ((isKiller || isAccomplice) && !isGameOver && sanitized.secretSolution) {
    // Killer and Accomplice see the crime choice and partners
    sanitized.secretSolution = {
      killerPlayerId: sanitized.secretSolution.killerPlayerId,
      methodId: sanitized.secretSolution.methodId,
      objectId: sanitized.secretSolution.objectId,
      accomplicePlayerIds: sanitized.secretSolution.accomplicePlayerIds,
      suggestedMethodId: sanitized.secretSolution.suggestedMethodId,
      suggestedObjectId: sanitized.secretSolution.suggestedObjectId,
      suggestedByPlayerName: sanitized.secretSolution.suggestedByPlayerName,
    };
  }

  // Strip night suggestion if player is not killer or accomplice
  if (!isGameOver && !isKiller && !isAccomplice) {
    delete sanitized.nightSuggestion;
  }

  return sanitized;
}

export function adjustTimer(room: RoomState, deltaSeconds: number, actorName?: string): RoomState {
  const updated = { ...room };
  updated.phaseTimerRemaining = Math.max(0, updated.phaseTimerRemaining + deltaSeconds);
  const sign = deltaSeconds > 0 ? `+${deltaSeconds}s` : `${deltaSeconds}s`;
  
  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `⏳ Cronômetro ajustado em [${sign}] por ${actorName || 'Oráculo'}.`,
    type: 'system',
  });
  return updated;
}

export function handleDrawRandomEvent(room: RoomState): RoomState {
  let updated = { ...room };
  // If there was a previous event with concealed markers, clean it up first
  if (updated.activeEvent || updated.evidencesOnTable.some((e) => e.isConcealed)) {
    updated = handleFinishActiveEvent(updated);
  }

  // 100% random event card selection from deck
  const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  updated.activeEvent = {
    event: randomEvent,
    remainingSeconds: randomEvent.duration || 90,
  };
  updated.eventsActivatedCount = (updated.eventsActivatedCount || 0) + 1;

  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `⚡ EVENTO DA BIBLIOTECA INVOCADO: [${randomEvent.name}] - ${randomEvent.effect}`,
    type: 'system',
  });

  if (isEvidenceConcealmentEvent(randomEvent)) {
    updated = applyConcealmentEvent(updated, randomEvent);
  }

  return updated;
}

export function handleDrawNewEvidence(room: RoomState): RoomState {
  const updated = { ...room };
  const currentIds = new Set(updated.evidencesOnTable.map((e) => e.id));
  const discardedIds = new Set((updated.discardedEvidences || []).map((e) => e.id));

  // Find unused evidences from the master list
  const availableEvidences = EVIDENCES.filter(
    (e) => !currentIds.has(e.id) && !discardedIds.has(e.id)
  );

  if (availableEvidences.length === 0) {
    throw new Error('Não há mais cartas de evidência disponíveis nos arquivos da biblioteca.');
  }

  const randomNew = availableEvidences[Math.floor(Math.random() * availableEvidences.length)];
  const newCard: CardEvidence = { ...randomNew, markedOptionIndex: undefined, markedColor: undefined };

  updated.evidencesOnTable = [...updated.evidencesOnTable, newCard];
  updated.presentedEvidenceIds = Array.from(new Set([...(updated.presentedEvidenceIds || []), newCard.id]));

  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `📜 O Oráculo revelou uma nova tábua de pistas: [${newCard.title}]!`,
    type: 'oracle',
  });

  return updated;
}

export function handleAddSpecificEvidence(room: RoomState, evidenceId: string): RoomState {
  const updated = { ...room };
  if (updated.evidencesOnTable.some((e) => e.id === evidenceId)) {
    throw new Error('Esta evidência já está disposta sobre a mesa.');
  }
  const found = EVIDENCES.find((e) => e.id === evidenceId);
  if (!found) throw new Error('Carta de evidência não encontrada.');

  updated.discardedEvidences = (updated.discardedEvidences || []).filter((e) => e.id !== evidenceId);
  updated.evidencesOnTable = [...updated.evidencesOnTable, { ...found, markedOptionIndex: undefined, markedColor: undefined }];
  updated.presentedEvidenceIds = Array.from(new Set([...(updated.presentedEvidenceIds || []), found.id]));

  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `📜 O Oráculo adicionou especificamente a carta [${found.id} - ${found.title}] à mesa!`,
    type: 'oracle',
  });

  return updated;
}

export function handleDiscardEvidence(room: RoomState, evidenceId: string): RoomState {
  const updated = { ...room };
  const cardToDiscard = updated.evidencesOnTable.find((e) => e.id === evidenceId);

  if (!cardToDiscard) {
    throw new Error('Evidência não encontrada na mesa.');
  }

  // Prevent discarding the 2 mandatory primary evidence cards (Causa da Morte e Local)
  if (cardToDiscard.id === 'E01' || cardToDiscard.id === 'E02') {
    throw new Error('As evidências fundamentais (Causa da Morte e Local do Crime) não podem ser descartadas.');
  }

  if (cardToDiscard.isProtected) {
    throw new Error('Esta evidência está inviolável e protegida pelo Selo do Guardião!');
  }

  updated.evidencesOnTable = updated.evidencesOnTable.filter((e) => e.id !== evidenceId);
  updated.discardedEvidences = [...(updated.discardedEvidences || []), cardToDiscard];

  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `🗑️ A evidência [${cardToDiscard.title}] foi descartada dos registros da mesa pelo Oráculo.`,
    type: 'oracle',
  });

  return updated;
}

export function autoProcessBotOracleNextRound(room: RoomState): RoomState {
  const updated = { ...room };
  const solution = updated.secretSolution;
  if (!solution) return finishOraclePhase(updated);

  const killer = updated.players.find((p) => p.id === solution.killerPlayerId);
  const method = killer?.methods.find((m) => m.id === solution.methodId);
  const object = killer?.objects.find((o) => o.id === solution.objectId);

  // 1. Draw a new evidence card from unused cards
  const currentIds = new Set(updated.evidencesOnTable.map((e) => e.id));
  const discardedIds = new Set((updated.discardedEvidences || []).map((e) => e.id));
  const availableEvidences = EVIDENCES.filter(
    (e) => !currentIds.has(e.id) && !discardedIds.has(e.id)
  );

  let newCard: CardEvidence | null = null;
  if (availableEvidences.length > 0) {
    const randomNew = availableEvidences[Math.floor(Math.random() * availableEvidences.length)];
    newCard = { ...randomNew, markedOptionIndex: undefined, markedColor: undefined };
    updated.evidencesOnTable = [...updated.evidencesOnTable, newCard];
    updated.presentedEvidenceIds = Array.from(new Set([...(updated.presentedEvidenceIds || []), newCard.id]));

    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `📜 O Oráculo Sagrado (IA) interpretou novos presságios no Códice e revelou a tábua de pistas [${newCard.title}]!`,
      type: 'oracle',
    });
  }

  // 2. Mark any unmarked evidences intelligently
  const colors: MarkerColor[] = ['dourado', 'azul', 'vermelho', 'preto', 'cinza'];
  updated.evidencesOnTable = updated.evidencesOnTable.map((ev, idx) => {
    if (ev.markedOptionIndex !== undefined && ev.markedColor !== undefined) {
      return ev;
    }

    const chosenColor = colors[idx % colors.length];
    let chosenOptionIdx = 0;
    const combinedDesc = `${method?.name || ''} ${method?.description || ''} ${object?.name || ''} ${object?.description || ''}`.toLowerCase();

    let foundMatch = -1;
    ev.options.forEach((opt, optIdx) => {
      const optWords = opt.toLowerCase().split(/[\s,./]+/);
      for (const w of optWords) {
        if (w.length >= 4 && combinedDesc.includes(w)) {
          foundMatch = optIdx;
          break;
        }
      }
    });

    if (foundMatch !== -1) {
      chosenOptionIdx = foundMatch;
    } else {
      chosenOptionIdx = (idx * 2 + 1) % ev.options.length;
    }

    return {
      ...ev,
      markedOptionIndex: chosenOptionIdx,
      markedColor: chosenColor,
    };
  });

  return finishOraclePhase(updated);
}

export function handleAdvanceRound(room: RoomState): RoomState {
  let updated = { ...room };
  const maxRounds = updated.maxRounds || updated.settings.maxRounds || 3;

  // Clear active round event and automatically restore any concealed markers
  const hadEvent = Boolean(updated.activeEvent);
  if (updated.activeEvent || updated.evidencesOnTable.some((e) => e.isConcealed)) {
    const finished = handleFinishActiveEvent(updated);
    updated.evidencesOnTable = finished.evidencesOnTable;
  }
  updated.activeEvent = null;
  updated.activeAbility = null;

  if (updated.round < maxRounds) {
    updated.round += 1;
    updated.roundsPlayed = updated.round;
    updated.phase = 'ORACULO';
    updated.phaseTimerRemaining = 0;
    updated.phaseTimerActive = false;

    // Distribute random abilities to all players for the new round
    const shuffledAbilities = secureShuffle(ABILITIES);
    updated.players = updated.players.map((p, idx) => ({
      ...p,
      ability: { ...(shuffledAbilities[idx % shuffledAbilities.length] || ABILITIES[0]) },
      abilityUsed: false,
    }));

    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🔔 INÍCIO DA RODADA ${updated.round} DE ${maxRounds}! O Oráculo entra em novo transe para atualizar ou expandir as evidências.${
        hadEvent ? ' O evento da rodada anterior foi encerrado.' : ''
      } Todos os jogadores receberam uma nova carta de habilidade aleatória!`,
      type: 'system',
    });

    // If Oracle is an AI Bot: auto-draw new evidence, place markers and start investigation
    const oraclePlayer = updated.players.find((p) => p.role === 'oraculo');
    if (oraclePlayer?.isAI) {
      return autoProcessBotOracleNextRound(updated);
    }
  } else {
    // Max rounds reached without solving crime -> Killer escapes & wins!
    updated = finalizeGameMatchStats(updated, 'assassino');

    updated.logs.push({
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `🩸 FIM DA ÚLTIMA RODADA (${maxRounds}/${maxRounds})! O tempo se esgotou e o crime não foi solucionado. O Assassino triunfou!`,
      type: 'result',
    });
  }

  return updated;
}

export function toggleTimer(room: RoomState): RoomState {
  const updated = { ...room };
  updated.phaseTimerActive = !updated.phaseTimerActive;
  return updated;
}

export function handleUpdateStoryNarrative(
  room: RoomState,
  playerId: string,
  newNarrative: string
): RoomState {
  const updated = { ...room };
  const player = updated.players.find((p) => p.id === playerId);
  if (!player) {
    throw new Error('Jogador inválido.');
  }
  // Allow Oracle, host, or local game admin to update narrative
  updated.storyNarrative = newNarrative.trim();
  updated.logs.push({
    id: `log_${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `📜 ${player.name} atualizou o Diário e a Crônica do Crime nos registros da biblioteca.`,
    type: 'oracle',
  });
  return updated;
}

// -------------------------------------------------------------
// AI BOTS DEDUCTION, DIALOGUE & ACCUSATION SIMULATION
// -------------------------------------------------------------

export function generateAIBotDialogue(room: RoomState): RoomState | null {
  if (room.phase !== 'INVESTIGACAO') return null;

  const aiBots = room.players.filter((p) => p.isAI);
  if (aiBots.length === 0) return null;

  const bot = aiBots[Math.floor(Math.random() * aiBots.length)];
  const updated = { ...room, messages: [...room.messages] };

  // Generate rich contextual dialogues based on clues & other players
  const markedEvidences = updated.evidencesOnTable.filter((e) => e.markedOptionIndex !== undefined);
  const otherPlayers = updated.players.filter((p) => p.id !== bot.id && p.role !== 'oraculo');
  const randomSuspect = otherPlayers.length > 0 ? otherPlayers[Math.floor(Math.random() * otherPlayers.length)] : null;
  const randomEvidence = markedEvidences.length > 0 ? markedEvidences[Math.floor(Math.random() * markedEvidences.length)] : null;

  const dialogues: string[] = [];

  if (randomEvidence && randomEvidence.markedOptionIndex !== undefined) {
    const optionText = randomEvidence.options[randomEvidence.markedOptionIndex];
    dialogues.push(
      `Analisando a pista de [${randomEvidence.title}]... A opção "${optionText}" chama muita atenção.`,
      `O Oráculo marcou "${optionText}" em [${randomEvidence.title}]. Isso deve se conectar com algum método ou objeto na mesa.`,
      `Prestem atenção no marcador em [${randomEvidence.title}]. Não foi uma escolha ao acaso.`
    );
  }

  if (randomSuspect && randomSuspect.methods.length > 0 && randomSuspect.objects.length > 0) {
    const randomM = randomSuspect.methods[Math.floor(Math.random() * randomSuspect.methods.length)];
    const randomO = randomSuspect.objects[Math.floor(Math.random() * randomSuspect.objects.length)];

    if (bot.role === 'assassino') {
      dialogues.push(
        `Não podemos nos precipitar, mas as cartas de ${randomSuspect.name} parecem muito suspeitas, especialmente [${randomM.name}].`,
        `Acho que estamos procurando no lugar errado. Devíamos investigar melhor a mesa de ${randomSuspect.name}.`
      );
    } else if (bot.role === 'cumplice') {
      dialogues.push(
        `O que acham de [${randomO.name}] com ${randomSuspect.name}? Pode ser uma pista forte.`,
        `Talvez devêssemos focar em ${randomSuspect.name} antes que o tempo acabe.`
      );
    } else {
      dialogues.push(
        `Examinando a mesa de ${randomSuspect.name}, vejo [${randomM.name}] e [${randomO.name}]. Faz sentido com os indícios?`,
        `Alguém mais reparou nas cartas de ${randomSuspect.name}? [${randomM.name}] se alinha com as marcações do Oráculo.`,
        `Estou cruzando as evidências do Códice com os objetos de ${randomSuspect.name}. O cerco está se fechando!`
      );
    }
  }

  // General atmospheric deduction lines
  dialogues.push(
    `O tempo está passando rápido. Precisamos formular uma teoria sólida antes da próxima rodada.`,
    `Se observarmos as cores dos marcadores, o Oráculo está nos guiando para uma contradição evidente.`,
    `A biblioteca guarda segredos sombrios, mas a verdade sempre deixa rastros.`
  );

  const selectedText = dialogues[Math.floor(Math.random() * dialogues.length)];

  updated.messages.push({
    id: `msg_bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: bot.id,
    senderName: bot.name,
    text: selectedText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  return updated;
}

export function performAIBotAccusation(room: RoomState): RoomState | null {
  if (room.phase !== 'INVESTIGACAO') return null;
  if (!room.secretSolution) return null;

  // Do not let bots rush into accusations during early phase of round 1 (allow humans time to analyze and talk)
  const timerTotal = room.settings.discussionTimerSeconds || 120;
  if (room.round === 1 && room.phaseTimerRemaining > timerTotal - 35) {
    return null;
  }

  // Find eligible AI investigators who haven't accused yet
  const eligibleBots = room.players.filter((p) => p.isAI && p.role === 'investigador' && !p.hasAccused);
  if (eligibleBots.length === 0) return null;

  const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
  const solution = room.secretSolution;
  const killerPlayer = room.players.find((p) => p.id === solution.killerPlayerId);
  if (!killerPlayer) return null;

  // Calculate bot accuracy based on room settings (default 20%) and bot difficulty
  let baseAccuracy = room.settings.botAccuracyPercent !== undefined ? room.settings.botAccuracyPercent : 20;
  if (bot.aiDifficulty === 'facil') baseAccuracy = Math.max(5, baseAccuracy * 0.5);
  else if (bot.aiDifficulty === 'dificil') baseAccuracy = Math.min(60, baseAccuracy * 1.3);
  else if (bot.aiDifficulty === 'especialista') baseAccuracy = Math.min(75, baseAccuracy * 1.6);

  const isAccurate = Math.random() < (baseAccuracy / 100);

  let targetPlayerId = killerPlayer.id;
  let targetMethodId = solution.methodId;
  let targetObjectId = solution.objectId;

  if (!isAccurate) {
    const errorType = Math.random();
    if (errorType < 0.5) {
      // Suspects the real killer, but picks 1 wrong card
      const otherMethods = killerPlayer.methods.filter((m) => m.id !== solution.methodId);
      const otherObjects = killerPlayer.objects.filter((o) => o.id !== solution.objectId);

      if (Math.random() < 0.5 && otherMethods.length > 0) {
        targetMethodId = otherMethods[Math.floor(Math.random() * otherMethods.length)].id;
      } else if (otherObjects.length > 0) {
        targetObjectId = otherObjects[Math.floor(Math.random() * otherObjects.length)].id;
      }
    } else {
      // Suspects a completely different innocent player
      const innocentPlayers = room.players.filter(
        (p) => p.id !== solution.killerPlayerId && p.id !== bot.id && p.role !== 'oraculo' && p.methods.length > 0 && p.objects.length > 0
      );
      if (innocentPlayers.length > 0) {
        const pickedInnocent = innocentPlayers[Math.floor(Math.random() * innocentPlayers.length)];
        targetPlayerId = pickedInnocent.id;
        targetMethodId = pickedInnocent.methods[Math.floor(Math.random() * pickedInnocent.methods.length)].id;
        targetObjectId = pickedInnocent.objects[Math.floor(Math.random() * pickedInnocent.objects.length)].id;
      }
    }
  }

  // Pre-accusation announcement in chat
  const preUpdated = { ...room, messages: [...room.messages] };
  const targetPlayer = preUpdated.players.find((p) => p.id === targetPlayerId);
  if (!targetPlayer) return null;

  preUpdated.messages.push({
    id: `msg_bot_acc_${Date.now()}`,
    senderId: bot.id,
    senderName: bot.name,
    text: `Reuni todas as evidências e tenho uma dedução categórica! Eu acuso formalmente ${targetPlayer.name}!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  try {
    return handleAccusation(preUpdated, bot.id, targetPlayerId, targetMethodId, targetObjectId);
  } catch (err) {
    console.error('Bot accusation error:', err);
    return null;
  }
}

