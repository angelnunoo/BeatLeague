export function xpToNext(level: number) {
  return 360 + level * 47
}

export function totalXpForLevel(level: number) {
  let total = 0
  for (let current = 1; current < level; current += 1) total += xpToNext(current)
  return total
}

export function levelFromXp(xp: number) {
  let level = 1
  let spent = 0
  while (spent + xpToNext(level) <= xp) {
    spent += xpToNext(level)
    level += 1
  }
  const into = xp - spent
  const need = xpToNext(level)
  return { level, into, need, ratio: into / need }
}

export const ARTIST_TIERS = [
  { id: 'bronce', label: 'Bronce', min: 0 },
  { id: 'plata', label: 'Plata', min: 250 },
  { id: 'oro', label: 'Oro', min: 600 },
  { id: 'platino', label: 'Platino', min: 1100 },
  { id: 'diamante', label: 'Diamante', min: 1800 },
  { id: 'maestro', label: 'Maestro', min: 2600 },
] as const

export function artistTier(xp: number) {
  let current: (typeof ARTIST_TIERS)[number] = ARTIST_TIERS[0]
  for (const tier of ARTIST_TIERS) {
    if (xp >= tier.min) current = tier
  }
  const index = ARTIST_TIERS.findIndex((tier) => tier.id === current.id)
  const next = ARTIST_TIERS[index + 1]
  const floor = current.min
  const ceil = next?.min ?? floor + 800
  return {
    ...current,
    next: next?.label ?? 'Cima',
    ratio: Math.min(1, (xp - floor) / (ceil - floor)),
  }
}

export const RARITY_LABEL = {
  common: 'Común',
  rare: 'Rara',
  epic: 'Épica',
  legendary: 'Legendaria',
  mythic: 'Mítica',
} as const

export const RARITY_STARS = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
} as const

const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary', 'mythic'] as const

export function rollRarity(luck: number) {
  const roll = Math.random() + luck
  if (roll > 1.22) return RARITY_ORDER[4]
  if (roll > 1.05) return RARITY_ORDER[3]
  if (roll > 0.82) return RARITY_ORDER[2]
  if (roll > 0.55) return RARITY_ORDER[1]
  return RARITY_ORDER[0]
}
