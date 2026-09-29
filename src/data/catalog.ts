import type { Artist, Track } from '../types'

export const ARTISTS: Artist[] = [
  { id: 'quevedo', name: 'Quevedo', genre: 'Reggaetón', genreGroup: 'reggaeton', monthlyListeners: 31200000, palette: ['#1DB954', '#0B3D22'] },
  { id: 'bad-bunny', name: 'Bad Bunny', genre: 'Reggaetón', genreGroup: 'reggaeton', monthlyListeners: 82400000, palette: ['#F2C14E', '#6B3A12'] },
  { id: 'feid', name: 'Feid', genre: 'Reggaetón', genreGroup: 'reggaeton', monthlyListeners: 46800000, palette: ['#7CFFB2', '#145C38'] },
  { id: 'rosalia', name: 'Rosalía', genre: 'Flamenco pop', genreGroup: 'pop', monthlyListeners: 28600000, palette: ['#FF5A7A', '#4A1020'] },
  { id: 'taylor', name: 'Taylor Swift', genre: 'Pop', genreGroup: 'pop', monthlyListeners: 104000000, palette: ['#C9B6FF', '#3A215C'] },
  { id: 'weeknd', name: 'The Weeknd', genre: 'R&B', genreGroup: 'rnb', monthlyListeners: 112000000, palette: ['#FF4D4D', '#2A0A0A'] },
  { id: 'arctic', name: 'Arctic Monkeys', genre: 'Rock', genreGroup: 'rock', monthlyListeners: 51200000, palette: ['#F4EFE6', '#3A342C'] },
  { id: 'dua', name: 'Dua Lipa', genre: 'Pop', genreGroup: 'pop', monthlyListeners: 73800000, palette: ['#FFD1E8', '#6E2348'] },
  { id: 'bizarrap', name: 'Bizarrap', genre: 'Latin', genreGroup: 'latin', monthlyListeners: 27400000, palette: ['#B6FF3B', '#1E3A08'] },
  { id: 'karol', name: 'Karol G', genre: 'Reggaetón', genreGroup: 'reggaeton', monthlyListeners: 54100000, palette: ['#FF8AD4', '#5A1840'] },
  { id: 'rauw', name: 'Rauw Alejandro', genre: 'Reggaetón', genreGroup: 'reggaeton', monthlyListeners: 39800000, palette: ['#8ED0FF', '#12324A'] },
  { id: 'aitana', name: 'Aitana', genre: 'Pop', genreGroup: 'pop', monthlyListeners: 9800000, palette: ['#FFE08A', '#5C4310'] },
  { id: 'billie', name: 'Billie Eilish', genre: 'Pop', genreGroup: 'pop', monthlyListeners: 67600000, palette: ['#9BE7FF', '#102830'] },
  { id: 'dragons', name: 'Imagine Dragons', genre: 'Rock', genreGroup: 'rock', monthlyListeners: 54800000, palette: ['#FFB020', '#4A2508'] },
  { id: 'coldplay', name: 'Coldplay', genre: 'Rock', genreGroup: 'rock', monthlyListeners: 79200000, palette: ['#FFF4C2', '#243018'] },
]

export const TRACKS: Track[] = [
  { id: 'bzrp-52', title: 'Quevedo: Bzrp Music Sessions, Vol. 52', artistId: 'quevedo', album: 'BZRP Music Sessions, Vol. 52', plays: 1280000000, released: '2022-07-06' },
  { id: 'columbia', title: 'Columbia', artistId: 'quevedo', album: 'Donde Quiero Estar', plays: 780000000, released: '2022-09-15' },
  { id: 'titi', title: 'Tití Me Preguntó', artistId: 'bad-bunny', album: 'Un Verano Sin Ti', plays: 1860000000, released: '2022-05-06' },
  { id: 'moscow', title: 'Moscow Mule', artistId: 'bad-bunny', album: 'Un Verano Sin Ti', plays: 940000000, released: '2022-05-06' },
  { id: 'bonito', title: 'Me Porto Bonito', artistId: 'bad-bunny', album: 'Un Verano Sin Ti', plays: 1510000000, released: '2022-05-06' },
  { id: 'normal', title: 'Normal', artistId: 'feid', album: 'Feliz Cumpleaños Ferxxo', plays: 760000000, released: '2022-09-14' },
  { id: 'classy', title: 'Classy 101', artistId: 'feid', album: 'MOR, No Le Temas a la Oscuridad', plays: 890000000, released: '2023-03-31' },
  { id: 'luna', title: 'LUNA', artistId: 'feid', album: 'FERXXOCALIPSIS', plays: 510000000, released: '2023-12-01' },
  { id: 'despecha', title: 'Despechá', artistId: 'rosalia', album: 'Motomami+', plays: 640000000, released: '2022-07-28' },
  { id: 'saoko', title: 'Saoko', artistId: 'rosalia', album: 'Motomami', plays: 280000000, released: '2022-02-04' },
  { id: 'antihero', title: 'Anti-Hero', artistId: 'taylor', album: 'Midnights', plays: 1720000000, released: '2022-10-21' },
  { id: 'cruel', title: 'Cruel Summer', artistId: 'taylor', album: 'Lover', plays: 2100000000, released: '2019-08-23' },
  { id: 'blinding', title: 'Blinding Lights', artistId: 'weeknd', album: 'After Hours', plays: 4600000000, released: '2019-11-29' },
  { id: 'tears', title: 'Save Your Tears', artistId: 'weeknd', album: 'After Hours', plays: 2300000000, released: '2020-08-09' },
  { id: 'diwk', title: 'Do I Wanna Know?', artistId: 'arctic', album: 'AM', plays: 2480000000, released: '2013-06-19' },
  { id: 'am505', title: '505', artistId: 'arctic', album: 'Favourite Worst Nightmare', plays: 1900000000, released: '2007-04-23' },
  { id: 'levitating', title: 'Levitating', artistId: 'dua', album: 'Future Nostalgia', plays: 2400000000, released: '2020-10-01' },
  { id: 'dont', title: "Don't Start Now", artistId: 'dua', album: 'Future Nostalgia', plays: 2200000000, released: '2019-11-01' },
  { id: 'bzrp-53', title: 'Shakira: Bzrp Music Sessions, Vol. 53', artistId: 'bizarrap', album: 'BZRP Music Sessions, Vol. 53', plays: 1100000000, released: '2023-01-11' },
  { id: 'provenza', title: 'Provenza', artistId: 'karol', album: 'Mañana Será Bonito', plays: 1200000000, released: '2022-04-21' },
  { id: 'tqg', title: 'TQG', artistId: 'karol', album: 'Mañana Será Bonito', plays: 980000000, released: '2023-02-24' },
  { id: 'todo', title: 'Todo De Ti', artistId: 'rauw', album: 'Vice Versa', plays: 1050000000, released: '2021-05-20' },
  { id: 'desesperados', title: 'Desesperados', artistId: 'rauw', album: 'Vice Versa', plays: 740000000, released: '2021-12-09' },
  { id: 'badguy', title: 'bad guy', artistId: 'billie', album: 'When We All Fall Asleep, Where Do We Go?', plays: 2900000000, released: '2019-03-29' },
  { id: 'believer', title: 'Believer', artistId: 'dragons', album: 'Evolve', plays: 3100000000, released: '2017-02-01' },
  { id: 'yellow', title: 'Yellow', artistId: 'coldplay', album: 'Parachutes', plays: 2600000000, released: '2000-06-26' },
  { id: 'viva', title: 'Viva La Vida', artistId: 'coldplay', album: 'Viva la Vida or Death and All His Friends', plays: 2300000000, released: '2008-05-25' },
  { id: 'angeles', title: 'Los Ángeles', artistId: 'aitana', album: 'Alpha', plays: 86000000, released: '2023-06-09' },
  { id: 'formentera', title: 'Formentera', artistId: 'aitana', album: 'Formentera', plays: 120000000, released: '2022-08-18' },
]

const artistMap = new Map(ARTISTS.map((artist) => [artist.id, artist]))
const trackMap = new Map(TRACKS.map((track) => [track.id, track]))

export function artistById(id: string) {
  const artist = artistMap.get(id)
  if (!artist) throw new Error(`Artista desconocido: ${id}`)
  return artist
}

export function trackById(id: string) {
  const track = trackMap.get(id)
  if (!track) throw new Error(`Pista desconocida: ${id}`)
  return track
}

export function tracksByArtist(artistId: string) {
  return TRACKS.filter((track) => track.artistId === artistId)
}
