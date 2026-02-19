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
    

    // ── moove files ───────────────────────────────

async function organizeFiles() {
  try {
    const files = await window.electronAPI.getFiles()

    if (files.length === 0) {
      console.log('No files to move')
      return
    }

    const fileToMove = files[0] // exemple : premier fichier
    const result = await window.electronAPI.moveFile(fileToMove)

    console.log('File moved:', result)
  } catch (e) {
    console.error('Error organizing files:', e)
  }
}

testButton.addEventListener('click', async () => {
    testButton.disabled = true; // Évite les doubles clics
    try {
        console.log('Test manuel lancé...');
        await organizeFiles(); // Déplace un fichier
        
        // On demande immédiatement les nouvelles stats pour rafraîchir l'écran
        const freshStats = await window.electronAPI.getStats();
        applyStats(freshStats);
    } finally {
        testButton.disabled = false;
    }
});
// ── Boot ───────────────────────────────────────────────
async function init() {
  try {
    const stats = await window.electronAPI.getStats();
    applyStats(stats);
    
    // On démarre le processus côté Main
    await window.electronAPI.startWatcher();
    
    // On écoute les futures mises à jour envoyées par le Main
    window.electronAPI.onStatsUpdated((newStats) => {
        console.log("Stats auto-actualisées :", newStats);
        applyStats(newStats);
    });
  } catch(e) {
    console.warn("Impossible de charger les stats initiales, utilisation des valeurs par défaut.");
    applyStats({
      screenshotsToday: 0,
      totalOrganized: 0,
      lastFile: '—',
      isAutoOrganize: false,
      diskUsage: 0
    });
  }
}

    init()