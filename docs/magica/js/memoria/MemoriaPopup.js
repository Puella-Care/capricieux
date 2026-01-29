define([
	'underscore',
	'backbone',
	"backboneCommon",
	"ajaxControl",
	//'text!template/memoria/MemoriaPopup.html',
	'memoriaUtil',
	'command'
], function (
	_,Backbone,common,ajaxControl,
	//pageTemp,
	memoriaUtil,cmd
) {

	var popupJson;

	var disableFlag = false;

	//アンドロイド用
	if(common.ua.android){
		common.doc.addEventListener("touchmove",function(){
			clearTimeout(common.popupTimerObj);
		},true);
	}

	//アビリティ周りのイベント設定
	var popupEventSet = function(){
		var PageView = Backbone.View.extend({
			className : "memoriaDetailPopInner",
			events : function(){
				var evtObj = {};
				evtObj[common.cgti + " #memoriaProtect"]    = this.protectHandler;
				evtObj[common.cgti + " #memoriaPopClose"]   = this.removeHandler;
				evtObj[common.cgti + " .popupCardImage"]    = this.cardZoom;
				evtObj[common.cgti + " #strengtheningBtn"]  = this.strengtheningFunc;//強化ボタン
				evtObj[common.cgti + " #breakthroughBtn"]   = this.breakthroughFunc;//限凸ボタン
				return evtObj;
			},
			initialize : function() {
				// 改行処理
				popupJson.piece.description = popupJson.piece.description.replace(/＠/g, "<br>");
				this.model = popupJson;

				// 最大レベル
				if(!this.model.maxLevel) this.model.maxLevel = memoriaUtil.getMaxLevel(this.model.piece.rank,this.model.lbCount);

				// 小さなキュウベエ対応
				if (this.model.piece.charaList) {
					var userName = common.storage.user.get("loginName");
					_.each(this.model.piece.charaList, function(chara, index) {
						chara.name = chara.name.replace(/userName/g,userName);
					}.bind(this));
				}

				// メモリアの所持数カウント(フレンドのは表示しない)
				var hidePieceIdArr = [1147,1148,1297,1298];
				this.model.isHideHasNum = true;
				if (hidePieceIdArr.indexOf(this.model.piece.pieceId) === -1 && common.location !== "ProfileFormationSupport") {
					this.model.isHideHasNum = false;
					var targetList = common.storage.userPieceList.filter(function(model) {
						return model.get("pieceId") === this.model.piece.pieceId;
					}.bind(this));
					this.model.listNum = 0;
					_.each(targetList,function(model) {
						this.model.listNum++;
					}.bind(this));

					var targetList = common.storage.userPieceArchiveList.filter(function(model) {
						return model.get("pieceId") === this.model.piece.pieceId;
					}.bind(this));
					this.model.archiveNum = 0;
					_.each(targetList,function(model) {
						this.model.archiveNum++;
					}.bind(this));
				}

				//素材選択・売却・保管庫画面で同機能を使わないようにするとき用
				var _historyArrLeng = common.historyArr.length;
				var lastPage = common.historyArr[_historyArrLeng - 1];
				switch (lastPage) {
					case "MemoriaCompose/compose":
					case "MemoriaCompose/limitbreak":
					case "MemoriaList/sell":
					case "PieceArchive/normal":
						this.model.btnHide = true;
						break;
					default:
						break;
				}

				//保管庫増設対応
				if(
					lastPage.indexOf("MemoriaList/archiveList") != -1 ||
					lastPage.indexOf("MemoriaList/archiveSell") != -1 ||
					lastPage.indexOf("PieceArchive/archive") != -1
				){
					this.model.btnHide = true;
				}

				this.template = _.template(
					common.doc.getElementById('tempMemoriaPopup').innerText
				);

				this.createDom();
			},
			render : function() {
				this.$el.html(this.template({model:this.model}));

				// 画面いっぱいに広げる
				this.el.style.height = 100+"%";
				this.el.style.width = 100+"%";
				return this;
			},
			createDom : function(){
				// ポップアップ扱いする

				// 後ろのDOMを非表示にする
				_.each(common.doc.querySelector("#baseContainer").children,function(elm) {
					common.addClass(elm,"hide");
				});

				// ポップアップ用DOMを用意する
				var memoriaDom = common.doc.createElement("div");
				memoriaDom.id  = "memoriaDetailWrap";

				memoriaDom.appendChild(this.render().el);

				// SE
				cmd.startSe(1002);

				// 現在の経験値取得
				var beforeExp;
				var nextLvExp;
				var expPersent;
				if(memoriaUtil.getMaxLevel(popupJson.piece.rank,popupJson.lbCount) > popupJson.level){
					beforeExp = popupJson.experience;
					nextLvExp = memoriaUtil.parExArr[popupJson.level] - popupJson.experience || 0;
					expPersent = Math.round(beforeExp / memoriaUtil.parExArr[popupJson.level] * 100) || 0;
				}else{
					// 最大のときはMAX表記
					nextLvExp = "MAX";
					expPersent = 100;
				}

				// アペンド
				common.doc.getElementById("baseContainer").appendChild(memoriaDom);

				cmd.getBaseData(common.getNativeObj());

				// スクロールのセット
				common.scrollSet("memoriaPopScroll","infoWrap");

				/* 強化・限凸ボタン制御 */
				this.btnChack();

				// 遷移不可フラグを折る
				common.disableLink = false;
			},
			protectHandler : function(e){
				// ロックボタン押したとき
				e.preventDefault();
				if(common.isScrolled()) return;
				if(disableFlag) return;
				if(popupJson.lockFlg) return;
				if(popupJson.lockFlg) return;

				// イベント期間中保護解除不可メモリアのロック押したとき
				// （グレースケールにするが、分かりにくい気がするのでポップアップ）
				// common.scssのcantUnlockでpointer-events: none;だと出ない
				if(popupJson.unprotectLimitFlag){
					new common.PopupClass({
						title:"メモリアロック解除",
						content:"イベント期間中にこのメモリアのロックを<br>解除することはできません。",
						closeBtnText:"OK",
						popupType:"typeC"
					});

					return;
				}

				// 2重送信防止
				disableFlag = true;

				var targetDom = e.currentTarget;

				var that = this;
				var callback = function(res){
					if(res.resultCode !== "error") {
						// モデルのセットし直し
						res.userPieceList[0].equipFlag = that.model.equipFlag;
						res.userPieceList[0].equipDeck = that.model.equipDeck;
						res.userPieceList[0].eventDescription = that.model.eventDescription;
						res.userPieceList[0].eventEffect      = that.model.eventEffect;
						res.userPieceList[0].regularEventDescription = that.model.regularEventDescription;
						res.userPieceList[0].regularEventEffect      = that.model.regularEventEffect;
						res.userPieceList[0].equipRemoveFlag  = that.model.equipRemoveFlag;
						// console.log(common.location);
						if(common.location === "PieceArchive"){
							if(that.model.archive)   res.userPieceList[0].archive   = that.model.archive;
							if(that.model.selectFlg) res.userPieceList[0].selectFlg = that.model.selectFlg;
						}

						//ロック時に装備をできてしまうので絶対に注意
						if (that.model.archive) {
							res.userPieceArchiveList = res.userPieceList;
							delete res.userPieceList;
						}
						common.responseSetStorage(res);

						var _historyArrLeng = common.historyArr.length;
						var nowPage = common.historyArr[_historyArrLeng - 1];
						if(nowPage.indexOf("PieceArchive/archive") >= 0 ||nowPage.indexOf("MemoriaList/archiveList") >= 0 || nowPage.indexOf("MemoriaList/archiveSell") >=0 ){
							if(common.popModel){
								common.popModel.attributes.protect = !common.popModel.attributes.protect;
								common.popModel.trigger("latestData");
							}
						}

						// 表示の変更
						if(targetDom.classList.contains("protected")){
							targetDom.textContent = "ロック";
						}else{
							targetDom.textContent = "ロック中";
						}

						targetDom.classList.toggle("protected");
					}

					// 2重送信防止フラグ折る
					disableFlag = false;
				};

				var postValue = {"userPieceId":popupJson.id};

				// ロック/解除でAPIが変わる
				if(e.currentTarget.classList.contains("protected")){
					ajaxControl.ajaxPost(common.linkList.userPieceUnprotect,postValue,callback);
				}else{
					ajaxControl.ajaxPost(common.linkList.userPieceProtect,postValue,callback);
				}
			},
			cardZoom :function(e){
				// カード画像拡大
				e.preventDefault();
				if(common.isScrolled()) return;

				e.currentTarget.classList.toggle("zoom");

				if(common.displayWidth !== 1024 && e.currentTarget.classList.contains("zoom")){
					e.currentTarget.getElementsByTagName("img")[0].style = "top:-webkit-calc(50% + 16px - 432.5px);";
				}else{
					e.currentTarget.getElementsByTagName("img")[0].style = "";
				}

			},
			btnChack : function(){
				/* 強化・限凸ボタン制御 */
				// レベルマックス時
				if(this.model.level === this.model.maxLevel){
					common.doc.getElementById("strengtheningBtn").classList.add("off");
				}

				// 限界突破完了済み
				if(this.model.lbCount > 3) {
					common.doc.getElementById("breakthroughBtn").classList.add("off");
				} else {

					//同じメモリアがあるか
					var sameMemoria = common.storage.userPieceList.where({pieceId:this.model.pieceId});

					// 限凸メモリア
					var lbItemId = "";
					switch (this.model.piece.rank) {
						// case "RANK_2":
						// 	lbItemId = "OVER_LIMITTER_PIECE";
						// 	break;
						case "RANK_3":
							lbItemId = "OVER_LIMITTER";
							break;
						case "RANK_4":
							lbItemId = "OVER_LIMITTER_CORE";
							break;
					}

					//限凸メモリアを探して個数を見る
					var lbMemoriaModel = common.storage.userItemList.findWhere({itemId:lbItemId});
					var quantity = lbMemoriaModel ? lbMemoriaModel.get("quantity") : 0;

					// if(this.model.piece.pieceKind != "LIMIT_BREAK" && (sameMemoria.length > 1 || quantity > 0)){
					if((sameMemoria.length > 1 || quantity > 0)){//同じメモリアがあるか、限凸アイテムがあるかをみる
						common.doc.getElementById("breakthroughBtn").classList.remove("off");
					}else{
						common.doc.getElementById("breakthroughBtn").classList.add("off");
					}
				}

				/* 強化・限凸ボタン制御 */
			},
			strengtheningFunc : function(e){
				if(common.isScrolled()) return;
				e.preventDefault();

					common.memoriaComposeTarget = this.model;
					location.href = "#/MemoriaCompose/" + "compose";
			},
			breakthroughFunc : function(e){
				if(common.isScrolled()) return;
				e.preventDefault();

				common.memoriaComposeTarget = this.model;
				location.href = "#/MemoriaCompose/" + "limitbreak";
			},
			removeHandler : function(){
				common.androidKeyStop = false;
				common.disableLink = false;
				_.each(common.doc.querySelector("#baseContainer").children,function(elm) {
					common.removeClass(elm,"hide");
				});

				if(this.model.closeEvent) {
					this.model.closeEvent();
				}

				if(common.doc.getElementById("memoriaDetailWrap")) common.doc.getElementById("baseContainer").removeChild(common.doc.getElementById("memoriaDetailWrap"));
				if(common.detailPopup){
					common.detailPopup.remove();
					common.detailPopup = null;
				}
			}
		});

		common.detailPopup = new PageView();
		// console.log(common.detailPopup)
	};


	return {
		cardDetailPopup : function(e,model,endL2d){
			clearTimeout(common.popupTimerObj);

			common.disableLink = true;
			common.popupTimerObj = setTimeout(function(){
				if(common.isScrolled()) {
					common.disableLink = false;
					return;
				}

				if(common.doc.querySelector("#sideMenu")) {
					common.removeClass(common.doc.querySelector("#sideMenu"),'close');
					common.removeClass(common.doc.querySelector("#sideMenu"),'anim');
				}

				e.preventDefault();
				e.stopPropagation();

				popupJson = model;

				if(endL2d) cmd.endL2d();
				popupEventSet();
			},500);
		},
		popupTimerStop : function(e){
			common.disableLink = false;
			clearTimeout(common.popupTimerObj);
		},
		instantPopup : function(e,model,bntHideFlag){//メモリア改修：強化ボタンを消す第三引数追加
			clearTimeout(common.popupTimerObj);
			popupJson = model;

			//メモリア改修：強化ボタンを消す
			if(bntHideFlag || bntHideFlag == true){
				popupJson.btnHide = true;
			}else{
				popupJson.btnHide = false;
			}

			popupEventSet();
		},
		maxParamPopup : function(e,model,lockFlg,isTimer,endL2d){
			popupJson = model;

			// 最高レベルの情報ですべて上書きする
			popupJson.level = memoriaUtil.getMaxLevel(model.piece.rank,4);
			popupJson.maxLevel = popupJson.level;
			popupJson.lbCount = 4;
			popupJson.experience = 0;

			var maxParam = memoriaUtil.getParam(model,popupJson.level);
			popupJson.attack = maxParam.attack;
			popupJson.defense = maxParam.defense;
			popupJson.hp = maxParam.hp;
			if(lockFlg){
				popupJson.lockFlg = true;
			}

			//メモリア改修：強化ボタンを消す追加
			popupJson.btnHide = true;

			if(!isTimer){
				popupEventSet();
			}else{
				// 現状タイマーはショップのみなのでl2d消すのも入れる
				this.cardDetailPopup(e,popupJson,endL2d);
			}
		}

	};

});
