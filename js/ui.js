function openModal(id) {
  var modal = document.getElementById(id);
  modal.className = modal.className + ' open';
}

function closeModal(id) {
  var modal = document.getElementById(id);
  modal.className = modal.className.replace(' open', '');
}

// ── Confirm dialog (replaces window.confirm) ──
var confirmCallback = null;

function showConfirm(title, message, actionLabel, callback) {
  confirmCallback = callback;
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = message;
  document.getElementById('confirmOkBtn').textContent = actionLabel;
  openModal('confirmDialog');
}

var contextTargetId = null;

function showContextMenu(e, imageId) {
  e.preventDefault();
  contextTargetId = imageId;

  var menu = document.getElementById('contextMenu');
  menu.style.display = 'block';

  var x = e.clientX;
  if (x > window.innerWidth - menu.offsetWidth - 8) {
     x = window.innerWidth - menu.offsetWidth - 8;
  }
  
  var y = e.clientY;
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
var activeTagPopover = null;

function openTagPopover(imageId, anchorBtn) {
  closePopovers();

  var img = null;
  for (var i = 0; i < state.images.length; i++) {
     if (state.images[i].id === imageId) {
        img = state.images[i];
        break;
     }
  }
  
  if (!img) {
      return;
  }

  var popover = document.createElement('div');
  popover.className = 'popover';
  popover.id = 'tagPopover';

  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'popover-search';
  searchInput.placeholder = 'Search or add tag…';
  popover.appendChild(searchInput);

  var list = document.createElement('div');
  list.className = 'popover-list';
  popover.appendChild(list);

  function buildTagList(query) {
    list.innerHTML = '';

    var allTags = [];
    for (var k = 0; k < state.images.length; k++) {
       var tgs = state.images[k].tags;
       if (tgs) {
          for (var tIdx = 0; tIdx < tgs.length; tIdx++) {
             var t = tgs[tIdx];
             var exists = false;
             for (var aIdx = 0; aIdx < allTags.length; aIdx++) {
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

    var currentTags = [];
    if (img.tags) {
       currentTags = img.tags;
    }
    
    var matches = [];
    for (var m = 0; m < allTags.length; m++) {
       var tag = allTags[m];
       if (tag.toLowerCase().includes(query.toLowerCase())) {
          var isApplied = false;
          for (var c = 0; c < currentTags.length; c++) {
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

    for (var n = 0; n < matches.length; n++) {
      var tagStr = matches[n];
      var item = document.createElement('div');
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

    var trimmed = query.trim();
    
    var alreadyExists = false;
    for (var t2 = 0; t2 < allTags.length; t2++) {
       if (allTags[t2].toLowerCase() === trimmed.toLowerCase()) {
          alreadyExists = true;
          break;
       }
    }
    
    var alreadyApplied = false;
    for (var c2 = 0; c2 < currentTags.length; c2++) {
       if (currentTags[c2].toLowerCase() === trimmed.toLowerCase()) {
          alreadyApplied = true;
          break;
       }
    }
    
    if (trimmed !== "" && !alreadyExists && !alreadyApplied) {
      var addItem = document.createElement('div');
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

  var rect = anchorBtn.getBoundingClientRect();
  popover.style.left = rect.left + 'px';
  popover.style.top = (rect.bottom + 6) + 'px';

  setTimeout(function () { 
     searchInput.focus(); 
  }, 10);
}

function addTagToImage(imageId, tag) {
  var img = null;
  for (var i = 0; i < state.images.length; i++) {
     if (state.images[i].id === imageId) {
        img = state.images[i];
        break;
     }
  }
  
  if (!img) return;

  var existing = [];
  if (img.tags) {
     existing = img.tags;
  }
  
  var hasTag = false;
  for (var j = 0; j < existing.length; j++) {
     if (existing[j] === tag) {
        hasTag = true;
        break;
     }
  }
  
  if (hasTag) {
     return;
  }

  var newTags = [];
  for (var k = 0; k < existing.length; k++) {
     newTags.push(existing[k]);
  }
  newTags.push(tag);
  
  updateImage(imageId, { tags: newTags });
  renderRightSidebar();
}

var activeFolderPopover = null;

function openFolderPopover(imageId, anchorBtn) {
  closePopovers();

  var img = null;
  for (var i = 0; i < state.images.length; i++) {
     if (state.images[i].id === imageId) {
        img = state.images[i];
        break;
     }
  }
  
  if (!img) return;

  var popover = document.createElement('div');
  popover.className = 'popover';
  popover.id = 'folderPopover';

  for (var f = 0; f < state.folders.length; f++) {
    var folder = state.folders[f];
    
    var item = document.createElement('div');
    item.className = 'folder-pop-item';

    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'folderPick';
    if (img.folder === folder.id) {
       radio.checked = true;
    } else {
       radio.checked = false;
    }

    var label = document.createElement('span');
    var ICON_FOLDER = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 3C1 1.89543 1.89543 1 3 1H5C5.55228 1 6.08264 1.20092 6.4714 1.58969L7.5286 2.64689C7.91736 3.03566 8.44772 3.23658 9 3.23658H11C12.1046 3.23658 13 4.13201 13 5.23658V11C13 12.1046 12.1046 13 11 13H3C1.89543 13 1 12.1046 1 11V3Z" stroke="currentColor" stroke-width="1.6"/></svg>';
    label.innerHTML = '<span style="color:var(--yellow);display:inline-flex;vertical-align:middle;margin-right:4px">' + ICON_FOLDER + '</span>' + escapeHtml(folder.name);

    item.appendChild(radio);
    item.appendChild(label);

    item.addEventListener('click', (function(fld) {
      return function () {
        var newFolder = null;
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

  var newFolderItem = document.createElement('div');
  newFolderItem.className = 'folder-pop-item add-new';
  newFolderItem.style.color = 'var(--accent)';
  var ICON_PLUS_SM = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  newFolderItem.innerHTML = ICON_PLUS_SM + ' <span>New folder…</span>';
  
  newFolderItem.addEventListener('click', function () {
    closePopovers();
    createFolderInline(function (newName) {
      if (newName) {
        var created = null;
        for (var idx = 0; idx < state.folders.length; idx++) {
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

  var rect = anchorBtn.getBoundingClientRect();
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
  var wrap = document.getElementById('newFolderInputWrap');
  var input = document.getElementById('newFolderInput');
  wrap.style.display = 'block';
  input.value = '';
  input.focus();

  function finish() {
    var name = input.value.trim();
    if (name !== "") {
      var idStr = Date.now().toString(36) + Math.random().toString(36).slice(2);
      var newFolder = { id: idStr, name: name };
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
      var newFolders = [];
      for (var f = 0; f < state.folders.length; f++) {
         if (state.folders[f].id !== folderId) {
            newFolders.push(state.folders[f]);
         }
      }
      state.folders = newFolders;
      saveFolders();

      for (var i = 0; i < state.images.length; i++) {
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
