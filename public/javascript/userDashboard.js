const allSideMenu = document.querySelectorAll('#sidebar .side-menu.top li a');

allSideMenu.forEach(item => {
    const li = item.parentElement;

    const currentPageUrl = window.location.href;
    if (item.href === currentPageUrl) {
        li.classList.add('active');
    }

    item.addEventListener('click', function () {
        // Remove 'active' class from all list items
        allSideMenu.forEach(i => {
            i.parentElement.classList.remove('active');
        });

        // Add 'active' class to the clicked list item
        li.classList.add('active');
    });
});


// TOGGLE SIDEBAR
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');
const brand = document.getElementById('brand-text');

// menuBar.addEventListener('click', function () {
// 	sidebar.classList.toggle('hide');
// })

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');

    if (sidebar.classList.contains('hide')) {

        brand.style.display = 'none';
    } else {
        brand.style.display = '';
    }
});



function checkScreenSize() {
    if (window.matchMedia("(max-width: 991.98px)").matches) {
        sidebar.classList.add('hide');
    }
    else {
        sidebar.classList.remove('hide');
        brand.style.display = '';
    }
}

// Run the function on page load and window resize
window.addEventListener('load', checkScreenSize);
window.addEventListener('resize', checkScreenSize);


const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
    }
})





if (window.innerWidth < 768) {
    sidebar.classList.add('hide');
} else if (window.innerWidth > 576) {
    searchButtonIcon.classList.replace('bx-x', 'bx-search');
    searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
})


// gym-detail

//map
var x = document.getElementById("moonjan").innerHTML;

var y = document.getElementById("moonjan2").innerHTML;
var map = L.map('map').setView([x, y], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
var marker = L.marker([x, y]).addTo(map);

function navigateToDirection() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                var userLatitude = position.coords.latitude;
                var userLongitude = position.coords.longitude;
                var destinationLatitude = 9.7271004807413; // Example latitude
                var destinationLongitude = 76.7260518790598; // Example longitude
                var url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLatitude}%2C${userLongitude}%3B${destinationLatitude}%2C${destinationLongitude}`;
                window.open(url, '_blank');
            },
            function (error) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        alert("User denied the request for geolocation.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        alert("Location information is unavailable.");
                        break;
                    case error.TIMEOUT:
                        alert("The request to get user location timed out.");
                        break;
                    case error.UNKNOWN_ERROR:
                        alert("An unknown error occurred.");
                        break;
                }
            }
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

