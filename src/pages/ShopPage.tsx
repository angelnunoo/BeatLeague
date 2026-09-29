import { useState } from 'react'
import { SHOP, SHOP_LABEL } from '../data/meta'
import { formatNum } from '../domain/format'
import { useGame } from '../state/store'
import type { ShopCategory } from '../types'
import { Button, PageHead } from '../components/ui'

const CATEGORIES = Object.keys(SHOP_LABEL) as ShopCategory[]

export function ShopPage() {
  const game = useGame()
  const [category, setCategory] = useState<ShopCategory>('frame')
  const [message, setMessage] = useState('')
  const items = SHOP.filter((item) => item.category === category)
  return (
    <div className="grid gap-4">
      <PageHead kicker="Beats" title="Tienda" text="Marcos, banners, títulos y efectos. Los tronos no se compran: se escuchan." />
      <div className="hide-scroll flex gap-2 overflow-x-auto">
        {CATEGORIES.map((id) => (
          <button key={id} type="button" onClick={() => setCategory(id)} className={`shrink-0 rounded-full px-3 py-2 text-sm ${id === category ? 'bg-white text-black' : 'bg-white/8 text-muted'}`}>
            {SHOP_LABEL[id]}
          </button>
        ))}
      </div>
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const owned = game.state.ownedItems.includes(item.id)
          const equipped = game.state.equipped[item.category] === item.id
          return (
            <article key={item.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-panel">
              <div className="h-24" style={{ background: item.palette ? `linear-gradient(120deg, ${item.palette[0]}, ${item.palette[1]})` : 'linear-gradient(120deg,#1db954,#102818)' }} />
              <div className="p-4">
                <h2 className="font-display text-2xl leading-none">{item.name}</h2>
                <p className="mt-2 text-sm text-muted">{item.detail}</p>
                <p className="mt-3 text-sm font-semibold text-spotify">{formatNum(item.price)} Beats</p>
                <div className="mt-3">
                  {equipped ? (
                    <Button variant="ghost" onClick={() => game.unequip(item.category)}>Quitar</Button>
                  ) : owned ? (
                    <Button onClick={() => game.equip(item.id)}>Equipar</Button>
                  ) : (
                    <Button
                      onClick={() => {
                        const error = game.buy(item.id)
                        setMessage(error ?? `${item.name} equipado.`)
                      }}
                    >
                      Comprar
                    </Button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
