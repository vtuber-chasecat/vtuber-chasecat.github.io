! function() {
	"use strict";
	
	var xmlns   = "http://www.w3.org/2000/svg";
	var xlinkns = "http://www.w3.org/1999/xlink";
	var board   = document.getElementById("board");
	var game    = document.getElementById("game");
	var resetB  = document.getElementById("reset");
	resetB.onclick = resetB.ontouchstart = function (e) {
		e.preventDefault();
		reset();
		return false;
	}
	var enabled = true, win = false;
	var pageToken = "";
	var liveChatId, chaName;
	var linkyoutube = "";
	var commentList = [];
	var regexNumber = new RegExp('^\\d+$');
	var commentIndex = 0;
	var addx0, addy0, addx1, addy1, cel, lx, ly, ld, lmax, lx2, ly2;
	
	linkyoutube = prompt('Please enter your youtube streaming url');
	while (!linkyoutube)
	{
		linkyoutube = prompt('Please enter your youtube streaming url');
	}

	// cell constructor
	function Cell () {
		this.stat  = 0;
		this.win   = 0;
		this.reach = 0;
		this.po    = -1;
		this.id    = null;
	}

	// create SVG plot
	Cell.prototype.createElement = function (i, j, index) {
		var x = 2 * 34 + j * 34 + ((i % 2) ? 1 : -1) * 34 / 4;
		var y = 2 * 26 + i * 26;
		var use = document.createElementNS(xmlns, "use");
		var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		var content = index + 1;
		
		var x1 = x + 21;
		var y1 = y + 19.7;
		
		if (content > 9 && content < 100)
		{
			x1 = x + 16;
		}
		else if (content > 99)
		{
			x1 = x + 12;
		}

		text.id = content;
		text.cx = j + 2;
		text.cy = i + 2;
		text.setAttributeNS(null, "class", "cell");
		text.setAttributeNS(xlinkns, "xlink:href", "#r0");
		text.setAttributeNS(null, "transform", "translate(" + x1 + "," + y1 + ")");
		text.setAttribute('fill', '#000');
		text.textContent = content;
		text.onclick = function (e) {
			e.preventDefault();
			click(this.parentElement, this.id, this.cx, this.cy);
		}

		use.id = content;
		use.cx = j + 2;
		use.cy = i + 2;
		this.id = use;
		use.setAttributeNS(null, "class", "cell");
		use.setAttributeNS(xlinkns, "xlink:href", "#r0");
		use.setAttributeNS(null, "transform", "translate(" + x + "," + y + ")");
		use.setAttributeNS(null, "fill", this.win == 1 ? "#B20000" : this.stat == 2 ? "#728501" : "#CCFF00");
		use.onclick = function (e) {
			e.preventDefault();
			click(this.parentElement, this.id, this.cx, this.cy);
		}
		
		board.appendChild(use);
		board.appendChild(text);
	}

	function click(parentelm, id, x, y) {
		if (!win && !enabled)
		{
			var x1 = cat.x;
			var y1 = cat.y;
			var check = false;
			var p = 0;
			for (var k = 0; k < 6; ++k) {
				var kx = y1 % 2 ? (x1 + addx1[k]) : (x1 + addx0[k]);
				var ky = y1 + addy0[k];
				if (cel[ky][kx].stat != 1) continue;
				lx[p] = kx;
				ly[p] = ky;
				ld[p] = k;
				p++;
			}

			for (var i = 0; i < lx.length; ++i) {
				if (lx[i] == x && ly[i] == y)
				{
					check = true;
					break;
				}
			}
			
			if (check)
			{
				if (cel[y][x].stat != 2)
				{
					win = cel[y][x].win == 1;
					cat.play(x, y, win);
				}
			}
		}
	}

	// initialize new game
	function newGame () {
		$('.purple-square-container').css('display', 'none');
		commentList = [];
		commentIndex = 0;
		win = false;
		enabled = true;
		addx0 = [1, 0, -1, -1, -1, 0];
		addy0 = [0, 1, 1, 0, -1, -1];
		addx1 = [1, 1, 0, -1, 0, 1];
		addy1 = [0, 1, 1, 0, -1, -1];
		cel = [];
		for (var i = 0; i < 15; i++) {
			cel[i] = [];
			for (var j = 0; j < 15; j++) {
				cel[i][j] = new Cell();
			}
		}
		cat.x = Math.floor(15 / 2);
		cat.y = Math.floor(15 / 2);
		cat.px =  20 + 34 * cat.x;
		cat.py = -15 + 26 * cat.y;
		cel[cat.y][cat.x].stat = 1;
		lx = [];
		ly = [];
		ld = [];
		lx[0] = cat.x;
		ly[0] = cat.y;
		lmax = 1;
		lx2 = [];
		ly2 = [];
		for (var i = 2; i < 15 - 2; i++) {
			for (var j = 2; j < 15 - 2; j++) {
				cel[i][j].stat = 1;
			}
		}
		// place random plots (10 more than in the original)
		for (var i = 0; i < 30; i++) {
			var rx = Math.floor(Math.random() * 15);
			var ry = Math.floor(Math.random() * 15);
			if (rx != cat.x && ry != cat.y) {
				if (cel[ry][rx].stat == 1) {
					cel[ry][rx].stat = 2;
				}
			}
		}
		for (var i = 0; i < 15; i++) {
			for (var j = 0; j < 15; j++) {
				if (cel[i][j].stat != 1) continue;
				for (var k = 0; k < 6; k++) {
					var nx = i % 2 ? (j + addx1[k]) : (j + addx0[k]);
					var ny = i + addy0[k];
					if (cel[ny][nx].stat == 0) {
						cel[i][j].win = 1;
					}
				}
			}
		}
		// draw the board game
		var x = 0, y = 0;
		while (board.children.length > 0) {
			board.removeChild(board.lastElementChild);
		}
		var index = 0;
		for (var i = 0; i < 11; i++) {
			for (var j = 0; j < 11; j++) {
				cel[i + 2][j + 2].createElement(i, j, index);
				index++;
			}
		}
		
		// display cat
		game.setAttributeNS(null, "fill-opacity", 1);
		cat.display(cat.px, cat.py, "f30");
		$('#game').css('opacity', '0.5');
		
		setTimeout(function(){
			var tmpList = [];
			var tmpIndex = 0;
			for (var i = 0; i < commentList.length; ++i) {
				var tmp = commentList[i];
				if (regexNumber.test(tmp))
				{
					tmpList[tmpIndex] = tmp;
					tmpIndex++;
				}
			}
			
			if(tmpList.length == 0)
			{
				var x = Math.floor(Math.random() * 11) + 2;
				var y = Math.floor(Math.random() * 11) + 2;
				while ((x == cat.x && y == cat.y) || cel[y][x].stat == 2)
				{
					x = Math.floor(Math.random() * 11) + 2;
					y = Math.floor(Math.random() * 11) + 2;
				}
				
				var position = (11 * (y - 2) + (x - 2)) * 2;
				var haha = (position / 2) + 1;
				
				reset1();
				animateTextWinner("No comment, so the random position is " + haha);
				animateBlobs();
				
				board.children[position].setAttributeNS(null, "fill", "#728501");
				cel[y][x].stat = 2;
			}
			else
			{
				var modeMap = {};
				var maxEl = tmpList[0], maxCount = 1;
				for(var i = 0; i < tmpList.length; i++)
				{
					var el = tmpList[i];
					if(modeMap[el] == null)
						modeMap[el] = 1;
					else
						modeMap[el]++;  
					if(modeMap[el] > maxCount)
					{
						maxEl = el;
						maxCount = modeMap[el];
					}
				}
				
				var position = parseInt(maxEl) - 1;
				var y = Math.floor(position / 11) + 2;
				var x = position % 11;
				x = x + 2;
				
				if ((x == cat.x && y == cat.y) || cel[y][x].stat == 2)
				{
					x = Math.floor(Math.random() * 11) + 2;
					y = Math.floor(Math.random() * 11) + 2;
					while ((x == cat.x && y == cat.y) || cel[y][x].stat == 2)
					{
						x = Math.floor(Math.random() * 11) + 2;
						y = Math.floor(Math.random() * 11) + 2;
					}
					
					var haha = (11 * (y - 2) + (x - 2)) + 1;
					reset1();
					animateTextWinner("Position viewer choose is wrong, so random position is " + haha);
					animateBlobs();
				}
				else
				{
					var haha = (11 * (y - 2) + (x - 2)) + 1;
					reset1();
					animateTextWinner("Position viewer choose mostly is " + haha);
					animateBlobs();
				}
				
				var position = (11 * (y - 2) + (x - 2)) * 2;
				board.children[position].setAttributeNS(null, "fill", "#728501");
				cel[y][x].stat = 2;
			}
			
			commentList = [];
			commentIndex = 0;
			enabled = false;
			$('#game').css('opacity', '1');
		}, 20000);
	}

	// reset
	function reset () {
		win = false;
		cat.display(0, 0, "");
		var alpha = 100;
		for (var i = 0; i < 100; i++) {
			setTimeout(function () {
				alpha--;
				game.setAttributeNS(null, "fill-opacity", alpha / 100);
				if (alpha == 0) {
					enabled = true;
					newGame();
				}
			}, i * 16);
		}
	}

	// the Cat
	var cat = {
		shape: document.getElementById("cat"),
		x: 0,
		y: 0,
		px: 0,
		py: 0,
		dir: 0,
		dirX: [1, 0.5, -0.5, -1, -0.5, 0.5],
		dirY: [0, 1, 1, 0, -1, -1],
		// SVG update
		display: function (x, y, id) {
			this.shape.setAttributeNS(null, "transform", 'translate(' + x + ',' + y + ')');
			this.shape.setAttributeNS(xlinkns, "xlink:href", "#" + id);
		},
		// move the cat
		jump: function (dir, winornot) {
			setTimeout(function(){
				if (winornot)
				{
					reset1();
					animateTextWinner("The winner is " + chaName);
					animateBlobs();
				}
				else
				{
					commentList = [];
					commentIndex = 0;

					setTimeout(function(){
						var tmpList = [];
						var tmpIndex = 0;
						for (var i = 0; i < commentList.length; ++i) {
							var tmp = commentList[i];
							if (regexNumber.test(tmp))
							{
								tmpList[tmpIndex] = tmp;
								tmpIndex++;
							}
						}
						
						if(tmpList.length == 0)
						{
							var x = Math.floor(Math.random() * 11) + 2;
							var y = Math.floor(Math.random() * 11) + 2;
							while ((x == cat.x && y == cat.y) || cel[y][x].stat == 2)
							{
								x = Math.floor(Math.random() * 11) + 2;
								y = Math.floor(Math.random() * 11) + 2;
							}
							
							var position = (11 * (y - 2) + (x - 2)) * 2;
							var haha = (position / 2) + 1;
							
							reset1();
							animateTextWinner("No comment, so the random position is " + haha);
							animateBlobs();
							
							board.children[position].setAttributeNS(null, "fill", "#728501");
							cel[y][x].stat = 2;
						}
						else
						{
							var modeMap = {};
							var maxEl = tmpList[0], maxCount = 1;
							for(var i = 0; i < tmpList.length; i++)
							{
								var el = tmpList[i];
								if(modeMap[el] == null)
									modeMap[el] = 1;
								else
									modeMap[el]++;  
								if(modeMap[el] > maxCount)
								{
									maxEl = el;
									maxCount = modeMap[el];
								}
							}
							
							var position = parseInt(maxEl) - 1;
							var y = Math.floor(position / 11) + 2;
							var x = position % 11;
							x = x + 2;
							
							if ((x == cat.x && y == cat.y) || cel[y][x].stat == 2)
							{
								x = Math.floor(Math.random() * 11) + 2;
								y = Math.floor(Math.random() * 11) + 2;
								while ((x == cat.x && y == cat.y) || cel[y][x].stat == 2)
								{
									x = Math.floor(Math.random() * 11) + 2;
									y = Math.floor(Math.random() * 11) + 2;
								}
								
								var haha = (11 * (y - 2) + (x - 2)) + 1;
								reset1();
								animateTextWinner("Position viewer choose is wrong, so random position is " + haha);
								animateBlobs();
							}
							else
							{
								var haha = (11 * (y - 2) + (x - 2)) + 1;
								reset1();
								animateTextWinner("Position viewer choose mostly is " + haha);
								animateBlobs();
							}
							
							var position = (11 * (y - 2) + (x - 2)) * 2;
							board.children[position].setAttributeNS(null, "fill", "#728501");
							cel[y][x].stat = 2;
						}
						
						commentList = [];
						commentIndex = 0;
						enabled = false;
						$('#game').css('opacity', '1');
					}, 20000);
					
					enabled = true;
					$('#game').css('opacity', '0.5');
				}
			}, 6 * 64);
			for (var i = 1; i < 6; i++) {
				var frame = 1;
				setTimeout(function () {
					var id = "f" + dir + (frame++) % 5;
					if (frame == 6) {
						this.px += 34 * this.dirX[dir];
						this.py += 26 * this.dirY[dir];
						enabled = true;
					}
					this.display(this.px, this.py, id);
				}.bind(this), i * 64);
			}
		},
		// random move
		randMove: function (x1, y1) {
			var x = this.x;
			var y = this.y;
			var p = 0;
			for (var k = 0; k < 6; ++k) {
				var kx = y % 2 ? (x + addx1[k]) : (x + addx0[k]);
				var ky = y + addy0[k];
				if (cel[ky][kx].stat != 1) continue;
				lx[p] = kx;
				ly[p] = ky;
				ld[p] = k;
				p++;
			}
			//if (p == 0) return false;
			//var d = Math.floor(Math.random() * p);
			for (var i = 0; i < lx.length; ++i) {
				if (lx[i] == x1 && ly[i] == y1)
				{
					this.x = lx[i];
					this.y = ly[i];
					this.dir = ld[i];
					break;
				}
			}
			
			return true;
		},
		// play function
		play: function (x1, y1, winornot) {
			this.randMove(x1, y1);
			this.jump(this.dir, winornot);
		}
	}

	var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
		{
			var obj = JSON.parse(xmlHttp.response);
			liveChatId = obj.items[0].liveStreamingDetails.activeLiveChatId;
			chaName = obj.items[0].snippet.channelTitle;
			setInterval(function(){
				var xmlHttp1 = new XMLHttpRequest();
				xmlHttp1.onreadystatechange = function() { 
					if (xmlHttp1.readyState == 4 && xmlHttp1.status == 200)
					{
						var obj1 = JSON.parse(xmlHttp1.response);
						pageToken = obj1.nextPageToken;
						if (!win && enabled)
						{
							for (var i = 0; i < obj1.items.length; ++i) {
								commentList[commentIndex] = obj1.items[i].snippet.displayMessage;
								commentIndex++;
							}
						}
					}
				}
				if (pageToken === "")
				{
					xmlHttp1.open("GET", "https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=" + liveChatId + "&part=snippet&key=AIzaSyBDg7OedlIQY7bsmzFWp6RvqHvJPy0dgb0", true);
				}
				else
				{
					xmlHttp1.open("GET", "https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=" + liveChatId + "&part=snippet&pageToken=" + pageToken + "&key=AIzaSyBDg7OedlIQY7bsmzFWp6RvqHvJPy0dgb0", true);
				}
				xmlHttp1.send(null);
			}, 8000);
		}
    }
	var res = linkyoutube.split("?v=");
    xmlHttp.open("GET", "https://www.googleapis.com/youtube/v3/videos?part=snippet%2CliveStreamingDetails&id=" + res[res.length - 1] + "&key=AIzaSyBDg7OedlIQY7bsmzFWp6RvqHvJPy0dgb0", true);
    xmlHttp.send(null);
	
	newGame();
	
	var numberOfStars = 200;
	
	for (var i = 0; i < numberOfStars; i++) {
	  $('.congrats').append('<div class="blob fa fa-star ' + i + '"></div>');
	}
	
	function sleep (time) {
	  return new Promise((resolve) => setTimeout(resolve, time));
	}

	function reset1() {
		$.each($('.blob'), function(i) {
			TweenMax.set($(this), { x: 0, y: 0, opacity: 1 });
		});
		
		TweenMax.set($('h1'), { scale: 1, opacity: 1, rotation: 0 });
	}

	function animateTextWinner(textSamp) {
		TweenMax.from($('h1'), 0.8, {
			scale: 0.4,
			opacity: 0,
			rotation: 15,
			ease: Back.easeOut.config(4),
			onStart: function($element) {
				$('#winner').html(textSamp);
				$('.purple-square-container').css('display', 'flex');
			},
			onComplete: function($element) {
				if (!textSamp.includes("The winner is"))
				{
					sleep(5000).then(() => {
						$('.purple-square-container').css('display', 'none');
					});
				}
			}
		});
	}
	
	function animateBlobs() {
		var xSeed = _.random(350, 380);
		var ySeed = _.random(120, 170);

		$.each($('.blob'), function(i) {
			var $blob = $(this);
			var speed = _.random(1, 5);
			var rotation = _.random(5, 100);
			var scale = _.random(0.8, 1.5);
			var x = _.random(-xSeed, xSeed);
			var y = _.random(-ySeed, ySeed);

			TweenMax.to($blob, speed, {
				x: x,
				y: y,
				ease: Power1.easeOut,
				opacity: 0,
				rotation: rotation,
				scale: scale,
				onStartParams: [$blob],
				onStart: function($element) {
					$element.css('display', 'block');
				},
				onCompleteParams: [$blob],
				onComplete: function($element) {
					$element.css('display', 'none');
				}
			});
		});
	}
}();
