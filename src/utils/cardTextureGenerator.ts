import * as THREE from 'three';
import { CardMethod, CardObject, CardEvidence } from '../types/game';

// Texture cache to prevent redundant re-renders
const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Draws gothic filigree corners on canvas
 */
function drawGothicBorder(ctx: CanvasRenderingContext2D, width: number, height: number, color: string, accent: string) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Ornate corners
  const cornerSize = 24;
  const corners = [
    [10, 10, 1, 1],
    [width - 10, 10, -1, 1],
    [10, height - 10, 1, -1],
    [width - 10, height - 10, -1, -1],
  ];

  ctx.fillStyle = color;
  corners.forEach(([x, y, dx, dy]) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * cornerSize, y);
    ctx.lineTo(x, y + dy * cornerSize);
    ctx.closePath();
    ctx.fill();

    // Inner filigree curve
    ctx.beginPath();
    ctx.arc(x + dx * 18, y + dy * 18, 6, 0, Math.PI * 2);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  ctx.restore();
}

/**
 * Generates an illustrated 3D texture for a Method card
 */
export function getMethodCardTexture(method: CardMethod): THREE.CanvasTexture {
  const cacheKey = `method_${method.id}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const width = 384;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Dark Crimson / Bordeaux Gothic Gradient Background
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 320);
  bgGrad.addColorStop(0, '#3a0d0d');
  bgGrad.addColorStop(0.6, '#200505');
  bgGrad.addColorStop(1, '#0c0202');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle parchment dust noise
  ctx.fillStyle = 'rgba(255, 200, 150, 0.03)';
  for (let i = 0; i < 200; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 2. Borders
  drawGothicBorder(ctx, width, height, '#d97706', '#fef08a');

  // 3. Header Banner: "MÉTODO" + ID
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(20, 24, width - 40, 36);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 24, width - 40, 36);

  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = '#f87171';
  ctx.textAlign = 'left';
  ctx.fillText(`MÉTODO • ${method.category.toUpperCase()}`, 32, 47);

  // ID Badge in gold
  ctx.fillStyle = '#f59e0b';
  ctx.textAlign = 'right';
  ctx.font = 'bold 15px "Cinzel", Georgia, serif';
  ctx.fillText(`[${method.id}]`, width - 32, 48);

  // 4. Central Thematic Illustration
  ctx.save();
  const name = method.name.toLowerCase();
  const desc = method.description.toLowerCase();
  const cx = width / 2;
  const cy = 185;

  // Background aura for illustration
  const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 90);
  aura.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.fill();

  // Circular illustration frame
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 75, 0, Math.PI * 2);
  ctx.stroke();

  // Draw icon based on method keywords
  if (name.includes('veneno') || name.includes('tóx') || name.includes('gás') || name.includes('ácido') || name.includes('quím') || desc.includes('poção')) {
    // Alchemical Flask with Skull and bubbling fumes
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 35);
    ctx.lineTo(cx + 15, cy - 35);
    ctx.lineTo(cx + 15, cy - 15);
    ctx.lineTo(cx + 40, cy + 35);
    ctx.arc(cx, cy + 40, 40, 0.2, Math.PI - 0.2);
    ctx.lineTo(cx - 15, cy - 15);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Skull sigil
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(cx, cy + 25, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a7f3d0';
    ctx.fillRect(cx - 5, cy + 22, 3, 3);
    ctx.fillRect(cx + 2, cy + 22, 3, 3);
  } else if (name.includes('adaga') || name.includes('punhal') || name.includes('lâmina') || name.includes('espada') || name.includes('corte') || desc.includes('sang')) {
    // Ornate Dagger / Blade with blood drop
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy + 35);
    ctx.lineTo(cx + 35, cy - 35);
    ctx.stroke();

    // Crossguard
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 5);
    ctx.lineTo(cx + 5, cy + 20);
    ctx.stroke();

    // Blood drops
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(cx + 40, cy - 35, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (name.includes('corda') || name.includes('enforc') || name.includes('asfix') || name.includes('estrang')) {
    // Hanging Noose / Coiled Rope
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50);
    ctx.lineTo(cx, cy - 10);
    ctx.stroke();
    // Loop
    ctx.beginPath();
    ctx.ellipse(cx, cy + 20, 22, 35, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Knot
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 8, cy - 10, 16, 14);
  } else if (name.includes('fogo') || name.includes('chama') || name.includes('incênd') || name.includes('queim')) {
    // Alchemical Flames
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 50);
    ctx.quadraticCurveTo(cx + 40, cy - 10, cx + 25, cy + 40);
    ctx.quadraticCurveTo(cx, cy + 50, cx - 25, cy + 40);
    ctx.quadraticCurveTo(cx - 40, cy - 10, cx, cy - 50);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 25);
    ctx.quadraticCurveTo(cx + 20, cy, cx + 12, cy + 30);
    ctx.quadraticCurveTo(cx, cy + 38, cx - 12, cy + 30);
    ctx.quadraticCurveTo(cx - 20, cy, cx, cy - 25);
    ctx.fill();
  } else {
    // Default Gothic Skull & Crossed Blades
    ctx.fillStyle = '#fef08a';
    ctx.font = '54px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚔️', cx, cy);
  }
  ctx.restore();

  // 5. Card Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 8;
  ctx.fillText(method.name, width / 2, 305);
  ctx.shadowBlur = 0;

  // 6. Card Description Body
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(25, 330, width - 50, 140);
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 330, width - 50, 140);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';

  // Multi-line wrap
  const words = method.description.split(' ');
  let line = '';
  let y = 365;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 70 && n > 0) {
      ctx.fillText(line, width / 2, y);
      line = words[n] + ' ';
      y += 22;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, y);

  // Footer Seal
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#d97706';
  ctx.fillText('CÓDICE DA MORTE • MÉTODO LETAL', width / 2, 492);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Generates an illustrated 3D texture for an Object card
 */
export function getObjectCardTexture(object: CardObject): THREE.CanvasTexture {
  const cacheKey = `object_${object.id}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const width = 384;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Dark Sapphire / Obsidian Gothic Gradient Background
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 320);
  bgGrad.addColorStop(0, '#0f274a');
  bgGrad.addColorStop(0.6, '#081427');
  bgGrad.addColorStop(1, '#030811');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle parchment dust noise
  ctx.fillStyle = 'rgba(150, 200, 255, 0.03)';
  for (let i = 0; i < 200; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 2. Borders
  drawGothicBorder(ctx, width, height, '#38bdf8', '#bae6fd');

  // 3. Header Banner: "OBJETO" + ID
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(20, 24, width - 40, 36);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 24, width - 40, 36);

  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'left';
  ctx.fillText(`OBJETO • ${object.category.toUpperCase()}`, 32, 47);

  // ID Badge in cyan/gold
  ctx.fillStyle = '#bae6fd';
  ctx.textAlign = 'right';
  ctx.font = 'bold 15px "Cinzel", Georgia, serif';
  ctx.fillText(`[${object.id}]`, width - 32, 48);

  // 4. Central Thematic Illustration
  ctx.save();
  const name = object.name.toLowerCase();
  const desc = object.description.toLowerCase();
  const cx = width / 2;
  const cy = 185;

  // Background aura for illustration
  const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 90);
  aura.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
  aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(cx, cy, 90, 0, Math.PI * 2);
  ctx.fill();

  // Circular illustration frame
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 75, 0, Math.PI * 2);
  ctx.stroke();

  if (name.includes('livro') || name.includes('códice') || name.includes('tomo') || name.includes('diário') || name.includes('manuscrito') || name.includes('carta')) {
    // Open Gothic Grimoire / Book with leather binding
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(cx - 45, cy - 30);
    ctx.lineTo(cx, cy - 20);
    ctx.lineTo(cx + 45, cy - 30);
    ctx.lineTo(cx + 45, cy + 30);
    ctx.lineTo(cx, cy + 40);
    ctx.lineTo(cx - 45, cy + 30);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pages
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(cx - 40, cy - 20, 36, 45);
    ctx.fillRect(cx + 4, cy - 20, 36, 45);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cx - 35, cy - 10, 26, 2);
    ctx.fillRect(cx - 35, cy - 4, 26, 2);
    ctx.fillRect(cx + 9, cy - 10, 26, 2);
    ctx.fillRect(cx + 9, cy - 4, 26, 2);
  } else if (name.includes('chave') || name.includes('fechadura') || name.includes('cadeado')) {
    // Baroque Skeleton Key
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy - 25, 18, 0, Math.PI * 2);
    ctx.stroke();
    // Shaft
    ctx.beginPath();
    ctx.moveTo(cx, cy - 7);
    ctx.lineTo(cx, cy + 40);
    ctx.stroke();
    // Teeth
    ctx.beginPath();
    ctx.moveTo(cx, cy + 25);
    ctx.lineTo(cx + 18, cy + 25);
    ctx.moveTo(cx, cy + 35);
    ctx.lineTo(cx + 14, cy + 35);
    ctx.stroke();
  } else if (name.includes('lupa') || name.includes('óculos') || name.includes('lente') || name.includes('telescópio')) {
    // Brass Magnifying Glass with lens flare
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx - 10, cy - 10, 32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
    ctx.fill();
    // Handle
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx + 12, cy + 12);
    ctx.lineTo(cx + 40, cy + 40);
    ctx.stroke();
  } else if (name.includes('lanterna') || name.includes('vela') || name.includes('candelabro') || name.includes('lamparina')) {
    // Gothic Candelabrum with flame
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 40);
    ctx.lineTo(cx, cy);
    ctx.moveTo(cx - 25, cy + 15);
    ctx.quadraticCurveTo(cx, cy + 30, cx + 25, cy + 15);
    ctx.stroke();
    // Candles
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(cx - 28, cy - 10, 6, 25);
    ctx.fillRect(cx - 3, cy - 25, 6, 25);
    ctx.fillRect(cx + 22, cy - 10, 6, 25);
    // Flames
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(cx - 25, cy - 18, 5, 0, Math.PI * 2);
    ctx.arc(cx, cy - 33, 6, 0, Math.PI * 2);
    ctx.arc(cx + 25, cy - 18, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (name.includes('pena') || name.includes('tinteiro') || name.includes('carimbo') || name.includes('selo')) {
    // Writing Quill & Inkwell
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + 35, cy - 45);
    ctx.quadraticCurveTo(cx, cy, cx - 25, cy + 25);
    ctx.stroke();
    // Inkwell
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(cx - 35, cy + 20, 24, 20);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - 35, cy + 20, 24, 20);
  } else {
    // Default Artefact Emblem
    ctx.fillStyle = '#38bdf8';
    ctx.font = '54px "Cinzel", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🗝️', cx, cy);
  }
  ctx.restore();

  // 5. Card Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 8;
  ctx.fillText(object.name, width / 2, 305);
  ctx.shadowBlur = 0;

  // 6. Card Description Body
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(25, 330, width - 50, 140);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 330, width - 50, 140);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';

  // Multi-line wrap
  const words = object.description.split(' ');
  let line = '';
  let y = 365;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > width - 70 && n > 0) {
      ctx.fillText(line, width / 2, y);
      line = words[n] + ' ';
      y += 22;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, width / 2, y);

  // Footer Seal
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('CÓDICE DA MORTE • OBJETO DE CENA', width / 2, 492);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Generates an illustrated 3D texture for a Center Evidence card
 */
export function getEvidenceCardTexture(evidence: CardEvidence): THREE.CanvasTexture {
  const cacheKey = `evidence_${evidence.id}_${evidence.markedOptionIndex ?? 'none'}_${evidence.markedColor ?? 'none'}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const width = 384;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Vintage parchment background
  ctx.fillStyle = '#1c130d';
  ctx.fillRect(0, 0, width, height);

  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, 280);
  bgGrad.addColorStop(0, '#2d1c12');
  bgGrad.addColorStop(1, '#130a06');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  drawGothicBorder(ctx, width, height, '#d97706', '#fef08a');

  // Header Title
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`ARQUIVO DO CÓDICE • [${evidence.id}]`, width / 2, 42);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Cinzel", Georgia, serif';
  ctx.fillText(evidence.title.toUpperCase(), width / 2, 70);

  if (evidence.subtitle) {
    ctx.fillStyle = '#d1d5db';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.fillText(evidence.subtitle, width / 2, 90);
  }

  // Divider
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 105);
  ctx.lineTo(width - 35, 105);
  ctx.stroke();

  // Render options list
  ctx.textAlign = 'left';
  const startY = 135;
  const rowHeight = 58;

  evidence.options.forEach((opt, idx) => {
    const isMarked = evidence.markedOptionIndex === idx;
    const y = startY + idx * rowHeight;

    if (isMarked) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.fillRect(30, y - 22, width - 60, 48);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, y - 22, width - 60, 48);
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(30, y - 22, width - 60, 48);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(30, y - 22, width - 60, 48);
    }

    // Number bullet
    ctx.fillStyle = isMarked ? '#f59e0b' : '#9ca3af';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillText(`${idx + 1}.`, 45, y + 6);

    // Option text
    ctx.fillStyle = isMarked ? '#ffffff' : '#d1d5db';
    ctx.font = isMarked ? 'bold 13px Georgia, serif' : '12px Georgia, serif';
    ctx.fillText(opt, 75, y + 6);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  textureCache.set(cacheKey, texture);
  return texture;
}
