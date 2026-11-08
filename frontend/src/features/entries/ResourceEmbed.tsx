interface Embed {
  src: string
  title: string
  /** Fixed player height in px; video players use a 16:9 ratio instead. */
  height?: number
}

function youtubeId(url: URL): string | null {
  const host = url.hostname.replace(/^(www\.|m\.)/, '')
  if (host === 'youtu.be') return url.pathname.slice(1) || null
  if (host !== 'youtube.com' && host !== 'youtube-nocookie.com') return null
  if (url.pathname === '/watch') return url.searchParams.get('v')
  const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)
  return match?.[1] ?? null
}

function toEmbed(href: string): Embed | null {
  const url = new URL(href)
  const host = url.hostname.replace(/^www\./, '')

  const yt = youtubeId(url)
  if (yt && /^[\w-]{6,}$/.test(yt)) {
    return { src: `https://www.youtube-nocookie.com/embed/${yt}`, title: 'Vidéo YouTube' }
  }

  if (host === 'vimeo.com') {
    const id = url.pathname.match(/^\/(\d+)/)?.[1]
    if (id) return { src: `https://player.vimeo.com/video/${id}`, title: 'Vidéo Vimeo' }
  }

  if (host === 'open.spotify.com') {
    const match = url.pathname.match(/^\/(?:intl-[\w-]+\/)?(track|album|playlist|episode|show|artist)\/(\w+)/)
    if (match) {
      const [, kind, id] = match
      const height = kind === 'track' || kind === 'episode' ? 152 : 352
      return { src: `https://open.spotify.com/embed/${kind}/${id}`, title: 'Lecteur Spotify', height }
    }
  }

  if (host === 'soundcloud.com' && url.pathname.split('/').filter(Boolean).length >= 2) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&color=%23111111&visual=false`
    return { src, title: 'Lecteur SoundCloud', height: 166 }
  }

  return null
}

/** Inline player for known media hosts, otherwise a link card. `href` must already be a vetted http(s) URL. */
export function ResourceEmbed({ href, label }: { href: string; label?: string }) {
  const embed = toEmbed(href)

  if (embed) {
    return (
      <div
        className={embed.height ? 'res-embed' : 'res-embed res-embed--video'}
        style={embed.height ? { height: embed.height } : undefined}
      >
        <iframe
          src={embed.src}
          title={embed.title}
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    )
  }

  const host = new URL(href).hostname.replace(/^www\./, '')
  return (
    <a className="res-card" href={href} target="_blank" rel="noopener noreferrer">
      <span className="res-card-host">{host}</span>
      <span className="res-card-title">{label || href}</span>
      <span className="res-card-cta">Ouvrir la ressource ↗</span>
    </a>
  )
}
