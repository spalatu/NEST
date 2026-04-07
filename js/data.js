let state = {
  images: [],
  folders: [],
  activeFolder: 'all',
  selectedId: null,
  zoom: 100,
  search: '',
  navHistory: ['all'],
  navIndex: 0
};

const LS_IMAGES = 'nest_images';
const LS_FOLDERS = 'nest_folders';

function loadStorage() {
  console.log("loading saved images...");
  let imagesRaw = localStorage.getItem(LS_IMAGES);
  let foldersRaw = localStorage.getItem(LS_FOLDERS);

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

function saveImages() {
  try {
    localStorage.setItem(LS_IMAGES, JSON.stringify(state.images));
  } catch (err) {
    console.error("Local storage error:", err);
    alert("Could not save to local storage. Your browser's 5MB limit might be full!");
  }
}

function saveFolders() {
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
  let idx = -1;
  for (let i = 0; i < state.images.length; i++) {
    if (state.images[i].id === id) {
      idx = i;
      break;
    }
  }

  if (idx === -1) {
    return;
  }

  let currentImage = state.images[idx];
  for (let key in patch) {
    currentImage[key] = patch[key];
  }
  currentImage.dateModified = new Date().toISOString();

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
  let q = state.search.toLowerCase().trim();
  let sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  let filtered = [];

  for (let i = 0; i < state.images.length; i++) {
    let img = state.images[i];
    let keep = true;

    if (state.activeFolder === 'trash') {
      if (img.trashed !== true) {
        keep = false;
      }
    } else {
      if (img.trashed === true) {
        keep = false;
      } else {
        if (state.activeFolder === 'all') {

        } else if (state.activeFolder === 'uncategorized') {
          if (img.folder) {
            keep = false;
          }
        } else if (state.activeFolder === 'untagged') {
          if (img.tags && img.tags.length > 0) {
            keep = false;
          }
        } else if (state.activeFolder === 'recent') {
          let modTime = new Date(img.dateModified).getTime();
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
      let title = img.title.toLowerCase();
      let desc = "";
      if (img.description) {
         desc = img.description.toLowerCase();
      }

      let inTitle = title.includes(q);
      let inDesc = desc.includes(q);

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
  let sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  let count = 0;

  for (let i = 0; i < state.images.length; i++) {
    let img = state.images[i];

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
      let modTime = new Date(img.dateModified).getTime();
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