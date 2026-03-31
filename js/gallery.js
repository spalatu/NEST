var masonryColumns = [];
var masonryColumnEls = [];

function getColumnCount() {
  var zoom = state.zoom / 100;
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
  var inner = document.getElementById('galleryInner');
  var emptyState = document.getElementById('galleryEmpty');
  var images = getFilteredImages();

  inner.innerHTML = '';
  masonryColumns = [];
  masonryColumnEls = [];

  if (images.length === 0) {
    emptyState.style.display = 'flex';
    return;
  } else {
    emptyState.style.display = 'none';
  }

  var gallery = document.getElementById('gallery');
  var colCount = getColumnCount();
  var padding = 16;
  var gap = 10;

  var availableWidth = gallery.clientWidth - (padding * 2) - (gap * (colCount - 1));
  var colWidth = Math.floor(availableWidth / colCount);

  for (var i = 0; i < colCount; i++) {
    var col = document.createElement('div');
    col.className = 'masonry-col';
    col.style.width = colWidth + 'px';
    inner.appendChild(col);

    masonryColumns.push(0);
    masonryColumnEls.push(col);
  }

  for (var j = 0; j < images.length; j++) {
    placeCardInMasonry(images[j], colWidth);
  }
}

function placeCardInMasonry(img, colWidth) {
  var shortestHeight = masonryColumns[0];
  var shortestIndex = 0;

  for (var i = 1; i < masonryColumns.length; i++) {
    if (masonryColumns[i] < shortestHeight) {
      shortestHeight = masonryColumns[i];
      shortestIndex = i;
    }
  }

  var card = buildCard(img, colWidth);
  masonryColumnEls[shortestIndex].appendChild(card);

  var aspectRatio = 1.5;
  if (img.width && img.height) {
    aspectRatio = img.width / img.height;
  }

  var imageHeight = colWidth / aspectRatio;
  masonryColumns[shortestIndex] = masonryColumns[shortestIndex] + imageHeight + 49 + 10;
}

function buildCard(img, colWidth) {
  var aspectRatio = 1.5;
  if (img.width && img.height) {
    aspectRatio = img.width / img.height;
  }
  var imageHeight = Math.round(colWidth / aspectRatio);

  var card = document.createElement('div');
  card.className = 'img-card';

  if (state.selectedId === img.id) {
    card.className = card.className + ' selected';
  }

  card.dataset.id = img.id;

  var imgEl = document.createElement('img');
  imgEl.setAttribute('src', img.src);
  imgEl.setAttribute('alt', img.title);
  imgEl.style.height = imageHeight + 'px';
  imgEl.draggable = false;

  var info = document.createElement('div');
  info.className = 'img-card-info';

  var titleDiv = document.createElement('div');
  titleDiv.className = 'img-card-title';
  titleDiv.innerHTML = escapeHtml(img.title);

  var dimsDiv = document.createElement('div');
  dimsDiv.className = 'img-card-dims';
  dimsDiv.innerHTML = img.width + 'x' + img.height;

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

  var cards = document.querySelectorAll('.img-card');
  for (var i = 0; i < cards.length; i++) {
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
  var zoomLabel = document.getElementById('zoomLabel');
  zoomLabel.textContent = value + '%';
  renderGallery();
}

function exportImage(img, format) {
  var image = new Image();

  image.onload = function () {
    var canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    var ctx = canvas.getContext('2d');
    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(image, 0, 0);

    var mimeType = 'image/jpeg';
    if (format === 'png') {
      mimeType = 'image/png';
    }

    var quality;
    if (format === 'jpg') {
      quality = 0.92;
    }

    var cleanTitle = "";
    for (var i = 0; i < img.title.length; i++) {
      var charCode = img.title.charCodeAt(i);
      if ((charCode > 47 && charCode < 58) ||
        (charCode > 64 && charCode < 91) ||
        (charCode > 96 && charCode < 123)) {
        cleanTitle += img.title[i];
      } else {
        cleanTitle += "_";
      }
    }
    var fileName = cleanTitle + '.' + format;

    canvas.toBlob(function (blob) {
      if (blob) {
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
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