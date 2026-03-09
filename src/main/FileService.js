const fs = require('fs/promises');
const path = require('path');
const { getSourceDir, getTargetDir } = require('./PathConfig');

function inferCategoryFromName(fileName) {
  const base  = fileName.replace(/\.[^.]+$/, '');
  const parts = base.split('_');
  const suffix = parts[parts.length - 1];
  const knownCategories = ['Chrome', 'Firefox', 'Code', 'Terminal', 'Other'];
  if (knownCategories.includes(suffix)) return suffix;
  return 'Other';
}

async function ensureTargetDirExists(dir = getTargetDir()) {
  await fs.mkdir(dir, { recursive: true });
}

async function moveFile(fileName) {
  if (!fileName) {
    throw new Error('Aucun nom de fichier fourni');
  }

  const sourceDir = getSourceDir();
  const targetDir = getTargetDir();

  const oldFilePath = path.join(sourceDir, fileName);
  const newFilePath = path.join(targetDir, fileName);

  try {
    await ensureTargetDirExists(targetDir);
    await fs.rename(oldFilePath, newFilePath);
    
    console.log(`Succes : ${fileName} deplace vers /Organize`);
    return newFilePath;
  } catch (error) {
    console.error(`Erreur lors du deplacement de ${fileName}:`, error.message);
    throw error;
  }
}

async function listOrganizedFiles(baseDir) {
  try {
    const targetDir = baseDir || getTargetDir();
    await ensureTargetDirExists(targetDir);
    
    const result = [];
    
    // Lire tous les fichiers dans Organize/ et ses sous-dossiers
    async function scanDir(dirPath, relativePath = '') {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relPath = relativePath ? path.join(relativePath, entry.name) : entry.name;
        
        if (entry.isFile() && !entry.name.startsWith('.')) {
          const stat = await fs.stat(fullPath);
          const iso = stat.mtime.toISOString();
          
          // Le tag est le dossier parent (relativePath)
          const tag = relativePath || 'Untagged';
          
          result.push({
            name: entry.name,
            category: inferCategoryFromName(entry.name),
            dateTaken: iso,
            modified: iso,
            size: stat.size,
            tags: [tag],
            filePath: fullPath,
          });
        } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
          // Récursif dans les sous-dossiers
          await scanDir(fullPath, relPath);
        }
      }
    }
    
    await scanDir(targetDir);
    return result;
  } catch (error) {
    console.error('Erreur lors de la lecture du dossier Organize:', error.message);
    return [];
  }
}

async function renameFile(filePath, newName) {
  if (!filePath || !newName) {
    throw new Error('filePath and newName are required');
  }

  const newPath = path.join(path.dirname(filePath), newName);

  try {
    await fs.rename(filePath, newPath);
    console.log(`Succès : ${path.basename(filePath)} renommé en ${newName}`);
    return newPath;
  } catch (error) {
    console.error(`Erreur lors du renommage:`, error.message);
    throw error;
  }
}

async function updateFileTags(filePath, tags) {
  if (!filePath || !tags || tags.length === 0) {
    throw new Error('filePath and tags are required');
  }

  // tags[0] est le nouveau tag (dossier)
  const newTag = tags[0];
  const fileName = path.basename(filePath);
  
  try {
    const targetRoot = getTargetDir();
    let newFilePath;
    
    if (newTag === 'Untagged') {
      // Si le tag est "Untagged", le fichier va à la racine de Organize/
      newFilePath = path.join(targetRoot, fileName);
    } else {
      // Sinon, créer le dossier tag s'il n'existe pas
      const newTagPath = path.join(targetRoot, newTag);
      await fs.mkdir(newTagPath, { recursive: true });
      newFilePath = path.join(newTagPath, fileName);
    }
    
    // Si le fichier n'est pas déjà à la bonne place, le déplacer
    if (filePath !== newFilePath) {
      // Déplacer le fichier
      try {
        await fs.rename(filePath, newFilePath);
      } catch (error) {
        // Si source et destination sont les mêmes, ignorer l'erreur
        if (filePath !== newFilePath) throw error;
      }
      
      // Supprimer le dossier parent s'il est vide (et n'est pas Organize)
      const currentDir = path.dirname(filePath);
      const currentDirName = path.basename(currentDir);
      if (currentDirName !== 'Organize') {
        try {
          const entries = await fs.readdir(currentDir);
          if (entries.length === 0) {
            await fs.rmdir(currentDir);
            console.log(`Dossier vide ${currentDir} supprimé`);
          }
        } catch (e) {
          // Dossier non vide ou autre erreur, ignorer
        }
      }
    }
    
    console.log(`Tag mis à jour: ${fileName} → ${newTag}`);
    return { success: true, newPath: newFilePath };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du tag:`, error.message);
    throw error;
  }
}

module.exports = { moveFile, listOrganizedFiles, renameFile, updateFileTags };