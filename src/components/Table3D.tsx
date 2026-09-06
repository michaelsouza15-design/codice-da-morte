import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomState, Player, CardMethod, CardObject } from '../types/game';
import { MARKER_INFOS } from '../data/gameData';
import { getMethodCardTexture, getObjectCardTexture, getEvidenceCardTexture } from '../utils/cardTextureGenerator';
import { Camera, ZoomIn, Eye, RotateCw, Sparkles } from 'lucide-react';

interface Table3DProps {
  room: RoomState;
  myPlayerId: string;
  onSelectPlayerCard?: (player: Player, cardType: 'method' | 'object', card: CardMethod | CardObject) => void;
  onFocusEvidence?: () => void;
}

export const Table3D: React.FC<Table3DProps> = ({
  room,
  myPlayerId,
  onSelectPlayerCard,
  onFocusEvidence,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'orbit' | 'mySeat' | 'topDown' | 'center'>('mySeat');
  const [hoveredInfo, setHoveredInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0502);
    scene.fog = new THREE.FogExp2(0x140a05, 0.028);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lighting - Gothic Library Atmosphere with Candles & Chandelier
    const ambientLight = new THREE.AmbientLight(0x331c12, 1.4);
    scene.add(ambientLight);

    // Main Warm Chandelier Light over the center table
    const chandelierLight = new THREE.PointLight(0xff9428, 4.0, 25);
    chandelierLight.position.set(0, 7, 0);
    chandelierLight.castShadow = true;
    chandelierLight.shadow.mapSize.width = 1024;
    chandelierLight.shadow.mapSize.height = 1024;
    scene.add(chandelierLight);

    // Secondary subtle cool rim light (moonlight through stained glass dome)
    const moonLight = new THREE.DirectionalLight(0x4488ff, 0.9);
    moonLight.position.set(10, 15, -10);
    scene.add(moonLight);

    // 5. Build Round Mahogany Gothic Table
    const tableGroup = new THREE.Group();

    // Tabletop - Dynamically scales for 4 to 12 players
    const playersCount = Math.max(room.players.length, 4);
    const tableRadius = Math.max(5.5, 3.6 + (playersCount * 0.28));
    const tableThickness = 0.4;
    const tableGeo = new THREE.CylinderGeometry(tableRadius, tableRadius * 0.98, tableThickness, 48);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x382218,
      roughness: 0.35,
      metalness: 0.15,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = 2.0;
    tableMesh.receiveShadow = true;
    tableMesh.castShadow = true;
    tableGroup.add(tableMesh);

    // Golden / Brass Inlaid Table Rim
    const rimGeo = new THREE.TorusGeometry(tableRadius, 0.08, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xc89838,
      roughness: 0.25,
      metalness: 0.85,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = 2.21;
    tableGroup.add(rimMesh);

    // Central Skull / Códice Sigil (Golden Circle with Compass Rosette)
    const sigilGeo = new THREE.RingGeometry(0.1, 1.8, 32);
    const sigilMat = new THREE.MeshStandardMaterial({
      color: 0xaa7820,
      roughness: 0.3,
      metalness: 0.7,
      side: THREE.DoubleSide,
    });
    const sigilMesh = new THREE.Mesh(sigilGeo, sigilMat);
    sigilMesh.rotation.x = -Math.PI / 2;
    sigilMesh.position.y = 2.21;
    tableGroup.add(sigilMesh);

    // Central Pillar / Table Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.2, 2.4, 2.0, 24);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x22140e,
      roughness: 0.5,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 1.0;
    baseMesh.castShadow = true;
    tableGroup.add(baseMesh);

    scene.add(tableGroup);

    // Floor (Dark Stone Tiles with circular pattern)
    const floorGeo = new THREE.PlaneGeometry(35, 35);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      roughness: 0.8,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = 0;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Perimeter Gothic Bookcase Walls
    const wallGeo = new THREE.CylinderGeometry(14, 14, 9, 32, 1, true);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x16100c,
      roughness: 0.9,
      side: THREE.BackSide,
    });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.y = 4.5;
    scene.add(wallMesh);

    // 6. Interactive Raycasting Targets (Players, Seats, and Cards)
    const interactables: THREE.Object3D[] = [];

    // Helper to create small 3D card mesh
    const cardGeo = new THREE.BoxGeometry(0.5, 0.02, 0.75);

    room.players.forEach((p, idx) => {
      const angle = (idx / playersCount) * Math.PI * 2;
      const seatDist = tableRadius - 0.7;
      const chairDist = tableRadius + 1.2;

      const posX = Math.sin(angle) * seatDist;
      const posZ = Math.cos(angle) * seatDist;

      // Chair Mesh
      const chairGroup = new THREE.Group();
      const seatMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.15, 1.1),
        new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.6 })
      );
      seatMesh.position.set(0, 1.4, 0);
      chairGroup.add(seatMesh);

      const backMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 1.6, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x18100c, roughness: 0.5 })
      );
      backMesh.position.set(0, 2.2, 0.5);
      chairGroup.add(backMesh);

      chairGroup.position.set(Math.sin(angle) * chairDist, 0, Math.cos(angle) * chairDist);
      chairGroup.lookAt(0, 0, 0);
      scene.add(chairGroup);

      // Name & Avatar Plaque on Table
      const plaqueGeo = new THREE.BoxGeometry(1.2, 0.04, 0.4);
      const isMe = p.id === myPlayerId;
      const isOracle = p.role === 'oraculo';
      const plaqueMat = new THREE.MeshStandardMaterial({
        color: isOracle ? 0xb8860b : isMe ? 0x996611 : 0x27272a,
        metalness: isOracle ? 0.8 : 0.5,
        roughness: isOracle ? 0.2 : 0.3,
      });
      const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
      plaqueMesh.position.set(posX, 2.22, posZ);
      plaqueMesh.lookAt(0, 2.22, 0);
      plaqueMesh.userData = { type: 'player', player: p };
      scene.add(plaqueMesh);
      interactables.push(plaqueMesh);

      // 4 Methods (Red/Silver) + 4 Objects (Blue/Gold) placed in front of this player (if not Oracle)
      const cardRowGroup = new THREE.Group();
      cardRowGroup.position.set(posX * 0.85, 2.22, posZ * 0.85);
      cardRowGroup.lookAt(0, 2.22, 0);

      if (p.methods.length === 0) {
        // Oracle Sacred Codex Tome / Lectern
        const tomeGeo = new THREE.BoxGeometry(1.0, 0.12, 0.8);
        const tomeMat = new THREE.MeshStandardMaterial({
          color: 0x5c1212,
          roughness: 0.4,
          metalness: 0.4,
        });
        const tomeMesh = new THREE.Mesh(tomeGeo, tomeMat);
        tomeMesh.position.set(0, 0.06, 0);
        tomeMesh.userData = { type: 'player', player: p };
        cardRowGroup.add(tomeMesh);
        interactables.push(tomeMesh);
      } else {
        // Base side material for card edges
        const methodSideMat = new THREE.MeshStandardMaterial({ color: 0x4a0e0e, roughness: 0.5 });
        const objectSideMat = new THREE.MeshStandardMaterial({ color: 0x0c2545, roughness: 0.5 });
        const cardBackMat = new THREE.MeshStandardMaterial({ color: 0x1f140e, roughness: 0.6 });

        // Methods
        p.methods.forEach((m, mIdx) => {
          const topTexture = getMethodCardTexture(m);
          const topMat = new THREE.MeshStandardMaterial({
            map: topTexture,
            roughness: 0.3,
            metalness: 0.1,
          });

          // 6 faces of BoxGeometry: [+X, -X, +Y(top), -Y(bottom), +Z, -Z]
          const cardMaterials = [
            methodSideMat,
            methodSideMat,
            topMat,
            cardBackMat,
            methodSideMat,
            methodSideMat,
          ];

          const mesh = new THREE.Mesh(cardGeo, cardMaterials);
          mesh.position.set((mIdx - 1.5) * 0.55, 0.01, -0.45);
          mesh.userData = { type: 'method', card: m, player: p };
          cardRowGroup.add(mesh);
          interactables.push(mesh);
        });

        // Objects
        p.objects.forEach((o, oIdx) => {
          const topTexture = getObjectCardTexture(o);
          const topMat = new THREE.MeshStandardMaterial({
            map: topTexture,
            roughness: 0.3,
            metalness: 0.1,
          });

          const cardMaterials = [
            objectSideMat,
            objectSideMat,
            topMat,
            cardBackMat,
            objectSideMat,
            objectSideMat,
          ];

          const mesh = new THREE.Mesh(cardGeo, cardMaterials);
          mesh.position.set((oIdx - 1.5) * 0.55, 0.01, 0.45);
          mesh.userData = { type: 'object', card: o, player: p };
          cardRowGroup.add(mesh);
          interactables.push(mesh);
        });
      }

      scene.add(cardRowGroup);
    });

    // 7. Center Evidence Tiles with Illustrated Textures & 3D Marker Gem tokens
    const centerEvidencesGroup = new THREE.Group();
    centerEvidencesGroup.position.set(0, 2.23, 0);

    const evGeo = new THREE.BoxGeometry(1.0, 0.03, 1.4);
    const evSideMat = new THREE.MeshStandardMaterial({ color: 0x1c130d, roughness: 0.5 });
    const evBackMat = new THREE.MeshStandardMaterial({ color: 0x0f0b08, roughness: 0.6 });

    room.evidencesOnTable.forEach((ev, evIdx) => {
      const row = Math.floor(evIdx / 3);
      const col = evIdx % 3;
      const evTexture = getEvidenceCardTexture(ev);
      const evTopMat = new THREE.MeshStandardMaterial({
        map: evTexture,
        roughness: 0.35,
        metalness: 0.1,
      });

      const evMaterials = [
        evSideMat,
        evSideMat,
        evTopMat,
        evBackMat,
        evSideMat,
        evSideMat,
      ];

      const evMesh = new THREE.Mesh(evGeo, evMaterials);
      evMesh.position.set((col - 1) * 1.15, 0, (row - 0.5) * 1.55);
      evMesh.userData = { type: 'evidence', evidence: ev };
      centerEvidencesGroup.add(evMesh);
      interactables.push(evMesh);

      // If marked, add glowing 3D gemstone
      if (ev.markedOptionIndex !== undefined && ev.markedColor) {
        const markerInfo = MARKER_INFOS[ev.markedColor];
        const gemGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.08, 16);
        const gemMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(markerInfo.hex),
          emissive: new THREE.Color(markerInfo.hex),
          emissiveIntensity: 0.5,
          roughness: 0.1,
          metalness: 0.85,
        });
        const gemMesh = new THREE.Mesh(gemGeo, gemMat);
        const optOffset = (ev.markedOptionIndex - 2.5) * 0.22;
        gemMesh.position.set((col - 1) * 1.15, 0.05, (row - 0.5) * 1.55 + optOffset);
        centerEvidencesGroup.add(gemMesh);
      }
    });

    scene.add(centerEvidencesGroup);

    // 8. Vintage Digital Clock on table edge
    const clockGroup = new THREE.Group();
    const clockBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.4, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x991b1b, metalness: 0.3, roughness: 0.4 })
    );
    clockGroup.add(clockBody);
    clockGroup.position.set(-3.8, 2.4, -2.5);
    clockGroup.rotation.y = Math.PI / 4;
    scene.add(clockGroup);

    // 9. Camera positioning based on cameraMode
    const myPlayerIndex = room.players.findIndex((p) => p.id === myPlayerId);
    const mySeatAngle =
      myPlayerIndex >= 0
        ? (myPlayerIndex / playersCount) * Math.PI * 2
        : 0;

    const updateCameraPosition = () => {
      if (cameraMode === 'topDown') {
        camera.position.set(0, 14, 0.01);
        camera.lookAt(0, 2.2, 0);
      } else if (cameraMode === 'center') {
        camera.position.set(0, 6, 4.5);
        camera.lookAt(0, 2.2, 0);
      } else if (cameraMode === 'mySeat') {
        const camDist = tableRadius + 2.5;
        camera.position.set(
          Math.sin(mySeatAngle) * camDist,
          4.5,
          Math.cos(mySeatAngle) * camDist
        );
        camera.lookAt(0, 2.2, 0);
      } else {
        // Orbit free mode
        camera.position.set(0, 7.5, 9);
        camera.lookAt(0, 2.0, 0);
      }
    };
    updateCameraPosition();

    // 10. Mouse interaction / Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactables);
      if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        if (data.type === 'method') {
          setHoveredInfo(`[${data.card.id}] ${data.card.name} (${data.player.name})`);
        } else if (data.type === 'object') {
          setHoveredInfo(`[${data.card.id}] ${data.card.name} (${data.player.name})`);
        } else if (data.type === 'evidence') {
          setHoveredInfo(`[${data.evidence.id}] ${data.evidence.title}`);
        } else if (data.type === 'player') {
          setHoveredInfo(`Investigador: ${data.player.name}`);
        }
      } else {
        setHoveredInfo(null);
      }
    };

    const onClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactables);
      if (intersects.length > 0) {
        const data = intersects[0].object.userData;
        if (data.type === 'method' && onSelectPlayerCard) {
          onSelectPlayerCard(data.player, 'method', data.card);
        } else if (data.type === 'object' && onSelectPlayerCard) {
          onSelectPlayerCard(data.player, 'object', data.card);
        } else if (data.type === 'evidence' && onFocusEvidence) {
          onFocusEvidence();
        }
      }
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('click', onClick);

    // 11. Render Animation Loop with subtle candle flicker
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Subtle candle flicker on chandelier
      chandelierLight.intensity = 3.5 + Math.sin(elapsed * 8) * 0.15 + Math.cos(elapsed * 13) * 0.1;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [room, myPlayerId, cameraMode]);

  return (
    <div className="relative w-full h-full min-h-[460px] max-h-[680px] rounded-2xl overflow-hidden glass-ui border-white/10 card-shadow bg-[#0a0502]">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Floating 3D Controls Bar */}
      <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 glass-ui p-1.5 rounded-xl border-white/10 z-10">
        <button
          onClick={() => setCameraMode('mySeat')}
          className={`flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
            cameraMode === 'mySeat'
              ? 'bg-amber-600/90 text-white font-bold shadow border border-amber-400/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Ver da Minha Cadeira"
        >
          <Camera className="w-3.5 h-3.5 text-amber-300" />
          Minha Cadeira
        </button>

        <button
          onClick={() => setCameraMode('center')}
          className={`flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
            cameraMode === 'center'
              ? 'bg-amber-600/90 text-white font-bold shadow border border-amber-400/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Focar nas Evidências"
        >
          <Eye className="w-3.5 h-3.5 text-amber-300" />
          Evidências
        </button>

        <button
          onClick={() => setCameraMode('topDown')}
          className={`flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
            cameraMode === 'topDown'
              ? 'bg-amber-600/90 text-white font-bold shadow border border-amber-400/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Visão Superior do Códice"
        >
          <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
          Planta Superior
        </button>

        <button
          onClick={() => setCameraMode('orbit')}
          className={`flex items-center gap-1.5 text-xs font-serif uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
            cameraMode === 'orbit'
              ? 'bg-amber-600/90 text-white font-bold shadow border border-amber-400/40'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Visão Panorâmica"
        >
          <RotateCw className="w-3.5 h-3.5 text-amber-300" />
          Panorâmica
        </button>
      </div>

      {/* Hover Information Tooltip */}
      {hoveredInfo && (
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 glass-ui card-shadow text-amber-200 border-white/20 px-4 py-2 rounded-full text-xs font-serif shadow-xl flex items-center gap-2.5 pointer-events-none z-10 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold tracking-wide">{hoveredInfo}</span>
        </div>
      )}
    </div>
  );
};
