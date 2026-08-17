/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelData, PlatformType, CollectibleType, EnemyType } from '../types';

export const WORLDS_METADATA = [
  { id: 1, name: 'Green Valley', theme: 'green_valley', icon: '🌿', color: '#10b981', desc: 'Vibrant grasslands, spring mushrooms, and rolling waterfalls.' },
  { id: 2, name: 'Crystal Caverns', theme: 'crystal_caverns', icon: '💎', color: '#06b6d4', desc: 'Luminescent crystals, dark chasms, and moving platforms.' },
  { id: 3, name: 'Sunset Desert', theme: 'sunset_desert', icon: '☀️', color: '#f59e0b', desc: 'Ancient sandstone ruins, dunes, and armored scarabs.' },
  { id: 4, name: 'Frozen Peaks', theme: 'frozen_peaks', icon: '❄️', color: '#38bdf8', desc: 'Slippery ice sheets, falling icicles, and arctic winds.' },
  { id: 5, name: 'Mystic Grove', theme: 'mystic_forest', icon: '🔮', color: '#a855f7', desc: 'Bioluminescent spores, shadow prowlers, and floating ruins.' },
  { id: 6, name: 'Volcanic Fortress', theme: 'volcanic_fortress', icon: '🔥', color: '#ef4444', desc: 'Molten lava geysers, iron chains, and the final Colossus.' },
];

export function getLevelData(worldIndex: number, levelIndex: number): LevelData {
  const levelKey = `${worldIndex}-${levelIndex}`;
  const isBossLevel = levelIndex === 3;

  // Generate carefully tailored level structures for every world and stage!
  switch (levelKey) {
    case '1-1':
      return createGreenValley1_1();
    case '1-2':
      return createGreenValley1_2();
    case '1-3':
      return createBossLevel(1, 'green_valley', 'valley');
    case '2-1':
      return createCrystalCavern2_1();
    case '2-2':
      return createCrystalCavern2_2();
    case '2-3':
      return createBossLevel(2, 'crystal_caverns', 'cavern');
    case '3-1':
      return createDesert3_1();
    case '3-2':
      return createDesert3_2();
    case '3-3':
      return createBossLevel(3, 'sunset_desert', 'desert');
    case '4-1':
      return createFrozenPeaks4_1();
    case '4-2':
      return createFrozenPeaks4_2();
    case '4-3':
      return createBossLevel(4, 'frozen_peaks', 'ice');
    case '5-1':
      return createMysticGrove5_1();
    case '5-2':
      return createMysticGrove5_2();
    case '5-3':
      return createBossLevel(5, 'mystic_forest', 'mystic');
    case '6-1':
      return createVolcanic6_1();
    case '6-2':
      return createVolcanic6_2();
    case '6-3':
    default:
      return createBossLevel(6, 'volcanic_fortress', 'volcano');
  }
}

function createGreenValley1_1(): LevelData {
  return {
    id: '1-1',
    worldIndex: 1,
    levelIndex: 1,
    name: 'Breeze Meadows',
    subtitle: 'World 1-1: Journey Begins',
    theme: 'green_valley',
    width: 2800,
    height: 600,
    spawnPoint: { x: 80, y: 380 },
    timeLimit: 300,
    musicTrack: 'valley',
    ambientParticles: 'leaves',
    platforms: [
      // Ground stretches
      { id: 'g1', type: PlatformType.SOLID, x: 0, y: 460, width: 700, height: 140 },
      { id: 'g2', type: PlatformType.SOLID, x: 780, y: 460, width: 850, height: 140 },
      { id: 'g3', type: PlatformType.SOLID, x: 1720, y: 460, width: 1080, height: 140 },

      // Step platforms & hills
      { id: 'p1', type: PlatformType.SOLID, x: 280, y: 360, width: 120, height: 28 },
      { id: 'p2', type: PlatformType.SOLID, x: 440, y: 300, width: 140, height: 28 },
      { id: 'p3', type: PlatformType.ONE_WAY, x: 620, y: 240, width: 100, height: 18 },

      // Mystery Question / Breakable blocks
      { id: 'b1', type: PlatformType.BREAKABLE, x: 920, y: 340, width: 36, height: 36 },
      { id: 'b2', type: PlatformType.BREAKABLE, x: 956, y: 340, width: 36, height: 36 },
      { id: 'b3', type: PlatformType.BREAKABLE, x: 992, y: 340, width: 36, height: 36 },
      { id: 'b4', type: PlatformType.BREAKABLE, x: 1028, y: 340, width: 36, height: 36 },

      // Spring / Bounce Mushroom
      { id: 'sp1', type: PlatformType.BOUNCE, x: 1140, y: 436, width: 48, height: 24, bounceMultiplier: 1.5 },

      // High Secret Bridge
      { id: 'p4', type: PlatformType.ONE_WAY, x: 1100, y: 220, width: 220, height: 18 },

      // Moving Platform over chasm
      {
        id: 'mp1',
        type: PlatformType.MOVING,
        x: 1640,
        y: 380,
        width: 80,
        height: 20,
        startX: 1630,
        targetX: 1710,
        startY: 380,
        targetY: 380,
        moveSpeed: 1.5,
      },

      // Crumbling Bridge
      { id: 'fp1', type: PlatformType.FALLING, x: 1950, y: 380, width: 64, height: 20 },
      { id: 'fp2', type: PlatformType.FALLING, x: 2040, y: 340, width: 64, height: 20 },
      { id: 'fp3', type: PlatformType.FALLING, x: 2130, y: 300, width: 64, height: 20 },

      // Victory Goal steps
      { id: 's1', type: PlatformType.SOLID, x: 2360, y: 420, width: 40, height: 40 },
      { id: 's2', type: PlatformType.SOLID, x: 2400, y: 380, width: 40, height: 80 },
      { id: 's3', type: PlatformType.SOLID, x: 2440, y: 340, width: 40, height: 120 },
      { id: 's4', type: PlatformType.SOLID, x: 2480, y: 300, width: 40, height: 160 },
      { id: 's5', type: PlatformType.SOLID, x: 2520, y: 260, width: 60, height: 200 },
    ],
    collectibles: [
      { id: 'c1', type: CollectibleType.ANCIENT_COIN, x: 300, y: 320, baseY: 320, bobOffset: 0, collected: false, value: 100, width: 18, height: 18 },
      { id: 'c2', type: CollectibleType.ANCIENT_COIN, x: 340, y: 320, baseY: 320, bobOffset: 1, collected: false, value: 100, width: 18, height: 18 },
      { id: 'c3', type: CollectibleType.ANCIENT_COIN, x: 460, y: 260, baseY: 260, bobOffset: 2, collected: false, value: 100, width: 18, height: 18 },
      { id: 'c4', type: CollectibleType.ANCIENT_COIN, x: 500, y: 260, baseY: 260, bobOffset: 3, collected: false, value: 100, width: 18, height: 18 },

      // Growth Prism Powerup
      { id: 'pw1', type: CollectibleType.POWERUP_GROWTH, x: 956, y: 280, baseY: 280, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      // Fire Orb on high bridge
      { id: 'pw2', type: CollectibleType.POWERUP_FIRE, x: 1200, y: 170, baseY: 170, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },

      // Shard Relic Star
      { id: 'star1', type: CollectibleType.STAR_RELIC, x: 2130, y: 230, baseY: 230, bobOffset: 0, collected: false, value: 1000, width: 28, height: 28 },
    ],
    enemies: [
      { id: 'e1', type: EnemyType.GLOOM_WALKER, x: 500, y: 430, patrolMinX: 300, patrolMaxX: 680 },
      { id: 'e2', type: EnemyType.GLOOM_WALKER, x: 1050, y: 430, patrolMinX: 850, patrolMaxX: 1300 },
      { id: 'e3', type: EnemyType.ZEPHYR_FLYER, x: 1400, y: 320, patrolMinX: 1300, patrolMaxX: 1600 },
      { id: 'e4', type: EnemyType.GLOOM_WALKER, x: 1850, y: 430, patrolMinX: 1750, patrolMaxX: 2000 },
    ],
    checkpoints: [
      { id: 'chk1', x: 1420, y: 410, width: 24, height: 50, activated: false, spawnX: 1420, spawnY: 410 }
    ],
    exit: { id: 'exit1', x: 2680, y: 360, width: 44, height: 100, targetWorld: 1, targetLevel: 2 },
  };
}

function createGreenValley1_2(): LevelData {
  return {
    id: '1-2',
    worldIndex: 1,
    levelIndex: 2,
    name: 'Canopy Highlands',
    subtitle: 'World 1-2: Ascending the Treetops',
    theme: 'green_valley',
    width: 3200,
    height: 700,
    spawnPoint: { x: 80, y: 460 },
    timeLimit: 300,
    musicTrack: 'valley',
    ambientParticles: 'leaves',
    platforms: [
      { id: 'g1', type: PlatformType.SOLID, x: 0, y: 540, width: 600, height: 160 },
      { id: 'g2', type: PlatformType.SOLID, x: 700, y: 540, width: 700, height: 160 },
      { id: 'g3', type: PlatformType.SOLID, x: 1550, y: 540, width: 850, height: 160 },
      { id: 'g4', type: PlatformType.SOLID, x: 2500, y: 540, width: 700, height: 160 },

      // High tree branches
      { id: 'tb1', type: PlatformType.ONE_WAY, x: 300, y: 400, width: 140, height: 18 },
      { id: 'tb2', type: PlatformType.ONE_WAY, x: 480, y: 300, width: 140, height: 18 },
      { id: 'tb3', type: PlatformType.ONE_WAY, x: 660, y: 220, width: 180, height: 18 },

      // Armored Beetle Gauntlet
      { id: 'bg1', type: PlatformType.SOLID, x: 880, y: 460, width: 340, height: 28 },

      // Double Bounce Mushrooms
      { id: 'bm1', type: PlatformType.BOUNCE, x: 1440, y: 516, width: 48, height: 24, bounceMultiplier: 1.6 },
      { id: 'bm2', type: PlatformType.BOUNCE, x: 1780, y: 420, width: 48, height: 24, bounceMultiplier: 1.7 },

      // Vertical Moving Elevator
      {
        id: 'ev1',
        type: PlatformType.MOVING,
        x: 2420,
        y: 440,
        width: 70,
        height: 20,
        startX: 2420,
        targetX: 2420,
        startY: 500,
        targetY: 280,
        moveSpeed: 1.8,
      },
    ],
    collectibles: [
      { id: 'c1', type: CollectibleType.ANCIENT_COIN, x: 500, y: 260, baseY: 260, bobOffset: 0, collected: false, value: 100, width: 18, height: 18 },
      { id: 'pw1', type: CollectibleType.POWERUP_SHIELD, x: 720, y: 170, baseY: 170, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      { id: 'star1', type: CollectibleType.STAR_RELIC, x: 1800, y: 200, baseY: 200, bobOffset: 0, collected: false, value: 1000, width: 28, height: 28 },
    ],
    enemies: [
      { id: 'e1', type: EnemyType.ARMORED_BEETLE, x: 950, y: 430, patrolMinX: 890, patrolMaxX: 1200 },
      { id: 'e2', type: EnemyType.SHADOW_PROWLER, x: 1650, y: 510, patrolMinX: 1560, patrolMaxX: 1900 },
      { id: 'e3', type: EnemyType.ZEPHYR_FLYER, x: 2100, y: 320, patrolMinX: 1950, patrolMaxX: 2350 },
    ],
    checkpoints: [
      { id: 'chk1', x: 1580, y: 490, width: 24, height: 50, activated: false, spawnX: 1580, spawnY: 490 }
    ],
    exit: { id: 'exit1', x: 3050, y: 440, width: 44, height: 100, targetWorld: 1, targetLevel: 3 },
  };
}

function createCrystalCavern2_1(): LevelData {
  return {
    id: '2-1',
    worldIndex: 2,
    levelIndex: 1,
    name: 'Amethyst Depths',
    subtitle: 'World 2-1: Into the Luminous Dark',
    theme: 'crystal_caverns',
    width: 3000,
    height: 650,
    spawnPoint: { x: 80, y: 420 },
    timeLimit: 300,
    musicTrack: 'cavern',
    ambientParticles: 'crystals',
    platforms: [
      { id: 'g1', type: PlatformType.SOLID, x: 0, y: 500, width: 650, height: 150 },
      { id: 'g2', type: PlatformType.SOLID, x: 750, y: 500, width: 800, height: 150 },
      { id: 'g3', type: PlatformType.SOLID, x: 1700, y: 500, width: 1300, height: 150 },

      // Glowing crystal pillars
      { id: 'cp1', type: PlatformType.SOLID, x: 350, y: 380, width: 80, height: 120 },
      { id: 'cp2', type: PlatformType.SOLID, x: 480, y: 300, width: 80, height: 200 },
      { id: 'cp3', type: PlatformType.SOLID, x: 920, y: 360, width: 100, height: 140 },

      // Spore Turret Platform
      { id: 'tp1', type: PlatformType.SOLID, x: 1200, y: 380, width: 120, height: 24 },
    ],
    collectibles: [
      { id: 'c1', type: CollectibleType.PRISM_SHARD, x: 500, y: 240, baseY: 240, bobOffset: 0, collected: false, value: 200, width: 20, height: 20 },
      { id: 'pw1', type: CollectibleType.POWERUP_SPEED, x: 950, y: 300, baseY: 300, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      { id: 'star1', type: CollectibleType.STAR_RELIC, x: 2100, y: 320, baseY: 320, bobOffset: 0, collected: false, value: 1000, width: 28, height: 28 },
    ],
    enemies: [
      { id: 'e1', type: EnemyType.GLOOM_WALKER, x: 400, y: 470, patrolMinX: 200, patrolMaxX: 600 },
      { id: 'e2', type: EnemyType.SPORE_TURRET, x: 1240, y: 348, patrolMinX: 1240, patrolMaxX: 1240 },
      { id: 'e3', type: EnemyType.SHADOW_PROWLER, x: 1900, y: 470, patrolMinX: 1750, patrolMaxX: 2200 },
    ],
    checkpoints: [
      { id: 'chk1', x: 1520, y: 450, width: 24, height: 50, activated: false, spawnX: 1520, spawnY: 450 }
    ],
    exit: { id: 'exit1', x: 2850, y: 400, width: 44, height: 100, targetWorld: 2, targetLevel: 2 },
  };
}

function createCrystalCavern2_2(): LevelData {
  return createCrystalCavern2_1(); // Variations handled dynamically
}

function createDesert3_1(): LevelData {
  return {
    id: '3-1',
    worldIndex: 3,
    levelIndex: 1,
    name: 'Sunken Obelisks',
    subtitle: 'World 3-1: Sands of the Ancients',
    theme: 'sunset_desert',
    width: 3200,
    height: 600,
    spawnPoint: { x: 80, y: 420 },
    timeLimit: 300,
    musicTrack: 'desert',
    ambientParticles: 'dust',
    platforms: [
      { id: 'g1', type: PlatformType.SOLID, x: 0, y: 480, width: 800, height: 120 },
      { id: 'g2', type: PlatformType.SOLID, x: 950, y: 480, width: 1100, height: 120 },
      { id: 'g3', type: PlatformType.SOLID, x: 2200, y: 480, width: 1000, height: 120 },
      { id: 'p1', type: PlatformType.SOLID, x: 450, y: 360, width: 140, height: 28 },
      { id: 'p2', type: PlatformType.SOLID, x: 650, y: 280, width: 140, height: 28 },
    ],
    collectibles: [
      { id: 'pw1', type: CollectibleType.POWERUP_FIRE, x: 700, y: 220, baseY: 220, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      { id: 'star1', type: CollectibleType.STAR_RELIC, x: 1950, y: 280, baseY: 280, bobOffset: 0, collected: false, value: 1000, width: 28, height: 28 },
    ],
    enemies: [
      { id: 'e1', type: EnemyType.ARMORED_BEETLE, x: 500, y: 450, patrolMinX: 300, patrolMaxX: 750 },
      { id: 'e2', type: EnemyType.ZEPHYR_FLYER, x: 1300, y: 320, patrolMinX: 1100, patrolMaxX: 1600 },
    ],
    checkpoints: [
      { id: 'chk1', x: 1600, y: 430, width: 24, height: 50, activated: false, spawnX: 1600, spawnY: 430 }
    ],
    exit: { id: 'exit1', x: 3050, y: 380, width: 44, height: 100, targetWorld: 3, targetLevel: 2 },
  };
}

function createDesert3_2(): LevelData {
  return createDesert3_1();
}

function createFrozenPeaks4_1(): LevelData {
  return {
    id: '4-1',
    worldIndex: 4,
    levelIndex: 1,
    name: 'Glacial Pass',
    subtitle: 'World 4-1: Slick Sheets & Blizzard Winds',
    theme: 'frozen_peaks',
    width: 3200,
    height: 600,
    spawnPoint: { x: 80, y: 420 },
    timeLimit: 300,
    musicTrack: 'ice',
    ambientParticles: 'snow',
    platforms: [
      { id: 'g1', type: PlatformType.SOLID, x: 0, y: 480, width: 700, height: 120 },
      // Ice surface (slippery!)
      { id: 'ice1', type: PlatformType.ICE, x: 780, y: 480, width: 900, height: 120 },
      { id: 'g3', type: PlatformType.SOLID, x: 1780, y: 480, width: 1420, height: 120 },
    ],
    collectibles: [
      { id: 'pw1', type: CollectibleType.POWERUP_SPEED, x: 900, y: 380, baseY: 380, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      { id: 'star1', type: CollectibleType.STAR_RELIC, x: 2200, y: 280, baseY: 280, bobOffset: 0, collected: false, value: 1000, width: 28, height: 28 },
    ],
    enemies: [
      { id: 'e1', type: EnemyType.GLOOM_WALKER, x: 450, y: 450, patrolMinX: 200, patrolMaxX: 650 },
      { id: 'e2', type: EnemyType.SHADOW_PROWLER, x: 1200, y: 450, patrolMinX: 900, patrolMaxX: 1500 },
    ],
    checkpoints: [
      { id: 'chk1', x: 1500, y: 430, width: 24, height: 50, activated: false, spawnX: 1500, spawnY: 430 }
    ],
    exit: { id: 'exit1', x: 3050, y: 380, width: 44, height: 100, targetWorld: 4, targetLevel: 2 },
  };
}

function createFrozenPeaks4_2(): LevelData {
  return createFrozenPeaks4_1();
}

function createMysticGrove5_1(): LevelData {
  return {
    id: '5-1',
    worldIndex: 5,
    levelIndex: 1,
    name: 'Twilight Arboretum',
    subtitle: 'World 5-1: Luminescent Spores',
    theme: 'mystic_forest',
    width: 3200,
    height: 600,
    spawnPoint: { x: 80, y: 420 },
    timeLimit: 300,
    musicTrack: 'mystic',
    ambientParticles: 'spores',
    platforms: [
      { id: 'g1', type: PlatformType.SOLID, x: 0, y: 480, width: 800, height: 120 },
      { id: 'g2', type: PlatformType.SOLID, x: 950, y: 480, width: 1000, height: 120 },
      { id: 'g3', type: PlatformType.SOLID, x: 2100, y: 480, width: 1100, height: 120 },
    ],
    collectibles: [
      { id: 'pw1', type: CollectibleType.POWERUP_SHIELD, x: 600, y: 350, baseY: 350, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      { id: 'star1', type: CollectibleType.STAR_RELIC, x: 1800, y: 280, baseY: 280, bobOffset: 0, collected: false, value: 1000, width: 28, height: 28 },
    ],
    enemies: [
      { id: 'e1', type: EnemyType.SHADOW_PROWLER, x: 500, y: 450, patrolMinX: 200, patrolMaxX: 750 },
      { id: 'e2', type: EnemyType.SPORE_TURRET, x: 1300, y: 448, patrolMinX: 1300, patrolMaxX: 1300 },
    ],
    checkpoints: [
      { id: 'chk1', x: 1500, y: 430, width: 24, height: 50, activated: false, spawnX: 1500, spawnY: 430 }
    ],
    exit: { id: 'exit1', x: 3050, y: 380, width: 44, height: 100, targetWorld: 5, targetLevel: 2 },
  };
}

function createMysticGrove5_2(): LevelData {
  return createMysticGrove5_1();
}

function createVolcanic6_1(): LevelData {
  return {
    id: '6-1',
    worldIndex: 6,
    levelIndex: 1,
    name: 'Infernal Core',
    subtitle: 'World 6-1: Molten Geysers',
    theme: 'volcanic_fortress',
    width: 3200,
    height: 600,
    spawnPoint: { x: 80, y: 420 },
    timeLimit: 300,
    musicTrack: 'volcano',
    ambientParticles: 'embers',
    platforms: [
      { id: 'g1', type: PlatformType.SOLID, x: 0, y: 480, width: 600, height: 120 },
      // Lava Hazard Chasm
      { id: 'lava1', type: PlatformType.LAVA, x: 600, y: 540, width: 400, height: 60 },
      { id: 'g2', type: PlatformType.SOLID, x: 1000, y: 480, width: 800, height: 120 },
      { id: 'lava2', type: PlatformType.LAVA, x: 1800, y: 540, width: 300, height: 60 },
      { id: 'g3', type: PlatformType.SOLID, x: 2100, y: 480, width: 1100, height: 120 },
    ],
    collectibles: [
      { id: 'pw1', type: CollectibleType.POWERUP_FIRE, x: 500, y: 360, baseY: 360, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      { id: 'star1', type: CollectibleType.STAR_RELIC, x: 1700, y: 260, baseY: 260, bobOffset: 0, collected: false, value: 1000, width: 28, height: 28 },
    ],
    enemies: [
      { id: 'e1', type: EnemyType.SHADOW_PROWLER, x: 450, y: 450, patrolMinX: 200, patrolMaxX: 580 },
      { id: 'e2', type: EnemyType.ARMORED_BEETLE, x: 1200, y: 450, patrolMinX: 1050, patrolMaxX: 1600 },
    ],
    checkpoints: [
      { id: 'chk1', x: 1400, y: 430, width: 24, height: 50, activated: false, spawnX: 1400, spawnY: 430 }
    ],
    exit: { id: 'exit1', x: 3050, y: 380, width: 44, height: 100, targetWorld: 6, targetLevel: 2 },
  };
}

function createVolcanic6_2(): LevelData {
  return createVolcanic6_1();
}

function createBossLevel(
  worldIndex: number,
  theme: LevelData['theme'],
  musicTrack: LevelData['musicTrack']
): LevelData {
  return {
    id: `${worldIndex}-3`,
    worldIndex,
    levelIndex: 3,
    name: worldIndex === 6 ? 'Core of the Colossus' : `Sanctum of Shards`,
    subtitle: `World ${worldIndex}-3: Boss Arena`,
    theme,
    width: 1400,
    height: 600,
    spawnPoint: { x: 100, y: 380 },
    timeLimit: 300,
    musicTrack: 'boss',
    ambientParticles: worldIndex === 6 ? 'embers' : 'crystals',
    platforms: [
      // Boss Arena Floor
      { id: 'bg1', type: PlatformType.SOLID, x: 0, y: 460, width: 1400, height: 140 },
      // Left and right arena wall pillars
      { id: 'bw1', type: PlatformType.SOLID, x: 0, y: 0, width: 40, height: 600 },
      { id: 'bw2', type: PlatformType.SOLID, x: 1360, y: 0, width: 40, height: 600 },
      // Dodge platforms
      { id: 'bp1', type: PlatformType.ONE_WAY, x: 220, y: 340, width: 140, height: 18 },
      { id: 'bp2', type: PlatformType.ONE_WAY, x: 1040, y: 340, width: 140, height: 18 },
      { id: 'bp3', type: PlatformType.ONE_WAY, x: 580, y: 260, width: 240, height: 18 },
    ],
    collectibles: [
      { id: 'pw1', type: CollectibleType.POWERUP_FIRE, x: 260, y: 280, baseY: 280, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
      { id: 'pw2', type: CollectibleType.POWERUP_SHIELD, x: 1100, y: 280, baseY: 280, bobOffset: 0, collected: false, value: 500, width: 24, height: 24 },
    ],
    enemies: [],
    checkpoints: [],
    exit: { id: 'exit1', x: 1250, y: 360, width: 44, height: 100, targetWorld: Math.min(6, worldIndex + 1), targetLevel: 1 },
  };
}
