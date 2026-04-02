var importQueue = [];
var importQueueIndex = 0;

function handleFiles(files) {
  var imageFiles = [];
  
  for (var i = 0; i < files.length; i++) {
     var f = files[i];
     if (f.type && f.type.startsWith('image/')) {
        imageFiles.push(f);
     }
  }

  if (imageFiles.length === 0) {
     return;
  }

  importQueue = imageFiles;
  importQueueIndex = 0;
  processNextInQueue();
}

function processNextInQueue() {
  if (importQueueIndex >= importQueue.length) {
    importQueue = [];
    return;
  }

  var file = importQueue[importQueueIndex];
  var reader = new FileReader();

  reader.onload = function (e) {
    var src = e.target.result;
    var tempImg = new Image();

    tempImg.onload = function () {
      var fType = 'jpeg';
      
      var maxW = 1000;
      var maxH = 1000;
      var cw = tempImg.naturalWidth;
      var ch = tempImg.naturalHeight;
      
      if (cw > maxW || ch > maxH) {
        var ratio = maxW / cw;
        if (maxH / ch < ratio) {
           ratio = maxH / ch;
        }
        cw = Math.round(cw * ratio);
        ch = Math.round(ch * ratio);
      }
      
      var canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(tempImg, 0, 0, cw, ch);
      
      var compressedSrc = canvas.toDataURL('image/jpeg', 0.65);

      window.pendingImport = {
        src: compressedSrc,
        width: tempImg.naturalWidth,
        height: tempImg.naturalHeight,
        fileSize: formatBytes(file.size),
        fileType: fType,
        colors: []
      };



      var guessedTitle = "";
      var nameParts = file.name.split('.');
      if (nameParts.length > 1) {
         nameParts.pop(); 
      }
      var noExt = nameParts.join('.');
      
      for (var j = 0; j < noExt.length; j++) {
         var c = noExt[j];
         if (c === '-' || c === '_') {
            guessedTitle += ' ';
         } else {
            guessedTitle += c;
         }
      }
      
      guessedTitle = guessedTitle.trim();

      var input = document.getElementById('importTitleInput');
      input.value = guessedTitle;
      
      if (guessedTitle === '') {
         document.getElementById('importConfirmBtn').disabled = true;
      } else {
         document.getElementById('importConfirmBtn').disabled = false;
      }
      
      document.getElementById('importModalTitle').textContent = 'Add to Nest (' + (importQueueIndex + 1) + '/' + importQueue.length + ')';

      openModal('importModal');
      input.select();
    };

    tempImg.src = src;
  };

  reader.readAsDataURL(file);
}

function confirmImport(title) {
  if (!window.pendingImport) return;

  var timestamp = nowISO();
  var newImage = {
    id: generateId(),
    title: title,
    src: window.pendingImport.src,
    width: window.pendingImport.width,
    height: window.pendingImport.height,
    fileSize: window.pendingImport.fileSize,
    fileType: window.pendingImport.fileType,
    description: '',
    notes: '',
    source: '',
    tags: [],
    folder: null,
    colors: window.pendingImport.colors,
    dateImported: timestamp,
    dateCreated: timestamp,
    dateModified: timestamp,
    trashed: false
  };

  addImage(newImage);
  window.pendingImport = null;
  importQueueIndex++;

  renderLeftSidebar();
  renderGallery();

  if (importQueueIndex < importQueue.length) {
    setTimeout(processNextInQueue, 80);
  }
}
