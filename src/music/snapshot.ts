import { artistById, trackById } from '../data/catalog'
import { personById } from '../data/people'
import type { ListenEvent, ListeningSnapshot, MusicProviderId, Person, SnapshotArtist, SnapshotTrack } from '../types'

function artistMinute(person: Person, artistId: string) {
  return person.listening.find((row) => row.artistId === artistId)?.minutes ?? 0
}

export function snapshotFromPerson(person: Person, provider: MusicProviderId = 'demo', withEvents = false): ListeningSnapshot {
  const topArtists: SnapshotArtist[] = [...person.listening]
    .sort((a, b) => b.minutes - a.minutes)
    .map((row) => {
      const artist = artistById(row.artistId)
      return {
        key: artist.name.toLowerCase(),
        name: artist.name,
        genres: [artist.genre],
        minutes: row.minutes,
        listeners: artist.monthlyListeners,
      }
    })

  const toTrack = (id: string, playedAt?: string): SnapshotTrack => {
    const track = trackById(id)
    return {
      key: track.title.toLowerCase(),
      name: track.title,
      artistName: artistById(track.artistId).name,
      album: track.album,
      playedAt,
    }
  }

  const genreMinutes = new Map<string, number>()
  for (const row of person.listening) {
    const artist = artistById(row.artistId)
    genreMinutes.set(artist.genre, (genreMinutes.get(artist.genre) ?? 0) + row.minutes)
  }
  const genreTotal = [...genreMinutes.values()].reduce((sum, value) => sum + value, 0) || 1
  const genres = [...genreMinutes.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, minutes]) => ({ name, share: minutes / genreTotal }))

  const listeningMinutes = person.listening.reduce((sum, row) => sum + row.minutes, 0)
  const events = withEvents ? demoEvents(person) : undefined

  return {
    provider,
    displayName: person.name,
    topArtists,
    topTracks: person.topTrackIds.map((id) => toTrack(id)),
    genres,
    recent: person.topTrackIds.slice(0, 4).map((id, index) => toTrack(id, new Date(Date.now() - index * 3600_000).toISOString())),
    listeningMinutes,
    plays: events?.length ?? person.topTrackIds.length,
    uniqueTracks: person.topTrackIds.length,
    updatedAt: new Date().toISOString(),
    events,
  }
}

function demoEvents(person: Person): ListenEvent[] {
  const events: ListenEvent[] = []
  for (const row of person.listening) {
    const artist = artistById(row.artistId)
    const tracks = person.topTrackIds.map((id) => trackById(id)).filter((track) => track.artistId === row.artistId)
    const plays = Math.max(1, Math.round(row.minutes / 4))
    const slice = row.minutes / plays
    for (let index = 0; index < plays; index += 1) {
      const track = tracks[index % Math.max(1, tracks.length)]
      events.push({
        key: `demo:${person.id}:${row.artistId}:${index}`,
        trackKey: track?.id ?? row.artistId,
        name: track?.title ?? artist.name,
        artistName: artist.name,
        minutes: slice,
        album: track?.album,
        genres: [artist.genre],
      })
    }
  }
  return events
}

export function demoSnapshot() {
  return snapshotFromPerson(personById('angel'), 'demo', true)
}

export function minutesFor(person: Person, artistId: string) {
  return artistMinute(person, artistId)
}
