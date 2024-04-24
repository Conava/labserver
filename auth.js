document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission
    
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // First, check if the user input matches the hardcoded credentials
    if (username === "Admin" && password === "nimdA") {
        // Proceed to verify from the server
        document.getElementById("verifyPopup").style.display = "block";
        checkAuthorizationFromServer();
    } else {
        // Show error message if credentials do not match
        displayError("Incorrect username or password.");
    }
});

function checkAuthorizationFromServer() {
    document.getElementById("verifyPopup").style.display = "block";
    
    const intervalId = setInterval(() => {
        fetch('/api/check-authorization')
        .then(response => response.json())
        .then(data => {
            if (data.authorized) {
                clearInterval(intervalId);
                sessionStorage.setItem('authStatus', 'true');
                window.location.href = "dashboard.html"; // Redirect to dashboard if authorized
                document.getElementById("verifyPopup").style.display = "none";
            }
        })
        .catch(error => {
            displayError("Error connecting to server.");
            document.getElementById("verifyPopup").style.display = "none";
        });
    }, 1000); // Poll every 1 second
}


function closePopup() {
    document.getElementById("errorPopup").style.display = "none";
}

function displayError(message) {
    document.getElementById("errorMessage").innerText = message;
    document.getElementById("errorPopup").style.display = "block";
}
function closePopup(popupId) {
    document.getElementById(popupId).style.display = "none";
}

