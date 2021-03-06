(function(window,$) {

	var BASE_URL = 'https://tvar.claudetech.com';
	//var BASE_URL = 'http://localhost:3000';

	(function() {

		window.fbAsyncInit = function() {

			FB.init({

				appId   : '1811015185777807',
				cookie  : true,
				xfbml   : true,
				version : 'v2.6'

			});

			FB.getLoginStatus(function(response) {

				statusChangeCallback(response);
				return;

			});

			return;

		}

		window.checkLoginState = function() {
			FB.getLoginStatus(statusChangeCallback);
		}

		function statusChangeCallback(response) {

		    if (response.status === 'connected') {

				var auth = response.authResponse;
				_login(auth.userID,auth.accessToken);

				FB.api('/me',function(response) {

					_profile.set(auth.userID,response.name);
					return;

				});

		    }

			return;

		}

		return;

	})();

	var _$win;
	var _movies,_profile,_token,_userOriginalID,_screenName,_pauseAll;

	$(document).on('ready',function() {

		_$win = $(window);

		var $all  = $('#all');
		var $main = $all.find('#main');

		_movies   = [];
		_profile  = new Profile($all.find('#profile'));
		_token    = '';
		_pauseAll = pauseAll;

		_$win.on({

			login    : onLogin,
			ajaxload : onAjaxload,
			resize   : onResize,
			keydown  : onKeydown

		});

		$('#enter-app').click(function () {
			
			$('#login').fadeOut(300);
			
			$all.find('#header').find('h1').animate({

				width     : 60,
				marginTop : 0

			},300,function() {

				$main.fadeIn(300);
				new Ajax($main.find('#movies'));

				return;

			});
		});

		_login = login;

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

		function login(id,token) {

			$.ajax({

				type     : 'POST',
				url      : BASE_URL + '/login',
				dataType : 'json',
				data     : {

					"id"          : id,
					"provider"    : "facebook",
					"access_token": token

				},
				success : onSuccess,
				error   : onError

			});

			function onSuccess(data) {

				_token          = data.access_token;
				_userOriginalID = data.id;
				_screenName     = data.screen_name;

				$('#login').fadeOut(300);

				var $header = $('#header');

				$header.find('.button').hide();
				$header.find('.profile').show().on('click',_profile.show);

				_$win.trigger('login');

				return;

			}

			function onError() {

				trace('onError');
				return;

			}

			return;

		}

		return;

	});

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
				url        : BASE_URL + '/videos',
				dataType   : 'json',
				beforeSend : function(xhr) { xhr.setRequestHeader('Authorization',_token); },
				success    : onSuccess

			});

			return;

		}

		function showNotification(video) {
			var options = {body: video.program_name + 'の新しい動画が追加されました', icon: 'files/img/icon-colored.png'}
			var notification = new Notification('動画着信', options);
			notification.onclick = function (e) {
				e.preventDefault();
				window.open(BASE_URL + '/videos/' + video.id, '_blank');
				notification.close();
			}
		}

		function onSuccess(rawData) {

			var data = [];

			for (var i = 0; i < rawData.length; i++) {
				if (rawData[i].resource && rawData[i].resource.thumbnail) {
					data.push(rawData[i])
				}
			}

			if (data.length == _length) return;

			if (_length > 0) {
				showNotification(data[0]);
			}

			var length = data.length - _length;

			_length = data.length;
			setHTML(data,length);

			_$win.trigger('ajaxload');

			return;

		}

		function setHTML(data,length) {

			var html = '';

			for (var i = 0;i < length; i++) {
				html += getCellHTML(data[i]);
			}

			var $videos = _$parent.prepend(html).find('.video');

			for (var i = 0; i < length; i++) {

				$videos.eq(i).css('opacity',0).delay(200 * i).animate({ opacity:1 },400,function() {

					$(this).next('.button').trigger('ready');

					var element = $(this).get(0);

					element.setAttribute('controls','');
					element.removeAttribute('controls');

					return;

				});

			}

			return;

		}

		function getCellHTML(data) {

			var html     = '';
			var resource = data.resource
			var id       = data.id;
			var swapped  = resource.swapped;
			var name     = data.program_name;
			var view     = data.view_count;
			var comments = data.video_comments;
			var author   = data.user.screen_name;
			
			var isMine = (author == _screenName);

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
			if (isMine) html += '<p class="credit">クレジットを消す</p>';
			html += '<ul class="comment">';
			html += getCommentHTML(comments);
			html += '</ul>';
			if (_token) {
				html += '<p class="message">';
				html += '<input type="text" placeholder="コメントを入力する…">';
				html += '<span><button>投稿する</button></span>';
				html += '</p>';
			}
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
				html += '<li>' + info.user.screen_name + ' : ' + info.contents + '</li>';

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
			
			_$parent.find('.credit').off().on('click',function() {
				
				killCredit($(this),$(this).parents('.movie').data('id'));
				return;
				
			});

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
		
		function killCredit($button,id) {
			
			$.ajax({

				type       : 'POST',
				url        : BASE_URL + '/videos/' + id + '/remove_ad',
				beforeSend : function(xhr) { xhr.setRequestHeader('Authorization',_token); },
				success    : function(data) { $button.hide(); alert('削除手続きが完了いたしました'); },
				error      : function(a,b,c) { alert('ポイントが足りません'); trace([a,b,c]); }

			});
			
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

			_$parent.prepend('<li>' + _screenName + ' : ' + text + '</li>').find('li:first-child').hide().slideDown(240);
			_$input.prop('value','');

			$.ajax({

				type       : 'POST',
				url        : BASE_URL + '/videos/' + _$parent.parents('.movie').data('id') + '/comments',
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

			if (_$input.length == 0 || _length == _$input.prop('value')) return;
			_length = _$input.prop('value').length;

			if (_length > 0) _$button.addClass('ready');
			else _$button.removeClass('ready');

			return;

		}

		return {};

	}

	function Profile(_$parent) {

		(function() {

			_$parent.on('click',hide);
			return;

		})();

		function set(userID,userName) {

			_$parent.find('.icon').html('<img src="https://graph.facebook.com/' + userID + '/picture?type=normal">');
			_$parent.find('.name').text(userName);

			return;

		}

		function show() {

			$.ajax({

				type       : 'GET',
				url        : BASE_URL + '/points',
				dataType   : 'json',
				beforeSend : function(xhr) { xhr.setRequestHeader('Authorization',_token); },
				success    : function(data) { _$parent.find('.point').find('dd').text(data.point) }

			});

			$.ajax({

				type       : 'GET',
				url        : BASE_URL + '/users/' + _userOriginalID + '/videos',
				dataType   : 'json',
				beforeSend : function(xhr) { xhr.setRequestHeader('Authorization',_token); },
				success    : function(data) { _$parent.find('.length').find('dd').text(data.length) }

			});

			_$parent.stop().fadeIn(300);

			return;

		}

		function hide() {

			_$parent.stop().fadeOut(300);
			return;

		}

		return { set:set, show:show };

	}

	function trace(text) {

		console.log(text);

	}

	if (!Notification) {
		return;
	}
	Notification.requestPermission();

	return;

})(window,jQuery);
