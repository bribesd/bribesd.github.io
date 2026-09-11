(() => {
  const trackId = '5kqIPrATaCc2LqxVWzQGbk'
  const playerUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=oembed`
  const sourceUrl = `https://open.spotify.com/track/${trackId}`

  const createPlayer = () => {
    if (document.getElementById('music-player-card')) return

    const card = document.createElement('div')
    card.id = 'music-player-card'
    card.className = 'music-player-card music-player-floating'
    card.innerHTML = `
      <div class="item-headline music-player-headline">
        <i class="fas fa-music"></i>
        <span>正在播放 · 7 Years</span>
        <a class="music-player-source" href="${sourceUrl}" target="_blank" rel="noopener" title="在 Spotify 中打开歌曲">
          <i class="fas fa-external-link-alt"></i>
        </a>
      </div>
      <iframe
        class="music-player-frame"
        src="${playerUrl}"
        frameborder="0"
        allowfullscreen
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Spotify 播放器：7 Years"
      ></iframe>
    `

    document.body.append(card)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPlayer, { once: true })
  } else {
    createPlayer()
  }
})()
