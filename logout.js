window.onload = function() {
    sessionStorage.removeItem('authStatus'); // Clear the authentication status
    window.location.href = "index.html";
}