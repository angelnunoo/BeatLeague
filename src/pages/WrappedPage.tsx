import { useState } from 'react'
import { formatMinutes } from '../domain/format'
import { useGame } from '../state/store'
import { Button, PageHead } from '../components/ui'

export function WrappedPage() {
  const game = useGame()
  const [slide, setSlide] = useState(0)
  const artist = game.snapshot.topArtists[0]
  const track = game.snapshot.topTracks[0]
  const weekly = game.standings('weekly').find((row) => row.person.id === 'angel')
  const slides = [
    { kicker: 'Artista', title: artist?.name ?? 'Tu artista', text: 'El nombre que más ha ocupado tu semana.' },
    { kicker: 'Canción', title: track?.name ?? 'Tu canción', text: track?.artistName ?? '' },
    { kicker: 'Escucha', title: formatMinutes(game.snapshot.listeningMinutes), text: 'Tiempo contado en la temporada visible.' },
    { kicker: 'Liga', title: `#${weekly?.rank ?? 1}`, text: `${weekly && weekly.movement >= 0 ? 'Subes' : 'Bajas'} ${Math.abs(weekly?.movement ?? 0)} puestos respecto a la foto anterior.` },
  ]
  const current = slides[slide] ?? slides[0]

  async function share() {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, 1080, 1920)
    ctx.fillStyle = '#1db954'
    ctx.font = '700 42px Outfit, sans-serif'
    ctx.fillText('BEATLEAGUE WRAPPED', 80, 220)
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 92px Syne, sans-serif'
    wrapText(ctx, current.title, 80, 460, 920, 110)
    ctx.fillStyle = '#c8c8c8'
    ctx.font = '500 40px Outfit, sans-serif'
    wrapText(ctx, current.text, 80, 860, 920, 56)
    ctx.fillStyle = '#1db954'
    ctx.font = '600 36px Outfit, sans-serif'
    ctx.fillText('Tu música. Tus amigos. Tu liga.', 80, 1700)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) return
    const file = new File([blob], 'beatleague-wrapped.png', { type: 'image/png' })
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'BeatLeague Wrapped', text: 'Tu música. Tus amigos. Tu liga.' })
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'beatleague-wrapped.png'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="grid gap-4">
      <PageHead kicker="Semana" title="Wrapped" text="Una tarjeta por dato. Compártela cuando la liga te quede bien." />
      <section className="rise grid min-h-[420px] content-between rounded-[32px] bg-[radial-gradient(circle_at_top_left,rgba(29,185,84,0.35),transparent_40%),linear-gradient(180deg,#173222,#0f0f0f)] p-6">
        <p className="text-xs font-semibold tracking-[0.2em] text-spotify uppercase">{current.kicker}</p>
        <h2 className="font-display text-6xl leading-none">{current.title}</h2>
        <p className="text-muted">{current.text}</p>
      </section>
      <div className="flex gap-2">
        {slides.map((item, index) => (
          <button key={item.kicker} type="button" aria-label={item.kicker} onClick={() => setSlide(index)} className={`h-1.5 flex-1 rounded-full ${index === slide ? 'bg-spotify' : 'bg-white/15'}`} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={() => setSlide((value) => (value + slides.length - 1) % slides.length)}>Anterior</Button>
        <Button onClick={() => setSlide((value) => (value + 1) % slides.length)}>Siguiente</Button>
      </div>
      <Button variant="gold" full onClick={() => void share()}>Compartir tarjeta</Button>
    </div>
  )
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, line: number) {
  const words = text.split(' ')
  let row = ''
  let cursor = y
  for (const word of words) {
    const test = `${row}${word} `
    if (ctx.measureText(test).width > max) {
      ctx.fillText(row, x, cursor)
      row = `${word} `
      cursor += line
    } else row = test
  }
  ctx.fillText(row, x, cursor)
}
