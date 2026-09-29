import { ARTISTS, artistById } from '../data/catalog'
import { artistTier } from '../domain/progression'
import { useGame } from '../state/store'
import { Meter, PageHead, Stars } from '../components/ui'

export function CardsPage() {
  const game = useGame()
  return (
    <div className="grid gap-4">
      <PageHead kicker="Colección" title="Cartas" text="Salen de partidas, duelos, misiones y subidas. La rareza brilla más cuanto más cuesta verla." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ARTISTS.map((artist) => {
          const card = game.state.cards.find((item) => item.artistId === artist.id)
          const xp = game.state.artistXp[artist.id] ?? 0
          const tier = artistTier(xp)
          return (
            <article key={artist.id} className={`relative overflow-hidden rounded-[28px] border p-3 ${card ? 'border-white/15' : 'border-white/5 opacity-50'}`} style={{ background: `linear-gradient(180deg, ${artist.palette[0]}55, #121212 58%)` }}>
              {card ? <div className="shimmer pointer-events-none absolute inset-0 opacity-50" /> : null}
              <div className="relative">
                {card ? <Stars rarity={card.rarity} /> : <p className="text-xs text-faint">Sin carta</p>}
                <p className="mt-8 font-display text-2xl leading-none">{artist.name}</p>
                <p className="mt-2 text-xs text-gold">{xp > 0 ? tier.label : artist.genre}</p>
                {xp > 0 ? <div className="mt-2"><Meter value={tier.ratio} gold /></div> : null}
              </div>
            </article>
          )
        })}
      </div>
      <p className="text-xs text-faint">Progreso de artista: {ARTISTS.filter((artist) => (game.state.artistXp[artist.id] ?? 0) > 0).map((artist) => `${artistById(artist.id).name} ${artistTier(game.state.artistXp[artist.id] ?? 0).label}`).join(' · ')}</p>
    </div>
  )
}
