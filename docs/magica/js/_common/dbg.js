// ----------------------------------------------------------------------------.
(function () {
	const TARGET_ID = 'magica';

	const ONLINE = location.href.match('192.168.') ? true : false;

	const AUDIO_FILE_FORMAT = '/' + TARGET_ID + '/resource/audio/%s/%s.mp3';

	const DEFAULT_VOLUME = 0.05;

	const VOLUME_KEY = {
		BGM: TARGET_ID + '-bgm-volume',
		ENV: TARGET_ID + '-env-volume',
		SE: TARGET_ID + '-se-volume',
		VOICE: TARGET_ID + '-voice-volume'
	};

	const BGM_VOLUME = localStorage.getItem(VOLUME_KEY.BGM) || DEFAULT_VOLUME;
	const ENV_VOLUME = localStorage.getItem(VOLUME_KEY.ENV) || DEFAULT_VOLUME;
	const SE_VOLUME = localStorage.getItem(VOLUME_KEY.SE) || DEFAULT_VOLUME;
	const VOICE_VOLUME = localStorage.getItem(VOLUME_KEY.VOICE) ||
			DEFAULT_VOLUME;

	const FONTS = [
		['HeiSeiGothic', 'DFP-HeiSeiGothic-W7.ttf'],
		['DFHSGothic',   'DFP-HeiSeiGothic-W7.ttf'],
		['BANGLENO',     'BANGLENO.TTF'],
		['BangleNormal', 'BANGLENO.TTF']
	];

	const FONT_FACE =
			'@font-face {\n' +
			'	font-family: "%s";\n' +
			'	src: url("/magica/resource/image_web/font/%s");\n' +
			'}\n';

	var loaded = false;

	// for kill.
	var bgm = null;
	var enviroment = null;
	var voice = null;

	document.addEventListener('DOMContentLoaded', init, false);

	window.debug = {
		DEFAULT_VOLUME: DEFAULT_VOLUME,

		VOLUME_KEY: VOLUME_KEY,

		// ------------------------------------------------------------------------.
		ajaxLoadComp: function (callback) {
			if (loaded) {
				callback();

			} else {
				setTimeout(arguments.callee, 0, callback);
			}
		},
		// ------------------------------------------------------------------------.
		log: function (command) {
			audio(command);
		},
		// ------------------------------------------------------------------------.
		audio: function (command) {
			audio(command);
		},
		// ------------------------------------------------------------------------.
		// key found:     return string.
		// key not found: return null.
		query: function (key) {
			if (!location.search) {
				return null;
			}

			var value = null;
			location.search.substr(1).split('&').forEach(function (v) {
				const vs = v.split('=');

				if (vs[0] == key) {
					value = vs[1];
				}
			});

			return value;
		}
	};

	return;

	// --------------------------------------------------------------------------.
	function init() {
		setViewPort();

		window.scrollTo(0, 1); // URL表示エリアを隠す.

		// fonts.
		const styleElem = document.createElement('style');
		styleElem.disable = false;

		FONTS.forEach(function (v) {
			styleElem.innerHTML += spf(FONT_FACE, v[0], v[1]);
		});

		$('head').append(styleElem);

		// panels.
		const panels = Array.prototype.slice.call(
				document.getElementsByClassName("panel"));

		if (panels.length == 0) {
			loaded = true;

			return false;
		}

		var loadCount = 0;
		panels.forEach(function (v) {
			ajaxLoad(v);
		});

		return;

		// ------------------------------------------------------------------------.
		function ajaxLoad(panel) {
			$.ajax({
				url: panel.getAttribute('data-panel-path'),
				dataType: 'html',
				cache: false

			}).error(function (data) {
				console.error('load error on ajax: ' + data);

			}).success(function (data) {
				var st = '';
				data.replace(/<wicket:panel>([\s\S]*)<\/wicket:panel>/, function () {
					st = arguments[1];
				});

				panel.innerHTML = st;

				loadCount ++;

				// 外部から読み込むscriptがある場合と
				// scriptタグ内に直接scriptを埋め込まれたタイプが
				// あるので両方に対応する

				const ajaxPanelScript = panel.getElementsByTagName('script');
				const scriptArr = [];

				for (var i = 0; i < ajaxPanelScript.length; i++) {
					if (ajaxPanelScript[i].innerHTML) {
						eval(ajaxPanelScript[i].innerHTML); // 直接埋め込むタイプは即実行.

						continue;
					}

					scriptArr.push(document.createElement('script'));

					const turn = scriptArr.length - 1;
					scriptArr[turn].src = ajaxPanelScript[i].src;
					scriptArr[turn].setAttribute('loadedOrder', turn);

					scriptArr[i].onload = function (e) {
						const num = parseInt(this.getAttribute('loadedOrder')) + 1;

						if (scriptArr.length > num) {
							document.getElementsByTagName('body')[0].appendChild(
									scriptArr[num]);

						} else if (scriptArr.length == num) {
							const customEvent = document.createEvent('HTMLEvents');
							customEvent.initEvent('localAjaxPanelLoadFinish', true, false);

							document.dispatchEvent(customEvent);
						}
					};

					scriptArr[i].onerror = function (e) {
						console.error('js load error:' + this);
					};

					if (scriptArr[0]) {
						document.getElementsByTagName('body')[0].appendChild(scriptArr[0]);
					}
				}

				//フッターのios6つ版対応
				if (panel.id == 'head_foot' && !ua.android) {
					$('#common_foot li:first').before(
							'<li id="common_foot_back_link_wrap" class="SARI se_decide">' +
							'<span id="foot_back_link"></span></li>');
				}

				if (loadCount == panels.length) {
					loaded = true;
				}
			}); // end of success().
		} // end of ajaxLoad().

		// ------------------------------------------------------------------------.
		function setViewPort() {
			if (document.getElementsByName('viewport').length) {
				return;
			}

			var head = document.getElementsByTagName('head')[0];
			var body = document.getElementsByTagName('body')[0];

			var w = SCREEN_WIDTH;
			var h = SCREEN_HEIGHT;

			if (ua.ios) {
				body.className += ' ios'; // bodyタグにos名記述.

				if (!window.orientation) {
					addViewportTag(w, h, 1, 'medium-dpi'); // 実機.

				} else {
					if (ua.ipad) {
						addViewportTag(w, h, 0.8, 'medium-dpi');

					} else if (screen.availWidth == 414) { // iPhone 6 Plus
						addViewportTag(w, h, 0.575, 'medium-dpi');

					} else if (screen.availWidth == 375) { // iPhone 6
						addViewportTag(w, h, 0.52, 'medium-dpi');

					} else {
						addViewportTag(w, h, 0.44, 'medium-dpi');
					}
				}

			} else if (ua.android) {
				body.className += ' android';

				if (getAndroidOSVersion() >= 440) {
					w = screen.availWidth;
					h = screen.availHeight;

					if (h / w > 9 / 16) {
						h = w * 9 / 16; // 縦持ち端末.
					} else {
						w = h * 16 / 9; // 横持ち端末.
					}

					addViewportTag(w, h, w / SCREEN_WIDTH, 'device-dpi');

				} else if (ua.isEluga) {
					addViewportTag('device-width', 0, 1.0, 340);

				} else {
					addViewportTag('device-width', 0, 1.0, 'device-dpi');
				}
			}

			return;

			// ----------------------------------------------------------------------.
			function addViewportTag(width, height, scale, dpi) {
				const tag =
						'<meta name="viewport" content="' +
						'width=' + width +
						',height=' + height +
						',initial-scale=' + scale +
						',minimum-scale=' + scale +
						',maximum-scale=' + scale +
						',target-densitydpi=' + dpi +
						',user-scalable=no' +
						'" />\n';

				head.innerHTML += tag.
						replace(',height=0', '').
						replace(',target-densitydpi=0', '');
			}
		} // end of setViewPort().
	} // end of init().

	// --------------------------------------------------------------------------.
	function audio(command) {
		if (ONLINE) {
			return;
		}

		const cmd = command.split('_');

		const kind = cmd[0];
		const act = command.split(kind + '_')[1];
		const dir = (kind == 'ENV') ? 'SE' : kind;

		// stop audio.
		if (act == 'STOP') {
			switch (kind) {
				case 'BGM':
					if (bgm) {
						bgm.pause();
						bgm = null;
					}
					break;

				case 'ENV':
					if (enviroment) {
						enviroment.pause();
						enviroment = null;
					}
					break;

				case 'VOICE':
					if (voice) {
						voice.pause();
						voice = null;
					}
					break;
			}

			return;
		}

		// play audio.
		switch (kind) {
			case 'BGM':
			case 'ENV':
			case 'SE':
			case 'VOICE':
				break;

			default: // LOAD_HIDE, etc.
				return;
		}

		const file = spf(AUDIO_FILE_FORMAT, dir, act);

		switch (kind) {
			case 'BGM':
				if (bgm) {
					bgm.pause();
					bgm = null;
				}

				bgm = new Audio(file);
				bgm.volume = BGM_VOLUME;
				bgm.loop = true;
				bgm.play();
				break;

			case 'ENV':
				if (enviroment) {
					enviroment.pause();
					enviroment = null;
				}

				enviroment = new Audio(file);
				enviroment.volume = ENV_VOLUME;
				enviroment.loop = true;
				enviroment.play();
				break;

			case 'SE':
				const se = new Audio(file);
				se.volume = SE_VOLUME;
				se.play();
				break;

			case 'VOICE':
				if (voice) {
					voice.pause();
					voice = null;
				}

				voice = new Audio(file);
				voice.volume = VOICE_VOLUME;
				voice.play();
				break;
		}
	}
})();
