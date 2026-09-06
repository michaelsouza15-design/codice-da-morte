import React, { useState, useEffect, useRef } from 'react';
import { METHODS, OBJECTS, SECRET_ROLES, EVIDENCES, EVENTS, ABILITIES, CHARACTERS } from '../data/gameData';
import { isUploadsUnlocked } from './uploadSecurity';

const IDB_NAME = 'CodiceCardDB_v2';
const IDB_STORE = 'card_arts';
const EVENT_NAME = 'codice_custom_card_arts_updated';

// In-memory runtime cache for lightning-fast synchronous access in components
const memoryCardArts: Record<string, string> = {};
let isIDBInitialized = false;

/* =========================================================================
   INDEXED-DB ENGINE (NO 5MB QUOTA LIMIT - SUPPORTS HUNDREDS OF HIGH-RES PNGs)
   ========================================================================= */

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(IDB_NAME, 2);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromIndexedDB(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        const map: Record<string, string> = {};
        for (const item of items) {
          if (item && item.id && item.data) {
            map[item.id] = item.data;
          }
        }
        resolve(map);
      };
      req.onerror = () => resolve({});
    });
  } catch (err) {
    console.warn('IndexedDB read fallback:', err);
    return {};
  }
}

async function saveToIndexedDB(id: string, data: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.put({ id, data, updatedAt: Date.now() });
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }
}

async function saveBatchToIndexedDB(entries: Record<string, string>): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    const now = Date.now();
    for (const [id, data] of Object.entries(entries)) {
      store.put({ id, data, updatedAt: now });
    }
  } catch (err) {
    console.warn('IndexedDB batch write error:', err);
  }
}

async function deleteFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.delete(id);
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }
}

async function clearAllFromIndexedDB(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    store.clear();
  } catch (err) {
    console.warn('IndexedDB clear error:', err);
  }
}

/* =========================================================================
   SERVER SYNC & INITIALIZATION
   ========================================================================= */

// Fetch persisted cards list from Express server (/public/cards/ directory)
export async function syncCardsWithServer(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/api/cards/list');
    if (response.ok) {
      const data = await response.json();
      const serverCards: Record<string, string> = data.cards || {};

      // 1. Purge any stale server URLs from memory if the server no longer has them
      for (const [key, val] of Object.entries(memoryCardArts)) {
        if (val.startsWith('/cards/') && !serverCards[key] && !serverCards[key.toUpperCase()] && !serverCards[key.toLowerCase()]) {
          delete memoryCardArts[key];
        }
      }

      // 2. Populate valid server URLs
      for (const [id, url] of Object.entries(serverCards)) {
        // Only set if we don't have a fresh local base64 upload in memory
        if (!memoryCardArts[id] || memoryCardArts[id].startsWith('/cards/')) {
          memoryCardArts[id] = url;
          const allAliases = getAliasesForCard(id);
          for (const alias of allAliases) {
            if (!memoryCardArts[alias] || memoryCardArts[alias].startsWith('/cards/')) {
              memoryCardArts[alias] = url;
            }
          }
        }
      }
      return serverCards;
    }
  } catch (err) {
    console.warn('Could not sync cards with server (offline or preview mode):', err);
  }
  return {};
}

// Mark broken image URL as failed and remove it from memory & cache so UI falls back smoothly
export function markCardArtFailed(cardIdOrUrl: string): void {
  if (!cardIdOrUrl) return;
  const clean = cardIdOrUrl.trim();
  
  // Find all keys in memoryCardArts that match or point to this URL
  let changed = false;
  for (const [k, v] of Object.entries(memoryCardArts)) {
    if (k === clean || k.toLowerCase() === clean.toLowerCase() || v === cardIdOrUrl) {
      delete memoryCardArts[k];
      deleteFromIndexedDB(k);
      changed = true;
    }
  }

  if (changed && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cardId: clean, failed: true } }));
  }
}

// Export full backup JSON of all linked cards (for transferring between computers or backups)
export async function exportCardsBackupJSON(): Promise<string> {
  // Collect all arts from memory & IDB
  const idbArts = await getAllFromIndexedDB();
  const combined: Record<string, string> = { ...idbArts };

  for (const [k, v] of Object.entries(memoryCardArts)) {
    if (v.startsWith('data:image/')) {
      combined[k] = v;
    }
  }

  // Also check if server has anything via export-bundle
  try {
    const res = await fetch('/api/cards/export-bundle');
    if (res.ok) {
      const serverBundle = await res.json();
      if (serverBundle.cards) {
        Object.assign(combined, serverBundle.cards);
      }
    }
  } catch (e) {
    // ignore
  }

  const payload = {
    appName: 'CRIMEN - O Códice de Sangue',
    version: '2.0',
    exportDate: new Date().toISOString(),
    totalCards: Object.keys(combined).length,
    cards: combined,
  };

  return JSON.stringify(payload, null, 2);
}

// Download backup JSON file directly in browser
export async function downloadCardsBackupFile(): Promise<number> {
  const jsonStr = await exportCardsBackupJSON();
  const parsed = JSON.parse(jsonStr);
  const count = parsed.totalCards || 0;

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crimen-cartas-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return count;
}

// Import backup JSON file and save to memory, IndexedDB and server disk
export async function importCardsBackupJSON(
  jsonData: string | Record<string, any>,
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; count: number }> {
  try {
    let parsed: any;
    if (typeof jsonData === 'string') {
      parsed = JSON.parse(jsonData);
    } else {
      parsed = jsonData;
    }

    const cardsMap: Record<string, string> = parsed.cards || parsed;
    if (!cardsMap || typeof cardsMap !== 'object') {
      throw new Error('Formato de JSON inválido: chave "cards" não encontrada');
    }

    const validEntries: Record<string, string> = {};
    for (const [k, v] of Object.entries(cardsMap)) {
      if (typeof v === 'string' && (v.startsWith('data:image/') || v.startsWith('/cards/') || v.startsWith('http'))) {
        validEntries[k] = v;
      }
    }

    const count = Object.keys(validEntries).length;
    if (count === 0) {
      return { success: false, count: 0 };
    }

    await setBatchCustomCardArts(validEntries, onProgress);
    return { success: true, count };
  } catch (err) {
    console.error('Erro ao importar backup de cartas:', err);
    return { success: false, count: 0 };
  }
}

// Unified asset persistence to server (characters, cards, manual, audio, markers)
export async function persistAssetToServer(
  assetId: string,
  base64Data: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; fileName?: string; cardId?: string }> {
  try {
    const isChar = assetId.startsWith('char_') || assetId.startsWith('personagem_') || assetId.startsWith('crest_') || assetId.startsWith('perso_');
    if (isChar) {
      const charRes = await persistCharacterToServer(assetId, base64Data, fileName);
      return { success: charRes.success, url: charRes.url, fileName: charRes.fileName, cardId: assetId };
    }

    const res = await fetch('/api/cards/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId: assetId, base64Data, fileName }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.url) {
        memoryCardArts[assetId] = result.url;
        const allAliases = getAliasesForCard(assetId);
        for (const alias of allAliases) {
          memoryCardArts[alias] = result.url;
        }
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cardId: assetId, url: result.url } }));
        return { success: true, url: result.url, fileName: result.fileName, cardId: result.cardId || assetId };
      }
    }
  } catch (err) {
    console.warn(`Could not persist asset ${assetId} to server:`, err);
  }
  return { success: false };
}

// Push card art to server disk (/public/cards/)
export async function persistCardToServer(cardId: string, base64Data: string, fileName?: string): Promise<boolean> {
  const res = await persistAssetToServer(cardId, base64Data, fileName);
  return res.success;
}

// Push character art to server disk (/public/characters/char_XX.png) directly without duplication
export async function persistCharacterToServer(
  characterIndexOrId: number | string,
  base64Data: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; fileName?: string; slot?: number }> {
  try {
    const payload = typeof characterIndexOrId === 'number'
      ? { characterIndex: characterIndexOrId, base64Data, fileName }
      : { characterId: String(characterIndexOrId), base64Data, fileName };

    const res = await fetch('/api/characters/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.url) {
        const slot = result.slot;
        const pad = String(slot).padStart(2, '0');
        const charKey = `char_${pad}`;
        const persoKey = `personagem_${String(slot + 1).padStart(2, '0')}`;
        const numberKey = `perso_${slot + 1}`;
        const crestKey = `crest_${charKey}`;
        
        memoryCardArts[charKey] = result.url;
        memoryCardArts[persoKey] = result.url;
        memoryCardArts[numberKey] = result.url;
        memoryCardArts[crestKey] = result.url;
        if (typeof characterIndexOrId === 'string') {
          memoryCardArts[characterIndexOrId] = result.url;
          const aliases = getAliasesForCard(characterIndexOrId);
          for (const a of aliases) {
            memoryCardArts[a] = result.url;
          }
        }

        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cardId: charKey, url: result.url } }));
        return { success: true, url: result.url, fileName: result.fileName, slot: result.slot };
      }
    }
  } catch (err) {
    console.warn(`Could not persist character to server:`, err);
  }
  return { success: false };
}

// Bulk push cards to server disk (/public/cards/)
export async function persistBatchCardsToServer(
  cards: Array<{ cardId: string; base64Data: string; fileName?: string }>
): Promise<{ success: boolean; savedCount: number }> {
  try {
    // Send in chunks of 20 to avoid extreme payload sizes while remaining super fast
    const chunkSize = 20;
    let totalSaved = 0;

    for (let i = 0; i < cards.length; i += chunkSize) {
      const chunk = cards.slice(i, i + chunkSize);
      const res = await fetch('/api/cards/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: chunk }),
      });
      if (res.ok) {
        const result = await res.json();
        totalSaved += result.savedCount || chunk.length;
        if (result.saved && Array.isArray(result.saved)) {
          for (const s of result.saved) {
            memoryCardArts[s.cardId] = s.url;
            const allAliases = getAliasesForCard(s.cardId);
            for (const alias of allAliases) {
              memoryCardArts[alias] = s.url;
            }
          }
        }
      }
    }
    return { success: true, savedCount: totalSaved };
  } catch (err) {
    console.warn('Could not persist batch cards to server:', err);
    return { success: false, savedCount: 0 };
  }
}

// Initial bootstrap
if (typeof window !== 'undefined') {
  // 1. Load from IndexedDB
  getAllFromIndexedDB().then((idbItems) => {
    Object.assign(memoryCardArts, idbItems);
    isIDBInitialized = true;
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { initial: true } }));
    
    // 2. Load from server
    syncCardsWithServer().then(() => {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { serverSync: true } }));
    });
  });
}

/* =========================================================================
   PUBLIC API METHODS
   ========================================================================= */

// Helper to generate all possible normalized aliases for a card ID or name
export function getAliasesForCard(cardIdentifier: string): string[] {
  if (!cardIdentifier) return [];
  const raw = cardIdentifier.trim();
  const lower = raw.toLowerCase();
  const upper = raw.toUpperCase();
  const clean = lower
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_\s.]+/g, '');
  
  const aliases = new Set<string>([raw, lower, upper, clean]);

  // Method resolution (M01 to M60)
  const methodMatch = raw.match(/^(?:m|metodo|method)?0*(\d{1,2})$/i);
  let methodObj = METHODS.find((m) => m.id.toLowerCase() === lower || m.id.toUpperCase() === upper);
  if (!methodObj && methodMatch) {
    const num = parseInt(methodMatch[1], 10);
    const mId = `M${num.toString().padStart(2, '0')}`;
    methodObj = METHODS.find((m) => m.id === mId);
  }
  if (!methodObj) {
    // Check by name
    methodObj = METHODS.find((m) => {
      const cleanMName = m.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '').toLowerCase();
      return clean.includes(cleanMName) || cleanMName.includes(clean) || clean.includes(m.id.toLowerCase());
    });
  }
  if (methodObj) {
    aliases.add(methodObj.id);
    aliases.add(methodObj.id.toLowerCase());
    aliases.add(methodObj.id.toUpperCase());
    aliases.add(`metodo_${methodObj.id.toLowerCase()}`);
    aliases.add(`metodo_${methodObj.id.toUpperCase()}`);
    const cleanName = methodObj.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '').toLowerCase();
    aliases.add(cleanName);
    const firstWord = cleanName.split(/\s+/)[0];
    if (firstWord) aliases.add(firstWord);
  }

  // Object resolution (O01 to O64)
  const objMatch = raw.match(/^(?:o|obj|objeto|object)?0*(\d{1,2})$/i);
  let objectObj = OBJECTS.find((o) => o.id.toLowerCase() === lower || o.id.toUpperCase() === upper);
  if (!objectObj && objMatch) {
    const num = parseInt(objMatch[1], 10);
    const oId = `O${num.toString().padStart(2, '0')}`;
    objectObj = OBJECTS.find((o) => o.id === oId);
  }
  if (!objectObj) {
    objectObj = OBJECTS.find((o) => {
      const cleanOName = o.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '').toLowerCase();
      return clean.includes(cleanOName) || cleanOName.includes(clean) || clean.includes(o.id.toLowerCase());
    });
  }
  if (objectObj) {
    aliases.add(objectObj.id);
    aliases.add(objectObj.id.toLowerCase());
    aliases.add(objectObj.id.toUpperCase());
    aliases.add(`obj_${objectObj.id.toLowerCase()}`);
    aliases.add(`objeto_${objectObj.id.toLowerCase()}`);
    const cleanName = objectObj.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '').toLowerCase();
    aliases.add(cleanName);
  }

  // Secret Role resolution
  if (clean.includes('assassino') || raw === 'role_assassino' || raw === 'R01') {
    ['role_assassino', 'assassino', 'r01', 'R01', 'murderer', 'killer'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('oraculo') || raw === 'role_oraculo' || raw === 'R02') {
    ['role_oraculo', 'oraculo', 'r02', 'R02', 'oracle'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('investigador') || clean.includes('detetive') || raw === 'role_investigador' || raw === 'R03') {
    ['role_investigador', 'investigador', 'detetive', 'r03', 'R03', 'investigator'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('cumplice') || raw === 'role_cumplice' || raw === 'R04') {
    ['role_cumplice', 'cumplice', 'r04', 'R04', 'accomplice'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('sabotador') || raw === 'role_sabotador' || raw === 'R05') {
    ['role_sabotador', 'sabotador', 'r05', 'R05', 'saboteur'].forEach((a) => aliases.add(a));
  }

  // Oracle Wax Seals / Markers resolution
  if (clean.includes('dourado') || clean.includes('gold') || clean.includes('amarelo') || raw === 'seal_dourado' || raw === 'marcador_dourado' || raw === 'marcador1' || raw === 'marcador_1') {
    ['seal_dourado', 'marcador_dourado', 'dourado', 'gold', 'marcador1', 'marcador_1', 'selo_dourado', 'cera_dourado', 'wax_dourado', 'selo1'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('vermelho') || clean.includes('red') || clean.includes('rubi') || raw === 'seal_vermelho' || raw === 'marcador_vermelho' || raw === 'marcador2' || raw === 'marcador_2') {
    ['seal_vermelho', 'marcador_vermelho', 'vermelho', 'red', 'marcador2', 'marcador_2', 'selo_vermelho', 'cera_vermelho', 'wax_vermelho', 'selo2', 'rubi'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('azul') || clean.includes('blue') || raw === 'seal_azul' || raw === 'marcador_azul' || raw === 'marcador3' || raw === 'marcador_3') {
    ['seal_azul', 'marcador_azul', 'azul', 'blue', 'marcador3', 'marcador_3', 'selo_azul', 'cera_azul', 'wax_azul', 'selo3'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('cinza') || clean.includes('gray') || clean.includes('grey') || clean.includes('prata') || raw === 'seal_cinza' || raw === 'marcador_cinza' || raw === 'marcador4' || raw === 'marcador_4') {
    ['seal_cinza', 'marcador_cinza', 'cinza', 'gray', 'grey', 'marcador4', 'marcador_4', 'selo_cinza', 'cera_cinza', 'wax_cinza', 'selo4', 'prata'].forEach((a) => aliases.add(a));
  }
  if (clean.includes('preto') || clean.includes('black') || clean.includes('sombrio') || clean.includes('trevas') || raw === 'seal_preto' || raw === 'marcador_preto' || raw === 'marcador5' || raw === 'marcador_5') {
    ['seal_preto', 'marcador_preto', 'preto', 'black', 'marcador5', 'marcador_5', 'selo_preto', 'cera_preto', 'wax_preto', 'selo5', 'sombrio', 'trevas'].forEach((a) => aliases.add(a));
  }

  // Evidence resolution (E01 to E60 / EV01 to EV60)
  const evMatch = raw.match(/^(?:e|ev|evidencia|evidence)0*(\d{1,2})$/i);
  if (evMatch) {
    const num = parseInt(evMatch[1], 10);
    const eId = `E${num.toString().padStart(2, '0')}`;
    const evId = `EV${num.toString().padStart(2, '0')}`;
    aliases.add(eId);
    aliases.add(eId.toLowerCase());
    aliases.add(evId);
    aliases.add(evId.toLowerCase());
    aliases.add(`evidencia_${eId.toLowerCase()}`);
  }

  // Event resolution (EV01 to EV16)
  const eventMatch = raw.match(/^(?:ev|evento|event)0*(\d{1,2})$/i);
  if (eventMatch) {
    const num = parseInt(eventMatch[1], 10);
    const evId = `EV${num.toString().padStart(2, '0')}`;
    aliases.add(evId);
    aliases.add(evId.toLowerCase());
    aliases.add(`evento_${evId.toLowerCase()}`);
  }
  for (const event of EVENTS) {
    const cleanEventName = event.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '').toLowerCase();
    if (
      clean === event.id.toLowerCase() ||
      clean === cleanEventName ||
      clean.includes(cleanEventName) ||
      cleanEventName.includes(clean) ||
      (event.aliases && event.aliases.some((a) => clean.includes(a.replace(/[-_\s.]+/g, '').toLowerCase())))
    ) {
      aliases.add(event.id);
      aliases.add(event.id.toLowerCase());
      if (event.aliases) {
        event.aliases.forEach((a) => aliases.add(a));
      }
    }
  }

  // Ability resolution (H01 to H12)
  const abMatch = raw.match(/^(?:h|hab|habilidade|ability)0*(\d{1,2})$/i);
  if (abMatch) {
    const num = parseInt(abMatch[1], 10);
    const hId = `H${num.toString().padStart(2, '0')}`;
    aliases.add(hId);
    aliases.add(hId.toLowerCase());
    aliases.add(`habilidade_${hId.toLowerCase()}`);
  }
  for (const ability of ABILITIES) {
    const cleanAbilityName = ability.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '').toLowerCase();
    if (
      clean === ability.id.toLowerCase() ||
      clean === cleanAbilityName ||
      clean.includes(cleanAbilityName) ||
      cleanAbilityName.includes(clean) ||
      (ability.aliases && ability.aliases.some((a) => clean.includes(a.replace(/[-_\s.]+/g, '').toLowerCase())))
    ) {
      aliases.add(ability.id);
      aliases.add(ability.id.toLowerCase());
      if (ability.aliases) {
        ability.aliases.forEach((a) => aliases.add(a));
      }
    }
  }

  // Character resolution
  for (const c of CHARACTERS) {
    const cleanCName = c.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[-_\s.]+/g, '').toLowerCase();
    if (
      clean === c.id.replace(/_/g, '') ||
      clean.includes(cleanCName) ||
      cleanCName.includes(clean) ||
      (c.aliases && c.aliases.some((a) => clean.includes(a.replace(/[-_\s.]+/g, '').toLowerCase())))
    ) {
      aliases.add(c.id);
      aliases.add(`char_${c.id}`);
      aliases.add(`char_card_${c.id}`);
      aliases.add(`crest_${c.id}`);
      if (c.number) {
        aliases.add(`perso_${c.number}`);
        aliases.add(`perso${c.number}`);
        aliases.add(`char_${c.number}`);
        aliases.add(`char_${(c.number - 1).toString().padStart(2, '0')}`);
      }
    }
  }

  return Array.from(aliases);
}

// Get all custom card artworks
export function getAllCustomCardArts(): Record<string, string> {
  return { ...memoryCardArts };
}

// Get custom artwork for a specific card ID (e.g. 'M01', 'O22', 'role_assassino', 'E01')
export function getCustomCardArt(cardId?: string | string[]): string | undefined {
  if (!cardId) return undefined;
  const ids = Array.isArray(cardId) ? cardId : [cardId];

  for (const id of ids) {
    if (!id) continue;
    // 1. Direct key
    if (memoryCardArts[id]) return memoryCardArts[id];

    // 2. Lookup through all generated aliases
    const aliases = getAliasesForCard(id);
    for (const alias of aliases) {
      if (memoryCardArts[alias]) return memoryCardArts[alias];
    }
  }
  return undefined;
}

// Save a single custom card art
export function setCustomCardArt(cardId: string, dataUrl: string): void {
  const cleanId = cardId.trim();
  const allAliases = getAliasesForCard(cleanId);

  // Bind to memory cache for all aliases
  for (const alias of allAliases) {
    memoryCardArts[alias] = dataUrl;
  }

  // Save to IndexedDB (local persistence without 5MB limit)
  saveToIndexedDB(cleanId, dataUrl);

  // Dispatch UI update immediately
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cardId: cleanId, dataUrl } }));

  // Persist to physical server files (/public/cards/)
  persistCardToServer(cleanId, dataUrl);
}

// Batch save multiple card artworks at once
export function setBatchCustomCardArts(
  newArts: Record<string, string>,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  return new Promise(async (resolve) => {
    const entries = Object.entries(newArts);
    const total = entries.length;

    // 1. Immediately update memory cache for instant UI rendering for all aliases
    for (const [id, dataUrl] of entries) {
      const allAliases = getAliasesForCard(id);
      for (const alias of allAliases) {
        memoryCardArts[alias] = dataUrl;
      }
    }

    // 2. Dispatch UI update
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { batch: true, count: total } }));

    // 3. Save to IndexedDB
    await saveBatchToIndexedDB(newArts);

    // 4. Send to server disk in background
    const serverPayload = entries.map(([cardId, base64Data]) => ({ cardId, base64Data }));
    await persistBatchCardsToServer(serverPayload);

    if (onProgress) onProgress(total, total);
    resolve();
  });
}

// Remove custom card art
export function removeCustomCardArt(cardId: string): void {
  const cleanId = cardId.trim();
  delete memoryCardArts[cleanId];
  delete memoryCardArts[cleanId.toLowerCase()];
  delete memoryCardArts[cleanId.toUpperCase()];

  deleteFromIndexedDB(cleanId);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cardId: cleanId, deleted: true } }));

  fetch(`/api/cards/${cleanId}`, { method: 'DELETE' }).catch(() => {});
}

// Clear all custom card arts
export function clearAllCustomCardArts(): void {
  for (const key of Object.keys(memoryCardArts)) {
    delete memoryCardArts[key];
  }
  clearAllFromIndexedDB();
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { cleared: true } }));
  fetch('/api/cards/clear', { method: 'POST' }).catch(() => {});
}

/* =========================================================================
   CANONICAL CARD ID MATCHING ALGORITHM (60 METHODS, 64 OBJECTS, 5 SECRET ROLES)
   ========================================================================= */

export interface CardMatchResult {
  cardId: string;
  cardName: string;
  category:
    | 'metodos'
    | 'objetos'
    | 'papeis'
    | 'evidencias'
    | 'eventos'
    | 'habilidades'
    | 'personagens'
    | 'brasoes'
    | 'bordas'
    | 'cenarios'
    | 'marcadores'
    | 'manual'
    | 'audio';
}

export function matchCardIdFromFileName(fileName: string): CardMatchResult | null {
  // Remove extension and clean string
  const base = fileName.replace(/\.[^/.]+$/, '').trim().toLowerCase();
  // Remove spaces, underscores, dashes, accents, and all parentheses/brackets/punctuation
  const clean = base
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[()[\]{}'"_~`!@#$%^&*+=|\\:;<>,.?/-\s]+/g, '');

  // -------------------------------------------------------------------------
  // RULES MANUAL: O Códice da Morte (manual_regras, rules_reference, etc.)
  // -------------------------------------------------------------------------
  if (
    clean.includes('manualregras') ||
    clean.includes('rulesreference') ||
    clean.includes('codiceregras') ||
    clean.includes('regrasmanual') ||
    clean.includes('referenceregras') ||
    clean === 'manual' ||
    clean === 'regras' ||
    clean === 'codice' ||
    clean.includes('manualdocodice')
  ) {
    return { cardId: 'rules_reference', cardName: 'Manual de Regras: O Códice', category: 'manual' };
  }

  // -------------------------------------------------------------------------
  // AUDIO SOUNDTRACKS (MP3 / WAV tracks)
  // -------------------------------------------------------------------------
  if (clean.includes('rastronastrevas') || clean.includes('rastrotravas') || clean.includes('trilha1') || clean === 'rastro') {
    return { cardId: 'rastro_trevas', cardName: 'Trilha 1: Rastro nas Trevas', category: 'audio' };
  }
  if (clean.includes('luznacupula') || clean.includes('cupula') || clean.includes('trilha2')) {
    return { cardId: 'a_luz_na_cupula', cardName: 'Trilha 2: A Luz na Cúpula', category: 'audio' };
  }
  if (clean.includes('euvouachar') || clean.includes('vouachar') || clean.includes('trilha3')) {
    return { cardId: 'eu_vou_achar', cardName: 'Trilha 3: Eu Vou Achar', category: 'audio' };
  }
  if (clean.includes('codicedassombras') || clean.includes('codicesombras') || clean.includes('trilha4')) {
    return { cardId: 'codice_sombras', cardName: 'Trilha 4: Códice das Sombras', category: 'audio' };
  }
  if (clean.includes('despertardracula') || clean.includes('despertardoconde') || clean.includes('dracula') || clean.includes('trilha5')) {
    return { cardId: 'despertar_dracula', cardName: 'Trilha 5: O Despertar do Conde', category: 'audio' };
  }

  // -------------------------------------------------------------------------
  // 0. PRIORITY CHECK: CHARACTER CARDS with (perso) (1) .. (perso) (42)
  // -------------------------------------------------------------------------
  // Check for (perso) (1) .. (perso) (42), (perso)(1), perso (1), (perso 1), perso1, etc.
  const explicitPersoPattern = base.match(/(?:\(?\s*(?:perso|personagem|char|person|suspeito|p|c)\s*\)?)\s*\(?\s*(\d{1,2})\s*\)?/i)
    || clean.match(/^(?:perso|personagem|charcard|cartapersonagem|char|suspeito|p|c)0*(\d{1,2})$/i);

  if (explicitPersoPattern) {
    const num = parseInt(explicitPersoPattern[1], 10);
    // 1-indexed (1 to 42, matching perso 1 to perso 42)
    if (num >= 1 && num <= CHARACTERS.length) {
      const char = CHARACTERS[num - 1] || CHARACTERS.find((c) => c.number === num);
      if (char) {
        return { cardId: `char_card_${char.id}`, cardName: `Carta de Personagem: ${char.name} (#${num})`, category: 'personagens' };
      }
    }
    // 0-indexed (0 to 41, matching char_00 to char_41)
    if (num >= 0 && num < CHARACTERS.length) {
      const char = CHARACTERS[num];
      if (char) {
        return { cardId: `char_card_${char.id}`, cardName: `Carta de Personagem: ${char.name} (#${num + 1})`, category: 'personagens' };
      }
    }
  }

  // -------------------------------------------------------------------------
  // 0. BORDERS, FRAMES & SCENERY TEXTURES FOR ALL PAGES OF THE GAME
  // -------------------------------------------------------------------------
  if (clean.includes('bordacarta') || clean.includes('cardborder') || clean.includes('molduracarta')) {
    return { cardId: 'custom_card_border', cardName: 'Borda / Moldura de Cartas', category: 'bordas' };
  }
  if (clean.includes('bordajogo') || clean.includes('gameborder') || clean.includes('moldurajogo') || clean.includes('bordageral') || clean.includes('bordajanela')) {
    return { cardId: 'custom_game_border', cardName: 'Moldura Global de Janelas e Jogo', category: 'bordas' };
  }
  if (clean.includes('bordaoraculo') || clean.includes('oracleborder') || clean.includes('molduraoraculo') || clean.includes('bordatexturaoraculo')) {
    return { cardId: 'custom_oracle_border', cardName: 'Moldura da Sala do Oráculo', category: 'bordas' };
  }
  if (clean.includes('bordalobby') || clean.includes('lobbyborder') || clean.includes('molduralobby')) {
    return { cardId: 'custom_lobby_border', cardName: 'Moldura do Lobby e Espera', category: 'bordas' };
  }
  if (clean.includes('bordahome') || clean.includes('homeborder') || clean.includes('moldurahome') || clean.includes('bordainicio')) {
    return { cardId: 'custom_home_border', cardName: 'Moldura da Tela Inicial', category: 'bordas' };
  }
  if (clean.includes('fundosalao') || clean.includes('cenariosalao') || clean.includes('hallbg') || clean.includes('salagotica') || clean.includes('fundosala')) {
    return { cardId: 'custom_hall_bg', cardName: 'Cenário do Salão 2D', category: 'cenarios' };
  }
  if (clean.includes('fundooraculo') || clean.includes('cenariooraculo') || clean.includes('oraclebg')) {
    return { cardId: 'custom_oracle_bg', cardName: 'Cenário da Sala do Oráculo', category: 'cenarios' };
  }
  if (clean.includes('fundolobby') || clean.includes('cenariolobby') || clean.includes('lobbybg')) {
    return { cardId: 'custom_lobby_bg', cardName: 'Cenário do Lobby', category: 'cenarios' };
  }
  if (clean.includes('fundohome') || clean.includes('cenariohome') || clean.includes('homebg')) {
    return { cardId: 'custom_home_bg', cardName: 'Cenário da Tela Inicial', category: 'cenarios' };
  }

  // Oracle Wax Seals / Markers
  if (
    clean.includes('marcadordourado') ||
    clean.includes('selodourado') ||
    clean.includes('sealdourado') ||
    clean.includes('marcadorouro') ||
    clean.includes('marcadorgold') ||
    clean.includes('selogold') ||
    clean.includes('marcadoramarelo') ||
    clean.includes('seloamarelo') ||
    clean === 'marcador1' ||
    clean === 'selo1'
  ) {
    return { cardId: 'seal_dourado', cardName: 'Marcador Dourado (Pista Central)', category: 'marcadores' };
  }
  if (
    clean.includes('marcadorvermelho') ||
    clean.includes('selovermelho') ||
    clean.includes('sealvermelho') ||
    clean.includes('marcadorred') ||
    clean.includes('selored') ||
    clean.includes('marcadorrubi') ||
    clean.includes('selorubi') ||
    clean === 'marcador2' ||
    clean === 'selo2'
  ) {
    return { cardId: 'seal_vermelho', cardName: 'Marcador Vermelho (Método Fatal)', category: 'marcadores' };
  }
  if (
    clean.includes('marcadorazul') ||
    clean.includes('seloazul') ||
    clean.includes('sealazul') ||
    clean.includes('marcadorblue') ||
    clean.includes('seloblue') ||
    clean === 'marcador3' ||
    clean === 'selo3'
  ) {
    return { cardId: 'seal_azul', cardName: 'Marcador Azul (Objeto do Crime)', category: 'marcadores' };
  }
  if (
    clean.includes('marcadorcinza') ||
    clean.includes('selocinza') ||
    clean.includes('sealcinza') ||
    clean.includes('marcadorgray') ||
    clean.includes('selogray') ||
    clean.includes('marcadorprata') ||
    clean.includes('seloprata') ||
    clean === 'marcador4' ||
    clean === 'selo4'
  ) {
    return { cardId: 'seal_cinza', cardName: 'Marcador Cinza (Incerteza / Pista Ambígua)', category: 'marcadores' };
  }
  if (
    clean.includes('marcadorpreto') ||
    clean.includes('selopreto') ||
    clean.includes('sealpreto') ||
    clean.includes('marcadorblack') ||
    clean.includes('seloblack') ||
    clean.includes('marcadorsombrio') ||
    clean.includes('selosombrio') ||
    clean.includes('marcadortrevas') ||
    clean === 'marcador5' ||
    clean === 'selo5'
  ) {
    return { cardId: 'seal_preto', cardName: 'Marcador Sombrio (Evidência Obscura)', category: 'marcadores' };
  }

  // -------------------------------------------------------------------------
  // 1. METHODS: M01 to M60
  // -------------------------------------------------------------------------
  const mNumMatch = clean.match(/^(?:m|metodo|method|met)0*(\d{1,2})$/);
  if (mNumMatch) {
    const num = parseInt(mNumMatch[1], 10);
    if (num >= 1 && num <= 60) {
      const cardId = `M${num.toString().padStart(2, '0')}`;
      const method = METHODS.find((m) => m.id === cardId);
      return { cardId, cardName: method?.name || `Método ${cardId}`, category: 'metodos' };
    }
  }

  // Check if filename contains method name or ID (e.g. "m22_choquetermico.png" or "01_asfixia.png")
  for (const m of METHODS) {
    const cleanMethodName = m.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_\s.]+/g, '')
      .toLowerCase();
    
    if (
      clean.includes(m.id.toLowerCase()) ||
      clean.includes(cleanMethodName) ||
      cleanMethodName.includes(clean)
    ) {
      return { cardId: m.id, cardName: m.name, category: 'metodos' };
    }
  }

  // -------------------------------------------------------------------------
  // 2. OBJECTS: O01 to O64
  // -------------------------------------------------------------------------
  const oNumMatch = clean.match(/^(?:o|obj|objeto|object)0*(\d{1,2})$/);
  if (oNumMatch) {
    const num = parseInt(oNumMatch[1], 10);
    if (num >= 1 && num <= 64) {
      const cardId = `O${num.toString().padStart(2, '0')}`;
      const obj = OBJECTS.find((o) => o.id === cardId);
      return { cardId, cardName: obj?.name || `Objeto ${cardId}`, category: 'objetos' };
    }
  }

  for (const o of OBJECTS) {
    const cleanObjName = o.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_\s.]+/g, '')
      .toLowerCase();

    if (
      clean.includes(o.id.toLowerCase()) ||
      clean.includes(cleanObjName) ||
      cleanObjName.includes(clean)
    ) {
      return { cardId: o.id, cardName: o.name, category: 'objetos' };
    }
  }

  // -------------------------------------------------------------------------
  // 3. THE 5 SECRET ROLES (R01..R05, role_assassino, etc.)
  // -------------------------------------------------------------------------
  const secretRolesMapping = [
    {
      id: 'role_assassino',
      aliasIds: ['r01', 'r1', 'role1', 'papel1', 'assassino', 'murderer', 'killer', 'oassassino'],
      name: 'O Assassino',
    },
    {
      id: 'role_oraculo',
      aliasIds: ['r02', 'r2', 'role2', 'papel2', 'oraculo', 'oracle', 'ooraculo'],
      name: 'O Oráculo',
    },
    {
      id: 'role_investigador',
      aliasIds: ['r03', 'r3', 'role3', 'papel3', 'investigador', 'investigator', 'detetive', 'oinvestigador'],
      name: 'O Investigador',
    },
    {
      id: 'role_cumplice',
      aliasIds: ['r04', 'r4', 'role4', 'papel4', 'cumplice', 'accomplice', 'ocumplice'],
      name: 'O Cúmplice',
    },
    {
      id: 'role_sabotador',
      aliasIds: ['r05', 'r5', 'role5', 'papel5', 'sabotador', 'saboteur', 'osabotador'],
      name: 'O Sabotador',
    },
  ];

  for (const sr of secretRolesMapping) {
    if (
      clean === sr.id.replace(/_/g, '') ||
      sr.aliasIds.some((alias) => clean === alias || clean.includes(alias))
    ) {
      return { cardId: sr.id, cardName: `Papel Secreto: ${sr.name}`, category: 'papeis' };
    }
  }

  // -------------------------------------------------------------------------
  // 4. EVIDENCES: E01 to E60
  // -------------------------------------------------------------------------
  const eNumMatch = clean.match(/^(?:e|ev|evidencia|evidence)0*(\d{1,2})$/) || clean.match(/(?:^|evidencia|evidence|e|ev)0*(\d{1,2})/);
  if (eNumMatch) {
    const num = parseInt(eNumMatch[1], 10);
    if (num >= 1 && num <= 60) {
      const cardId = `E${num.toString().padStart(2, '0')}`;
      const ev = EVIDENCES.find((e) => e.id === cardId);
      return { cardId, cardName: ev?.title || `Evidência ${cardId}`, category: 'evidencias' };
    }
  }

  for (const ev of EVIDENCES) {
    const cleanEvTitle = ev.title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_\s.]+/g, '')
      .toLowerCase();

    if (
      clean.includes(ev.id.toLowerCase()) ||
      clean.includes(cleanEvTitle) ||
      cleanEvTitle.includes(clean)
    ) {
      return { cardId: ev.id, cardName: ev.title, category: 'evidencias' };
    }
  }

  // -------------------------------------------------------------------------
  // 5. EVENTS: EV01 to EV16
  // -------------------------------------------------------------------------
  const evMatch = clean.match(/^(?:ev|evento|event)0*(\d{1,2})$/) || clean.match(/(?:^|evento|event|ev)0*(\d{1,2})/);
  if (evMatch) {
    const num = parseInt(evMatch[1], 10);
    if (num >= 1 && num <= 16) {
      const cardId = `EV${num.toString().padStart(2, '0')}`;
      const ev = EVENTS.find((e) => e.id === cardId);
      return { cardId, cardName: ev?.name || `Evento ${cardId}`, category: 'eventos' };
    }
  }

  for (const ev of EVENTS) {
    const cleanEvName = ev.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_\s.]+/g, '')
      .toLowerCase();

    if (
      clean.includes(ev.id.toLowerCase()) ||
      clean.includes(cleanEvName) ||
      cleanEvName.includes(clean)
    ) {
      return { cardId: ev.id, cardName: ev.name, category: 'eventos' };
    }
  }

  // -------------------------------------------------------------------------
  // 6. ABILITIES: H01 to H12
  // -------------------------------------------------------------------------
  const hMatch = clean.match(/^(?:h|hab|habilidade|ability)0*(\d{1,2})$/) || clean.match(/(?:^|habilidade|ability|hab|h)0*(\d{1,2})/);
  if (hMatch) {
    const num = parseInt(hMatch[1], 10);
    if (num >= 1 && num <= 12) {
      const cardId = `H${num.toString().padStart(2, '0')}`;
      const hab = ABILITIES.find((h) => h.id === cardId);
      return { cardId, cardName: hab?.name || `Habilidade ${cardId}`, category: 'habilidades' };
    }
  }

  for (const hab of ABILITIES) {
    const cleanHabName = hab.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_\s.]+/g, '')
      .toLowerCase();

    if (
      clean.includes(hab.id.toLowerCase()) ||
      clean.includes(cleanHabName) ||
      cleanHabName.includes(clean)
    ) {
      return { cardId: hab.id, cardName: hab.name, category: 'habilidades' };
    }
  }

  // -------------------------------------------------------------------------
  // 7. CHARACTER CRESTS / BRASÕES (brasao_*, crest_*, emblema_*, brasao_perso*)
  // -------------------------------------------------------------------------
  const isCrestMatch = clean.includes('brasao') || clean.includes('crest') || clean.includes('emblema');
  if (isCrestMatch) {
    const cleanNoCrest = clean.replace(/brasao|crest|emblema/g, '').replace(/[-_]+/g, '');
    const pMatch = cleanNoCrest.match(/^(?:perso|p|c|char)?0*(\d{1,2})$/);
    if (pMatch) {
      const num = parseInt(pMatch[1], 10);
      if (num >= 1 && num <= CHARACTERS.length) {
        const char = CHARACTERS[num - 1] || CHARACTERS.find((c) => c.number === num);
        if (char) {
          return { cardId: `crest_${char.id}`, cardName: `Brasão: ${char.name}`, category: 'brasoes' };
        }
      }
      if (num >= 0 && num < CHARACTERS.length) {
        const char = CHARACTERS[num];
        if (char) {
          return { cardId: `crest_${char.id}`, cardName: `Brasão: ${char.name}`, category: 'brasoes' };
        }
      }
    }

    for (const c of CHARACTERS) {
      const cleanCharName = c.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[-_\s.]+/g, '')
        .toLowerCase();
      if (cleanNoCrest.includes(cleanCharName) || cleanCharName.includes(cleanNoCrest) || cleanNoCrest.includes(c.id.replace(/_/g, ''))) {
        return { cardId: `crest_${c.id}`, cardName: `Brasão: ${c.name}`, category: 'brasoes' };
      }
    }
  }

  // -------------------------------------------------------------------------
  // 8. CHARACTER CARDS: 42 Characters (perso1..perso42, char_card_*, P01..P42, char_00..char_41)
  // -------------------------------------------------------------------------
  const pNumMatch = clean.match(/^(?:perso|p|c|personagem|person|charcard|cartapersonagem|char|suspeito)0*(\d{1,2})$/);
  if (pNumMatch) {
    const num = parseInt(pNumMatch[1], 10);
    // If 1-indexed (1 to 42, e.g. perso1 to perso42)
    if (num >= 1 && num <= CHARACTERS.length) {
      const char = CHARACTERS[num - 1] || CHARACTERS.find((c) => c.number === num);
      if (char) {
        return { cardId: `char_card_${char.id}`, cardName: `Carta de Personagem: ${char.name}`, category: 'personagens' };
      }
    }
    // If 0-indexed (0 to 41, e.g. char00)
    if (num >= 0 && num < CHARACTERS.length) {
      const char = CHARACTERS[num];
      if (char) {
        return { cardId: `char_card_${char.id}`, cardName: `Carta de Personagem: ${char.name}`, category: 'personagens' };
      }
    }
  }

  for (const c of CHARACTERS) {
    const cleanCharName = c.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[-_\s.]+/g, '')
      .toLowerCase();

    if (
      clean === c.id.replace(/_/g, '') ||
      clean === `perso${c.number}` ||
      clean === `perso${c.number?.toString().padStart(2, '0')}` ||
      clean === `char${c.number}` ||
      clean === `char${c.number?.toString().padStart(2, '0')}` ||
      clean === `p${c.number?.toString().padStart(2, '0')}` ||
      clean === `c${c.number?.toString().padStart(2, '0')}` ||
      clean === `charcard${c.number}` ||
      clean.includes(cleanCharName) ||
      cleanCharName.includes(clean) ||
      (c.aliases && c.aliases.some((a) => clean.includes(a.replace(/[-_\s.]+/g, '').toLowerCase())))
    ) {
      return { cardId: `char_card_${c.id}`, cardName: `Carta de Personagem: ${c.name}`, category: 'personagens' };
    }
  }

  return null;
}

/* =========================================================================
   PROMPT CARD ART UPLOAD (DOUBLE CLICK TO UPLOAD DIRECTLY)
   ========================================================================= */

export function showCardArtNotification(message: string, isError: boolean = false) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('codice_card_art_toast', {
      detail: { message, isError, timestamp: Date.now() },
    })
  );
}

export function promptCardArtUpload(
  cardId: string,
  options?: {
    name?: string;
    aliases?: string[];
    onUploaded?: (dataUrl: string) => void;
  }
): Promise<string | null> {
  return new Promise((resolve) => {
    if (!isUploadsUnlocked()) {
      showCardArtNotification('🔒 Modo de Upload bloqueado. Ative nas Configurações com a senha de administrador.', true);
      resolve(null);
      return;
    }

    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp, image/gif, image/svg+xml';
    input.style.display = 'none';

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const dataUrl = await processImageUpload(file);
        const cleanId = cardId.trim();

        setCustomCardArt(cleanId, dataUrl);

        // Also bind to any aliases if provided (e.g. char aliases or alternative IDs)
        if (options?.aliases && Array.isArray(options.aliases)) {
          for (const alias of options.aliases) {
            if (alias && alias.trim()) {
              setCustomCardArt(alias.trim(), dataUrl);
            }
          }
        }

        const label = options?.name || cleanId;
        showCardArtNotification(`⚡ Nova imagem vinculada a "${label}" com sucesso!`);

        if (options?.onUploaded) {
          options.onUploaded(dataUrl);
        }

        resolve(dataUrl);
      } catch (err) {
        console.error('Failed to process image upload:', err);
        showCardArtNotification('Erro ao processar imagem para a carta.', true);
        resolve(null);
      } finally {
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      }
    };

    document.body.appendChild(input);
    input.click();
  });
}

/* =========================================================================
   REACT HOOKS
   ========================================================================= */

export function useCustomCardArt(cardId?: string | string[]): string | undefined {
  const [art, setArt] = useState<string | undefined>(() => getCustomCardArt(cardId));
  const key = Array.isArray(cardId) ? cardId.filter(Boolean).join(',') : (cardId || '');

  useEffect(() => {
    setArt(getCustomCardArt(cardId));

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const updatedId = customEvent.detail?.cardId;
      if (!updatedId || customEvent.detail?.batch || customEvent.detail?.cleared || customEvent.detail?.serverSync) {
        setArt(getCustomCardArt(cardId));
        return;
      }
      const ids = Array.isArray(cardId) ? cardId : [cardId];
      if (ids.some((id) => id && id.toLowerCase() === updatedId.toLowerCase())) {
        setArt(getCustomCardArt(cardId));
      }
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, [key]);

  return art;
}

export function useAllCustomCardArts(): Record<string, string> {
  const [arts, setArts] = useState<Record<string, string>>(() => getAllCustomCardArts());

  useEffect(() => {
    const handleUpdate = () => {
      setArts(getAllCustomCardArts());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  return arts;
}

/* =========================================================================
   IMAGE COMPRESSION & PREPROCESSING (HIGH RESOLUTION & GOTHIC CRISPNESS)
   ========================================================================= */

export async function processImageUpload(file: File): Promise<string> {
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

  // If already PNG and under 2MB, read directly to preserve 100% pure transparency, crispness, and direct PNG replacement
  if (isPng && file.size <= 2 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // High quality resolution for detailed gothic cards and character portraits
        const maxWidth = 1024;
        const maxHeight = 1350;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Crisp image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Always keep PNG format for PNG uploads
        if (isPng) {
          resolve(canvas.toDataURL('image/png'));
          return;
        }

        // For non-PNGs, try WebP first for optimal size/quality, fallback to JPEG
        try {
          const webpOutput = canvas.toDataURL('image/webp', 0.90);
          if (webpOutput.startsWith('data:image/webp')) {
            resolve(webpOutput);
            return;
          }
        } catch {
          // fallback
        }
        resolve(canvas.toDataURL('image/jpeg', 0.90));
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function useDoubleTapUpload(cardId: string, cardName?: string, aliases?: string[]) {
  const lastTapRef = useRef<number>(0);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isUploadsUnlocked()) {
      showCardArtNotification('🔒 Modo de Upload desativado. Ative nas Configurações com a senha de administrador.', true);
      return;
    }
    promptCardArtUpload(cardId, { name: cardName || cardId, aliases });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      e.stopPropagation();
      if (!isUploadsUnlocked()) {
        showCardArtNotification('🔒 Modo de Upload desativado. Ative nas Configurações com a senha de administrador.', true);
        return;
      }
      promptCardArtUpload(cardId, { name: cardName || cardId, aliases });
    }
    lastTapRef.current = now;
  };

  return { onDoubleClick: handleDoubleClick, onTouchEnd: handleTouchEnd };
}
