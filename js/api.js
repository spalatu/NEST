let UNSPLASH_ACCESS_KEY = 'brLyW-27YytbSqrtkiYyfJ9oz1ifbnOkMPStsvDIHoQ';

let apiPage = 1;
let apiQuery = '';
let apiColumnHeights = [0, 0, 0];

let pendingApiPhoto = null;

function openApiBrowser() {
  openModal('apiModal');

  let searchInput = document.getElementById('apiSearchInput');

  if (apiQuery === '') {
    apiQuery = 'editorial design minimal';
    searchInput.value = apiQuery;
    searchApi(true);
  } else {
    searchInput.value = apiQuery;
  }
}

function searchApi(reset) {
  let query = document.getElementById('apiSearchInput').value.trim();
  if (query === '') {
    query = 'editorial design minimal';
  }

  let statusEl = document.getElementById('apiStatus');
  let gridEl = document.getElementById('apiGrid');
  let loadMoreBtn = document.getElementById('apiLoadMore');

  if (reset === true) {
    apiPage = 1;
    apiQuery = query;
    apiColumnHeights = [0, 0, 0];

    gridEl.innerHTML = '';
    gridEl.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    statusEl.style.display = 'block';
    statusEl.textContent = 'Searching…';

    for (let i = 0; i < 3; i++) {
      let col = document.createElement('div');
      col.className = 'unsplash-col';
      gridEl.appendChild(col);
    }
  }

  let url = 'https://api.unsplash.com/search/photos?query=' + encodeURIComponent(query) + '&per_page=15&page=' + apiPage;

  fetch(url, {
    headers: { 'Authorization': 'Client-ID ' + UNSPLASH_ACCESS_KEY }
  })
    .then(function (response) {
      if (response.ok === false) {
        throw new Error('API error ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (!data.results || data.results.length === 0) {
        statusEl.textContent = 'No results found.';
        return;
      }

      statusEl.style.display = 'none';
      gridEl.style.display = 'flex';

      let columns = gridEl.querySelectorAll('.unsplash-col');

      for (let p = 0; p < data.results.length; p++) {
        let photo = data.results[p];

        let shortestHeight = apiColumnHeights[0];
        let shortestIndex = 0;

        for (let c = 1; c < apiColumnHeights.length; c++) {
          if (apiColumnHeights[c] < shortestHeight) {
            shortestHeight = apiColumnHeights[c];
            shortestIndex = c;
          }
        }

        let ar = photo.width / photo.height;
        apiColumnHeights[shortestIndex] = apiColumnHeights[shortestIndex] + (210 / ar) + 10;

        let wrap = document.createElement('div');
        wrap.className = 'unsplash-img-wrap';

        let img = document.createElement('img');
        img.src = photo.urls.small;
        img.alt = photo.alt_description || photo.description || 'Unsplash photo';

        let overlay = document.createElement('div');
        overlay.className = 'unsplash-img-overlay';

        let addBtn = document.createElement('button');
        addBtn.className = 'unsplash-add-btn';
        addBtn.textContent = 'Add to Nest';

        addBtn.addEventListener('click', (function (ph) {
          return function () {
            startApiImport(ph);
          };
        })(photo));

        overlay.appendChild(addBtn);
        wrap.appendChild(img);
        wrap.appendChild(overlay);
        columns[shortestIndex].appendChild(wrap);
      }

      if (data.total_pages > apiPage) {
        apiPage++;
        loadMoreBtn.style.display = 'inline-flex';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    })
    .catch(function () {
      statusEl.style.display = 'block';
      statusEl.textContent = 'Error connecting to Unsplash. Check your internet connection.';
    });
}

function startApiImport(photo) {
  pendingApiPhoto = photo;
  closeModal('apiModal');

  let rawTitle = photo.alt_description || photo.description || 'Unsplash Image';
  let title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1).replace(/\s+/g, ' ').trim();

  document.getElementById('importTitleInput').value = title;

  let btn = document.getElementById('importConfirmBtn');
  btn.disabled = (title === '');

  document.getElementById('importModalTitle').textContent = 'Add Unsplash Image to Nest';

  openModal('importModal');
}

function confirmApiImport(title) {
  if (!pendingApiPhoto) return;

  let photo = pendingApiPhoto;
  pendingApiPhoto = null;

  let srcUrl = photo.urls.regular || photo.urls.full;

  fetch('https://api.unsplash.com/photos/' + photo.id + '/download', {
    headers: { 'Authorization': 'Client-ID ' + UNSPLASH_ACCESS_KEY }
  });

  let tempImg = new Image();
  tempImg.crossOrigin = 'anonymous';

  tempImg.onload = function () {
    extractColors(srcUrl, function (colors) {
      let timestamp = new Date().toISOString();
      let id = Date.now() + '_' + Math.random().toString(36).slice(2);

      let newImage = {
        id: id,
        title: title,
        src: srcUrl,
        width: tempImg.naturalWidth,
        height: tempImg.naturalHeight,
        fileSize: 'Online (API)',
        fileType: 'jpeg',
        description: photo.description || '',
        notes: '',
        source: photo.links ? photo.links.html : '',
        tags: [],
        folder: null,
        colors: colors,
        dateImported: timestamp,
        dateCreated: timestamp,
        dateModified: timestamp,
        trashed: false
      };

      addImage(newImage);
      renderLeftSidebar();
      renderGallery();
    });
  };

  tempImg.onerror = function () {
    console.log('Could not load image for import');
    alert('Failed to load image from Unsplash. Please try again.');
  };

  tempImg.src = srcUrl;
}
