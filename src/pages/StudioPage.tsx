import { Link } from 'react-router-dom'
import { SHOP } from '../data/meta'
import { heuristicEngine, insightInputFromSnapshot } from '../domain/retention'
import { threatLine } from '../domain/thrones'
import { useGame } from '../state/store'
import { Mark, PageHead, Panel } from '../components/ui'

const ACCENTS = ['#1DB954', '#E7C36A', '#FFFFFF', '#8ED0FF', '#FF5A7A']

const CATEGORIES = [
  ['banner', 'Banners'],
  ['frame', 'Marcos'],
  ['background', 'Fondos'],
  ['title', 'Títulos'],
  ['effect', 'Efectos'],
  ['badge', 'Insignias'],
  ['animation', 'Animaciones'],
  ['avatar', 'Avatares'],
] as const

export function StudioPage() {
  const game = useGame()
  const rival = [...game.friends].sort((a, b) => game.compat(b).percent - game.compat(a).percent)[0]
  const insights = heuristicEngine.recommend(
    insightInputFromSnapshot(game.snapshot, {
      threat: game.threats[0] ? threatLine(game.threats[0]) : undefined,
      friendName: rival?.name,
      compat: rival ? game.compat(rival).percent : undefined,
    }),
  )
  const banner = SHOP.find((item) => item.id === game.state.equipped.banner)?.palette
  const title = SHOP.find((item) => item.id === game.state.equipped.title)?.titleText
  return (
    <div className="grid gap-4">
      <PageHead kicker="Identidad" title="Estudio" text="El perfil se construye. El motor de recomendaciones ya lee tu escucha; un modelo puede ocupar el mismo contrato." />
      <section className="overflow-hidden rounded-[32px] border border-white/10" style={{ boxShadow: `inset 0 0 0 2px ${game.state.accent}` }}>
        <div className="h-28" style={{ background: banner ? `linear-gradient(120deg, ${banner[0]}, ${game.state.accent})` : `linear-gradient(120deg, ${game.state.accent}, #0f0f0f)` }} />
        <div className="-mt-8 px-4 pb-4">
          <Mark name={game.me.name} palette={game.me.palette} size={72} ring={game.state.accent} glow={game.state.equipped.effect === 'fx-glow'} />
          <h2 className="mt-3 font-display text-4xl">{game.me.name}</h2>
          <p className="text-sm text-gold">{title || game.myThrones[0]?.title || 'Sin título'}</p>
        </div>
      </section>
      <Panel>
        <h2 className="font-semibold">Color</h2>
        <div className="mt-3 flex gap-2">
          {ACCENTS.map((color) => (
            <button key={color} type="button" aria-label={`Color ${color}`} onClick={() => game.setAccent(color)} className="h-10 w-10 rounded-full" style={{ background: color, outline: game.state.accent === color ? '2px solid white' : undefined, outlineOffset: 3 }} />
          ))}
        </div>
      </Panel>
      {CATEGORIES.map(([category, label]) => {
        const items = SHOP.filter((item) => item.category === category)
        return (
          <Panel key={category}>
            <h2 className="font-semibold">{label}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {items.map((item) => {
                const owned = game.state.ownedItems.includes(item.id)
                if (!owned) {
                  return (
                    <Link key={item.id} to="/tienda" className="rounded-full bg-white/5 px-3 py-2 text-sm text-muted">
                      {item.name}
                    </Link>
                  )
                }
                return (
                  <button key={item.id} type="button" onClick={() => game.equip(item.id)} className={`rounded-full px-3 py-2 text-sm ${game.state.equipped[category] === item.id ? 'bg-spotify text-black' : 'bg-white/8'}`}>
                    {item.name}
                  </button>
                )
              })}
            </div>
          </Panel>
        )
      })}
      <Panel>
        <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">IA musical · {heuristicEngine.id}</p>
        <div className="mt-3 grid gap-3">
          {insights.map((insight) => (
            <Link key={insight.id} to={insight.href} className="block rounded-2xl bg-white/5 p-3">
              <p className="font-semibold">{insight.title}</p>
              <p className="text-sm text-muted">{insight.detail}</p>
            </Link>
          ))}
        </div>
      </Panel>
    </div>
  )
}
