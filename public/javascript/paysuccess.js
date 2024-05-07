// This function simulates a successful payment.
function simulatePayment() {
    // Simulate payment processing (replace this with your actual payment processing logic)
    // For demonstration purposes, setTimeout is used to simulate a delay
    setTimeout(function() {
        // Assuming payment is successful
        handlePaymentSuccess();
    }, 2000000); // Simulate a 2-second delay
}

// This function is called upon successful payment to redirect to the success page.
function handlePaymentSuccess() {
    // Redirect to the success page
    window.location.href = "success.html"; // Change "success.html" to the actual URL of your success page
}

// Call simulatePayment when the page loads (for demonstration)
window.onload = function() {
    simulatePayment();
}
