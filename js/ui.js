function openModal(id) {
  let modal = document.getElementById(id);
  modal.className = modal.className + ' open';
}

function closeModal(id) {
  let modal = document.getElementById(id);
  modal.className = modal.className.replace(' open', '');
}

// ── Confirm dialog (replaces window.confirm) ──
let confirmCallback = null;

function showConfirm(title, message, actionLabel, callback) {
  confirmCallback = callback;
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = message;
  document.getElementById('confirmOkBtn').textContent = actionLabel;
  openModal('confirmDialog');
}

let contextTargetId = null;

function showContextMenu(e, imageId) {
  e.preventDefault();
  contextTargetId = imageId;

  let menu = document.getElementById('contextMenu');
  menu.style.display = 'block';

  let x = e.clientX;
  if (x > window.innerWidth - menu.offsetWidth - 8) {
     x = window.innerWidth - menu.offsetWidth - 8;
  }
  
  let y = e.clientY;
  if (y > window.innerHeight - menu.offsetHeight - 8) {
     y = window.innerHeight - menu.offsetHeight - 8;
  }
  
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';
}

function hideContextMenu() {
  document.getElementById('contextMenu').style.display = 'none';
  contextTargetId = null;
}

// ── Tag popover ──
let activeTagPopover = null;

function openTagPopover(imageId, anchorBtn) {
  closePopovers();

  let img = null;
  for (let i = 0; i < state.images.length; i++) {
     if (state.images[i].id === imageId) {
        img = state.images[i];
        break;
     }
  }
  
  if (!img) {
      return;
  }

  let popover = document.createElement('div');
  popover.className = 'popover';
  popover.id = 'tagPopover';

  let searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'popover-search';
  searchInput.placeholder = 'Search or add tag…';
  popover.appendChild(searchInput);

  let list = document.createElement('div');
  list.className = 'popover-list';
  popover.appendChild(list);

  function buildTagList(query) {
    list.innerHTML = '';

    let allTags = [];
    for (let k = 0; k < state.images.length; k++) {
       let tgs = state.images[k].tags;
       if (tgs) {
          for (let tIdx = 0; tIdx < tgs.length; tIdx++) {
             let t = tgs[tIdx];
             let exists = false;
             for (let aIdx = 0; aIdx < allTags.length; aIdx++) {
                 if (allTags[aIdx] === t) {
                    exists = true;
                    break;
                 }
             }
             if (!exists) {
                allTags.push(t);
             }
          }
       }
    }
    allTags.sort();

    let currentTags = [];
    if (img.tags) {
       currentTags = img.tags;
    }
    
    let matches = [];
    for (let m = 0; m < allTags.length; m++) {
       let tag = allTags[m];
       if (tag.toLowerCase().includes(query.toLowerCase())) {
          let isApplied = false;
          for (let c = 0; c < currentTags.length; c++) {
             if (currentTags[c] === tag) {
                 isApplied = true;
                 break;
             }
          }
          if (!isApplied) {
             matches.push(tag);
          }
       }
    }

    for (let n = 0; n < matches.length; n++) {
      let tagStr = matches[n];
      let item = document.createElement('div');
      item.className = 'popover-item';
      item.textContent = tagStr;
      
      item.addEventListener('click', (function(t) {
        return function () {
          addTagToImage(imageId, t);
          closePopovers();
        };
      })(tagStr));
      
      list.appendChild(item);
    }

    let trimmed = query.trim();
    
    let alreadyExists = false;
    for (let t2 = 0; t2 < allTags.length; t2++) {
       if (allTags[t2].toLowerCase() === trimmed.toLowerCase()) {
          alreadyExists = true;
          break;
       }
    }
    
    let alreadyApplied = false;
    for (let c2 = 0; c2 < currentTags.length; c2++) {
       if (currentTags[c2].toLowerCase() === trimmed.toLowerCase()) {
          alreadyApplied = true;
          break;
       }
    }
    
    if (trimmed !== "" && !alreadyExists && !alreadyApplied) {
      let addItem = document.createElement('div');
      addItem.className = 'popover-item add-new';
      addItem.textContent = 'Add tag "' + trimmed + '"';
      
      addItem.addEventListener('click', function () {
        addTagToImage(imageId, trimmed);
        closePopovers();
      });
      list.appendChild(addItem);
    }
  }

  buildTagList('');

  searchInput.addEventListener('input', function () {
    buildTagList(searchInput.value);
  });

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
       if (searchInput.value.trim() !== '') {
          addTagToImage(imageId, searchInput.value.trim());
          closePopovers();
       }
    }
    if (e.key === 'Escape') {
       closePopovers();
    }
  });

  document.body.appendChild(popover);
  activeTagPopover = popover;

  let rect = anchorBtn.getBoundingClientRect();
  popover.style.left = rect.left + 'px';
  popover.style.top = (rect.bottom + 6) + 'px';

  setTimeout(function () { 
     searchInput.focus(); 
  }, 10);
}

function addTagToImage(imageId, tag) {
  let img = null;
  for (let i = 0; i < state.images.length; i++) {
     if (state.images[i].id === imageId) {
        img = state.images[i];
        break;
     }
  }
  
  if (!img) return;

  let existing = [];
  if (img.tags) {
     existing = img.tags;
  }
  
  let hasTag = false;
  for (let j = 0; j < existing.length; j++) {
     if (existing[j] === tag) {
        hasTag = true;
        break;
     }
  }
  
  if (hasTag) {
     return;
  }

  let newTags = [];
  for (let k = 0; k < existing.length; k++) {
     newTags.push(existing[k]);
  }
  newTags.push(tag);
  
  updateImage(imageId, { tags: newTags });
  renderRightSidebar();
}

let activeFolderPopover = null;

function openFolderPopover(imageId, anchorBtn) {
  closePopovers();

  let img = null;
  for (let i = 0; i < state.images.length; i++) {
     if (state.images[i].id === imageId) {
        img = state.images[i];
        break;
     }
  }
  
  if (!img) return;

  let popover = document.createElement('div');
  popover.className = 'popover';
  popover.id = 'folderPopover';

  for (let f = 0; f < state.folders.length; f++) {
    let folder = state.folders[f];
    
    let item = document.createElement('div');
    item.className = 'folder-pop-item';

    let radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'folderPick';
    if (img.folder === folder.id) {
       radio.checked = true;
    } else {
       radio.checked = false;
    }

    let label = document.createElement('span');
    const ICON_FOLDER = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3C1 1.89543 1.89543 1 3 1H5C5.55228 1 6.08264 1.20092 6.4714 1.58969L7.5286 2.64689C7.91736 3.03566 8.44772 3.23658 9 3.23658H11C12.1046 3.23658 13 4.13201 13 5.23658V11C13 12.1046 12.1046 13 11 13H3C1.89543 13 1 12.1046 1 11V3Z" stroke="currentColor" stroke-width="1.6"/></svg>';
    label.innerHTML = '<span style="color:var(--yellow);display:inline-flex;vertical-align:middle;margin-right:4px">' + ICON_FOLDER + '</span>' + folder.name;

    item.appendChild(radio);
    item.appendChild(label);

    item.addEventListener('click', (function(fld) {
      return function () {
        let newFolder = null;
        if (img.folder !== fld.id) {
           newFolder = fld.id;
        }
        updateImage(imageId, { folder: newFolder });
        closePopovers();
        renderGallery();
        renderRightSidebar();
      };
    })(folder));

    popover.appendChild(item);
  }

  let newFolderItem = document.createElement('div');
  newFolderItem.className = 'folder-pop-item add-new';
  newFolderItem.style.color = 'var(--accent)';
  const ICON_PLUS_SM = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  newFolderItem.innerHTML = ICON_PLUS_SM + ' <span>New folder…</span>';
  
  newFolderItem.addEventListener('click', function () {
    closePopovers();
    createFolderInline(function (newName) {
      if (newName) {
        let created = null;
        for (let idx = 0; idx < state.folders.length; idx++) {
           if (state.folders[idx].name === newName) {
              created = state.folders[idx];
              break;
           }
        }
        if (created) {
           updateImage(imageId, { folder: created.id });
        }
        renderRightSidebar();
      }
    });
  });
  popover.appendChild(newFolderItem);

  document.body.appendChild(popover);
  activeFolderPopover = popover;

  let rect = anchorBtn.getBoundingClientRect();
  popover.style.left = rect.left + 'px';
  popover.style.top = (rect.bottom + 6) + 'px';
}

function closePopovers() {
  if (activeTagPopover) { 
     if (activeTagPopover.parentNode) {
         activeTagPopover.parentNode.removeChild(activeTagPopover); 
     }
     activeTagPopover = null; 
  }
  if (activeFolderPopover) { 
     if (activeFolderPopover.parentNode) {
         activeFolderPopover.parentNode.removeChild(activeFolderPopover); 
     }
     activeFolderPopover = null; 
  }
}

function createFolderInline(callback) {
  let wrap = document.getElementById('newFolderInputWrap');
  let input = document.getElementById('newFolderInput');
  wrap.style.display = 'block';
  input.value = '';
  input.focus();

  function finish() {
    let name = input.value.trim();
    if (name !== "") {
      let idStr = Date.now().toString(36) + Math.random().toString(36).slice(2);
      let newFolder = { id: idStr, name: name };
      state.folders.push(newFolder);
      saveFolders();
      renderLeftSidebar();
      if (callback) {
         callback(name);
      }
    } else {
      if (callback) {
         callback(null);
      }
    }
    wrap.style.display = 'none';
    input.removeEventListener('keydown', onKey);
    input.removeEventListener('blur', onBlur);
  }

  function onKey(e) {
    if (e.key === 'Enter') {
       finish();
    }
    if (e.key === 'Escape') {
      wrap.style.display = 'none';
      input.removeEventListener('keydown', onKey);
      input.removeEventListener('blur', onBlur);
      if (callback) {
         callback(null);
      }
    }
  }

  function onBlur() {
    setTimeout(finish, 120);
  }

  input.addEventListener('keydown', onKey);
  input.addEventListener('blur', onBlur);
}

function confirmDeleteFolder(folderId) {
  showConfirm(
    'Delete folder?',
    'Images in this folder will become uncategorized.',
    'Delete',
    function () {
      let newFolders = [];
      for (let f = 0; f < state.folders.length; f++) {
         if (state.folders[f].id !== folderId) {
            newFolders.push(state.folders[f]);
         }
      }
      state.folders = newFolders;
      saveFolders();

      for (let i = 0; i < state.images.length; i++) {
        if (state.images[i].folder === folderId) {
          state.images[i].folder = null;
        }
      }
      saveImages();

      if (state.activeFolder === folderId) {
        navigateTo('all');
      } else {
        renderLeftSidebar();
        renderGallery();
      }
    }
  );
}
