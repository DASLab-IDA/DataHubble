function fullscreen(){
    var element = document.getElementsByTagName('iframe')[0]
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen();
    }
}

function setLanguage(language) {
    $cookies.set('language',language);
    window.location.reload();
}