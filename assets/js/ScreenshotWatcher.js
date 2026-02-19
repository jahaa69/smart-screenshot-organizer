const pathImg = require('C:\Users\assun\Pictures\Screenshots')
const fs = require('fs')
const chokidar = require('chokidar')

// Initialize watcher.
const watcher = chokidar.watch(pathImg, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true
})

// recupere le nom des fichiers dans le dossier
function getFiles() {
  fs.readdir(pathImg, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err)
      return
    }
    console.log('Files in directory:', files)
  }) 
}

//export la fonction getFiles pour pouvoir l'utiliser dans mainPage.js
module.exports = {
  getFiles
}