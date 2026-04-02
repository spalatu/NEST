var state = {
  images: [],
  folders: [],
  activeFolder: 'all',
  selectedId: null,
  zoom: 100,
  search: '',
  navHistory: ['all'],
  navIndex: 0
};

var LS_IMAGES = 'nest_images';
var LS_FOLDERS = 'nest_folders';

function loadStorage() { return;
  var imagesRaw = localStorage.getItem(LS_IMAGES);
  var foldersRaw = localStorage.getItem(LS_FOLDERS);

  if (imagesRaw) {
    state.images = JSON.parse(imagesRaw);
  } else {
    state.images = [];
  }

  if (foldersRaw) {
    state.folders = JSON.parse(foldersRaw);
  } else {
    state.folders = [];
  }
}

function saveImages() { return;
  try {
    localStorage.setItem(LS_IMAGES, JSON.stringify(state.images));
  } catch (err) {
    console.error("Local storage error:", err);
    alert("Could not save to local storage. Your browser's 5MB limit might be full!");
  }
}

function saveFolders() { return;
  try {
    localStorage.setItem(LS_FOLDERS, JSON.stringify(state.folders));
  } catch (err) {
    console.error("Local storage error:", err);
  }
}

function addImage(img) {
  state.images.unshift(img);
  saveImages();
}

function updateImage(id, patch) {
  var idx = -1;
  for (var i = 0; i < state.images.length; i++) {
    if (state.images[i].id === id) {
      idx = i;
      break;
    }
  }
  
  if (idx === -1) {
    return;
  }

  var currentImage = state.images[idx];
  for (var key in patch) {
    currentImage[key] = patch[key];
  }
  currentImage.dateModified = nowISO();
  
  state.images[idx] = currentImage;
  saveImages();

  renderLeftSidebar();
  if (state.selectedId === id) {
     renderRightSidebar();
  }
}

function trashImage(id) {
  updateImage(id, { trashed: true });

  if (state.selectedId === id) {
    state.selectedId = null;
    renderRightSidebar();
  }

  renderGallery();
}

function getFilteredImages() {
  var q = state.search.toLowerCase().trim();
  var sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  var filtered = [];

  for (var i = 0; i < state.images.length; i++) {
    var img = state.images[i];
    var keep = true;

    if (state.activeFolder === 'trash') {
      if (img.trashed !== true) {
        keep = false;
      }
    } else {
      if (img.trashed === true) {
        keep = false;
      } else {
        if (state.activeFolder === 'all') {
          // keep is true
        } else if (state.activeFolder === 'uncategorized') {
          if (img.folder) {
            keep = false;
          }
        } else if (state.activeFolder === 'untagged') {
          if (img.tags && img.tags.length > 0) {
            keep = false;
          }
        } else if (state.activeFolder === 'recent') {
          var modTime = new Date(img.dateModified).getTime();
          if (modTime < sevenDaysAgo) {
            keep = false;
          }
        } else {
          if (img.folder !== state.activeFolder) {
            keep = false;
          }
        }
      }
    }

    if (keep && q !== "") {
      var title = img.title.toLowerCase();
      var desc = "";
      if (img.description) {
         desc = img.description.toLowerCase();
      }
      
      var inTitle = title.includes(q);
      var inDesc = desc.includes(q);
      
      if (inTitle === false && inDesc === false) {
        keep = false;
      }
    }

    if (keep === true) {
      filtered.push(img);
    }
  }

  return filtered;
}

function getFolderCount(folderId) {
  var sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  var count = 0;

  for (var i = 0; i < state.images.length; i++) {
    var img = state.images[i];
    
    if (folderId === 'trash') {
       if (img.trashed === true) {
          count++;
       }
       continue;
    }
    
    if (img.trashed === true) {
       continue;
    }

    if (folderId === 'all') {
      count++;
    } else if (folderId === 'uncategorized') {
      if (!img.folder) {
        count++;
      }
    } else if (folderId === 'untagged') {
      if (!img.tags || img.tags.length === 0) {
        count++;
      }
    } else if (folderId === 'recent') {
      var modTime = new Date(img.dateModified).getTime();
      if (modTime >= sevenDaysAgo) {
        count++;
      }
    } else {
      if (img.folder === folderId) {
        count++;
      }
    }
  }
  
  return count;
}

function generateId() {
  var ranStr = Math.random().toString(36).slice(2);
  return Date.now().toString(36) + ranStr;
}

function nowISO() {
  return new Date().toISOString();
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

function formatDate(isoString) {
  if (!isoString) {
    return '—';
  }
  var d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  var s = String(str);
  s = s.split('&').join('&amp;');
  s = s.split('<').join('&lt;');
  s = s.split('>').join('&gt;');
  s = s.split('"').join('&quot;');
  return s;
}