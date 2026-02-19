const fs = require('fs/promises');
const path = require('path');
const os = require('os');

// Configuration des chemins (on cible le dossier Organize créé par FileService)
const SOURCE_DIR = path.join(os.homedir(), 'Pictures', 'Screenshots');
const ORGANIZE_DIR = path.join(SOURCE_DIR, 'Organize');

async function getStats() {
    try {
        // 1. Lire le contenu du dossier organisé
        // On s'assure que le dossier existe, sinon on retourne des stats à zéro
        try {
            await fs.access(ORGANIZE_DIR);
        } catch {
            return {
                screenshotsToday: 0,
                totalOrganized: 0,
                lastFile: "Aucun",
                diskUsage: "0 MB"
            };
        }

        const files = await fs.readdir(ORGANIZE_DIR);
        
        // On récupère les détails de chaque fichier (taille et date de création)
        const fileDetails = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(ORGANIZE_DIR, file);
                const stats = await fs.stat(filePath);
                return { name: file, stats };
            })
        );

        // 2. Calculer le total organisé
        const totalOrganized = files.length;

        // 3. Calculer les screenshots d'aujourd'hui
        const today = new Date().toDateString();
        const screenshotsToday = fileDetails.filter(f => 
            f.stats.birthtime.toDateString() === today
        ).length;

        // 4. Trouver le dernier fichier organisé (le plus récent)
        const lastFileObj = [...fileDetails].sort((a, b) => 
            b.stats.birthtime - a.stats.birthtime
        )[0];
        const lastFile = lastFileObj ? lastFileObj.name : "Aucun";

        // 5. Calculer la place utilisée (Disk Usage)
        const totalSizeBytes = fileDetails.reduce((acc, curr) => acc + curr.stats.size, 0);
        const diskUsageMB = (totalSizeBytes / (1024 * 1024)).toFixed(2); // Conversion en Mo

        return {
            screenshotsToday,
            totalOrganized,
            lastFile,
            diskUsage: `${diskUsageMB} MB`,
        };

    } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error);
        return null;
    }
}

module.exports = { getStats };