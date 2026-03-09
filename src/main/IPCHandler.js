const { ipcMain, Notification } = require("electron");
const { getFiles } = require("./ScreenshotWatcher");
const { moveFile, listOrganizedFiles } = require("./FileService.js");
const { getStats } = require("./StatFile.js");

let mainWindow = null;
let isAutoOrganizeActive = false;
let watcherInterval = null; // Pour stocker la boucle de recherche

// Function to show file organized notification to renderer
function notifyFileOrganized(fileName) {
  try {
    console.log(`[FileOrganized] Notifying renderer about: ${fileName}`);
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('file-organized', {
        fileName: fileName,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('[FileOrganized] Error sending notification:', err);
  }
}

async function notifyStatsUpdate() {
  if (mainWindow && mainWindow.webContents) {
    const stats = await getStats();
    mainWindow.webContents.send('stats-updated', {
      ...stats,
      isAutoOrganize: isAutoOrganizeActive
    });
  }
}

async function processAutoOrganization() {
  if (!isAutoOrganizeActive) return;

  try {
    const files = await getFiles();
    if (files && files.length > 0) {
      console.log(`${files.length} fichiers trouvés. Organisation en cours...`);
      
      for (const file of files) {
        try {
          await moveFile(file); // On déplace chaque fichier trouvé
          notifyFileOrganized(file); // Notifier le renderer
          await notifyStatsUpdate(); // Notifier le renderer après chaque déplacement
        } catch (err) {
          console.error(`Erreur lors du déplacement de ${file}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("Erreur pendant l'auto-organisation:", err);
  }
}

function setupIPCHandlers(win) {
  mainWindow = win;
  
  // Active ou désactive la surveillance
  ipcMain.handle("set-auto-organize", (event, value) => {
    isAutoOrganizeActive = value;

    if (isAutoOrganizeActive) {
      console.log("Auto-organize: START");
      // On lance une vérification toutes les 5 secondes (par exemple)
      if (!watcherInterval) {
        watcherInterval = setInterval(processAutoOrganization, 5000);
        // On lance aussi une première exécution immédiate
        processAutoOrganization();
      }
    } else {
      console.log("Auto-organize: STOP");
      // On arrête la boucle
      if (watcherInterval) {
        clearInterval(watcherInterval);
        watcherInterval = null;
      }
    }
    return isAutoOrganizeActive;
  });

  // Les autres handlers restent simples
  ipcMain.handle("get-files", async () => await getFiles());

  ipcMain.handle("get-organized-files", async () => {
    try {
      return await listOrganizedFiles();
    } catch (err) {
      console.error("Erreur pendant la récupération des fichiers organisés:", err);
      return [];
    }
  });
  
  ipcMain.handle("start-watcher", async () => {
    // Ce handler peut être utilisé pour démarrer le watcher si nécessaire
    // Pour le moment, il retourne juste un succès
    console.log("Watcher started");
    return true;
  });
  
  ipcMain.handle("move-file", async (event, fileName) => {
    const result = await moveFile(fileName);
    notifyFileOrganized(fileName); // Notifier le renderer
    await notifyStatsUpdate(); // Notifier après déplacement manuel
    return result;
  });

  ipcMain.handle("get-stats", async () => {
    const fileStats = await getStats();
    return {
      ...fileStats,
      isAutoOrganize: isAutoOrganizeActive
    };
  });
}

module.exports = { setupIPCHandlers };