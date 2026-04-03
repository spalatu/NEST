let masonryColumns = [];
let masonryColumnEls = [];

function getColumnCount() {
  let zoom = state.zoom / 100;
  if (zoom >= 1.8) {
    return 1;
  } else if (zoom >= 1.4) {
    return 2;
  } else if (zoom >= 1.0) {
    return 3;
  } else if (zoom >= 0.7) {
    return 5;
  } else {
    return 7;
  }
}

function renderGallery() {
  let inner = document.getElementById('galleryInner');
  let emptyState = document.getElementById('galleryEmpty');
  let images = getFilteredImages();

  inner.innerHTML = '';
  masonryColumns = [];
  masonryColumnEls = [];

  if (images.length === 0) {
    emptyState.style.display = 'flex';
    return;
  } else {
    emptyState.style.display = 'none';
  }

  let gallery = document.getElementById('gallery');
  let colCount = getColumnCount();
  let padding = 16;
  let gap = 10;

  let availableWidth = gallery.clientWidth - (padding * 2) - (gap * (colCount - 1));
  let colWidth = Math.floor(availableWidth / colCount);

  for (let i = 0; i < colCount; i++) {
    let col = document.createElement('div');
    col.className = 'masonry-col';
    col.style.width = colWidth + 'px';
    inner.appendChild(col);

    masonryColumns.push(0);
    masonryColumnEls.push(col);
  }

  for (let j = 0; j < images.length; j++) {
    placeCardInMasonry(images[j], colWidth, j);
  }
}

function placeCardInMasonry(img, colWidth, index) {
  let colIndex = index % masonryColumns.length;

  let card = buildCard(img, colWidth);
  masonryColumnEls[colIndex].appendChild(card);
}

function buildCard(img, colWidth) {
  let aspectRatio = 1.5;
  if (img.width && img.height) {
    aspectRatio = img.width / img.height;
  }
  let imageHeight = Math.round(colWidth / aspectRatio);

  let card = document.createElement('div');
  card.className = 'img-card';

  if (state.selectedId === img.id) {
    card.className = card.className + ' selected';
  }

  card.dataset.id = img.id;

  let imgEl = document.createElement('img');
  imgEl.setAttribute('src', img.src);
  imgEl.setAttribute('alt', img.title);
  imgEl.style.height = imageHeight + 'px';
  imgEl.draggable = false;

  let info = document.createElement('div');
  info.className = 'img-card-info';

  let titleDiv = document.createElement('div');
  titleDiv.className = 'img-card-title';
  titleDiv.textContent = img.title;

  let dimsDiv = document.createElement('div');
  dimsDiv.className = 'img-card-dims';
  dimsDiv.textContent = img.width + 'x' + img.height;

  info.appendChild(titleDiv);
  info.appendChild(dimsDiv);

  card.appendChild(imgEl);
  card.appendChild(info);

  card.addEventListener('click', function () {
    selectImage(img.id);
  });

  card.addEventListener('contextmenu', function (e) {
    showContextMenu(e, img.id);
  });

  return card;
}

function selectImage(id) {
  state.selectedId = id;

  let cards = document.querySelectorAll('.img-card');
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].dataset.id === id) {
      cards[i].classList.add('selected');
    } else {
      cards[i].classList.remove('selected');
    }
  }

  renderRightSidebar();
}

function setZoom(value) {
  state.zoom = value;
  let zoomLabel = document.getElementById('zoomLabel');
  zoomLabel.textContent = value + '%';
  renderGallery();
}

function exportImage(img, format) {
  let image = new Image();

  image.onload = function () {
    let canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    let ctx = canvas.getContext('2d');
    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);

    let mimeType = 'image/jpeg';
    if (format === 'png') {
       mimeType = 'image/png';
    }

    let quality;
    if (format === 'jpg') {
       quality = 0.92;
    }

    let cleanTitle = img.title.replace(/\s+/g, '_');
    let fileName = cleanTitle + '.' + format;

    canvas.toBlob(function (blob) {
      if (blob) {
        let url = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();

        setTimeout(function () { 
           URL.revokeObjectURL(url); 
        }, 1000);
      }
    }, mimeType, quality);
  };

  image.src = img.src;
}