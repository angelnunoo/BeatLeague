import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { artistById, trackById } from '../data/catalog'
import { RARITY_LABEL, RARITY_STARS } from '../domain/progression'
import type { Rarity } from '../types'

export function Button({
  variant = 'primary',
  full = false,
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'gold' | 'danger'; full?: boolean }) {
  const look = {
    primary: 'bg-spotify text-black shadow-[0_10px_30px_rgba(29,185,84,0.25)]',
    ghost: 'border border-white/10 bg-white/5 text-white',
    gold: 'bg-gold text-black',
    danger: 'bg-danger text-white',
  }[variant]
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-40 ${look} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-[28px] border border-white/8 bg-panel/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)] ${className}`}>{children}</section>
}

export function Chip({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'green' | 'gold' }) {
  const look = tone === 'green' ? 'bg-spotify/15 text-spotify' : tone === 'gold' ? 'bg-gold/15 text-gold' : 'bg-white/8 text-muted'
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${look}`}>{children}</span>
}

export function Meter({ value, gold = false }: { value: number; gold?: boolean }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className={`bar-fill h-full rounded-full ${gold ? 'bg-gold' : 'bg-spotify'}`} style={{ width: `${Math.max(4, Math.min(100, value * 100))}%` }} />
    </div>
  )
}

export function Mark({
  name,
  palette,
  size = 52,
  glow = false,
  ring,
}: {
  name: string
  palette: [string, string]
  size?: number
  glow?: boolean
  ring?: string
}) {
  const initial = name.trim().slice(0, 1).toUpperCase()
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center rounded-full font-display font-bold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${palette[0]}, ${palette[1]})`,
        boxShadow: glow
          ? `0 0 0 3px #0f0f0f, 0 0 0 6px ${ring ?? '#1DB954'}, 0 0 28px rgba(29,185,84,0.45)`
          : ring
            ? `0 0 0 3px #0f0f0f, 0 0 0 6px ${ring}`
            : undefined,
        fontSize: size * 0.38,
      }}
      aria-hidden
    >
      {initial}
    </span>
  )
}

export function CoverArt({ trackId, blurred = false, className = '' }: { trackId: string; blurred?: boolean; className?: string }) {
  const track = trackById(trackId)
  const artist = artistById(track.artistId)
  return (
    <div className={`relative overflow-hidden rounded-[24px] bg-ink ${className}`}>
      <div
        className="absolute inset-[-18%]"
        style={{
          background: `radial-gradient(circle at 28% 18%, ${artist.palette[0]}, transparent 36%), linear-gradient(160deg, ${artist.palette[1]}, #090909 78%)`,
          filter: blurred ? 'blur(16px) saturate(1.2)' : undefined,
        }}
      />
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(135deg, transparent 0 10px, rgba(255,255,255,0.08) 10px 11px)' }} />
      <div className="relative flex aspect-square flex-col justify-between p-3">
        <span className="text-[10px] font-semibold tracking-[0.18em] text-white/80 uppercase">{blurred ? 'Misterio' : artist.genre}</span>
        <span className={`font-display text-3xl leading-none ${blurred ? 'opacity-0' : ''}`}>{track.album.slice(0, 1)}</span>
      </div>
    </div>
  )
}

export function Wave({ live }: { live: boolean }) {
  return (
    <div className="wave flex h-14 items-end gap-1" aria-hidden>
      {Array.from({ length: 16 }, (_, index) => (
        <span
          key={index}
          className="w-full rounded-full bg-spotify"
          style={{
            height: '100%',
            animationDelay: `${index * 0.06}s`,
            animationPlayState: live ? 'running' : 'paused',
            transform: live ? undefined : 'scaleY(0.28)',
          }}
        />
      ))}
    </div>
  )
}

export function Stars({ rarity }: { rarity: Rarity }) {
  return (
    <span className="text-gold" aria-label={RARITY_LABEL[rarity]}>
      {'★'.repeat(RARITY_STARS[rarity])}
      <span className="text-white/20">{'★'.repeat(5 - RARITY_STARS[rarity])}</span>
    </span>
  )
}

export function PageHead({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <header className="mb-4">
      <p className="text-xs font-semibold tracking-[0.22em] text-spotify uppercase">{kicker}</p>
      <h1 className="mt-1 font-display text-4xl leading-none">{title}</h1>
      {text ? <p className="mt-2 max-w-xl text-sm text-muted">{text}</p> : null}
    </header>
  )
}
