const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const fsSync = require('fs');

// Configuration des chemins (on cible le dossier Organize créé par FileService)
const SOURCE_DIR = path.join(os.homedir(), 'Pictures', 'Screenshots');
const ORGANIZE_DIR = path.join(SOURCE_DIR, 'Organize');

async function getDiskUsageRatio() {
    try {
        console.log(`[getDiskUsageRatio] Checking partition for path: ${SOURCE_DIR}`);
        
        // Obtenir l'info d'espace disque de la partition où se trouve le dossier
        // Utiliser le dossier SOURCE_DIR qui existe probablement
        let checkPath = SOURCE_DIR;
        
        // Si SOURCE_DIR n'existe pas, utiliser le home directory
        try {
            await fs.access(checkPath);
        } catch {
            console.log(`[getDiskUsageRatio] SOURCE_DIR doesn't exist, using home directory`);
            checkPath = os.homedir();
        }
        
        console.log(`[getDiskUsageRatio] Using path for statfs: ${checkPath}`);
        
        // Utiliser statfs pour obtenir l'espace disque de la partition
        const stats = fsSync.statfsSync(checkPath);
        
        console.log(`[getDiskUsageRatio] Stats retrieved:`, {
            blocks: stats.blocks,
            bfree: stats.bfree,
            bavail: stats.bavail
        });
        
        // stats.blocks = nombre total de blocs
        // stats.bfree = blocs libres
        // stats.bavail = blocs disponibles pour l'utilisateur
        
        const totalBlocks = stats.blocks;
        const freeBlocks = stats.bfree;
        const usedBlocks = totalBlocks - freeBlocks;
        const diskUsageRatio = usedBlocks / totalBlocks;
        
        console.log(`[getDiskUsageRatio] Disk usage: ${(diskUsageRatio * 100).toFixed(1)}% (${usedBlocks}/${totalBlocks} blocks)`);
        
        return Math.min(diskUsageRatio, 1); // S'assurer que c'est entre 0 et 1
    } catch (error) {
        console.error("[getDiskUsageRatio] Error:", error.message);
        return 0.28; // valeur par défaut en cas d'erreur
    }
}

async function getStats() {
    try {
        console.log("[getStats] Starting...");
        
        // Initialiser les stats par défaut
        let screenshotsToday = 0;
        let totalOrganized = 0;
        let lastFile = "Aucun";
        
        // 1. Essayer de lire le contenu du dossier organisé
        try {
            await fs.access(ORGANIZE_DIR);
            console.log("[getStats] Organize folder exists");
            
            const files = await fs.readdir(ORGANIZE_DIR);
            console.log(`[getStats] Found ${files.length} files`);
            
            // On récupère les détails de chaque fichier (taille et date de création)
            const fileDetails = await Promise.all(
                files.map(async (file) => {
                    const filePath = path.join(ORGANIZE_DIR, file);
                    const stats = await fs.stat(filePath);
                    return { name: file, stats };
                })
            );

            // 2. Calculer le total organisé
            totalOrganized = files.length;

            // 3. Calculer les screenshots d'aujourd'hui
            const today = new Date().toDateString();
            screenshotsToday = fileDetails.filter(f => 
                f.stats.birthtime.toDateString() === today
            ).length;

            // 4. Trouver le dernier fichier organisé (le plus récent)
            const lastFileObj = [...fileDetails].sort((a, b) => 
                b.stats.birthtime - a.stats.birthtime
            )[0];
            lastFile = lastFileObj ? lastFileObj.name : "Aucun";
        } catch (e) {
            console.log("[getStats] Organize folder does not exist, using default file stats");
        }

        // 5. Calculer la place utilisée (Disk Usage) - TOUJOURS
        console.log("[getStats] Calling getDiskUsageRatio...");
        const diskUsageRatio = await getDiskUsageRatio();
        console.log(`[getStats] diskUsageRatio = ${diskUsageRatio}`);

        const result = {
            screenshotsToday,
            totalOrganized,
            lastFile,
            diskUsage: diskUsageRatio,
        };
        
        console.log("[getStats] Returning:", result);
        return result;

    } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
        return null;
    }
}

module.exports = { getStats };