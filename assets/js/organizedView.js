// ── Données de démo (fallback si Electron / IPC indisponible) ─────────────
const DEMO_FILES = [
  { name: 'ScreenShot_2024-04-28_Chrome.png',   category: 'Chrome',   dateTaken: '2024-04-28 14:05', modified: '2024-04-28 14:05', size: 842400,  tags: ['Work', 'Important'] },
  { name: 'ScreenShot_2024-04-27_Chrome.png',   category: 'Chrome',   dateTaken: '2024-04-27 09:32', modified: '2024-04-27 09:33', size: 1240000, tags: ['Work'] },
  { name: 'ScreenShot_2024-04-26_Firefox.png',  category: 'Firefox',  dateTaken: '2024-04-26 16:11', modified: '2024-04-26 16:11', size: 654000,  tags: ['Personal'] },
  { name: 'ScreenShot_2024-04-25_Code.png',     category: 'Code',     dateTaken: '2024-04-25 11:45', modified: '2024-04-25 12:01', size: 390000,  tags: ['Work'] },
  { name: 'ScreenShot_2024-04-24_Terminal.png', category: 'Terminal', dateTaken: '2024-04-24 08:20', modified: '2024-04-24 08:20', size: 210000,  tags: [] },
  { name: 'ScreenShot_2024-04-23_Chrome.png',   category: 'Chrome',   dateTaken: '2024-04-23 17:55', modified: '2024-04-23 18:02', size: 975000,  tags: ['Important'] },
  { name: 'ScreenShot_2024-04-22_Code.png',     category: 'Code',     dateTaken: '2024-04-22 14:30', modified: '2024-04-22 14:31', size: 450000,  tags: ['Work'] },
  { name: 'ScreenShot_2024-04-21_Firefox.png',  category: 'Firefox',  dateTaken: '2024-04-21 10:05', modified: '2024-04-21 10:06', size: 720000,  tags: [] },
  { name: 'ScreenShot_2024-04-20_Other.png',    category: 'Other',    dateTaken: '2024-04-20 19:15', modified: '2024-04-20 19:15', size: 530000,  tags: ['Personal'] },
  { name: 'ScreenShot_2024-04-19_Chrome.png',   category: 'Chrome',   dateTaken: '2024-04-19 13:42', modified: '2024-04-19 13:43', size: 1100000, tags: ['Work', 'Important'] },
];

// ── État ─────────────────────────────────────────────────────────────────
let allFiles    = [];
let activeFilter = 'all';
let activeSort   = 'date-desc';
let searchQuery  = '';
let isGridView   = false;
let selectedRow  = null;

// ── DOM refs ─────────────────────────────────────────────────────────────
const fileList    = document.getElementById('file-list');
const emptyState  = document.getElementById('empty-state');
const resultCount = document.getElementById('result-count');
const colHeaders  = document.getElementById('col-headers');
const searchInput = document.getElementById('search-input');
const sortSelect  = document.getElementById('sort-select');

// ── Helpers ───────────────────────────────────────────────────────────────
function formatSize(bytes) {
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  if (bytes >= 1024)    return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  const today    = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === today.toDateString())     return `Today at ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday at ${time}`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) + ` at ${time}`;
}

function highlightMatch(name, query) {
  if (!query) return escHtml(name);
  const idx = name.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escHtml(name);
  return escHtml(name.slice(0, idx))
    + '<strong>' + escHtml(name.slice(idx, idx + query.length)) + '</strong>'
    + escHtml(name.slice(idx + query.length));
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function tagClass(tag) {
  const t = tag.toLowerCase();
  if (t === 'work') return 'tag-pill--work';
  if (t === 'important') return 'tag-pill--important';
  if (t === 'personal') return 'tag-pill--personal';
  return '';
}

// ── Filter + sort + render ────────────────────────────────────────────────
function getFiltered() {
  let files = [...allFiles];

  // Category filter
  if (activeFilter !== 'all') {
    files = files.filter(f => f.category === activeFilter);
  }

  // Search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    files = files.filter(f => f.name.toLowerCase().includes(q));
  }

  // Sort
  files.sort((a, b) => {
    switch (activeSort) {
      case 'date-desc': return new Date(b.dateTaken) - new Date(a.dateTaken);
      case 'date-asc':  return new Date(a.dateTaken) - new Date(b.dateTaken);
      case 'name-asc':  return a.name.localeCompare(b.name);
      case 'name-desc': return b.name.localeCompare(a.name);
      case 'category-asc':  return (a.category || '').localeCompare(b.category || '');
      case 'category-desc': return (b.category || '').localeCompare(a.category || '');
      case 'size-desc': return (b.size || 0) - (a.size || 0);
      default: return 0;
    }
  });

  return files;
}

function render() {
  const files = getFiltered();
  resultCount.textContent = `${files.length} file${files.length !== 1 ? 's' : ''}`;

  if (files.length === 0) {
    fileList.innerHTML = '';
    emptyState.style.display = 'flex';
    fileList.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  fileList.style.display = isGridView ? 'grid' : 'block';

  fileList.innerHTML = files.map((f, i) => {
    const tags = (f.tags || []).map(t =>
      `<span class="tag-pill ${tagClass(t)}">${escHtml(t)}</span>`
    ).join('');

    let thumb;
    if (f.filePath) {
      const imgSrc = 'file:///' + f.filePath.replace(/\\/g, '/');
      thumb = `
        <div class="file-thumb">
          <img src="${imgSrc}" alt="${escHtml(f.name)}" />
        </div>`;
    } else {
      // Fallback: icône générique si aucun chemin n'est fourni (mode démo, etc.)
      thumb = `
        <div class="file-thumb">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 15l5-5 4 4 3-3 6 6"/>
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </div>`;
    }

    return `
      <div class="file-row" data-index="${i}" style="animation-delay:${i * 0.03}s">
        <div class="file-row__name-cell">
          ${thumb}
          <span class="file-name">${highlightMatch(f.name, searchQuery)}</span>
        </div>
        <div class="file-cell">
          <span class="cat-badge cat--${f.category}">
            <span class="cat-badge__dot"></span>${f.category}
          </span>
        </div>
        <div class="file-cell file-cell--date-taken">${formatDate(f.dateTaken)}</div>
        <div class="file-cell file-cell--modified">${formatDate(f.modified)}</div>
        <div class="file-cell file-cell--size">${formatSize(f.size || 0)}</div>
        <div class="file-cell file-cell--tags">${tags}</div>
      </div>`;
  }).join('');

  // Row click = select
  fileList.querySelectorAll('.file-row').forEach(row => {
    row.addEventListener('click', () => {
      fileList.querySelectorAll('.file-row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
      selectedRow = row;
    });
    row.addEventListener('contextmenu', e => showContextMenu(e));
  });
}

// ── Context menu ──────────────────────────────────────────────────────────
function showContextMenu(e) {
  e.preventDefault();
  removeContextMenu();

  const menu = document.createElement('div');
  menu.className = 'ctx-menu';
  menu.innerHTML = `
    <div class="ctx-menu__item">
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
      Open
    </div>
    <div class="ctx-menu__item">
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/><path d="M3 5a2 2 0 012-2 3 3 0 003 3h4a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z"/></svg>
      Move to…
    </div>
    <div class="ctx-menu__item">
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z"/><path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z"/></svg>
      Copy path
    </div>
    <div class="ctx-menu__sep"></div>
    <div class="ctx-menu__item">
      <svg viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828L7 15.828 3 17l1.172-4L14.586 2.586a2 2 0 012.828 0z"/></svg>
      Rename
    </div>
    <div class="ctx-menu__sep"></div>
    <div class="ctx-menu__item ctx-menu__item--danger">
      <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
      Delete
    </div>
  `;

  menu.style.left = e.clientX + 'px';
  menu.style.top  = e.clientY + 'px';
  document.body.appendChild(menu);

  // Adjust if out of viewport
  const rect = menu.getBoundingClientRect();
  if (rect.right  > window.innerWidth)  menu.style.left = (e.clientX - rect.width) + 'px';
  if (rect.bottom > window.innerHeight) menu.style.top  = (e.clientY - rect.height) + 'px';

  setTimeout(() => document.addEventListener('click', removeContextMenu, { once: true }), 0);
}

function removeContextMenu() {
  document.querySelectorAll('.ctx-menu').forEach(m => m.remove());
}

// ── Event listeners ───────────────────────────────────────────────────────

// Filter chips
document.querySelectorAll('.filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    render();
  });
});

// Sort
sortSelect.addEventListener('change', () => {
  activeSort = sortSelect.value;
  render();
});

// Clic sur les en-têtes Name / Category pour trier
document.querySelectorAll('.col-header--sortable').forEach(header => {
  header.addEventListener('click', () => {
    const sortKey = header.dataset.sort;
    if (!sortKey) return;
    if (sortKey === 'name') {
      activeSort = activeSort === 'name-asc' ? 'name-desc' : 'name-asc';
    } else if (sortKey === 'category') {
      activeSort = activeSort === 'category-asc' ? 'category-desc' : 'category-asc';
    }
    sortSelect.value = activeSort;
    render();
  });
});

// Search
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  render();
});

// Keyboard shortcut ⌘F / Ctrl+F
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape') {
    searchInput.blur();
    removeContextMenu();
  }
});

// View toggle
document.getElementById('view-list').addEventListener('click', () => {
  isGridView = false;
  document.getElementById('view-list').classList.add('active');
  document.getElementById('view-grid').classList.remove('active');
  colHeaders.style.display = 'grid';
  fileList.classList.remove('grid-view');
  render();
});
document.getElementById('view-grid').addEventListener('click', () => {
  isGridView = true;
  document.getElementById('view-grid').classList.add('active');
  document.getElementById('view-list').classList.remove('active');
  colHeaders.style.display = 'none';
  fileList.classList.add('grid-view');
  render();
});

// ── Init ─────────────────────────────────────────────────────────────────
async function init() {
  try {
    // Récupère les vrais fichiers via Electron IPC
    const files = await window.electronAPI.getOrganizedFiles();
    allFiles = files;
  } catch (e) {
    // Mode démo hors Electron
    console.warn('electronAPI non disponible, mode démo');
    allFiles = DEMO_FILES;
  }
  render();
}

init();