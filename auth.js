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

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Normally check the username and password correctness here
    // For example purposes, assume they're always correct and we're awaiting verification:
    document.getElementById("verifyPopup").style.display = "block";
    
    checkAuthorizationFromServer();
});

function checkAuthorizationFromServer() {
    // Example of calling an API which you must set up on your backend
    fetch('/api/check-authorization')
    .then(response => response.json())
    .then(data => {
        if (data.authorized) {
            window.location.href = "dashboard.html"; // Redirect to dashboard if authorized
        } else {
            displayError("Verification failed."); // Show error message if not
            document.getElementById("verifyPopup").style.display = "none"; // Hide verification popup
        }
    });
}

function displayError(message) {
    document.getElementById("errorMessage").innerText = message;
    document.getElementById("errorPopup").style.display = "block";
}

function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}

