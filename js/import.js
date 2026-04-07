function handleFiles(files) {
  let imageFiles = [];

  for (let i = 0; i < files.length; i++) {
     let f = files[i];
     if (f.type && f.type.startsWith('image/')) {
        imageFiles.push(f);
     }
  }

  if (imageFiles.length === 0) {
     return;
  }

  let file = imageFiles[0];
  let reader = new FileReader();

  reader.onload = function (e) {
    console.log("file loaded via FileReader");
    let src = e.target.result;

    window.pendingImport = {
      src: src,
      fileSize: Math.round(file.size / 1024) + ' KB',

      fileType: 'jpeg',
      colors: []
    };

    extractColors(src, function (colors) {
      if (window.pendingImport) {
        window.pendingImport.colors = colors;
      }
    });

    let nameParts = file.name.split('.');
    if (nameParts.length > 1) {
       nameParts.pop();
    }
    let guessedTitle = nameParts.join('.').replace(/[-_]/g, ' ').trim();

    let input = document.getElementById('importTitleInput');
    input.value = guessedTitle;

    if (guessedTitle === '') {
       document.getElementById('importConfirmBtn').disabled = true;
    } else {
       document.getElementById('importConfirmBtn').disabled = false;
    }

    document.getElementById('importModalTitle').textContent = 'Add to Nest';

    openModal('importModal');
    input.select();
  };

  reader.readAsDataURL(file);
}

function confirmImport(title) {
  if (!window.pendingImport) return;

  let timestamp = new Date().toISOString();
  let id = Date.now() + '_' + Math.random().toString(36).slice(2);

  let newImage = {
    id: id,
    title: title,
    src: window.pendingImport.src,
    width: 0,
    height: 0,
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

  renderLeftSidebar();
  renderGallery();
}

function extractColors(src, callback) {
  let img = new Image();
  img.crossOrigin = 'anonymous';

  img.onload = function () {
    let canvas = document.createElement('canvas');
    let MAX_SIZE = 80;

    let scale1 = MAX_SIZE / img.width;
    let scale2 = MAX_SIZE / img.height;
    let scale = scale1;
    if (scale2 < scale) {
       scale = scale2;
    }
    if (1 < scale) {
       scale = 1;
    }

    let cw = Math.round(img.width * scale);
    if (cw < 1) cw = 1;
    let ch = Math.round(img.height * scale);
    if (ch < 1) ch = 1;

    canvas.width = cw;
    canvas.height = ch;

    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let pixelData;
    try {
      pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    } catch (err) {
      callback([]);
      return;
    }

    let pixels = [];
    let seenCounts = {};
    let step = 12;

    for (let i = 0; i < pixelData.length; i += step) {
      if (pixelData[i + 3] < 128) continue; 

      let r = pixelData[i];
      let g = pixelData[i + 1];
      let b = pixelData[i + 2];

      let rKey = Math.floor(r / 16);
      let gKey = Math.floor(g / 16);
      let bKey = Math.floor(b / 16);
      let key = rKey + "," + gKey + "," + bKey;

      if (!seenCounts[key]) {
         seenCounts[key] = 0;
      }

      if (seenCounts[key] < 200) {
        pixels.push([r, g, b]);
        seenCounts[key]++;
      }
    }

    if (pixels.length === 0) { 
       callback([]); 
       return; 
    }

    let clusters = medianCut(pixels, 5);
    let total = pixels.length;

    let hexGroups = {};
    for (let c = 0; c < clusters.length; c++) {
      let cl = clusters[c];
      let rr = Math.round(cl.center[0]);
      let gg = Math.round(cl.center[1]);
      let bb = Math.round(cl.center[2]);

      let hr = rr.toString(16);
      if (hr.length < 2) hr = "0" + hr;
      let hg = gg.toString(16);
      if (hg.length < 2) hg = "0" + hg;
      let hb = bb.toString(16);
      if (hb.length < 2) hb = "0" + hb;
      let hex = '#' + hr + hg + hb;
      hex = hex.toUpperCase();

      if (!hexGroups[hex]) {
         hexGroups[hex] = { hex: hex, count: 0, r: rr, g: gg, b: bb };
      }
      hexGroups[hex].count += cl.count;
    }

    let sorted = [];
    for (let hx in hexGroups) {
        sorted.push(hexGroups[hx]);
    }

    for (let s1 = 0; s1 < sorted.length; s1++) {
       for (let s2 = s1 + 1; s2 < sorted.length; s2++) {
          if (sorted[s2].count > sorted[s1].count) {
             let temp = sorted[s1];
             sorted[s1] = sorted[s2];
             sorted[s2] = temp;
          }
       }
    }

    let finalColors = [];
    for (let j = 0; j < sorted.length; j++) {
      if (finalColors.length >= 7) {
         break;
      }
      let curr = sorted[j];
      let isTooSimilar = false;

      for (let k = 0; k < finalColors.length; k++) {
        let prev = finalColors[k];

        let diffR = curr.r - prev.r;
        let diffG = curr.g - prev.g;
        let diffB = curr.b - prev.b;

        let dist = Math.sqrt((diffR*diffR) + (diffG*diffG) + (diffB*diffB));

        if (dist < 30) {
          isTooSimilar = true;
          let addPct = Math.round((curr.count / total) * 100);
          prev.percent += addPct;
          break;
        }
      }

      if (!isTooSimilar) {
        let pct = Math.round((curr.count / total) * 100);
        finalColors.push({
          hex: curr.hex,
          percent: pct,
          r: curr.r, 
          g: curr.g, 
          b: curr.b
        });
      }
    }

    let result = [];
    for (let fr = 0; fr < finalColors.length; fr++) {
       if (finalColors[fr].percent >= 1) {
          result.push({
             hex: finalColors[fr].hex,
             percent: finalColors[fr].percent
          });
       }
    }

    callback(result);
  };

  img.onerror = function () { 
     callback([]); 
  };

  img.src = src;
}

function medianCut(pixels, depth) {
  if (depth === 0 || pixels.length === 0) {
    if (pixels.length === 0) {
       return [];
    }

    let sumR = 0, sumG = 0, sumB = 0;
    for (let i = 0; i < pixels.length; i++) {
       sumR += pixels[i][0];
       sumG += pixels[i][1];
       sumB += pixels[i][2];
    }
    let center = [
       sumR / pixels.length,
       sumG / pixels.length,
       sumB / pixels.length
    ];

    return [{ center: center, count: pixels.length }];
  }

  let minR = 256, maxR = -1;
  let minG = 256, maxG = -1;
  let minB = 256, maxB = -1;

  for (let j = 0; j < pixels.length; j++) {
     let r = pixels[j][0];
     let g = pixels[j][1];
     let b = pixels[j][2];
     if (r < minR) minR = r;
     if (r > maxR) maxR = r;
     if (g < minG) minG = g;
     if (g > maxG) maxG = g;
     if (b < minB) minB = b;
     if (b > maxB) maxB = b;
  }

  let rangeR = maxR - minR;
  let rangeG = maxG - minG;
  let rangeB = maxB - minB;

  let channel = 0;
  if (rangeG > rangeR && rangeG > rangeB) {
     channel = 1;
  } else if (rangeB > rangeR && rangeB > rangeG) {
     channel = 2;
  }

  pixels.sort(function (a, b) { 
     return a[channel] - b[channel]; 
  });

  let mid = Math.floor(pixels.length / 2);

  let firstHalf = [];
  for (let h1 = 0; h1 < mid; h1++) {
     firstHalf.push(pixels[h1]);
  }

  let secondHalf = [];
  for (let h2 = mid; h2 < pixels.length; h2++) {
     secondHalf.push(pixels[h2]);
  }

  let p1 = medianCut(firstHalf, depth - 1);
  let p2 = medianCut(secondHalf, depth - 1);

  let combined = [];
  for (let c1 = 0; c1 < p1.length; c1++) { combined.push(p1[c1]); }
  for (let c2 = 0; c2 < p2.length; c2++) { combined.push(p2[c2]); }

  return combined;
}