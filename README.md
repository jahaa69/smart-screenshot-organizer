# Smart Screenshot Organizer

Organise tes captures d’écran avec intelligence et élégance !

[Badge Version](https://img.shields.io/badge/version-1.0.0-blue)

[License](https://img.shields.io/badge/license-MIT-green)


#RajoutER DES SCREESHOTS

---

## Présentation du Projet

### Contexte

La gestion des captures d’écran peut rapidement devenir chaotique pour tout utilisateur travaillant sur plusieurs projets ou navigations. Une organisation manuelle est lente et source d’erreurs.

### Problématique

Comment automatiser le tri et la classification des captures d’écran tout en offrant un suivi clair et des tags personnalisés ?

### Solution proposée

*Smart Screenshot Organizer* surveille un dossier choisi, renomme automatiquement chaque capture, organise par date et application, et permet d’ajouter des tags. L’utilisateur conserve un contrôle total via un dashboard simple et visuel.

---

## Fonctionnalités

### Fonctionnalités principales (MVP)

- **Auto rename** : Renomme les captures selon le format `Screenshot_YYYY-MM-DD_AppName.png`
- **Auto organize** : Classe automatiquement dans des sous-dossiers par date
- **Tag system** : Ajout manuel ou automatique de tags
- **Dashboard** : Vue des statistiques et historique
- **Toggle ON/OFF** : Activer ou désactiver le watcher facilement

### Fonctionnalités secondaires

- Notifications système pour chaque capture traitée
- Gestion des fichiers verrouillés ou en conflit
- Historique des captures traitées

---

## Architecture Technique

- **Pattern :** MVVM (Model-View-ViewModel)
- **Main Process :** Gestion des fichiers, watcher, IPC
- **Renderer Process :** Interface utilisateur et dashboard
- **Dossiers :** `/src/main`, `/src/renderer`, `/src/shared`, `/assets`, `/doc`

---

## UML

- **Diagramme de Cas d’Utilisation** : Interaction utilisateur avec le watcher et le dashboard
- **Diagramme de Classes** : Screenshot, ScreenshotWatcher, FileClassifier, FileService, TagManager, IPCHandlers
- **Diagramme de Séquence** : Nouveau fichier détecté → classification → renommage → notification
- **Diagramme de Déploiement** : Electron App → Node.js → File System / OS

---

## Technologies Utilisées

- Electron (desktop app)
- Vue.js (interface)
- Node.js (backend local)
- fs / IPC (interaction avec le système)

---

## Installation

### Prérequis

- Node.js v18+
- NPM ou Yarn
- Système Windows / macOS / Linux

### Cloner le dépôt

```bash
git clone https://github.com/jahaa69/smart-screenshot-organizer.git
cd smart-screenshot-organizer
```

### Installer les dépendances

```bash
npm install
sudo apt install libnss3
```

### Lancement en développement

```bash
npm run dev
```

### Build production

```bash
npm run build
```

---

## Tests & Gestion des Erreurs

- Les fichiers verrouillés ne sont pas déplacés, notification affichée
- Inputs vides ou dossier non trouvé généreront un message d’erreur clair
- Historique des actions pour debug et suivi

---

## Améliorations Futures

- Intégration OCR pour lecture du contenu des screenshots
- Classification automatique via IA
- Support multi-dossiers et multi-utilisateurs
- Export CSV des statistiques

---

## Transparence IA 🤖

- **Prompts utilisés :** Génération des diagrammes UML et suggestions d’architecture
- **Parties générées par IA :** Diagrammes de classes, séquences, structure initiale du README
- **Parties développées manuellement :** Logique métier, watcher, interface et dashboard
- **Analyse critique IA :** La proposition initiale de watcher était synchrone ; refactor vers async/await pour performance

---

## Auto-Critique

- OCR et reconnaissance automatique d’application non implémentés
- Gestion multi-dossiers à améliorer
- Dashboard simplifié pour MVP, mais scalable
- Documentation UML complète pour prouver la structure

---

## Licence

MIT License – libre d’utilisation et de modification

---

Soléane et Bastien
