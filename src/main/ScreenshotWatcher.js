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
        console.log(`[getFiles] Checking directory: ${pathImg}`);
        
        // Vérifier que le dossier existe
        try {
          await fsp.access(pathImg);
        } catch {
          console.log(`[getFiles] Directory does not exist: ${pathImg}`);
          resolve([]);
          return;
        }
        
        const files = await fsp.readdir(pathImg);
        console.log(`[getFiles] All files in directory:`, files);
        
        const ORGANIZE_DIR = 'Organize';
        
        // Filtrer : exclure le dossier Organize et ne garder que les fichiers
        const validFiles = [];
        for (const file of files) {
          if (file === ORGANIZE_DIR) {
            console.log(`[getFiles] Skipping Organize folder`);
            continue;
          }
          
          const filePath = path.join(pathImg, file);
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
