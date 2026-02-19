    // ── Import ──────────────────────────────────────────────
    const autoOrganizeToggle = document.getElementById('toggle-auto')
    const testButton = document.getElementById('test')

    
    // ── State ──────────────────────────────────────────────
    let autoOrganize = false
    
    // ── Update UI from stats object ────────────────────────
    function applyStats(stats) {
        document.getElementById('val-today').textContent     = stats.screenshotsToday ?? 0
        document.getElementById('val-total').textContent     = stats.totalOrganized   ?? 0
        document.getElementById('val-last').textContent      = stats.lastFile         || '—'
        document.getElementById('val-organized').textContent = stats.lastOrganized    || '—'
        document.getElementById('val-next').textContent      = stats.nextFile         || '—'
        document.getElementById('disk-fill').style.width     = ((stats.diskUsage ?? 0.28) * 100) + '%'
        
        autoOrganize = stats.isAutoOrganize ?? true
        document.getElementById('toggle-auto').classList.toggle('on', autoOrganize)
    }
    
    // ── Toggle auto-organize ───────────────────────────────
    async function toggleAuto() {
        console.log('Toggling auto-organize')
        autoOrganize = !autoOrganize
        document.getElementById('toggle-auto').classList.toggle('on', autoOrganize)
        try {
            await window.electronAPI.setAutoOrganize(autoOrganize)
        } catch(e) {}
    }
    autoOrganizeToggle.addEventListener('click', toggleAuto)

    // ── Get files ───────────────────────────────

    async function getFiles() {
        try {
            const files = await window.electronAPI.getFiles()
            console.log('Files in directory:', files)
        } catch(e) {
            console.error('Error getting files:', e)
        }
    }
    testButton.addEventListener('click', getFiles)

    // ── Boot ───────────────────────────────────────────────
    async function init() {
      try {
        const stats = await window.electronAPI.getStats()
        applyStats(stats)
        await window.electronAPI.startWatcher()
        window.electronAPI.onStatsUpdated(applyStats)
      } catch(e) {
        // Dev mode outside Electron — load demo data
        applyStats({
          screenshotsToday: 12,
          totalOrganized: 256,
          lastFile: 'ScreenShot_2026-04-28Chrome.png',
          lastOrganized: 'ScreenShot_2026-04-27Chrome.png',
          nextFile: 'ScreenShot_2026-04-26Chrome.png',
          isAutoOrganize: true,
          diskUsage: 0.28,
        })
      }
    }

    init()