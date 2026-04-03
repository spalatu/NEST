

const ICON_ALL = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.7"/><rect x="8" y="1" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.7"/><rect x="1" y="8" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.7"/><rect x="8" y="8" width="5" height="5" rx="1.5" fill="currentColor" opacity="0.7"/></svg>';
const ICON_UNCATEGORIZED = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3" stroke-dasharray="3 2"/></svg>';
const ICON_UNTAGGED = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 9l5-7 5 7H2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>';
const ICON_RECENT = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 4v3l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_TRASH = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 4h9M5.5 4V3a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M4.5 4l.5 7h4l.5-7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_FOLDER = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 3.5A1 1 0 012.5 2.5h3l1 1.5h5a1 1 0 011 1V11a1 1 0 01-1 1h-9a1 1 0 01-1-1V3.5z" fill="currentColor" opacity="0.85"/></svg>';
const ICON_CHEVRON = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4.5 3L7.5 6L4.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_GLOBE = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 6.5h11M6.5 1c-2 2-2 8 0 11M6.5 1c2 2 2 8 0 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>';
const ICON_PLUS_SM = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
const ICON_X_SM = '<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 1l6 6M7 1L1 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

const SMART_FOLDERS = [
  { id: 'all', label: 'All Images', icon: ICON_ALL },
  { id: 'uncategorized', label: 'Uncategorized', icon: ICON_UNCATEGORIZED },
  { id: 'untagged', label: 'Untagged', icon: ICON_UNTAGGED },
  { id: 'recent', label: 'Recently Edited', icon: ICON_RECENT },
  { id: 'trash', label: 'Trash', icon: ICON_TRASH }
];

function renderLeftSidebar() {
  renderSmartFolders();
  renderUserFolders();

  let footer = document.getElementById('sidebarFooter');
  if (state.activeFolder === 'trash') {
    footer.style.display = 'block';
  } else {
    footer.style.display = 'none';
  }
}

function renderSmartFolders() {
  let container = document.getElementById('smartFolders');
  container.innerHTML = '';

  for (let i = 0; i < SMART_FOLDERS.length; i++) {
    let folder = SMART_FOLDERS[i];
    let item = document.createElement('div');
    
    item.className = 'folder-item';
    if (state.activeFolder === folder.id) {
       item.className += ' active';
    }
    
    item.innerHTML =
      '<span class="folder-icon">' + folder.icon + '</span>' +
      '<span class="folder-name">' + folder.label + '</span>' +
      '<span class="folder-count">' + getFolderCount(folder.id) + '</span>';

    item.addEventListener('click', (function(fid) {
      return function () {
        navigateTo(fid);
      };
    })(folder.id));

    container.appendChild(item);
  }
}

function renderUserFolders() {
  let container = document.getElementById('userFolders');
  container.innerHTML = '';

  for (let i = 0; i < state.folders.length; i++) {
    let folder = state.folders[i];
    let item = document.createElement('div');
    
    item.className = 'folder-item';
    if (state.activeFolder === folder.id) {
       item.className += ' active';
    }

    let deleteBtn = document.createElement('button');
    deleteBtn.className = 'folder-delete-btn';
    deleteBtn.title = 'Delete folder';
    deleteBtn.innerHTML = '<svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 1l7 7M8 1L1 8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    
    deleteBtn.addEventListener('click', (function(f) {
      return function (e) {
        e.stopPropagation();
        confirmDeleteFolder(f.id);
      };
    })(folder));

    item.innerHTML =
      '<span class="folder-icon" style="color:var(--yellow)">' + ICON_FOLDER + '</span>' +
      '<span class="folder-name">' + folder.name + '</span>' +
      '<span class="folder-count">' + getFolderCount(folder.id) + '</span>';
      
    item.appendChild(deleteBtn);

    item.addEventListener('click', (function(fid) {
      return function () {
        navigateTo(fid);
      };
    })(folder.id));

    container.appendChild(item);
  }
}

function navigateTo(folderId, addToHistory) {
  if (addToHistory === undefined) {
      addToHistory = true;
  }

  if (addToHistory) {
    let newHistory = [];
    for (let i = 0; i <= state.navIndex; i++) {
       newHistory.push(state.navHistory[i]);
    }
    state.navHistory = newHistory;
    
    if (state.navHistory[state.navIndex] !== folderId) {
      state.navHistory.push(folderId);
      state.navIndex++;
    }
  }

  state.activeFolder = folderId;
  state.selectedId = null;
  state.search = '';
  document.getElementById('searchInput').value = '';

  renderLeftSidebar();
  renderGallery();
  renderRightSidebar();
  updateNavButtons();
}

function updateNavButtons() {
  let backBtn = document.getElementById('backBtn');
  let fwdBtn = document.getElementById('fwdBtn');
  
  if (state.navIndex <= 0) {
      backBtn.disabled = true;
  } else {
      backBtn.disabled = false;
  }
  
  if (state.navIndex >= state.navHistory.length - 1) {
      fwdBtn.disabled = true;
  } else {
      fwdBtn.disabled = false;
  }
}

function renderRightSidebar() {
  let emptyPanel = document.getElementById('rsEmpty');
  let detailPanel = document.getElementById('rsDetail');

  if (!state.selectedId) {
    emptyPanel.style.display = 'flex';
    detailPanel.style.display = 'none';
    return;
  }

  let img = null;
  for (let i = 0; i < state.images.length; i++) {
     if (state.images[i].id === state.selectedId) {
        img = state.images[i];
        break;
     }
  }
  
  if (!img) {
    emptyPanel.style.display = 'flex';
    detailPanel.style.display = 'none';
    return;
  }

  emptyPanel.style.display = 'none';
  detailPanel.style.display = 'flex';

  document.getElementById('rsPreviewImg').src = img.src;

  let sectionsContainer = document.getElementById('rsSections');
  sectionsContainer.innerHTML = '';

  sectionsContainer.appendChild(makeSection('Colors', makeColorsContent(img)));
  sectionsContainer.appendChild(makeSection('Description', makeTextareaContent(img, 'description', 'Add a description…')));
  sectionsContainer.appendChild(makeSection('Notes', makeTextareaContent(img, 'notes', 'Add notes…')));
  sectionsContainer.appendChild(makeSection('Source', makeSourceContent(img)));
  sectionsContainer.appendChild(makeSection('Tags', makeTagsContent(img)));
  sectionsContainer.appendChild(makeSection('Folder', makeFolderContent(img)));
  sectionsContainer.appendChild(makeSection('Properties', makePropertiesContent(img)));
  sectionsContainer.appendChild(makeSection('Export', makeExportContent(img)));
}

function makeSection(title, contentEl) {
  let section = document.createElement('div');
  section.className = 'rs-section open';

  let header = document.createElement('div');
  header.className = 'rs-section-header';
  header.innerHTML = '<span class="rs-section-title">' + title + '</span><span class="rs-chevron">' + ICON_CHEVRON + '</span>';

  let body = document.createElement('div');
  body.className = 'rs-section-body';
  body.appendChild(contentEl);

  header.addEventListener('click', function () {
    section.classList.toggle('open');
  });

  section.appendChild(header);
  section.appendChild(body);
  return section;
}

function makeColorsContent(img) {
  let wrap = document.createElement('div');

  if (!img.colors || img.colors.length === 0) {
    wrap.innerHTML = '<span style="font-size:12px;color:var(--text3)">No colors extracted</span>';
    return wrap;
  }

  let strip = document.createElement('div');
  strip.className = 'color-strip';

  for (let i = 0; i < img.colors.length; i++) {
    let colorInfo = img.colors[i];
    let swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.background = colorInfo.hex;
    swatch.style.flex = colorInfo.percent.toString();

    swatch.addEventListener('mouseenter', (function(ci) {
      return function (e) {
        let tooltip = document.getElementById('colorTooltip');
        tooltip.textContent = ci.hex + '  ' + ci.percent + '%';
        tooltip.className = 'color-tooltip visible';

        let rect = e.target.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
      };
    })(colorInfo));

    swatch.addEventListener('mouseleave', function () {
      let tooltip = document.getElementById('colorTooltip');
      tooltip.className = 'color-tooltip hidden';
    });

    strip.appendChild(swatch);
  }

  wrap.appendChild(strip);
  return wrap;
}

function makeTextareaContent(img, field, placeholder) {
  let wrap = document.createElement('div');
  let textarea = document.createElement('textarea');
  textarea.className = 'rs-textarea';
  textarea.placeholder = placeholder;
  if (img[field]) {
     textarea.value = img[field];
  } else {
     textarea.value = '';
  }

  textarea.addEventListener('input', function () {
    textarea.style.height = '';
    textarea.style.height = textarea.scrollHeight + 'px';
  });

  textarea.addEventListener('blur', function () {
    let patch = {};
    patch[field] = textarea.value;
    updateImage(img.id, patch);
  });

  setTimeout(function () {
    textarea.style.height = textarea.scrollHeight + 'px';
  }, 0);

  wrap.appendChild(textarea);
  return wrap;
}

function makeSourceContent(img) {
  let wrap = document.createElement('div');

  let row = document.createElement('div');
  row.className = 'rs-source-wrap';
  row.innerHTML = '<span class="rs-source-icon">' + ICON_GLOBE + '</span>';

  let input = document.createElement('input');
  input.type = 'text';
  input.className = 'rs-input';
  input.placeholder = 'Paste source URL…';
  if (img.source) {
     input.value = img.source;
  } else {
     input.value = '';
  }

  input.addEventListener('blur', function () {
    updateImage(img.id, { source: input.value });
    renderRightSidebar();
  });

  row.appendChild(input);
  wrap.appendChild(row);

  if (img.source) {
    let link = document.createElement('a');
    link.href = img.source;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'rs-source-link';
    
    // safe truncate text content
    let sText = img.source;
    if (sText.length > 30) {
       sText = sText.substring(0, 30) + '...';
    }
    link.textContent = sText;
    
    wrap.appendChild(link);
  }

  return wrap;
}

function makeTagsContent(img) {
  let wrap = document.createElement('div');

  let chipsRow = document.createElement('div');
  chipsRow.className = 'tag-chips';

  let tags = [];
  if (img.tags) {
     tags = img.tags;
  }
  
  for (let i = 0; i < tags.length; i++) {
    let tag = tags[i];
    let chip = document.createElement('div');
    chip.className = 'tag-chip';

    let removeBtn = document.createElement('button');
    removeBtn.className = 'tag-chip-remove';
    removeBtn.title = 'Remove tag';
    removeBtn.innerHTML = ICON_X_SM;

    removeBtn.addEventListener('click', (function(t) {
      return function () {
        let newTags = [];
        for (let j = 0; j < tags.length; j++) {
           if (tags[j] !== t) {
              newTags.push(tags[j]);
           }
        }
        updateImage(img.id, { tags: newTags });
        renderRightSidebar();
      };
    })(tag));

    chip.appendChild(document.createTextNode(tag));
    chip.appendChild(removeBtn);
    chipsRow.appendChild(chip);
  }

  wrap.appendChild(chipsRow);

  let addBtn = document.createElement('button');
  addBtn.className = 'tag-add-btn';
  addBtn.innerHTML = ICON_PLUS_SM + ' New Tag';

  addBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    openTagPopover(img.id, addBtn);
  });

  wrap.appendChild(addBtn);
  return wrap;
}

function makeFolderContent(img) {
  let wrap = document.createElement('div');

  if (img.folder) {
    let currentFolder = null;
    for (let i = 0; i < state.folders.length; i++) {
       if (state.folders[i].id === img.folder) {
          currentFolder = state.folders[i];
          break;
       }
    }
    if (currentFolder) {
      let pill = document.createElement('div');
      pill.className = 'folder-pill';
      pill.innerHTML = '<span class="folder-pill-icon">' + ICON_FOLDER + '</span>' + currentFolder.name;
      wrap.appendChild(pill);
    }
  }

  let moveBtn = document.createElement('button');
  moveBtn.className = 'folder-move-btn';
  moveBtn.innerHTML = ICON_PLUS_SM + ' Move to folder…';

  moveBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    openFolderPopover(img.id, moveBtn);
  });

  wrap.appendChild(moveBtn);
  return wrap;
}

function makePropertiesContent(img) {
  let wrap = document.createElement('div');
  wrap.className = 'props-grid';

  let fType = '';
  if (img.fileType) {
     fType = img.fileType.toUpperCase();
  }
  
  let fSize = '—';
  if (img.fileSize) {
     fSize = img.fileSize;
  }

  let rows = [
    ['Dimensions', img.width + ' × ' + img.height + ' px'],
    ['File size', fSize],
    ['File type', fType],
    ['Imported', new Date(img.dateImported).toLocaleDateString()],
    ['Created', new Date(img.dateCreated).toLocaleDateString()],
    ['Modified', new Date(img.dateModified).toLocaleDateString()]
  ];

  for (let i = 0; i < rows.length; i++) {
    let row = rows[i];
    
    let label = document.createElement('div');
    label.className = 'prop-label';
    label.textContent = row[0];

    let value = document.createElement('div');
    value.className = 'prop-value';
    value.textContent = row[1];

    wrap.appendChild(label);
    wrap.appendChild(value);
  }

  return wrap;
}

function makeExportContent(img) {
  let wrap = document.createElement('div');
  wrap.className = 'export-row';

  let pngBtn = document.createElement('button');
  pngBtn.className = 'export-btn';
  pngBtn.textContent = 'Export PNG';
  pngBtn.addEventListener('click', function () { 
     exportImage(img, 'png'); 
  });

  let jpgBtn = document.createElement('button');
  jpgBtn.className = 'export-btn';
  jpgBtn.textContent = 'Export JPG';
  jpgBtn.addEventListener('click', function () { 
     exportImage(img, 'jpg'); 
  });

  wrap.appendChild(pngBtn);
  wrap.appendChild(jpgBtn);
  return wrap;
}
