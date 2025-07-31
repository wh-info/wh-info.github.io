function startTime() {
	var today = new Date();
	var y = today.getUTCFullYear()-1898;
	var mo = today.getUTCMonth()+1;
	var d = today.getUTCDate();
	var h = today.getUTCHours();
	var m = today.getUTCMinutes();
	var s = today.getUTCSeconds();
	m = checkTime(m);
	s = checkTime(s);
	document.getElementById('showtime').innerHTML =
	h + ":" + m + ":" + s + " " + "YC" + y + "-" + mo + "-" + d;
	var t = setTimeout(startTime, 1000);
  }
  function checkTime(i) {
	if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
	return i;
  }

// wh kill count:
// const socket = new WebSocket('wss://api.whtype.info');

// socket.addEventListener('message', function (event) {	
// var div = document.getElementById('whkills');
// div.innerHTML = event.data;
// });
