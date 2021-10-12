$(document).ready(function() {
	
	var colors = ["#d1d1d1","#1d4145","#763c19","#79cef4","yellow","#79cef4","orange","lime","green","#304b15"];
	$(".items li").css({color:colors[1]});

	var groupColors = ["#42ffec",
            "#42b3ff",
            "#4265ff",
            "#4230cf",
            "#9c32ed",
            "#f230dc",
            "#0dfa05",
            "#f0a800",
            "#e81e1e",
            "#f6fc32"];
        $(".items li").css({
            color: colors[1]
        });
	$(".star").each(function( i ) {
    $(this).css("color","black"); //black bob
  });

	canvas();
	$(window).resize(function() { // todo: get event, only repaint on mouse release
		canvas();
	});

	// distribute before list to span
	$(".items ul li")
		.wrapInner($('<span />'))
		.each(function() {

			item = lower_case($(this).children("span").html());		// turn item name css compliant
			$(this).attr({ id: item });								// set li id as item name
			
			if ($(this).parents("ul").attr("id") != "type") {		// type has no before
				list = $(this).attr("class").split(/\s+/);			// get before items from li class
				for (i in list) {
					$("#"+list[i]+" span").addClass(item);			// find id with class, inject itself into span as class
				}
			}
		})
	$('.items')
		.on('mouseenter','ul li',function() {
			if (! $('#pi').hasClass('sticky')) {
				$(this).addClass("current");
				$(this).css({color:colors[5]});
				pi_link($(this));
			}
		})
		
		.on('mouseleave','ul li',function() {
			if (! $('#pi').hasClass('sticky')) {
				$(this).removeClass("current");
				$(".items li").css({color:colors[1]});

				$(".star").each(function( i ) {
    			$(this).css("color","black"); //black bob
  });

				canvas();
			}
		})

		.on('click','ul li',function() {
			
			if (!$(this).hasClass('current')) {
				$('#pi').removeClass('sticky')
			}
			
			if ($('#pi').hasClass('sticky')) {
				$('#pi').removeClass('sticky')
				
				$('.items li').removeClass('current').css({color:colors[1]});
				
				$(".star").each(function( i ) {
    			$(this).css("color","black"); //black bob
  });
				
			} else {
				$('#pi').addClass('sticky')
				
				$('.items li').removeClass('current').css({color:"#06171c"});
				canvas();

				$(this).addClass("current");
				$(this).css({color:colors[5]});
				
				pi_link($(this));
			}
		})
		
		// $("ul#basic").hover(function() { $(".p1").toggleClass("current"); });
		// $("ul#toMass").hover(function() { $(".p2").toggleClass("current"); });
		// $("ul#indMass").hover(function() { $(".p3").toggleClass("current"); });
		// $("ul#advanced").hover(function() { $(".p4").toggleClass("current"); });
	
function lower_case(s) { return s.toLowerCase().replace(/ /g, '-').replace(/\./g, ''); }
	function pi_link(item) {
		pi_link_before(item,-1);
		pi_link_after(item,1);
	}
	function pi_link_before(item, degree, depth) {
		type   = item.parent("ul").attr("id");
		degree = degree + ((type == "basic") ? 1 : 0);

		class_prefex = ".items li span.";
		$(".items li span."+item.attr("id"))
			.each(function() {
				$(this).parent("li").css({color: colors[5+degree]});
				if (type != "basic" && degree > -4) {
					line(item.children("span"),$(this),colors[5+degree],colors[5+degree+1]);
				}
				pi_link_before($(this).parent("li"),degree-1);
			});
	}
	function pi_link_after(item, degree, depth) {
		type   = item.parent("ul").attr("id");
		degree = degree + ((type == "resources") ? -1 : 0);
		
		var i = 0;
            $(".items li." + item.attr("id"))
                .each(function () {

                    switch ($(this).text()) {
                        case "Class 1":
                            $(this).css({
                                color: groupColors[0]
                            });
                            break;
                        case "Class 2":
                            $(this).css({
                                color: groupColors[1]
                            });
                            break;
                        case "Class 3":
                            $(this).css({
                                color: groupColors[2]
                            });
                            break;
                        case "Class 4":
                            $(this).css({
                                color: groupColors[3]
                            });
                            break;
                        case "Class 5":
                            $(this).css({
                                color: groupColors[4]
                            });
                            break;
                        case "Class 6":
                            $(this).css({
                                color: groupColors[5]
                            });
                            break;
                        case "HighSec":
                            $(this).css({
                                color: groupColors[6]
                            });
                            break;
                        case "LowSec":
                            $(this).css({
                                color: groupColors[7]
                            });
                            break;
                        case "NullSec":
                            $(this).css({
                                color: groupColors[8]
                            });
                            break;
                        case "Class 12 - Thera":
                            $(this).css({
                                color: groupColors[9]
                            });
                            break;
							case "Class 13 - Shattered":
                            $(this).css({
                                color: "#ffffff"
                            });
                            break;
							case "Pochven ▲ Trig space":
                            $(this).css({
                                color: groupColors[8]
                            });
                            break;
							case "Drone Regions":
                            $(this).css({
                                color: groupColors[8]
                            });
                            break;
                        case "C1":
                            $(this).css({
                                color: groupColors[0]
                            });
                            break;
                        case "C2":
                            $(this).css({
                                color: groupColors[1]
                            });
                            break;
                        case "C3":
                            $(this).css({
                                color: groupColors[2]
                            });
                            break;
                        case "C4":
                            $(this).css({
                                color: groupColors[3]
                            });
                            break;
                        case "C5":
                            $(this).css({
                                color: groupColors[4]
                            });
                            break;
                        case "C6":
                            $(this).css({
                                color: groupColors[5]
                            });
                            break;
							case "C13":
                            $(this).css({
                                color: "#ffffff"
                            });
                            break;
                        case "HS":
                            $(this).css({
                                color: groupColors[6]
                            });
                            break;
                        case "LS":
                            $(this).css({
                                color: groupColors[7]
                            });
                            break;
                        case "NS":
                            $(this).css({
                                color: groupColors[8]
                            });
                            break;
							case "Pochven":
                            $(this).css({
                                color: groupColors[8]
                            });
                            break;
                        case "Thera":
                            $(this).css({
                                color: groupColors[9]
                            });
                            break;
						case "up to Destroyer":
                            $(this).css({
                                color: "#1f5eeb"
                            });
                            break;
							case "up to Battlecruiser":
                            $(this).css({
                                color: "#36cccc"
                            });
                            break;
							case "up to Battleship":
                            $(this).css({
                                color: "#D6D9CC"
                            });
                            break;
							case "up to Freighter":
                            $(this).css({
                                color: "#d7601b"
                            });
                            break;
							case "up to Capital":
                            $(this).css({
                                color: "#d7601b"
                            });
                            break;
                        default:
                            $(this).css({
                                color: colors[3]
                            });
                            break;
                    }

                  
                    if (type != "leadsTo") {
                        line($(this).children("span"), item.children("span"), colors[5],
                            colors[6]);
                    }
                    //  pi_link_after($(this), degree + 1);
                });
        }
	
	$("#disco").toggle(
		function() {
			$(this).text("Disco!");
		}
	,
		function() {
			$(this).text("type");
		}
	);
});
function canvas() {
	$("#canvas").attr({ 
		"height": $("#pi").outerHeight(),
		"width": $("#pi").outerWidth() 
	});
}
function line(a,b,c1,c2) {
	pad = 0;
	fx  = a.position().left + 4;
	fy  = a.position().top + a.height()/2 + 1;
	tx  = b.position().left + b.width() - 2;
	ty  = b.position().top + b.height()/2 + 1;

	var cvs = document.getElementById('canvas');

	var ctx = cvs.getContext('2d');
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(tx,ty);
	ctx.lineTo(fx,fy);
	ctx.globalAlpha = 0.5;

	var gdt = ctx.createLinearGradient( tx,ty, fx,fy );
	gdt.addColorStop(0, c1);
	gdt.addColorStop(1, c2);

	ctx.strokeStyle = gdt;
	ctx.stroke();
}


pi = {
	type: ['C125','C140','C247','C248','C391','C414','D364','D382','D792','D845','E004','E175','E545', 'E587','F135',
	'F353','F355','G008','G024','H121','H296','H900','I182','J244','K162','K329', 'K346','L005','L031','L477','L614',
	'M001','M164','M267','M555','M609','N062','N110','N290', 'N432','N766','N770','N944','N968','O128','O477','O883',
	'P060','Q003','Q063','Q317','R051', 'R259','R474','R943','S047','S199','S804','S877','T405','T458','U210','U319',
	'U574','V283', 'V301','V753','V898','V911','V928','W237','X702','X877','Y683','Y790','Z006','Z060','Z142','Z457','Z647','Z971'],
	spawnIn: ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 13 - Shattered','HighSec','LowSec','NullSec','Drone Regions','Pochven ▲ Trig space', 'Class 12 - Thera', 'Barbicans','Confluxs', 'Redoubts', 'Sentinels', 'Videttes', 'EXIT'],
	leadsTo: ['C1','C2','C3','C4','C5','C6','C13','HS','LS','NS','Thera', 'Pochven', 'Drifter Sentinel','Drifter Barbican', 'Drifter Vidette', 'Drifter Conflux', 'Drifter Redoubt', 'jump to identify'],
	productions: {
		lifeTime: ['12h','16h','24h','48h'],
		respawn: ['Static','Wandering'],
		toMass: ['100 000 000 kg','500 000 000 kg','750 000 000 kg','1 000 000 000 kg','2 000 000 000 kg','3,000,000,000 kg','5,000,000,000 kg'],
		indMass: ['up to Destroyer','up to Battlecruiser','up to Battleship','up to Freighter', 'up to Capital'],
	} 
}