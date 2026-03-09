// Path to the directory screenshots (basé sur PathConfig, donc dynamique)
const fs = require('fs');
const chokidar = require('chokidar');
const { getSourceDir } = require('./PathConfig');

let pathImg = getSourceDir();

// Initialize watcher on the current screenshots directory
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
        // Récupérer à chaque appel le dossier courant des screenshots
        const currentDir = getSourceDir();
        console.log(`[getFiles] Checking directory: ${currentDir}`);
        
        // Vérifier que le dossier existe
        try {
          await fsp.access(currentDir);
        } catch {
          console.log(`[getFiles] Directory does not exist: ${currentDir}`);
          resolve([]);
          return;
        }
        
        const files = await fsp.readdir(currentDir);
        console.log(`[getFiles] All files in directory:`, files);
        
        const ORGANIZE_DIR = 'Organize';
        
        // Filtrer : exclure le dossier Organize et ne garder que les fichiers
        const validFiles = [];
        for (const file of files) {
          if (file === ORGANIZE_DIR) {
            console.log(`[getFiles] Skipping Organize folder`);
            continue;
          }
          
          const filePath = path.join(currentDir, file);
          const stats = await fsp.stat(filePath);
          if (stats.isFile()) { // Vérifier que c'est un fichier
            console.log(`[getFiles] Found file: ${file}`);
            validFiles.push(file);
          } else {
            console.log(`[getFiles] Skipping non-file: ${file} (isDirectory: ${stats.isDirectory()})`);
          }
        }
        
        console.log(`[getFiles] Valid files to process:`, validFiles);
        resolve(validFiles);
      } catch (err) {
        console.error(`[getFiles] Error reading directory:`, err);
        reject(err);
      }
    })();
  })
}


//export la fonction getFiles pour pouvoir l'utiliser dans mainPage.js
module.exports = {
  getFiles
}
