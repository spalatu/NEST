var apiQuery = '';
var apiColumnHeights = [0, 0, 0];

function openApiBrowser() {
  openModal('apiModal');

  var searchInput = document.getElementById('apiSearchInput');

  if (apiQuery === '') {
    apiQuery = 'editorial design minimal';
    searchInput.value = apiQuery;
  } else {
    searchInput.value = apiQuery;
  }

  var statusEl = document.getElementById('apiStatus');
  var gridEl = document.getElementById('apiGrid');
  var loadMoreBtn = document.getElementById('apiLoadMore');

  statusEl.style.display = 'block';
  statusEl.textContent = 'Enter a query above to search.';
  gridEl.innerHTML = '';
  gridEl.style.display = 'none';
  loadMoreBtn.style.display = 'none';
}

function searchApi(reset) {
  var query = document.getElementById('apiSearchInput').value.trim();
  if (query === '') query = 'editorial design minimal';

  var statusEl = document.getElementById('apiStatus');
  var gridEl = document.getElementById('apiGrid');

  apiQuery = query;

  statusEl.style.display = 'block';
  statusEl.textContent = 'Searching\u2026';
  gridEl.style.display = 'none';

  // fetch not implemented yet
}
