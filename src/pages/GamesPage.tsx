import { Link } from 'react-router-dom'
import { GAMES } from '../data/meta'
import { PageHead } from '../components/ui'

export function GamesPage() {
  return (
    <div>
      <PageHead kicker="Arcade" title="Juegos" text="Rapidez, amigos y tronos. La trivia es solo el golpe; la liga es lo que se queda." />
      <div className="mb-3 grid gap-3 sm:grid-cols-2">
        <Link to="/predice" className="rounded-[28px] border border-gold/30 bg-gold/10 p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-gold uppercase">12 · Predice el hit</p>
          <p className="mt-2 font-semibold">Canción, artista o lanzamiento. Si aciertas, la semana paga.</p>
        </Link>
        <Link to="/eventos" className="rounded-[28px] border border-white/10 bg-panel p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-spotify uppercase">En vivo</p>
          <p className="mt-2 font-semibold">Quevedo Week abre batalla y carta de temporada.</p>
        </Link>
      </div>
      <div className="grid gap-3">
        {GAMES.map((game, index) => (
          <Link key={game.id} to={`/jugar/${game.id}`} className="rise grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[28px] border border-white/8 bg-panel p-4" style={{ animationDelay: `${index * 40}ms` }}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-spotify/15 font-display text-lg text-spotify">{index + 1}</span>
            <span>
              <span className="block font-semibold">{game.name}</span>
              <span className="mt-1 block text-sm text-muted">{game.blurb}</span>
            </span>
            <span className="text-xs text-faint">{game.minutes}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
