// Wait for 3 seconds, then hide the loading screen and show the main content
setTimeout(function() {
    document.getElementById("loading-screen").style.display = "none";
    document.getElementById("main-content").style.display = "block";
}, 3000);
