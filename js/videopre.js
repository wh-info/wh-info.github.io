var video = document.getElementById("xlpre")

var url = "video/xhole.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    //video.play()  if you want it to play on load
};

var video = document.getElementById("lpre")

var url = "video/lhole.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    //video.play()  if you want it to play on load
};

var video = document.getElementById("mpre")

var url = "video/mhole.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    //video.play()  if you want it to play on load
};

var video = document.getElementById("spre")

var url = "video/shole.webm"

var xhr = new XMLHttpRequest();
xhr.open("GET", url, true);
xhr.responseType = "arraybuffer";

xhr.onload = function(oEvent) {

    var blob = new Blob([oEvent.target.response], {type: "video/webm"});

    video.src = URL.createObjectURL(blob);

    //video.play()  if you want it to play on load
};

xhr.send();