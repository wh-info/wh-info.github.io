var datamap = new Map([
	[document.getElementById("myBtn"), document.getElementById("myModal")],
	[document.getElementById("myBtn1"), document.getElementById("myModal1")],
	[document.getElementById("myBtn2"), document.getElementById("myModal2")],
	[document.getElementById("myBtn3"), document.getElementById("myModal3")]
]);

datamap.forEach((value, key) => {
	doModal(key, value);
});

function doModal(anchor, popupbox) {

	// Get the <span> element that closes the modal
	var span = popupbox.getElementsByClassName("cls")[0];

	anchor.addEventListener("click", function (event) {
		popupbox.style.display = "block";
	});

	span.addEventListener("click", function (event) {
		popupbox.style.display = "none";
	});

	window.addEventListener("click", function (event) {
		if (event.target == popupbox) {
			popupbox.style.display = "none";
		}
	});
}

//sidenav
function openNav() {
	document.getElementById("mySidenav").style.width = "580px";
  }
  
  function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
  }

  $(function() {
	$('#pi').hover(function() {
	  $('.wholes, .attri').css('color', '#287099');
	}, function() {
	  // on mouseout, reset the background colour
	  $('.wholes, .attri').css('color', '');
	});
  }); 
 
  $(function() {
	$('.respawn').hover(function() {
	  $('#reS').css('color', '#79cef4');
	}, function() {
	  // on mouseout, reset the background colour
	  $('#reS').css('color', '');
	});
  });  

  		$(function() {
  $('.spawnIn').hover(function() {
    $('#sIn').css('color', '#79cef4');
  }, function() {
    // on mouseout, reset the background colour
    $('#sIn').css('color', '');
  });
});

$(function() {
  $('.leadsTo').hover(function() {
    $('#lTo').css('color', '#79cef4');
  }, function() {
    // on mouseout, reset the background colour
    $('#lTo').css('color', '');
  });
});

$(function() {
  $('.indMass').hover(function() {
    $('#sjs').css('color', '#79cef4');
  }, function() {
    // on mouseout, reset the background colour
    $('#sjs').css('color', '');
  });
});

$(function() {
  $('.toMass').hover(function() {
    $('#toM').css('color', '#79cef4');
  }, function() {
    // on mouseout, reset the background colour
    $('#toM').css('color', '');
  });
});

$(function() {
  $('.lifeTime').hover(function() {
    $('#liT').css('color', '#79cef4');
  }, function() {
    // on mouseout, reset the background colour
    $('#liT').css('color', '');
  });
});

$(function() {
	$('.sigLevel').hover(function() {
	  $('#sLvl').css('color', '#79cef4');
	}, function() {
	  // on mouseout, reset the background colour
	  $('#sLvl').css('color', '');
	});
  });