define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command',
], function (
	_,
	Backbone,
	common,
	ajaxControl,
	cmd
) {
	'use strict';
	var pageJson;
	var openPopUpRegisterRepaymentMail = function(){
		var popupView = Backbone.View.extend({
			initialize: function(options) {
				this.template = _.template(
					common.doc.getElementById("tempRegisterRepaymentMailPopup").innerText
				);
			},
			render: function() {
				var _money = 0;
				if(pageJson.userItemList){
					_.each(pageJson.userItemList, function(_val, _index, _list){
						if(_val.itemId == 'MONEY'){
							_money = _val.quantity;
						};
					});
				};
				this.$el.html(this.template({
					model:{
						gameMoney: _money,
						money: _money*15,
					}
				}));
				return this;
			},
			removeView: function() {
				this.off();
				this.remove();
			}
		});
		var _popupView = new popupView();
		new common.PopupClass({
			title: "払戻し申請",
			popupId: "RegisterRepaymentMailPop",
			content: $(_popupView.render().el).html(),
			popupType: "typeB",
			closeBtnText: "閉じる",
			decideBtnText: "送信",
			decideBtnEvent: function(){
				var _mailAddress = $('#inputMail').val();
				//メールアドレスチェック
				if(checkMatchMailAddress({
					mailAddress: _mailAddress,
				})){
					//パラメータ設定
					var _prm = {
						mailAddress: _mailAddress,
					};
					//通信実行
					ajaxControl.ajaxPost(
						common.linkList.sendRepaymentMail, 
						_prm, 
						function(res){
							console.log('res', res);
							//通信を成功したら無条件で入力画面
							openPopUpAuthNumber();
						}
					);
				}else{
					new common.PopupClass({
						title: "エラー",
						content: 'メールアドレスが間違っている可能性があります。<br>もう一度入力をお願いします。',
						closeBtnText: "もう一度入力する",
					},null,
					function() {
						//開いたあとのcallback
					},
					function() {
						//もう一回メール登録開く
						openPopUpRegisterRepaymentMail();
					});
				};
			},
		},null,
		function() {
			//開いたあとのcallback
			$("#RegisterRepaymentMailPop .AuthBtn").off();
			$("#RegisterRepaymentMailPop .ExplanBtn").off();
			$("#RegisterRepaymentMailPop .AuthBtn").on(common.cgti, function(e){
				if(e){
				e.preventDefault();
			};
			if(common.isScrolled()) return;
				openPopUpAuthNumber();
			});
			$("#RegisterRepaymentMailPop .ExplanBtn").on(common.cgti, function(e){
				if(e){
					e.preventDefault();
				};
				if(common.isScrolled()) return;
				console.log('注意事項ボタン押した');
				openPopUpCaution();
			});
			//ネイティブキーボード登録
			common.nativeKeyBoard("inputMail",-1,1);
		},function() {
			//閉じたあとのcallback
			_popupView.removeView();
		});
	};
	var openPopUpAuthNumber = function(){
		var popupView = Backbone.View.extend({
			initialize: function(options) {
				this.template = _.template(
					common.doc.getElementById("tempAuthNumberPopup").innerText
				);
			},
			render: function() {
				this.$el.html(this.template({
					model:{}
				}));
				return this;
			},
			removeView: function() {
				this.off();
				this.remove();
			}
		});
		var _popupView = new popupView();
		new common.PopupClass({
			title: "確認番号確認",
			popupId: "AuthNumberPop",
			content: $(_popupView.render().el).html(),
			popupType: "typeB",
			closeBtnText: "確認番号の再発行",
			decideBtnText: "確認",
			decideBtnEvent: function(){
				console.log('番号を送信します。');
				var _authNum = $('#inputAuthNum').val();
				if(!_authNum){
					new common.PopupClass({
						title: "エラー",
						content: '確認番号を入力してください',
						closeBtnText: "閉じる"
					});
				}else{
					//パラメータ設定
					var _prm = {
						repaymentCode: _authNum,
					};
					//通信実行
					ajaxControl.ajaxPost(
						common.linkList.registerRepaymentMail, 
						_prm, 
						function(res){
							console.log('res', res);
							if(res.errorMessage){
								new common.PopupClass({
									title: "エラー",
									content: res.errorMessage,
									closeBtnText: "閉じる"
								},null,
								function() {
									//開いたあとのcallback
								},
								function() {
									//もう一回番号入力開く
									openPopUpAuthNumber();
								});
							}else{
								//受付完了
								openPopUpRequestComplete();
							};
						}
					);
				};
			},
		},null,
		function() {
			//開いたあとのcallback
			//ネイティブキーボード登録
			common.nativeKeyBoard("inputAuthNum",-1,1);
		},
		function() {
			//閉じたあとのcallback
			_popupView.removeView();
			//もう一回メール登録開く
			openPopUpRegisterRepaymentMail();
		});
	};
	//受付完了ポップアップ
	var openPopUpRequestComplete = function(){
		var popupView = Backbone.View.extend({
			initialize: function(options) {
				this.template = _.template(
					common.doc.getElementById("tempRequestCompletePopup").innerText
				);
			},
			render: function() {
				this.$el.html(this.template({
					model:{}
				}));
				return this;
			},
			removeView: function() {
				this.off();
				this.remove();
			}
		});
		var _popupView = new popupView();
		new common.PopupClass({
			title: "払戻し申請受付完了",
			content: $(_popupView.render().el).html(),
			closeBtnText: "閉じる",
		},null,
		function() {
			//開いたあとのcallback
		},
		function() {
			//閉じたあとのcallback
			_popupView.removeView();
		});
	};
	//注意事項ポップアップ
	var openPopUpCaution = function(){
		var popupView = Backbone.View.extend({
			initialize: function(options) {
				this.template = _.template(
					common.doc.getElementById("tempRegisterRepaymentMailCautionPopup").innerText
				);
			},
			render: function() {
				this.$el.html(this.template({
					model:{}
				}));
				return this;
			},
			removeView: function() {
				this.off();
				this.remove();
			}
		});
		var _popupView = new popupView();
		new common.PopupClass({
			title: "注意事項",
			popupId: "RegisterRepaymentMailCaution",
			content: $(_popupView.render().el).html(),
			closeBtnText: "閉じる",
			popupType:"typeB",
		},null,
		function() {
			//開いたあとのcallback
			common.scrollRefresh();
			common.scrollSet("cautionBase","cautionPop");
		},
		function() {
			//閉じたあとのcallback
			_popupView.removeView();
			openPopUpRegisterRepaymentMail();
		});
	};
	//メールアドレスのチェック
	var checkMatchMailAddress = function(_args){
		var _mailAddress = _args.mailAddress;
		//メールアドレスのパターン 正規表現 
		var _pattern = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+.[A-Za-z0-9]+$/;
		var _isMatch = false; //デフォルトはfalse
		if(_mailAddress){
			_isMatch = _pattern.test(_mailAddress);
		};
		return _isMatch;
	};

	return {
		//払戻用メールを登録したかチェックする
		checkIsRegistedRepaymentMail: function(_args){
			//pageJsonをもらう
			pageJson = _args.pageJson;
			//チェック用apiを叩く
			ajaxControl.ajaxPost(
				common.linkList.isRegisterRepaymentMail, 
				{}, 
				function(res){
					console.log('isRegisterRepaymentMail_res', res);
					if(res.isRegisted){ //登録済みの時
						//受付完了
						openPopUpRequestComplete();
					}else{ //登録してない時
						openPopUpRegisterRepaymentMail();
					};
				}
			);
		},
	};
});
