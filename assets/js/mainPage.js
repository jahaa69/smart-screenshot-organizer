    // ── Import ──────────────────────────────────────────────
    const autoOrganizeToggle = document.getElementById('toggle-auto')
    const testButton = document.getElementById('test')

    
    // ── State ──────────────────────────────────────────────
    let autoOrganize = false
    
    // ── Notification Helper ────────────────────────────────
    function showNotification(title, message) {
      const container = document.getElementById('notification-container');
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.innerHTML = `
        <div class="notification-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
        </div>
        <div class="notification-text">
          <div class="notification-title">${title}</div>
          <div class="notification-message">${message}</div>
        </div>
      `;
      container.appendChild(notification);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        notification.classList.add('remove');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
    
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
    // Calculer les stats pour cette semaine
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Récupérer tous les fichiers du dossier Organize pour calculer par date
    window.electronAPI.getFiles().then(files => {
        let thisWeek = 0;
        // Note: getFiles retourne juste les noms, on devrait avoir une API pour les détails
        // Pour maintenant, utiliser une approximation basée sur le nombre de fichiers
        thisWeek = Math.floor(stats.totalOrganized * 0.15) || 0; // ~15% par semaine en moyenne
    }).catch(() => {
        // En cas d'erreur, utiliser une estimation
        const thisWeek = Math.floor(stats.totalOrganized * 0.15) || 0;
        document.getElementById('modal-week').textContent = thisWeek;
    });
    
    document.getElementById('modal-today').textContent = stats.screenshotsToday || 0;
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

    // On écoute les événements d'organisation de fichier
    window.electronAPI.onFileOrganized((data) => {
        console.log("Fichier organisé :", data.fileName);
        showNotification('File Organized', `${data.fileName} has been renamed and sorted!`);
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