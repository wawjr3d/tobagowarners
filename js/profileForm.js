function previewPic(files) {
  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var imageType = /^image\//;

    if (!imageType.test(file.type)) {
      continue;
    }

    var preview = document.getElementById('pic-preview');

    var img = document.createElement("img");
    img.file = file;

    preview.appendChild(img);

    var reader = new FileReader();
    reader.onload = (function(aImg) {
      return function(e) {
        aImg.src = e.target.result;
      };
    })(img);

    reader.readAsDataURL(file);
  }
}
