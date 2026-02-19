// Path to the directory screenshots default on Windows ingnore user's namme pc
const pathImg = `${process.env.HOME || process.env.USERPROFILE}/Pictures/Screenshots`
const fs = require('fs')
const chokidar = require('chokidar')

// Initialize watcher.
const watcher = chokidar.watch(pathImg, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
})

// recupere le nom des fichiers dans le dossier (exclut le dossier Organize)
function getFiles() {
  return new Promise((resolve, reject) => {
    const fsp = require('fs/promises');
    const path = require('path');
    
    (async () => {
      try {
        const files = await fsp.readdir(pathImg);
        const ORGANIZE_DIR = 'Organize';
        
        // Filtrer : exclure le dossier Organize et ne garder que les fichiers
        const validFiles = [];
        for (const file of files) {
          if (file === ORGANIZE_DIR) continue; // Exclure le dossier Organize
          
          const filePath = path.join(pathImg, file);
          const stats = await fsp.stat(filePath);
          if (stats.isFile()) { // Vérifier que c'est un fichier
            validFiles.push(file);
          }
        }
        
        console.log('Files in directory:', validFiles);
        resolve(validFiles);
      } catch (err) {
        console.error('Error reading directory:', err);
        reject(err);
      }
    })();
  })
}


//export la fonction getFiles pour pouvoir l'utiliser dans mainPage.js
module.exports = {
  getFiles
}
