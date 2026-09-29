import { formatMinutes, formatNum } from '../domain/format'
import { POINTS_PER_MINUTE, POINTS_PER_PLAY, POINTS_PER_SONG } from '../domain/listening'
import { useGame } from '../state/store'
import { Meter, PageHead, Panel } from '../components/ui'

export function StatsPage() {
  const game = useGame()
  const source = game.snapshot.provider === 'spotify' ? 'Spotify' : game.snapshot.provider === 'apple' ? 'Apple Music' : 'Liga demo'
  const ledger = game.state.ledger[game.snapshot.provider]
  return (
    <div className="grid gap-4">
      <PageHead kicker="Tu oído" title="Estadísticas" text={`Fuente: ${source}. Cada canción nueva y cada reproducción entran en la liga.`} />
      <div className="grid grid-cols-2 gap-3">
        <Panel>
          <p className="text-xs text-faint">Tiempo de escucha</p>
          <p className="mt-1 font-display text-4xl leading-none">{formatMinutes(game.snapshot.listeningMinutes)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-faint">Reproducciones</p>
          <p className="mt-1 font-display text-4xl leading-none">{formatNum(game.snapshot.plays)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-faint">Canciones distintas</p>
          <p className="mt-1 font-display text-4xl leading-none">{formatNum(game.snapshot.uniqueTracks)}</p>
        </Panel>
        <Panel>
          <p className="text-xs text-faint">Puntos de escucha</p>
          <p className="mt-1 font-display text-4xl leading-none">{formatNum(ledger.points)}</p>
        </Panel>
      </div>
      <Panel>
        <p className="text-sm text-muted">{POINTS_PER_SONG} puntos por canción nueva, {POINTS_PER_PLAY} por cada vez que suena y {POINTS_PER_MINUTE} por minuto. Repetir una canción cuenta.</p>
      </Panel>
      <Panel>
        <h2 className="font-display text-2xl">Géneros</h2>
        <div className="mt-3 grid gap-3">
          {game.snapshot.genres.map((genre) => (
            <div key={genre.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{genre.name}</span>
                <span className="num text-muted">{Math.round(genre.share * 100)}%</span>
              </div>
              <Meter value={genre.share} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel>
        <h2 className="font-display text-2xl">Top canciones</h2>
        <ol className="mt-3 grid gap-2">
          {game.snapshot.topTracks.map((track, index) => (
            <li key={track.key} className="flex justify-between gap-3 text-sm">
              <span><span className="num text-spotify">{index + 1}</span> {track.name}</span>
              <span className="text-muted">{track.plays ? `${formatNum(track.plays)} veces` : track.artistName}</span>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel>
        <h2 className="font-display text-2xl">Top artistas</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {game.snapshot.topArtists.map((artist) => (
            <li key={artist.key} className="flex justify-between gap-3">
              <span>{artist.name}</span>
              <span className="text-muted">{formatMinutes(artist.minutes)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
