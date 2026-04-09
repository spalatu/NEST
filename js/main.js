

window.addEventListener('load', function () {

  loadStorage();

  renderLeftSidebar();
  renderGallery();
  renderRightSidebar();
  updateNavButtons();

  setupTopbar();
  setupImportModal();
  setupConfirmDialog();
  setupApiModal();
  setupContextMenu();
  setupDragDrop();
  setupKeyboard();
});

function setupTopbar() {
  const backBtn = document.getElementById('backBtn');
  const fwdBtn = document.getElementById('fwdBtn');
  const zoomSlider = document.getElementById('zoomSlider');
  const searchInput = document.getElementById('searchInput');
  const importBtn = document.getElementById('importBtn');
  const fileInput = document.getElementById('fileInput');
  const apiBtn = document.getElementById('apiBtn');
  const addFolderBtn = document.getElementById('addFolderBtn');
  const emptyTrashBtn = document.getElementById('emptyTrashBtn');

  backBtn.addEventListener('click', function () {
    if (state.navIndex > 0) {
      state.navIndex--;
      navigateTo(state.navHistory[state.navIndex], false);
    }
  });

  fwdBtn.addEventListener('click', function () {
    if (state.navIndex < state.navHistory.length - 1) {
      state.navIndex++;
      navigateTo(state.navHistory[state.navIndex], false);
    }
  });

  zoomSlider.addEventListener('input', function (e) {
    var zoomValue = parseInt(e.target.value);
    setZoom(zoomValue);
  });

  searchInput.addEventListener('input', function (e) {
    state.search = e.target.value;
    renderGallery();
  });

  importBtn.addEventListener('click', function () {
    fileInput.click();
  });

  fileInput.addEventListener('change', function (e) {
    handleFiles(e.target.files);
    e.target.value = '';
  });

  apiBtn.addEventListener('click', function () {
    openApiBrowser();
  });

  addFolderBtn.addEventListener('click', function () {
    createFolderInline(null);
  });

  emptyTrashBtn.addEventListener('click', function () {
    const trashedImages = state.images.filter(function (i) { return i.trashed; });
    const count = trashedImages.length;

    showConfirm(
      'Empty Trash',
      'Permanently delete ' + count + ' image' + (count === 1 ? '' : 's') + '? This cannot be undone.',
      'Empty Trash',
      function () {
        state.images = state.images.filter(function (i) { return !i.trashed; });
        saveImages();
        state.selectedId = null;
        renderLeftSidebar();
        renderGallery();
        renderRightSidebar();
      }
    );
  });
}

function setupImportModal() {
  const titleInput = document.getElementById('importTitleInput');
  const confirmBtn = document.getElementById('importConfirmBtn');
  const cancelBtn = document.getElementById('importCancelBtn');
  const modal = document.getElementById('importModal');

  titleInput.addEventListener('input', function () {

    confirmBtn.disabled = !titleInput.value.trim();
  });

  titleInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmBtn.click();
    }
  });

  confirmBtn.addEventListener('click', function () {
    const title = titleInput.value.trim();
    if (!title) return;

    console.log("confirming import with title:", title);
    closeModal('importModal');

    if (pendingApiPhoto) {
      confirmApiImport(title);
    } else {
      confirmImport(title);
    }
  });

  cancelBtn.addEventListener('click', function () {
    closeModal('importModal');
    window.pendingImport = null;
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeModal('importModal');
      window.pendingImport = null;
    }
  });
}

function setupConfirmDialog() {
  const okBtn = document.getElementById('confirmOkBtn');
  const cancelBtn = document.getElementById('confirmCancelBtn');
  const dialog = document.getElementById('confirmDialog');

  okBtn.addEventListener('click', function () {
    closeModal('confirmDialog');
    if (confirmCallback) {
      confirmCallback();
      confirmCallback = null;
    }
  });

  cancelBtn.addEventListener('click', function () {
    closeModal('confirmDialog');
    confirmCallback = null;
  });

  dialog.addEventListener('click', function (e) {
    if (e.target === dialog) {
      closeModal('confirmDialog');
      confirmCallback = null;
    }
  });
}

function setupApiModal() {
  const searchBtn = document.getElementById('apiSearchBtn');
  const searchInput = document.getElementById('apiSearchInput');
  const loadMoreBtn = document.getElementById('apiLoadMore');
  const closeBtn = document.getElementById('apiCloseBtn');
  const modal = document.getElementById('apiModal');

  searchBtn.addEventListener('click', function () {
    searchApi(true);
  });

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      searchApi(true);
    }
  });

  loadMoreBtn.addEventListener('click', function () {
    searchApi(false);
  });

  closeBtn.addEventListener('click', function () {
    closeModal('apiModal');
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeModal('apiModal');
    }
  });
}

function setupContextMenu() {
  const trashItem = document.getElementById('ctxTrash');
  const exportPng = document.getElementById('ctxExportPng');
  const exportJpg = document.getElementById('ctxExportJpg');

  trashItem.addEventListener('click', function () {
    if (contextTargetId) {
      trashImage(contextTargetId);
    }
    hideContextMenu();
  });

  exportPng.addEventListener('click', function () {
    if (contextTargetId) {

      const img = state.images.find(function (i) { return i.id === contextTargetId; });
      if (img) {
        exportImage(img, 'png');
      }
    }
    hideContextMenu();
  });

  exportJpg.addEventListener('click', function () {
    if (contextTargetId) {
      const img = state.images.find(function (i) { return i.id === contextTargetId; });
      if (img) {
        exportImage(img, 'jpg');
      }
    }
    hideContextMenu();
  });

  document.addEventListener('click', function (e) {
    const menu = document.getElementById('contextMenu');
    if (!menu.contains(e.target)) {
      hideContextMenu();
    }

    if (activeTagPopover && !activeTagPopover.contains(e.target)) {
      closePopovers();
    }
    if (activeFolderPopover && !activeFolderPopover.contains(e.target)) {
      closePopovers();
    }
  });
}

function setupDragDrop() {
  const gallery = document.getElementById('gallery');
  const overlay = document.getElementById('dropOverlay');

  gallery.addEventListener('dragover', function (e) {
    e.preventDefault();
    overlay.classList.add('active');
  });

  gallery.addEventListener('dragleave', function (e) {
    if (!gallery.contains(e.relatedTarget)) {
      overlay.classList.remove('active');
    }
  });

  gallery.addEventListener('drop', function (e) {
    e.preventDefault();
    overlay.classList.remove('active');
    const droppedFiles = e.dataTransfer.files;
    console.log("files dropped:", droppedFiles.length);
    handleFiles(droppedFiles);
  });
}

function setupKeyboard() {
  document.addEventListener('keydown', function (e) {

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
      e.preventDefault();
      trashImage(state.selectedId);
    }

    if (e.key === 'Escape') {
      state.selectedId = null;
      const cards = document.querySelectorAll('.img-card');
      for (let i = 0; i < cards.length; i++) {
        cards[i].classList.remove('selected');
      }
      renderRightSidebar();
      closePopovers();
      hideContextMenu();
    }
  });

  window.addEventListener('resize', function () {
    renderGallery();
  });
}
