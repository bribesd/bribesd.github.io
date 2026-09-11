(() => {
  const playlistId = '2876952764'
  const playlistUrl = `https://music.163.com/outchain/player?type=0&id=${playlistId}&auto=1&height=86`
  const sourceUrl = `https://music.163.com/#/my/m/music/playlist?id=${playlistId}`

  const createPlayer = () => {
    const aside = document.getElementById('aside-content')
    if (!aside || document.getElementById('music-player-card')) return

    const card = document.createElement('div')
    card.id = 'music-player-card'
    card.className = 'card-widget music-player-card'
    card.innerHTML = `
      <div class="item-headline music-player-headline">
        <i class="fas fa-music"></i>
        <span>音乐</span>
        <a class="music-player-source" href="${sourceUrl}" target="_blank" rel="noopener" title="在网易云音乐中打开歌单">
          <i class="fas fa-external-link-alt"></i>
        </a>
      </div>
      <iframe
        class="music-player-frame"
        src="${playlistUrl}"
        frameborder="no"
        marginwidth="0"
        marginheight="0"
        scrolling="no"
        allow="autoplay"
        title="网易云音乐歌单播放器"
      ></iframe>
    `

    const announcement = aside.querySelector('.card-announcement')
    if (announcement) {
      announcement.insertAdjacentElement('afterend', card)
    } else {
      aside.prepend(card)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createPlayer, { once: true })
  } else {
    createPlayer()
  }
})()
