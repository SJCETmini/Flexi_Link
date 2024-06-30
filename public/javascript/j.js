const numBtns = document.querySelectorAll("[data-num-btn]")
const submitBtn = document.getElementById("submit-btn");

const surveyEl = document.getElementById("survey-el");
const thankYouEl = document.getElementById("thank-you-el");
const selectedNumEl = document.getElementById("selected-num-el");

let selectedRating = null;

numBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        selectedRating = btn.textContent;

        numBtns.forEach(button => {
            button.style.background = "";
            button.style.color = "";
        });

        btn.style.color = "white";
        btn.style.background = "var(--primary)";
    });
});

submitBtn.addEventListener("click", () => {
    if (!selectedRating) return;
    
    selectedNumEl.textContent = selectedRating;
    surveyEl.style.display = "none";
    thankYouEl.style.display = "flex";
});