(function(window,$) {
	
	var _$win;
	var _movies,_token,_pauseAll;

	$(document).on('ready',function() {
		
		_$win = $(window);
		
		var $all  = $('#all');
		var $main = $all.find('#main');
		
		_movies   = [];
		_token    = '';
		_pauseAll = pauseAll;
		
		_$win.on({
			
			login    : onLogin,
			ajaxload : onAjaxload,
			resize   : onResize,
			keydown  : onKeydown
			
		});
		
		new Login($all.find('#login'));
		
		function pauseAll() {
			
			for (var i = 0; i < _movies.length; i++) {
				_movies[i].pause();
			}
			
			return;
			
		}
		
		function onLogin() {
			
			$all.find('#header').find('h1').animate({
				
				width     : 60,
				marginTop : 0
				
			},300,function() {
				
				$main.fadeIn(300);
				new Ajax($main.find('#movies'));
				
				return;
				
			});
			
			return;
			
		}
		
		function onAjaxload() {
			
			_movies = [];
			
			$main.find('.movie').each(function() {
				_movies.push(new Movie($(this)));
			});
			
			_$win.trigger('resize');
			
			return;
			
		}
		
		function onResize() {
			
			for (var i = 0; i < _movies.length; i++) {
				_movies[i].resize();
			}
			
			return;

		}
		
		function onKeydown(event) {

			switch (event.keyCode) {

				case 32 : {

					break;

				}

				default : {}

			}

		}
		
		return;

	});
	
	function Login(_$parent) {
		
		(function() {
			
			_$parent.find('button').on('click',onClick);
			return;
			
		})();
		
		function onClick() {
			
			$.ajax({
				
				type     : 'POST',
				url      : 'https://tvar.claudetech.com/login',
				dataType : 'json',
				data     : {
					
					"id"          : "kenta.sakata.7",
					"provider"    : "facebook",
					"access_token": "EAAB373YsZCXcBADncxDVOgyZCZAa9ZAS0GHUe1MhGDcFGKo3Pkjl0ZCiZCuQjzYVoErgImPkVElX3qhWMzOWqg4ZAXNDu9aohVeEZASyBGTc3hAPiSSqDazNKHZC2uH6ZBMCnZCVrSkFYt12kmliQKMZAf4otFm8DZBpZC9gEZBNZAq2IvPRxQZDZD"
					
				},
				success : onSuccess,
				error   : onError

			});
			
			function onSuccess(data) {
				
				_token = data.access_token;
				
				_$parent.fadeOut(300);
				_$win.trigger('login');
				
				return;
				
			}
			
			function onError() {
				
				trace('onError');
				return;
				
			}
			
			return;
			
		}
		
		return {};
		
	}
	
	function Ajax(_$parent) {
		
		var _length;
		
		(function() {
			
			_length = 0;
			load();
			
			setInterval(function() {

				load();
				return;

			},3000);
			
			return;
			
		})();
		
		function load() {
			
			$.ajax({
				
				type       : 'GET',
				url        : 'https://tvar.claudetech.com/videos',
				dataType   : 'json',
				beforeSend : function(xhr) { xhr.setRequestHeader('Authorization',_token); },
				success    : onSuccess

			});
			
			return;
			
		}
		
		function onSuccess(data) {
			
			if (data.length == _length) return;
			
			_length = data.length;
			setHTML(data,_length);
			
			_$win.trigger('ajaxload');
			
			return;
			
		}
		
		function setHTML(data,length) {
			
			var html = '';
			
			for (var i = 0;i < length; i++) {
				html += getCellHTML(data[i]);
			}
			
			_$parent.html(html).find('.video').css('opacity',0).each(function(index) {
				
				$(this).delay(200 * index).animate({ opacity:1 },400,function() {
					
					$(this).next('.button').trigger('ready');
					return;
				
				});
				
				return;
				
			});
			
			return;
			
		}
		
		function getCellHTML(data) {
			
			trace(data)
			
			var html     = '';
			var resource = data.resource
			var id       = data.id;
			var swapped  = resource.swapped;
			var name     = data.program_name;
			var view     = data.view_count;
			var comments = data.video_comments;
			var author   = data.user.screen_name;
			
			html += '<li class="movie" data-id="' + id + '">';
			html += '<figure class="frame">';
			html += '<video class="video" src="' + swapped + '" loop></video>';
			html += '<p class="button"><button>▶</button></p>';
			html += '</figure>';
			html += '<section class="info">';
			html += '<p class="name"><span>' + name + '</span></p>';
			html += '<p class="author">by<span>' + author + '</span></p>';
			html += '</section>';
			html += '<p class="update"><em>Update</em><span>2016.09.17</span></p>';
			html += '<p class="view"><em>View</em><span>' + view + '</span></p>';
			html += '<ul class="comment">';
			html += getCommentHTML(comments);
			html += '</ul>';
			html += '<p class="message">';
			html += '<input type="text" placeholder="コメントを入力する…">';
			html += '<span><button>投稿する</button></span>';
			html += '</p>';
			html += '</li>';
			
			return html;
			
		}
		
		function getCommentHTML(data) {

			var length = data.length;
			if (length == 0) return '<li class="none">コメントはまだありません</li>';
			
			data.reverse();
			
			var html = '';
			
			for (var i = 0; i < data.length; i++) {
				
				var info = data[i];
				html += '<li>' + info.contents + '</li>';
				
			}
			
			return html;
			
		}
		
		return { load:load };
		
	}
	
	function Movie(_$parent) {
		
		var _$frame,_$video,_$button;
		var _video,_button,_comment,_isPlaying;
		
		(function() {
			
			_$frame  = _$parent.find('.frame');
			_$video  = _$frame.find('.video');
			_$button = _$frame.find('.button');
			
			_video     = new Video(_$video);
			_button    = new Button(_$button);
			_comment   = new Comment(_$parent.find('.comment'),_$parent.find('.message'));
			_isPlaying = false;
			
			_$frame.off().on('click',onClick);
			
			return;
			
		})();
		
		function resize() {
			
			var videoW = _$video.width();
			var videoH = _$video.height();
			var frameW = _$frame.outerWidth();
			var frameH = _$frame.outerHeight();
			var ratio  = videoH / videoW;
			
			videoH = frameW * ratio;
			
			var top = (frameH - videoH) * .5;
			_$video.css({ top:top, width:frameW, height:videoH });
			
			return;
			
		}
		
		function onClick() {
			
			if (_isPlaying) pause();
			else play();
			
			return;
			
		}
		
		function play() {
			
			_pauseAll();
			
			_isPlaying = true;
			
			_button.hide();
			_video.play();
			
			return;
			
		}
		
		function pause() {
			
			_isPlaying = false;
			
			_button.show();
			_video.pause();
			
			return;
			
		}
		
		return { resize:resize, pause:pause };
		
	}
	
	function Video(_$target) {
		
		var _element;
		
		(function() {
			
			_element   = _$target.get(0);
			_isPlaying = false;
			
			return;
			
		})();
		
		function play() {
			
			_element.play();
			return;
			
		}
		
		function pause() {
			
			_element.pause();
			return;
			
		}
		
		return { play:play, pause:pause };
		
	}
	
	function Button(_$parent) {
		
		var _$target;
		
		(function() {
			
			_$target = _$parent.find('button');
			
			hide();
			_$parent.on('ready',show);
			
			return;
			
		})();
		
		function show() {
			
			setSize(.9,80,'linear');
			return;
			
		}
		
		function hide() {
			
			setSize(0,0,'easeInBack');
			return;
			
		}
		
		function setSize(opacity,size,easing) {
			
			var margin = size * -.5;
			
			_$target.stop().animate({
				
				opacity    : opacity,
				marginTop  : margin,
				marginLeft : margin,
				width      : size,
				height     : size
				
			},200,easing);
			
			return;
			
		}
		
		return { show:show, hide:hide };
		
	}
	
	function Comment(_$parent,_$message) {
		
		var _$input,_$button;
		var _length;
		
		(function() {
			
			_$input  = _$message.find('input').on('keydown',onKeydown);
			_$button = _$message.find('button').on('click',submit);
			_length  = 0;
			
			setInterval(onLoop,100);
			
			return;
			
		})();
		
		function submit() {
			
			if (_length == 0) return;
			if (_$parent.find('.none').length > 0) _$parent.empty();
			
			var text = _$input.prop('value');
			
			_$parent.prepend('<li>' + text + '</li>').find('li:first-child').hide().slideDown(240);
			_$input.prop('value','');
			
			$.ajax({
				
				type       : 'POST',
				url        : 'https://tvar.claudetech.com/videos/' + _$parent.parents('.movie').data('id') + '/comments',
				data       : { "contents":text },
				beforeSend : function(xhr) { xhr.setRequestHeader('Authorization',_token); },
				success    : onSuccess,
				error      : onError

			});
			
			function onSuccess() {
				
				trace('onSuccess');
				
			}
			
			function onError() {
				
				trace('onError');
				
			}
			
			return;
			
		}
		
		function onKeydown(event) {
			
			if (event.keyCode == 13) {
				
				submit();
				return false;
				
			}

		}
		
		function onLoop() {
			
			if (_length == _$input.prop('value')) return;
			_length = _$input.prop('value').length;
			
			if (_length > 0) _$button.addClass('ready');
			else _$button.removeClass('ready');
			
			return;
			
		}
		
		return {};
		
	}
	
	function trace(text) {
		
		console.log(text);
		
	}
	
	return;

})(window,jQuery);

    
 