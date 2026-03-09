const path = require('path');
const os = require('os');

// Dossier source : où chercher les images à trier (modifiable via setBaseDir)
let baseScreenshotsDir = path.join(os.homedir(), 'Pictures', 'Screenshots');

// Dossier Organize : TOUJOURS en dur dans ~/Pictures/Screenshots/Organize
const ORGANIZE_DIR = path.join(os.homedir(), 'Pictures', 'Screenshots', 'Organize');

function setBaseDir(newBase) {
  if (typeof newBase === 'string' && newBase.trim()) {
    baseScreenshotsDir = newBase;
  }
}

function getBaseDir() {
  return baseScreenshotsDir;
}

function getSourceDir() {
  return baseScreenshotsDir;
}

function getTargetDir() {
  return ORGANIZE_DIR;
}

module.exports = {
  setBaseDir,
  getBaseDir,
  getSourceDir,
  getTargetDir,
};

