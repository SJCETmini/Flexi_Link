// Image Upload

   // Function to validate image size and preview image
   function validateAndPreviewImage(event, previewId) {
    var file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) {
      alert("Maximum allowed file size is 2 MB.");
      event.target.value = ""; // Clear the file input
      return;
    }
    var reader = new FileReader();
    reader.onload = function() {
      var output = document.getElementById(previewId);
      output.src = reader.result;
    }
    reader.readAsDataURL(file);
  }


  // GET ADDRESS

  var map = L.map('map').setView([20.5937, 78.9629], 4); // Set initial view point to India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var geocoder = L.Control.Geocoder.nominatim();

    var marker;

    function onMapClick(e) {
      if (marker) {
        map.removeLayer(marker);
      }
      marker = L.marker(e.latlng).addTo(map);
      updateInputs(e.latlng);
    }

    function updateInputs(latlng) {
      geocoder.reverse(latlng, map.options.crs.scale(map.getZoom()), function(results) {
        var address = results[0].name || "";
        var coordinates = latlng.lat.toFixed(6) + ", " + latlng.lng.toFixed(6);
        document.getElementById('coordinates').value = coordinates;
        document.getElementById('address').value = address;
      });
    }

    map.on('click', onMapClick);

    function findLocation() {
      var location = document.getElementById('locationInput').value;
      geocoder.geocode(location, function(results) {
        if (results.length > 0) {
          var latlng = results[0].center;
          map.setView(latlng, 15); // Zoom level 15
          if (marker) {
            map.removeLayer(marker);
          }
          marker = L.marker(latlng).addTo(map);
          updateInputs(latlng);
        } else {
          alert('Location not found');
        }
      });
    }

// VIDEO UPLOAD

function previewVideo(event) {
  const videoPreview = document.getElementById('videoPreview');
  const videoFile = event.target.files[0];
  
  if (videoFile) {
    const videoURL = URL.createObjectURL(videoFile);
    videoPreview.src = videoURL;
  } else {
    videoPreview.src = '';
  }
}