$(function() {

	var clientId = '3d61ebf45cc1513be216909219e8806e';

	SC.initialize({
		client_id: clientId
	});

	//iframe that holds the SC player
	var iframe = $("#widget")[0];
	iframe.src = "http://w.soundcloud.com/player/?url=https://soundcloud.com/solzilla/tomorrow-feat-shayhan";
    
    //SC widget object
    var widget = SC.Widget(iframe);

    //duration of the current song
    var duration;

    //holds all the songs returned from search
    var tracklist = [];

    //is true when there is an error displayed.
    var error = false;

    //event listener that will play the next song after the current song finishes
    widget.bind(SC.Widget.Events.READY, function() {

		widget.bind(SC.Widget.Events.FINISH, function() {
			playNext();
		});

	});

	$(document).keydown(function(evt) {

    	//hotkeys will only work if the input box is not focused
    	if(!$("#input").is(":focus")) {
    		if(evt.keyCode == 32) {
				widget.toggle();
			} else if(evt.keyCode == 38 && !error) {
				playNext();
			} else if(evt.keyCode == 39) {
				skip(30000);
			} else if(evt.keyCode == 37) {
				skip(-30000);
			}
    	}
	});

	
	$("#form").submit(function (event) {
		event.preventDefault();

		var query = $("#input").val().trim();

		if(query == '') {
			return;
		}

		query = query + " remix";

		SC.get('/tracks', {q: query}).then(function(tracks) {

			if (tracks.length != 0) {
				$("#error").empty();
				error = false;
				tracklist = tracks;
				playSound(tracklist[0].uri);
				tracklist.splice(0, 1);
				
			} else {
				displayError("No tracks found. Search up something else.");
			}
			
		});
	});

	//play next song in tracklist
	function playNext() {

		if(tracklist.length != 0) {
			playSound(tracklist[0].uri);
			tracklist.splice(0, 1);
		} else {
			displayError("No more songs left to play. Search up something else.");
		} 
	}

	function displayError(e) {
		if (!error){
			$("#error").append(e);
			error = true;
		}
	}

	//play the song
	function playSound(url) {
		widget.load(url, {
			auto_play : true,
			buying : false,
			liking : false,
			sharing : false,
			show_comments : false
		});
	}

	//go back or forward 30 seconds of the song
	function skip(skipTime) {
		widget.getDuration(function(duration) {
			widget.getPosition(function(position) {
				var time = position + skipTime;
				if(time < duration) {
					widget.seekTo(time)
				} else {
					playNext();
				}
			})
		});
	}
});
