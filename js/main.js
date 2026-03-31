window.addEventListener('load', function () {
  renderLeftSidebar();
  wireTopbar();
  wireContextMenu();
  wireGalleryDragDrop();
  wireKeyboard();
  renderGallery();
  renderRightSidebar();
  updateNavButtons();
});

function wireTopbar() {
  document.getElementById('searchInput').addEventListener('input', function (e) {
    state.search = e.target.value;
    renderGallery();
  });

  document.getElementById('addFolderBtn').addEventListener('click', function () {
    createFolderInline(null);
  });
}

function wireContextMenu() {
  document.addEventListener('click', hideContextMenu);
  document.getElementById('ctxTrash').addEventListener('click', function () {
    if (contextTargetId) trashImage(contextTargetId);
    hideContextMenu();
  });
}

function wireGalleryDragDrop() {

}

function wireKeyboard() {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Backspace' && state.selectedId && !e.target.closest('input, textarea')) {
      trashImage(state.selectedId);
    }
  });
}


function openModal() { }
function closeModal() { }
