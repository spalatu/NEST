var state = {
  images: [
    {
      id: "img1",
      title: "Hardcoded Nature",
      src: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=500&q=80",
      width: 500, height: 333,
      fileSize: "0 KB", fileType: "jpeg",
      description: '', notes: '', source: '', tags: [], folder: null, colors: [],
      dateImported: new Date().toISOString(), dateCreated: new Date().toISOString(), dateModified: new Date().toISOString(),
      trashed: false
    },
    {
      id: "img2",
      title: "Mountain Concept",
      src: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=500&q=80",
      width: 500, height: 333,
      fileSize: "0 KB", fileType: "jpeg",
      description: '', notes: '', source: '', tags: [], folder: null, colors: [],
      dateImported: new Date().toISOString(), dateCreated: new Date().toISOString(), dateModified: new Date().toISOString(),
      trashed: false
    }
  ],
  folders: [],
  activeFolder: 'all',
  selectedId: null,
  zoom: 100,
  search: '',
  navHistory: ['all'],
  navIndex: 0
};

function loadStorage() {}
function saveImages() {}
function saveFolders() {}
function addImage(img) { state.images.unshift(img); saveImages(); }
function updateImage(id, patch) {
  var idx = -1;
  for (var i = 0; i < state.images.length; i++) {
    if (state.images[i].id === id) { idx = i; break; }
  }
  if (idx !== -1) {
    for (var key in patch) { state.images[idx][key] = patch[key]; }
    state.images[idx].dateModified = new Date().toISOString();
  }
}
function trashImage(id) { updateImage(id, { trashed: true }); renderGallery(); }
function getFilteredImages() { return state.images; }
function getFolderCount(folderId) { return 0; }
function generateId() { return Math.random().toString(36).slice(2); }
function nowISO() { return new Date().toISOString(); }
function formatBytes(bytes) { return bytes + ' B'; }
function formatDate(isoString) { return isoString; }
function escapeHtml(str) { return String(str); }