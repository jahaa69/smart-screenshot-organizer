const fs = require('fs/promises');
const path = require('path');
const os = require('os');
const fsSync = require('fs');
const { getFiles } = require('./ScreenshotWatcher');

// Configuration des chemins (on cible le dossier Organize créé par FileService)
const SOURCE_DIR = path.join(os.homedir(), 'Pictures', 'Screenshots');
const ORGANIZE_DIR = path.join(SOURCE_DIR, 'Organize');

async function getFolderSizeBytes(dirPath) {
    try {
        await fs.access(dirPath);
    } catch {
        return 0;
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    let total = 0;

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);

        if (stats.isDirectory()) {
            total += await getFolderSizeBytes(fullPath);
        } else {
            total += stats.size;
        }
    }

    return total;
}

async function getDiskInfo() {
    try {
        console.log(`[getDiskInfo] Checking partition for path: ${SOURCE_DIR}`);

        let checkPath = SOURCE_DIR;

        try {
            await fs.access(checkPath);
        } catch {
            console.log(`[getDiskInfo] SOURCE_DIR doesn't exist, using home directory`);
            checkPath = os.homedir();
        }

        console.log(`[getDiskInfo] Using path for statfs: ${checkPath}`);

        const stats = fsSync.statfsSync(checkPath);

        const blockSize = stats.bsize || stats.frsize || 4096;
        const totalBlocks = stats.blocks;
        const freeBlocks = stats.bfree;
        const usedBlocks = totalBlocks - freeBlocks;

        const totalBytes = totalBlocks * blockSize;
        const usedBytes = usedBlocks * blockSize;
        const diskUsageRatio = totalBlocks > 0 ? usedBlocks / totalBlocks : 0;

        console.log(`[getDiskInfo] Stats retrieved:`, {
            blocks: stats.blocks,
            bfree: stats.bfree,
            bavail: stats.bavail,
            bsize: stats.bsize,
            frsize: stats.frsize,
            totalBytes,
            usedBytes,
        });

        console.log(
            `[getDiskInfo] Disk usage: ${(diskUsageRatio * 100).toFixed(1)}% (${usedBlocks}/${totalBlocks} blocks)`
        );

        return {
            totalBytes,
            usedBytes,
            diskUsageRatio: Math.min(diskUsageRatio, 1),
        };
    } catch (error) {
        console.error("[getDiskInfo] Error:", error.message);
        return {
            totalBytes: 0,
            usedBytes: 0,
            diskUsageRatio: 0.28,
        };
    }
}

async function getStats() {
    try {
        console.log("[getStats] Starting...");
        
        // Initialiser les stats par défaut
        let screenshotsToday = 0;
        let screenshotsThisWeek = 0;
        let totalOrganized = 0;
        let lastFile = "Aucun";
        let lastOrganized = "Aucun";
        let nextFile = "Aucun";
        let folderSizeBytes = 0;
        
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
            const today = new Date();
            const todayString = today.toDateString();
            screenshotsToday = fileDetails.filter(f =>
                f.stats.birthtime.toDateString() === todayString
            ).length;

            // 4. Calculer les screenshots de cette semaine (depuis le début de semaine)
            const startOfWeek = new Date(today);
            startOfWeek.setHours(0, 0, 0, 0);
            // Dimanche = 0, Lundi = 1, ...
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

            screenshotsThisWeek = fileDetails.filter(f =>
                f.stats.birthtime >= startOfWeek
            ).length;

            // 5. Trouver le dernier fichier organisé (le plus récent)
            const lastFileObj = [...fileDetails].sort((a, b) => 
                b.stats.birthtime - a.stats.birthtime
            )[0];
            lastFile = lastFileObj ? lastFileObj.name : "Aucun";
            lastOrganized = lastFile;

            // 6. Taille totale du dossier organisé
            folderSizeBytes = await getFolderSizeBytes(ORGANIZE_DIR);
            console.log(`[getStats] folderSizeBytes = ${folderSizeBytes}`);
        } catch (e) {
            console.log("[getStats] Organize folder does not exist, using default file stats");
        }

        // 7. Infos disque pour calculer la part occupée par le dossier
        console.log("[getStats] Calling getDiskInfo...");
        const diskInfo = await getDiskInfo();
        console.log("[getStats] diskInfo =", diskInfo);

        // 7 bis. Déterminer le prochain fichier à organiser (dans SOURCE_DIR hors Organize)
        try {
            const pendingFiles = await getFiles();
            if (pendingFiles && pendingFiles.length > 0) {
                nextFile = pendingFiles[0];
            }
        } catch (err) {
            console.warn("[getStats] Impossible de récupérer les fichiers en attente :", err.message);
        }

        const folderUsageRatio =
            diskInfo.totalBytes > 0
                ? Math.min(folderSizeBytes / diskInfo.totalBytes, 1)
                : 0;

        const result = {
            screenshotsToday,
            screenshotsThisWeek,
            totalOrganized,
            lastFile,
            lastOrganized,
            nextFile,
            diskUsage: folderUsageRatio,
            folderSizeBytes,
        };
        
        console.log("[getStats] Returning:", result);
        return result;

    } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
        return null;
    }
}

module.exports = { getStats };