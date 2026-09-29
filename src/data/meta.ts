import type { AchievementDef, GameMode, MissionDef, ShopItem } from '../types'

export const GAMES: { id: GameMode; name: string; blurb: string; minutes: string }[] = [
  { id: 'guess', name: 'Adivina la canción', blurb: 'Cinco segundos de pista. Cuatro respuestas. La prisa paga.', minutes: '1 min' },
  { id: 'lyric', name: 'Completa la letra', blurb: 'Falta una palabra del título real. Elige la que cierra el tema.', minutes: '1 min' },
  { id: 'plays', name: 'Más reproducciones', blurb: 'Dos canciones. Elige la que acumula más plays.', minutes: '45 s' },
  { id: 'listeners', name: 'Más oyentes', blurb: 'Dos artistas. ¿Quién mueve más oyentes al mes?', minutes: '45 s' },
  { id: 'release', name: '¿Qué salió antes?', blurb: 'Compara fechas de lanzamiento y quédate con la más antigua.', minutes: '45 s' },
  { id: 'cover', name: 'Portada misteriosa', blurb: 'La carátula llega desenfocada. Adivina el álbum.', minutes: '1 min' },
  { id: 'who-listens', name: '¿Quién escucha más?', blurb: 'Datos reales de tu círculo. ¿Quién vive dentro de ese artista?', minutes: '1 min' },
  { id: 'whose-top', name: '¿De quién es este top 5?', blurb: 'Cinco canciones de un amigo. Ponle nombre.', minutes: '1 min' },
  { id: 'duel', name: 'Duelo musical', blurb: 'Diez preguntas contra un amigo. El reloj es el rival extra.', minutes: '3 min' },
  { id: 'infinite', name: 'Modo infinito', blurb: 'Sin red. Una falla y la racha se queda en el marcador.', minutes: 'Libre' },
  { id: 'battle', name: 'Batalla de artistas', blurb: 'Un artista, todas las preguntas. Defiende o asalta el trono.', minutes: '2 min' },
]

export const MISSIONS: MissionDef[] = [
  { id: 'd-plays', cadence: 'daily', title: 'Juega 3 partidas', metric: 'plays', target: 3, xp: 80, coins: 40 },
  { id: 'd-duel', cadence: 'daily', title: 'Gana 1 duelo', metric: 'duelWins', target: 1, xp: 120, coins: 60 },
  { id: 'd-throne', cadence: 'daily', title: 'Defiende un trono', metric: 'defenses', target: 1, xp: 140, coins: 70 },
  { id: 'd-correct', cadence: 'daily', title: 'Acierta 15 preguntas', metric: 'correct', target: 15, xp: 100, coins: 50 },
  { id: 'w-duels', cadence: 'weekly', title: 'Gana 10 duelos', metric: 'duelWins', target: 10, xp: 400, coins: 220 },
  { id: 'w-epic', cadence: 'weekly', title: 'Consigue una carta épica', metric: 'epicCards', target: 1, xp: 320, coins: 160 },
  { id: 'w-level', cadence: 'weekly', title: 'Sube un nivel', metric: 'levels', target: 1, xp: 250, coins: 120 },
  { id: 'w-score', cadence: 'weekly', title: 'Suma 8.000 puntos', metric: 'score', target: 8000, xp: 350, coins: 180 },
]

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'correct-100', title: 'Oído absoluto', detail: '100 canciones acertadas', metric: 'correct', target: 100, xp: 300, coins: 150 },
  { id: 'answered-1000', title: 'Maratón', detail: '1.000 preguntas respondidas', metric: 'answered', target: 1000, xp: 500, coins: 250 },
  { id: 'wins-50', title: 'Cincuenta victorias', detail: '50 partidas ganadas', metric: 'wins', target: 50, xp: 400, coins: 200 },
  { id: 'duels-10', title: 'Duelista', detail: '10 duelos ganados', metric: 'duelsWon', target: 10, xp: 350, coins: 180 },
  { id: 'streak-30', title: 'Mes invicto', detail: '30 días seguidos jugando', metric: 'bestStreak', target: 30, xp: 600, coins: 300 },
  { id: 'artists-100', title: 'Cartógrafo', detail: '100 artistas descubiertos', metric: 'artistsDiscovered', target: 100, xp: 450, coins: 220 },
  { id: 'throne-30', title: 'Dinastía', detail: 'Conservar un trono durante 30 días', metric: 'throneDays', target: 30, xp: 700, coins: 400 },
  { id: 'cards-8', title: 'Coleccionista', detail: 'Reúne 8 cartas de artista', metric: 'cards', target: 8, xp: 250, coins: 120 },
]

export const SHOP: ShopItem[] = [
  { id: 'frame-volt', category: 'frame', name: 'Marco Volt', detail: 'Aro verde que respira con el pulso.', price: 400, palette: ['#1DB954', '#08331A'] },
  { id: 'frame-gold', category: 'frame', name: 'Marco Corona', detail: 'El borde de quien ya tiene trono.', price: 900, palette: ['#E7C36A', '#6A4A10'] },
  { id: 'banner-night', category: 'banner', name: 'Banner Noche', detail: 'Azul de afterhour.', price: 500, palette: ['#163044', '#0F0F0F'] },
  { id: 'banner-gold', category: 'banner', name: 'Banner Leyenda', detail: 'Oro sobre negro profundo.', price: 1100, palette: ['#6A4A10', '#0F0F0F'] },
  { id: 'avatar-volt', category: 'avatar', name: 'Avatar Volt', detail: 'Iniciales en verde liga.', price: 350, palette: ['#B6FF3B', '#12301A'] },
  { id: 'avatar-royal', category: 'avatar', name: 'Avatar Royal', detail: 'Retrato de rivalidad.', price: 800, palette: ['#E7C36A', '#2A2208'] },
  { id: 'bg-pulse', category: 'background', name: 'Fondo Pulso', detail: 'Halo verde detrás del perfil.', price: 600, palette: ['#1DB954', '#0F0F0F'] },
  { id: 'badge-note', category: 'badge', name: 'Insignia Nota', detail: 'Una nota blanca sobre el nombre.', price: 250 },
  { id: 'badge-crown', category: 'badge', name: 'Insignia Corona', detail: 'Para quien colecciona tronos.', price: 700 },
  { id: 'title-leyenda', category: 'title', name: 'Leyenda BeatLeague', detail: 'Título de perfil.', price: 1500, titleText: 'Leyenda BeatLeague' },
  { id: 'title-maestro', category: 'title', name: 'Maestro Musical', detail: 'Título de perfil.', price: 1200, titleText: 'Maestro Musical' },
  { id: 'title-pop', category: 'title', name: 'Rey del Pop', detail: 'Título cosmético. El trono real se gana escuchando.', price: 1000, titleText: 'Rey del Pop' },
  { id: 'title-destructor', category: 'title', name: 'Destructor de Tronos', detail: 'Para quien entra a conquistar, no a mirar.', price: 1800, titleText: 'Destructor de Tronos' },
  { id: 'fx-glow', category: 'effect', name: 'Brillo de escenario', detail: 'El avatar emite luz verde.', price: 650 },
  { id: 'fx-spark', category: 'effect', name: 'Chispa de oro', detail: 'Destellos en la tarjeta de perfil.', price: 900 },
  { id: 'anim-rise', category: 'animation', name: 'Subida', detail: 'El nivel entra desde abajo.', price: 750 },
  { id: 'anim-beat', category: 'animation', name: 'Latido', detail: 'El anillo de XP late al abrir el perfil.', price: 1300 },
]

export const SHOP_LABEL: Record<ShopItem['category'], string> = {
  frame: 'Marcos',
  banner: 'Banners',
  avatar: 'Avatares',
  background: 'Fondos',
  badge: 'Insignias',
  title: 'Títulos',
  effect: 'Efectos',
  animation: 'Animaciones',
}

export const PREDICTIONS = [
  {
    id: 'grow-track',
    title: '¿Qué canción crecerá más esta semana?',
    kind: 'track' as const,
    options: ['titi', 'bzrp-52', 'cruel', 'blinding'],
  },
  {
    id: 'grow-artist',
    title: '¿Qué artista sumará más oyentes?',
    kind: 'artist' as const,
    options: ['bad-bunny', 'quevedo', 'feid', 'taylor'],
  },
  {
    id: 'release-hit',
    title: '¿Qué lanzamiento hará más ruido?',
    kind: 'track' as const,
    options: ['classy', 'tqg', 'antihero', 'bzrp-53'],
  },
]

export const LAST_PREDICTION = {
  id: 'last-week-hit',
  title: 'La semana pasada: ¿quién lideró oyentes?',
  correct: 'bad-bunny',
  correctLabel: 'Bad Bunny',
  xp: 90,
  coins: 50,
}
