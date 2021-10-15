function startTime() {
	var today = new Date();
	var h = today.getUTCHours();
	var m = today.getUTCMinutes();
	var s = today.getUTCSeconds();
	m = checkTime(m);
	s = checkTime(s);
	document.getElementById('showtime').innerHTML =
	h + ":" + m + ":" + s;
	var t = setTimeout(startTime, 1000);
  }
  function checkTime(i) {
	if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	return i;
  }

const socket = new WebSocket('wss://expressjs-production-04a4.up.railway.app');

socket.addEventListener('open', function (event) {
    socket.send('Hello Server!');
});

socket.addEventListener('message', function (event) {	
var div = document.getElementById('whkills');
div.innerHTML = event.data;
});