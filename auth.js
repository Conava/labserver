window.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Example user credentials
        var exampleUsername = "Admin";
        var examplePassword = "nimdA";
        
        // Get the input values
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        // Check credentials match
        if (username === exampleUsername && password === examplePassword) {
            sessionStorage.setItem('authStatus', 'true'); // Set authentication status in sessionStorage
            window.location.href = "dashboard.html"; // Redirect to dashboard
        } else {
            // Show error message
            document.getElementById("errorMessage").innerText = "Incorrect username or password.";
            document.getElementById("errorPopup").style.display = "block";
        }
    });
});
function closePopup() {
    document.getElementById("errorPopup").style.display = "none";
}