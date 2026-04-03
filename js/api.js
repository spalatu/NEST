let apiQuery = '';
let apiColumnHeights = [0, 0, 0];

function openApiBrowser() {
  openModal('apiModal');

  let searchInput = document.getElementById('apiSearchInput');

  if (apiQuery === '') {
    apiQuery = 'editorial design minimal';
    searchInput.value = apiQuery;
  } else {
    searchInput.value = apiQuery;
  }

  let statusEl = document.getElementById('apiStatus');
  let gridEl = document.getElementById('apiGrid');
  let loadMoreBtn = document.getElementById('apiLoadMore');

  statusEl.style.display = 'block';
  statusEl.textContent = 'Enter a query above to search.';
  gridEl.innerHTML = '';
  gridEl.style.display = 'none';
  loadMoreBtn.style.display = 'none';
}

function searchApi(reset) {
  let query = document.getElementById('apiSearchInput').value.trim();
  if (query === '') query = 'editorial design minimal';

  let statusEl = document.getElementById('apiStatus');
  let gridEl = document.getElementById('apiGrid');

  apiQuery = query;

  statusEl.style.display = 'block';
  statusEl.textContent = 'Searching\u2026';
  gridEl.style.display = 'none';

  // fetch not implemented yet
}
