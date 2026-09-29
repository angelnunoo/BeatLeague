import { artistById, trackById } from '../data/catalog'
import { formatMinutes } from '../domain/format'
import { useGame } from '../state/store'
import { Mark, PageHead, Panel } from '../components/ui'

export function TrendingPage() {
  const game = useGame()
  const circle = [game.me, ...game.friends]
  const artists = new Map<string, number>()
  const tracks = new Map<string, number>()
  const genres = new Map<string, number>()
  for (const person of circle) {
    for (const row of person.listening) {
      artists.set(row.artistId, (artists.get(row.artistId) ?? 0) + row.minutes)
      const artist = artistById(row.artistId)
      genres.set(artist.genre, (genres.get(artist.genre) ?? 0) + row.minutes)
    }
    for (const id of person.topTrackIds) tracks.set(id, (tracks.get(id) ?? 0) + 1)
  }
  const topArtists = [...artists.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topTracks = [...tracks.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const topGenres = [...genres.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)
  return (
    <div className="grid gap-4">
      <PageHead kicker="Tu círculo" title="Trending" text="Lo que está sonando entre la gente que tienes en la liga. Nada de charts globales vacíos." />
      <Panel>
        <h2 className="font-display text-2xl">Artistas</h2>
        <ol className="mt-3 grid gap-3">
          {topArtists.map(([id, minutes], index) => {
            const artist = artistById(id)
            const drift = (id.charCodeAt(0) % 13) - 3
            return (
              <li key={id} className="flex items-center gap-3">
                <span className="num w-5 text-spotify">{index + 1}</span>
                <Mark name={artist.name} palette={artist.palette} size={40} />
                <span className="flex-1 font-semibold">{artist.name}</span>
                <span className="text-right text-xs text-muted">
                  {formatMinutes(minutes)}
                  <span className={`block ${drift >= 0 ? 'text-spotify' : 'text-danger'}`}>{drift >= 0 ? '+' : ''}{drift}% semanal</span>
                </span>
              </li>
            )
          })}
        </ol>
      </Panel>
      <Panel>
        <h2 className="font-display text-2xl">Canciones</h2>
        <ol className="mt-3 grid gap-2 text-sm">
          {topTracks.map(([id, count], index) => (
            <li key={id} className="flex justify-between gap-3">
              <span><span className="text-spotify">{index + 1}</span> {trackById(id).title}</span>
              <span className="text-muted">{count} amigos</span>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel>
        <h2 className="font-display text-2xl">Géneros de moda</h2>
        <ul className="mt-3 grid gap-2">
          {topGenres.map(([name, minutes]) => (
            <li key={name} className="flex justify-between text-sm">
              <span>{name}</span>
              <span className="text-muted">{formatMinutes(minutes)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
