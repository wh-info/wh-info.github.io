var video = document.getElementById("precal")

var url = "video/caldari.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    video.play()
};

var video = document.getElementById("preama")

var url = "video/amarr.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    video.play()
};

var video = document.getElementById("premin")

var url = "video/minmatar.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    video.play()
};

var video = document.getElementById("pregall")

var url = "video/gallente.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    video.play()
};

xhr.send();