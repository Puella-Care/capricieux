define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command'
], function (_,Backbone,common,ajaxControl,cmd) {
	'use strict';

	// SE 決定音(大)
	$(document).on(common.cgti,".se_kettei02",function(e){
		e.preventDefault();
		if(common.isScrolled()) return;

		cmd.startSe(1001);
	});

	// SE ポップアップ表示、タブ切り替えなどの音
	$(document).on(common.cgti,".se_decide",function(e){
		e.preventDefault();
		if(common.isScrolled()) return;

		cmd.startSe(1002);
	});

	// SE タブ切り替えとかの音
	$(document).on(common.cgti,".se_tabs",function(e){
		e.preventDefault();
		if(common.isScrolled()) return;

		cmd.startSe(1008);
	});

	// SE キャンセル音
	$(document).on(common.cgti,".se_cancel",function(e){
		e.preventDefault();
		if(common.isScrolled()) return;

		cmd.startSe(1003);
	});

	// linkBtn
	$(document).on(common.cgti,".linkBtn",function(e) {
		if(common.tutorialId) return;
		if(common.disableLink) return;
		if(common.isScrolled()) return;
		if(common.isDoubleTouch()) return;
		e.preventDefault();

		// 同じhrefに飛ぶの禁止
		// console.log(this.getAttribute('data-href'),this.getAttribute('data-href').split("/"),common.location)
		if(this.getAttribute('data-href') && this.getAttribute('data-href').split("/")[1] == common.location) return;

		// 二重送信防止
		if(!e.currentTarget.linkBtnFlg) {
			if(common.g_popup_instance) {
				common.g_popup_instance.remove();
			}
			if(common.doc.querySelector("#sideMenu")) {
				common.doc.querySelector("#sideMenu").className = "";
			}
			common.tapBlock(true);
			e.currentTarget.linkBtnFlg = true;
			location.href = this.getAttribute('data-href');
		}
	});

	// オーバーレイ関連
	$(document).on("touchstart",".btnOverlay",function(e) {
		common.addClass(e.currentTarget,"overlayOn");
	});
	$(document).on("touchcancel",".btnOverlay",function(e) {
		common.removeClass(e.currentTarget,"overlayOn");
	});
	$(document).on(common.cgti,".btnOverlay",function(e) {
		common.removeClass(e.currentTarget,"overlayOn");
	});

	// 画像拡大
	$(document).on(common.cgti,".imageZoom",function(e){
		if(common.isScrolled()) return;
		e.preventDefault();

		common.imageZoomView(e);
	});

	// データ受取
	$("#baseReceive").on("getBaseData",function(e,res) {
		$.extend(common.imgData,res);
		setNativeImg();
		// console.log("getBaseData:baseReceive:pageObj:",common.pageObj);
		// console.log("getBaseData:baseReceive:res:",res);
	});
	var setNativeImg = function() {
		_.each(common.imgData,function(path,key) {
			var elm = common.doc.querySelectorAll('[data-nativeimgkey='+ key +']');
			if(elm) {
				_.each(elm,function(target) {
					target.dataset.nativeimgkey = "";
					target.src = "data:image/png;base64," + path;
					// target.crossOrigin = 'Anonymous';
				});
			}

			var elmBg = common.doc.querySelectorAll('[data-nativebgkey='+ key +']');
			if(elmBg) {
				_.each(elmBg,function(target) {
					target.dataset.nativebgkey = "";
					target.style.backgroundImage = "url(data:image/png;base64," + path + ")";
					// target.crossOrigin = 'Anonymous';
				});
			}
		});
	};

	$(document).on("touchstart",".TE" , touchEffectStart);
	$(document).on("touchmove",".TE" ,touchEffectEnd);
	$(document).on("touchend",".TE" ,touchEffectEnd);

	function touchEffectStart(e){
		//ios8.4.1バグ対応、
		// if(!ios8_4_1){
			if(!e.currentTarget.classList.contains("off") &&
			!e.currentTarget.classList.contains("current") &&
			!e.currentTarget.classList.contains("selected")) {
				common.addClass(e.currentTarget,"touch");
			}
		// }
	}

	function touchEffectEnd(e){
		//ios8.4.1バグ対応、
		// if(!ios8_4_1){
			if(!e.currentTarget) return;
			if(!e.currentTarget.classList.contains("touch")) return;

			setTimeout(function() {common.removeClass(e.currentTarget,"touch")},0);

			if(e.currentTarget.tagName == "A" || e.currentTarget.tagName == "BUTTON" || e.currentTarget.tagName == "INPUT"){
				if(timeSpan < 500){
					e.preventDefault();
					return false;
				}
			}
		// }
	}

	$(document).on("touchstart","body",function(e) {
		if(common.tapEffectStop) return;
		var touchObj = e.originalEvent.changedTouches[0];
		var prm = {
			"x":touchObj.pageX,
			"y":touchObj.pageY
		};

		common.tapTimer = setTimeout(function(){
			if(common.effectView) {
				common.effectView.removeView();
				common.effectView = null;
			}
			common.effectView = new common.EffectView({model:prm});
			common.doc.body.appendChild(common.effectView.render().el);

			common.tapTimer = null;
		},100);
	});
	$(document).on("touchmove","body",function(e) {
		if(common.tapTimer) {
			clearTimeout(common.tapTimer);
			common.tapTimer = null;
		}
	});

});
