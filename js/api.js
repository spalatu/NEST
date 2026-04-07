let PEXELS_API_KEY = '563492ad6f917000010000018a1a3b4f62ca493c83b8b1dc6ef4a37b';

let apiPage = 1;
let apiQuery = '';

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
    gridEl.innerHTML = '';
    gridEl.style.display = 'none';
    loadMoreBtn.style.display = 'none';
    statusEl.style.display = 'block';
    statusEl.textContent = 'Searching…';
  }

  console.log("fetching pexels, page:", apiPage);

  let url = 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(query) + '&per_page=15&page=' + apiPage;

  fetch(url, {
    headers: { 'Authorization': PEXELS_API_KEY }
  })
    .then(function (response) {
      if (response.ok === false) {
        throw new Error('API error ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (!data.photos || data.photos.length === 0) {
        statusEl.textContent = 'No results found.';
        return;
      }

      statusEl.style.display = 'none';
      gridEl.style.display = 'flex';

      for (let i = 0; i < data.photos.length; i++) {
        let photo = data.photos[i];

        let wrap = document.createElement('div');
        wrap.className = 'unsplash-img-wrap';

        let img = document.createElement('img');
        img.src = photo.src.medium;
        img.alt = photo.alt || 'Pexels photo';

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
        gridEl.appendChild(wrap);
      }

      if (data.total_results > apiPage * 15) {
        apiPage++;
        loadMoreBtn.style.display = 'inline-flex';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    })
    .catch(function (err) {
      statusEl.style.display = 'block';
      statusEl.textContent = 'Error connecting to Pexels. Check your internet connection.';
    });
}

function startApiImport(photo) {
  pendingApiPhoto = photo;
  closeModal('apiModal');

  let title = photo.alt || 'Pexels Image';
  // capitalize first letter
  title = title.charAt(0).toUpperCase() + title.slice(1);

  document.getElementById('importTitleInput').value = title;

  let btn = document.getElementById('importConfirmBtn');
  btn.disabled = (title === '');

  document.getElementById('importModalTitle').textContent = 'Add Image to Nest';

  openModal('importModal');
}

function confirmApiImport(title) {
  if (!pendingApiPhoto) return;

  let photo = pendingApiPhoto;
  pendingApiPhoto = null;

  let srcUrl = photo.src.large;

  let timestamp = new Date().toISOString();
  let id = Date.now() + '_' + Math.random().toString(36).slice(2);

  let newImage = {
    id: id,
    title: title,
    src: srcUrl,
    width: photo.width,
    height: photo.height,
    fileSize: 'Online',
    fileType: 'jpeg',
    description: photo.alt || '',
    notes: '',
    source: photo.url || '',
    tags: [],
    folder: null,
    colors: [],
    dateImported: timestamp,
    dateCreated: timestamp,
    dateModified: timestamp,
    trashed: false
  };

  addImage(newImage);
  renderLeftSidebar();
  renderGallery();
}
