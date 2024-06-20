// Function to highlight the current section in the navigation
function updateActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const offset = 130; // Adjust this value to match your margin-top or other offset

    let currentSection = sections[0];

    sections.forEach(section => {
        const sectionTop = section.offsetTop - offset;
        if (pageYOffset >= sectionTop) {
            currentSection = section;
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection.getAttribute('id')) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
window.addEventListener('load', updateActiveNav); // Call the function on page load as well



function previewImage(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const previewContainer = preview.parentElement;

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            previewContainer.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        previewContainer.style.display = 'none';
    }
}

// Add event listeners for each file input
document.getElementById('imageUpload1').addEventListener('change', function () {
    previewImage('imageUpload1', 'preview1');
});
document.getElementById('imageUpload2').addEventListener('change', function () {
    previewImage('imageUpload2', 'preview2');
});
document.getElementById('imageUpload3').addEventListener('change', function () {
    previewImage('imageUpload3', 'preview3');
});