/*
Notes: 
'data' is lazily imported from the html
'seedrandom' is also imported from html. it gives deterministic random #s based on a seed set in fire()
*/


var wordsSelected = [];
var teams = [];
var NUMBER_OF_WORDS = 25;
var spyMasterMode = false;
var sessionData = [];
var customData = [];

var COLOR_RED = "#d43434";
var COLOR_YELLOW = "#efe36d";
var COLOR_BLUE = "#38b5d0";
var COLOR_BLACK = "#111111";
var COLOR_GREEN = "#00a900";

var menuIsOpen = false;

var seed = '';
var session = '';

$('.hamburger').click(function(){
	if(menuIsOpen)	{
		$('.hamburger').removeClass('is-active');
		$('#menu').fadeOut(500);
		menuIsOpen = false;
	}
	else{
		$('.hamburger').addClass('is-active');
		$('#menu').fadeIn(500);
		menuIsOpen = true;
	}
});

$('.word').hover(function(){},function(){
	if(menuIsOpen)
	{
		$('.hamburger').removeClass('is-active');
		$('#menu').fadeOut(500);
		menuIsOpen = false;
	}
});

$(document).ready(function(){
	$(window).resize(resizeGameBoard);
	populateQuerystringData();
	if(location.hash.length == 0)
	{
		seed =''+(Math.floor(Math.random()*1000));
		location.hash = $('#seed').val();
	}

	if(getCookie("darkTheme")!=="true")	{
		$('#lightTheme').click();
		lightThemeChecked = false;
	}
	fire();
	resizeGameBoard();
});

function populateQuerystringData(){
	var hashItems = location.hash.substring(1).split('&');
	for(var i=0; i < hashItems.length; i++){
		var item = hashItems[i].split('=');
		if(item.length == 2){
			if(item[0] == 'seed'){
				seed = item[1];
			}
			else if(item[0] == 'session'){
				session = item[1];
			}
		}
		
	}
}

function resizeGameBoard()
{
	var windowHeight = $(window).height();
	if(windowHeight < 750)
	{
		$('.word').css("height",(windowHeight/7));
	}
	else
	{
	$('.word').css("height","125px");	
	}
}

$( "#seed" ).keyup(function() {
  fire();
  clearTimeout(updateHashCall);
  updateHashCall = setTimeout(function(){ location.hash = $('#seed').val();}, 500);
});

var updateHashCall;

$('#confirmText').click(function(){
	$('#confirm').click();
});

$('#lightThemeText').click(function(){
	$('#lightTheme').click();
});

var lightThemeChecked = false;
$("#lightTheme").change(function(){
	if(this.checked){
		lightThemeChecked = true;
		$('body').addClass('light');
		setCookie("darkTheme", "false", 10);
	}
	else {
		lightThemeChecked = false;
		$('.light').removeClass('light');
		setCookie("darkTheme", "true", 10);
	}
});

function fire() {
	//get seed and set the seed for randomizer
	var boardSeed = document.getElementById("seed").value;
	Math.seedrandom(boardSeed.toLowerCase());

	var option = $('#gameMode :selected').val();
	switch (option) {
		case '2knouns':
			sessionData = data.slice(0);
			break;
		case 'movies':
			sessionData = movieData.slice(0);
			break;
		case 'custom':
			if(customData.length === 0){
				var customWordList = prompt("Please enter custom word list. The list will be saved until your refresh your browser. (The words MUST be delimanted by spaces). eg: cat dog mouse", "Enter words here");
				customData = customWordList.split(' ');
			}
			sessionData = customData.slice(0);	
			break;
		default:
			sessionData = defaultData.slice(0);
	}

	wordsSelected = [];
	teams = [];
	spyMasterMode = false;
	document.getElementById("board").innerHTML = "";

	//fire new board
	updateScore();
	createNewGame();
}

//not used, but probably useful at some point
function removeItem(array, index) {
	if (index > -1) {
		// console.log("index: " + index + ", word: " + array[index] + " removed.");
		array.splice(index, 1);
	}
}

function createNewGame() {
	var trs = [];
	for (var i = 0; i < NUMBER_OF_WORDS; i++) {
		if (!trs[i % 5]) {
			trs[i % 5] = "";
		}
		var randomNumber = Math.floor(Math.random() * sessionData.length);
		var word = sessionData[randomNumber];
		removeItem(sessionData, randomNumber);
		wordsSelected.push(word);
		trs[i % 5] += "<div class=\"word\" id=\'" + i + "\' onclick=\"clicked(\'" + i + "\')\"><div>" + word + "</div></div>";
	}
	for (var i = 0; i < trs.length; i++) {
		document.getElementById("board").innerHTML += '<div class="row">' + trs[i] + '</div>'
	}

	//create teams
	for (var i = 0; i < 8; i++) {
		teams.push(COLOR_RED);
		teams.push(COLOR_BLUE);
	}

	// one extra for one of the teams
	if (Math.floor(Math.random() * data.length) % 2 === 0) {
		teams.push(COLOR_RED);
		// document.getElementById("team").style.color = COLOR_RED;
		// document.getElementById("team").innerHTML = "RED";
		$('#board').addClass('redStarts').removeClass('blueStarts');

	} else {
		teams.push(COLOR_BLUE);
		// document.getElementById("team").style.color = COLOR_BLUE;
		// document.getElementById("team").innerHTML = "BLUE";
		$('#board').addClass('blueStarts').removeClass('redStarts');
	}

	// add neturals 
	for (var i = 0; i < 7; i++) {
		teams.push(COLOR_YELLOW);
	}

	// push the assasin
	teams.push(COLOR_BLACK)

	//shuffle teams
	shuffle(teams);
	updateScore();
}

function clicked(value) {
	var item = $('#' + value);
	if (!spyMasterMode) {
		//guessers mode
		var word = wordsSelected[value];
		if (document.getElementById("confirm").checked) {
			if (window.confirm("Are sure you want to select '" + word + "'?")) {
				item.css('background-color', teams[value]);
				item.attr('data-color',teams[value]);
				item.addClass('chosen');
			}
		} else {
			item.css('background-color', teams[value]);
			item.attr('data-color',teams[value]);
			item.addClass('chosen');

		}
	} else {
		//spymaster mode
		if(item.css('background-color') == COLOR_GREEN) {
			item.css('background-color', teams[value]);
			item.attr('data-color','');
		}
		else {
			item.css('background-color', COLOR_GREEN);
			item.attr('data-color',teams[value]);
		}

	}
	updateScore()
	item.css('font-size','16pt');
}

function updateScore(){
	var blueScore = 9;
	var redScore = 9;
	var yellowScore = 7;
	var blackScore = 1;

	if ($('#board.redStarts').length > 0){
		blueScore = 8;
	}
	else {
		redScore = 8;
	}

	$('div.word').each(function(){
		var color = $(this).attr('data-color');
		if (color === COLOR_BLUE){
			blueScore--;
		}
		if (color === COLOR_RED){
			redScore--;
		}
		if (color === COLOR_YELLOW){
			yellowScore--;
		}
		if (color === COLOR_BLACK){
			blackScore--;
		}
	});
	$('#redScore').text(redScore);
	$('#blueScore').text(blueScore);
	$('#yellowScore').text(yellowScore);
	$('#blackScore').text(blackScore);
}

function spyMaster() {
	if(!spyMasterMode) {
		spyMasterMode = true;
		for (var i = 0; i < NUMBER_OF_WORDS; i++) {
			var item = $(document.getElementById(i));
			item.css('backgroundColor', teams[i]);
			if (teams[i] == COLOR_BLACK) {
				item.css('color', "red !important");
			}
			item.addClass('chosen');
			item.attr('data-color','');
		}
		updateScore();
	}
}

function shuffle(array) {
	var currentIndex = array.length,
		temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

//enable pressing 'Enter' on seed field
document.getElementById('seed').onkeypress = function(e) {
	if (!e) e = window.event;
	var keyCode = e.keyCode || e.which;
	if (keyCode == '13') {
		// Enter pressed
		fire();
		return false;
	}
}

$.cssHooks.backgroundColor = {
    get: function(elem) {
        if (elem.currentStyle)
            var bg = elem.currentStyle["backgroundColor"];
        else if (window.getComputedStyle)
            var bg = document.defaultView.getComputedStyle(elem,
                null).getPropertyValue("background-color");
        if (bg.search("rgb") == -1)
            return bg;
        else {
            bg = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(bg[1]) + hex(bg[2]) + hex(bg[3]);
        }
    }
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}