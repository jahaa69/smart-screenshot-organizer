    // ── Import ──────────────────────────────────────────────
    const autoOrganizeToggle = document.getElementById('toggle-auto')
    const testButton = document.getElementById('test')

    
    // ── State ──────────────────────────────────────────────
    let autoOrganize = false
    
    function formatBytes(bytes) {
        if (!bytes || bytes <= 0) return '0 B';
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const value = bytes / Math.pow(k, i);
        return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
    }

    // ── Update UI from stats object ────────────────────────
    function applyStats(stats) {
        document.getElementById('val-today').textContent     = stats.screenshotsToday ?? 0
        document.getElementById('val-total').textContent     = stats.totalOrganized   ?? 0
        document.getElementById('val-last').textContent      = stats.lastFile         || '—'
        document.getElementById('val-organized').textContent = stats.lastOrganized    || '—'
        document.getElementById('val-next').textContent      = stats.nextFile         || '—'
        document.getElementById('disk-fill').style.width     = ((stats.diskUsage ?? 0.28) * 100) + '%'
        document.getElementById('disk-size-label').textContent = formatBytes(stats.folderSizeBytes || 0)
        
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

// ── Modal Logic ──────────────────────────────
const modal = document.getElementById('stats-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalButtonClose = document.getElementById('modal-button-close');
const statsCards = document.querySelectorAll('.stat-card');

// Ouvrir le modal quand on clique sur une stat card
statsCards.forEach(card => {
    card.addEventListener('click', async () => {
        const stats = await window.electronAPI.getStats();
        updateModalStats(stats);
        modal.classList.add('active');
    });
});

// Fermer le modal
function closeModal() {
    modal.classList.remove('active');
}

modalCloseBtn.addEventListener('click', closeModal);
modalButtonClose.addEventListener('click', closeModal);

// Fermer en cliquant en dehors du modal
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

function updateModalStats(stats) {
    document.getElementById('modal-today').textContent = stats.screenshotsToday || 0;
    document.getElementById('modal-week').textContent = stats.screenshotsThisWeek ?? 0;
    document.getElementById('modal-total').textContent = stats.totalOrganized || 0;
}
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