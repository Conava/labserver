window.onload = function() {
    // Check if authStatus variable is set to true
    if (sessionStorage.getItem('authStatus') !== 'true') {
        window.location.href = "unauthorized.html";
    }
}