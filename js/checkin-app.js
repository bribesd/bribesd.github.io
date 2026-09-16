(() => {
  // ====== Supabase 连接配置 ======
  const SUPABASE_URL = 'https://vjnthiilsyvvjtbwbeon.supabase.co'
  const SUPABASE_ANON_KEY = 'sb_publishable_iRDg00rmgldFu6QxoU9CJw_uFwO414N'

  const $ = (id) => document.getElementById(id)
  let supabase = null
  let user = null

  const init = () => {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      $('checkin-msg').textContent = 'Supabase SDK 加载失败，请检查网络。'
      return
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    bindEvents()
    listenAuth()
    restoreSession()
  }

  const bindEvents = () => {
    $('checkin-send')?.addEventListener('click', sendMagicLink)
    $('checkin-submit')?.addEventListener('click', doCheckin)
    $('checkin-logout')?.addEventListener('click', doLogout)
  }

  const restoreSession = async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) return console.error(error)
    if (data?.session?.user) {
      user = data.session.user
      showMain()
    } else {
      // 检查 URL 中是否有回调错误参数（如 redirect 未加白名单）
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.slice(1))
      const errDesc = params.get('error_description') || hashParams.get('error_description')
      if (errDesc) setMsg('登录失败：' + errDesc)
    }
  }

  const listenAuth = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !user) {
        user = session.user
        showMain()
      }
    })
  }

  const sendMagicLink = async () => {
    const email = $('checkin-email').value.trim()
    if (!email) return setMsg('请输入邮箱地址')
    setMsg('发送中...')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/checkin/' }
    })
    setMsg(error ? '发送失败：' + error.message : '登录链接已发送，请查收邮件。')
  }

  const showMain = async () => {
    $('checkin-auth').style.display = 'none'
    $('checkin-main').style.display = ''
    $('checkin-status').textContent = `当前用户：${user.email}`
    await loadToday()
    await loadHistory()
  }

  const todayStr = () => new Date().toISOString().slice(0, 10)

  const loadToday = async () => {
    const { data, error } = await supabase
      .from('checkins')
      .select('id, note, created_at')
      .eq('user_id', user.id)
      .gte('created_at', todayStr())
      .limit(1)
    if (error) return console.error(error)
    $('checkin-status').textContent = data?.length
      ? `今日已打卡 ✅（${data[0].created_at}）`
      : '今日还未打卡 ❌'
  }

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('checkins')
      .select('note, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) return console.error(error)
    $('checkin-list').innerHTML = (data || [])
      .map((c) => `<li>📅 ${c.created_at.slice(0, 10)} ${c.note || ''}</li>`)
      .join('')
  }

  const doCheckin = async () => {
    const note = $('checkin-note').value.trim()
    const file = $('checkin-file').files[0]
    const btn = $('checkin-submit')
    btn.disabled = true

    try {
      let photoUrl = null
      if (file) {
        const path = `${user.id}/${Date.now()}-${file.name}`
        const { error: upErr } = await supabase.storage
          .from('checkin-photos')
          .upload(path, file)
        if (upErr) throw upErr
        photoUrl = supabase.storage.from('checkin-photos').getPublicUrl(path).data.publicUrl
      }

      const { error: dbErr } = await supabase
        .from('checkins')
        .insert({ user_id: user.id, note, photo_url: photoUrl })
      if (dbErr) throw dbErr

      $('checkin-note').value = ''
      $('checkin-file').value = ''
      await loadToday()
      await loadHistory()
    } catch (e) {
      alert('打卡失败：' + e.message)
    } finally {
      btn.disabled = false
    }
  }

  const doLogout = async () => {
    await supabase.auth.signOut()
    location.reload()
  }

  const setMsg = (text) => {
    const el = $('checkin-msg')
    if (el) el.textContent = text
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true })
  } else {
    init()
  }
})()
