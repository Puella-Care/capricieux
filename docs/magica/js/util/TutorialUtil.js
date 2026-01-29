define([
	'underscore',
	'backbone',
	'backboneCommon',
	'ajaxControl',
	'command'
], function (_,Backbone,common,ajaxControl,cmd) {
	'use strict';

	var TutorialUtil = {};

	var tutorialStoryId = {
		"TU160": "101101-4",
		"TU250": "101101-7",
		"TU460": "101102-4",
		"TU998": "101103-10"
	};

	var tutorialTextObj = {
		"TU010"   : "<p>タッチしてストーリーを<br>開始しましょう</p>",
		"TU120"   : "<p>クエストをサポートしてくれる魔法少女を選択しましょう<br>サポートしてもらうことでサポートポイントを獲得できます</p>",
		"TU510"   : "<p>メインメニューが使用可能になりました。<br>MENUをタッチしてください</p>",
		"TU510_2" : "<p>メインメニューからは様々な画面に移動することができます<br>「ガチャ」に移動してみましょう</p>",
		"TU520"   : "<p>ガチャでは魔法少女やメモリアを手に入れることができます<br>特別に選んだ魔法少女1体を必ずもらえるガチャを用意しました<br>好きな魔法少女を選んでみましょう</p>",
		"TU520_2" : "<p>魔法少女を選んだらガチャを引いて仲間にしてみましょう<br>★4魔法少女は選んだ1体のみ出現します<br>ガチャを引くまでは魔法少女を選びなおすことが可能です</p>",
		"TU540"   : "<p>仲間にした魔法少女を<br>チームに入れてみましょう</p>",
		"TU550"   : "<p>クエスト用のチームを編成しましょう</p>",
		"TU560"   : "<p>未設定をタッチしてください</p>",
		"TU560_2" : "<p>先ほど仲間にした魔法少女をタッチしてください</p>",
		"TU560_3" : "<p>魔法少女をチームに参加させることができました<br>「決定」をタッチしてください</p>",
		"TU560_3_1" : "<p>他の魔法少女も編成してみましょう<br>お任せ編成ボタンをタッチすることで、<br>自動でチームを編成できます</p>",
		"TU560_4" : "<p>編成したチームで<br>次のクエストに進みましょう</p>"
	};

	var tutorialResumeId = {
		"TU010":"TU010", // バトル選択ページ
		"TU020":"TU010", // ADV①
		"TU030":"TU010", // バトル①
		"TU040":"TU110", // クエスト結果
		"TU110":"TU110", // バトル選択ページ
		"TU120":"TU110", // サポート選択ページ
		"TU130":"TU110", // ADV②
		"TU140":"TU110", // バトル②
		"TU150":"TU160", // クエスト結果
		"TU160":"TU160", // ADV③
		"TU210":"TU210", // バトル選択ページ
		"TU220":"TU210", // ADV④
		"TU230":"TU210", // バトル③
		"TU240":"TU250", // クエスト結果
		"TU250":"TU250", // ADV⑤
		"TU310":"TU310", // セクション選択
		"TU320":"TU320", // バトル選択ページ
		"TU330":"TU320", // サポート選択ページ
		"TU340":"TU320", // ADV④
		"TU350":"TU320", // バトル④
		"TU360":"TU410", // クエスト結果
		"TU410":"TU410", // バトル選択ページ
		"TU420":"TU410", // サポート選択ページ
		"TU430":"TU410", // ADV④
		"TU440":"TU410", // バトル⑤
		"TU450":"TU460", // クエスト結果
		"TU460":"TU460", // ADV⑤
		"TU510":"TU510", // バトル選択ページ
		"TU520":"TU520", // ガチャTOP
		"TU530":"TU550", // ガチャアニメ
		"TU540":"TU550", // ガチャ結果
		"TU550":"TU550", // 編成TOP
		"TU560":"TU560", // クエスト編成
		"TU998":"TU998"  // ADVは開始したが名前入力はまだ
	};

	var tutorialResumePage = {
		"prologue": "#/QuestBattleSelect/101101/TU010",
		"TU010"   : "#/QuestBattleSelect/101101/TU010",
		"TU110"   : "#/QuestBattleSelect/101101/TU110",
		"TU160"   : "#/QuestBattleSelect/101101/TU210", // ストーリー
		"TU210"   : "#/QuestBattleSelect/101101/TU210",
		"TU250"   : "#/MainQuest/TU310",                // ストーリー
		"TU310"   : "#/MainQuest/TU310",
		"TU320"   : "#/QuestBattleSelect/101102/TU320",
		"TU370"   : "#/QuestBattleSelect/101102/TU370",
		"TU410"   : "#/QuestBattleSelect/101102/TU410",
		"TU460"   : "#/QuestBattleSelect/101102/TU510", // ストーリー
		"TU510"   : "#/QuestBattleSelect/101102/TU510",
		"TU520"   : "#/GachaTop/SELECTABLE_TUTORIAL/TU520",
		"TU550"   : "#/FormationTop/TU550",
		"TU560"   : "#/DeckFormation/TU560",
		"TU998"   : "#/MainQuest"
	};

	TutorialUtil.tutorialAddClass = function(tuId) {
		common.addClass(common.doc.querySelector("#baseContainer"),"tutorial");

		var classArr = [];
		this.tutorialRemoveClass();

		if(!tuId) return;

		common.addClass(common.doc.querySelector("#baseContainer"),tuId);
	};

	TutorialUtil.tutorialRemoveClass = function() {
		var classArr = [];
		_.each(common.doc.querySelector("#baseContainer").classList,function(className){
			classArr.push(className);
		});
		_.each(classArr,function(className){
			if(className) {
				if(className.indexOf("TU") !== -1 || className.indexOf("type") !== -1) {
					common.removeClass(common.doc.querySelector("#baseContainer"),className);
				}
			}
		});
	};

	TutorialUtil.tutorialEnd = function(tuId,nextPage) {
		if(!nextPage) {
			nextPage = "#/MainQuest";
		}
		this.tutorialIdRegist(tuId);
		common.tutorialId   = null;
		common.tutorialUtil = null;

		common.removeClass(common.doc.querySelector("#baseContainer"),"tutorial");
		var classArr = [];
		this.tutorialRemoveClass();

		common.historyArr = [];
		// common.refreshStorage();
		setTimeout(function(){
			location.href = nextPage},100);
	};

	TutorialUtil.getResumeId = function() {
		var tuId = tutorialResumeId[common.storage.user.get("tutorialId")];
		return tuId;
	};

	TutorialUtil.tutorialResume = function() {
		var tuId = this.getResumeId();

		switch(tuId) {
			case "TU160":
			case "TU250":
			case "TU460":
			case "TU998":
				storyAdvStart(tuId);
			break;

			default:
				this.tutorialAddClass();
				location.href = tutorialResumePage[this.getResumeId()];
			return;
		}
	};

	TutorialUtil.tutorialText = function(tuId) {
		var text = tutorialTextObj[tuId] || "";
		common.doc.querySelector("#tutorialContainer .textWrap").innerHTML = text;
	};

	TutorialUtil.tutorialIdRegist = function(tuId) {
		if(!tuId || tuId == "prologue") return;
		if(typeof tuId !== "string") return;

		var tuIdNumber        = tuId.split("TU")[1] | 0;
		var currentTuIdNumber = common.storage.user.get("tutorialId").split("TU")[1] | 0;
		// console.log(tuIdNumber,currentTuIdNumber)
		if(tuIdNumber !== currentTuIdNumber && tuIdNumber > currentTuIdNumber) {
			// console.log("tutorialIdRegist",tuId);
			var callback = function(res) {
				// console.log("★tutorialIdRegistComp",res);
				common.responseSetStorage(res);
			}
			var prm = {
				"tutorialId": tuId
			}
			ajaxControl.ajaxPost(common.linkList.prologueRegister,prm,callback);
		}

		if(tuId == "TU997" || tuId == "TU998" || tuId == "TU999") return;
		this.tutorialInit(tuId);
	}

	TutorialUtil.tutorialInit = function(tuId) {
		common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
		this.tutorialText(tuId);

		switch(tuId) {
			case "TU510":
				TU510Init();
				break;

			case "TU520":
				TU520Init();
				break;

			case "TU540":
				TU540Init();
				break;

			case "TU550":
				TU550Init();
				break;

			case "TU560":
				TU560Init();
				break;

			default:
				mainContent.addEventListener("webkitAnimationEnd",function animEndFunc(e) {
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					mainContent.removeEventListener("webkitAnimationEnd", animEndFunc, false);
				},false);
			return;
		}
	}

	TutorialUtil.TU010 = function() {
		var prm = {
			"npcHelpId" : null,
			"resultUrl" : "/magica/index.html#/QuestResult/TU040",
			"startStoryTutorialId" : "TU020",
			"questStartTutorialId" : "TU030"
		};
		questFunc(prm);
	}

	TutorialUtil.TU040 = function() {
		location.href = "#/QuestBattleSelect/101101/TU110";
	};

	TutorialUtil.TU110 = function() {
		location.href = "#/SupportSelect/TU120";
	};

	TutorialUtil.TU120 = function() {
		var prm = {
			"npcHelpId" : common.questBattleModel.questBattle.npcHelpId,
			"resultUrl" : "/magica/index.html#/QuestResult/TU150",
			"startStoryTutorialId" : "TU130",
			"questStartTutorialId" : "TU140"
		};
		questFunc(prm);
	};

	TutorialUtil.TU150 = function() {
		location.href = "#/QuestBattleSelect/101101/TU210";
	};

	TutorialUtil.TU210 = function() {
		var prm = {
			"npcHelpId" : null,
			"resultUrl" : "/magica/index.html#/QuestResult/TU240",
			"startStoryTutorialId" : "TU220",
			"questStartTutorialId" : "TU230"
		};
		questFunc(prm);
	};

	TutorialUtil.TU240 = function() {
		location.href = "#/MainQuest/TU310";
	};

	TutorialUtil.TU310 = function() {
		location.href = "#/QuestBattleSelect/101102/TU320";
	};

	TutorialUtil.TU320 = function() {
		location.href = "#/SupportSelect/TU330";
	};

	TutorialUtil.TU330 = function() {
		var prm = {
			"npcHelpId" : common.questBattleModel.questBattle.npcHelpId,
			"resultUrl" : "/magica/index.html#/QuestResult/TU360",
			"startStoryTutorialId" : "TU340",
			"questStartTutorialId" : "TU350"
		};
		questFunc(prm);
	};

	TutorialUtil.TU360 = function() {
		location.href = "#/QuestBattleSelect/101102/TU410";
	};

	TutorialUtil.TU410 = function() {
		location.href = "#/SupportSelect/TU420";
	};

	TutorialUtil.TU420 = function() {
		var prm = {
			"npcHelpId" : common.questBattleModel.questBattle.npcHelpId,
			"resultUrl" : "/magica/index.html#/QuestResult/TU450",
			"startStoryTutorialId" : "TU430",
			"questStartTutorialId" : "TU440"
		};
		questFunc(prm);
	};

	TutorialUtil.TU450 = function() {
		location.href = "#/QuestBattleSelect/101102/TU510";
	};

	TutorialUtil.TU520 = function() {
		location.href = "#/GachaAnimation/TU530";
	};

	TutorialUtil.TU530 = function() {
		location.href = "#/GachaResult/TU540";
	};

	TutorialUtil.TU550 = function() {
		location.href = "#/DeckFormation/TU560";
	};

	TutorialUtil.TU560 = function(key) {
		switch(key) {
			case "set":
				var target = common.doc.querySelector("#charaList .userCharaIcon.RANK_4");

				if(!target) {
					target = common.doc.querySelector("#charaList .userCharaIcon.RANK_3");
				}
				if(!target) {
					target = common.doc.querySelector("#charaList .userCharaIcon.RANK_2");
				}

				common.addClass(target,"on");

				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type01");

				TutorialUtil.tutorialText("TU560_2");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type02");
				},10);
			break;
			case "charaSelect":
				var target = common.doc.querySelectorAll("#charaListWrap #charaList .userCharaIcon")[0];
				var target2 = common.doc.querySelector("#mainBtn");

				common.removeClass(target,"on");
				common.addClass(target,"tapOff");
				common.addClass(target2,"on");

				TutorialUtil.tutorialText("TU560_3");

				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type02");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type03");
				},10);
			break;
			case "save":
				var target = common.doc.querySelector("#mainBtn");
				var target2 = common.doc.querySelector("#autoFormationPopBtn");

				common.removeClass(target,"on");
				// common.addClass(target,"tapOff");
				common.addClass(target2,"on");

				TutorialUtil.tutorialText("TU560_3_1");

				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type03");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type03_1");
				},10);
			break;
			case "autoPop":
				var target = common.doc.querySelector("#autoFormationPopBtn");
				var target2 = common.doc.querySelector("#mainBtn");

				common.removeClass(target,"on");
				common.addClass(target,"tapOff");
				common.addClass(target2,"on");

				TutorialUtil.tutorialText("TU560_3");

				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type03_1");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type03_2");
				},10);
			break;
			case "save2":
				var target = common.doc.querySelector("#mainBtn");
				var target2 = common.doc.querySelector("#globalMenuContainer");

				common.removeClass(target,"on");
				common.addClass(target,"tapOff");
				common.addClass(target2,"on");

				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type03_2");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type04");
				},10);
			break;
		}
	};

	function TU510Init() {
		var mainContent = common.doc.getElementById("mainContent");

		mainContent.addEventListener("webkitAnimationEnd",function animEndFunc(e) {
			common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
			common.addClass(common.doc.querySelector("#baseContainer"),"type01");

			var sideMenu  = common.doc.getElementById("sideMenu");
			var menuBtn   = common.doc.getElementById("menu");
			var gachaLink = sideMenu.getElementsByClassName("gacha")[0];
			// console.log("イベントセット",sideMenu,menuBtn,gachaLink);

			menuBtn.addEventListener(common.cgti,function menuFunc(e) {
				e.preventDefault();
				if(common.isScrolled()) return;

				common.addClass(menuBtn,"off");
				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type01");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type02");
				},10);


				TutorialUtil.tutorialText("TU510_2");

				menuBtn.removeEventListener(common.cgti, menuFunc, false);
			},false);

			gachaLink.addEventListener(common.cgti,function gachaLinkFunc(e) {
				e.preventDefault();
				if(common.isScrolled()) return;


				location.href = "#/GachaTop/SELECTABLE_TUTORIAL/TU520";

				common.removeClass(menuBtn,"off");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type02");

				gachaLink.removeEventListener(common.cgti, gachaLinkFunc, false);
			},false);
			mainContent.removeEventListener("webkitAnimationEnd", animEndFunc, false);
		},false);
	};

	function TU520Init() {
		var mainContent = common.doc.getElementById("mainContent");

		var tutorialContainer = common.doc.querySelector("#tutorialContainer");
		var bgWrap            = common.doc.querySelector("#tutorialContainer .bgWrap");

		// console.log("石の数チェック",common.getTotalStone().totalMoney);
		if(common.getTotalStone().totalMoney < 25) {
			// 保険処理
			cmd.nativeReload("#/TopPage");
			return;
		}

		mainContent.addEventListener("webkitAnimationEnd",function animEndFunc(e) {
			common.addClass(common.doc.querySelector("#tutorialContainer"),"show");

			if(!common.selectableChara || !common.selectableChara[common.selectableGachaModel.id]) { // キャラがまだ選ばれてない状態
				common.addClass(common.doc.querySelector("#baseContainer"),"type01");

				$(common.doc.querySelector("#tutorialContainer")).on(common.cgti,function(e) {
					$(common.doc.querySelector("#tutorialContainer")).off();
					cmd.startSe(1008);
					common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				});
			} else {
				TutorialUtil.tutorialText("TU520_2");
				common.addClass(common.doc.querySelector("#baseContainer"),"type02");
			}

			mainContent.removeEventListener("webkitAnimationEnd", animEndFunc, false);
		},false);
	};

	function TU540Init() {
		var mainContent = common.doc.getElementById("mainContent");

		mainContent.addEventListener("webkitAnimationEnd",function animEndFunc(e) {
			common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
			common.addClass(common.doc.querySelector("#baseContainer"),"type01");

			var sideMenu  = common.doc.getElementById("sideMenu");
			var menuBtn   = common.doc.getElementById("menu");
			var formationLink = sideMenu.getElementsByClassName("team")[0];

			menuBtn.addEventListener(common.cgti,function menuFunc(e) {
				e.preventDefault();
				if(common.isScrolled()) return;

				common.addClass(menuBtn,"off");
				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type01");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type02");
				},10);

				menuBtn.removeEventListener(common.cgti, menuFunc, false);
			},false);

			formationLink.addEventListener(common.cgti,function formationLinkFunc(e) {
				e.preventDefault();
				if(common.isScrolled()) return;

				location.href = "#/FormationTop/TU550";

				common.removeClass(menuBtn,"off");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type02");

				formationLink.removeEventListener(common.cgti, formationLinkFunc, false);
			},false);
			mainContent.removeEventListener("webkitAnimationEnd", animEndFunc, false);
		},false);
	};

	function TU550Init() {
		var mainContent = common.doc.getElementById("mainContent");

		mainContent.addEventListener("webkitAnimationEnd",function animEndFunc(e) {
			common.addClass(common.doc.querySelector("#tutorialContainer"),"show");

			var questBtn = common.doc.getElementsByClassName("questBtn")[0];
			// console.log("イベントセット",questBtn);

			questBtn.addEventListener(common.cgti,function formationLink(e) {
				e.preventDefault();
				if(common.isScrolled()) return;
				location.href = "#/DeckFormation/TU560";
				questBtn.removeEventListener(common.cgti, formationLink, false);
			},false);

			mainContent.removeEventListener("webkitAnimationEnd", animEndFunc, false);
		},false);
	};

	function TU560Init() {
		// 進行不能を解決するために
		var mainContent = common.doc.getElementById("mainContent");

		mainContent.addEventListener("webkitAnimationEnd",function animEndFunc(e) {
			common.addClass(common.doc.querySelector("#tutorialContainer"),"show");

			// add:自動編成
			var target = common.doc.querySelectorAll("#DeckFormation .deckViewWrap .deckPartsWrap .deckParts");

			var afterTrigger = false;

			if(target[3].classList.contains("on")){
				TutorialUtil.TU560("save2");
			}else if(!target[0].classList.contains("on")){
				common.addClass(common.doc.querySelector("#baseContainer"),"type01");
			}else{
				afterTrigger = true;
			}

			var sideMenu  = common.doc.getElementById("sideMenu");
			var menuBtn   = common.doc.getElementById("menu");
			var storyLink = sideMenu.getElementsByClassName("globalQuestBtn")[0];

			menuBtn.addEventListener(common.cgti,function menuFunc(e) {
				e.preventDefault();
				if(common.isScrolled()) return;

				common.addClass(menuBtn,"off");

				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type04");

				TutorialUtil.tutorialText("TU560_4");

				setTimeout(function(){
					common.addClass(common.doc.querySelector("#tutorialContainer"),"show");
					common.addClass(common.doc.querySelector("#baseContainer"),"type05");
				},10);

				menuBtn.removeEventListener(common.cgti, menuFunc, false);
			},false);

			storyLink.addEventListener(common.cgti,function storyLinkFunc(e) {
				e.preventDefault();
				if(common.isScrolled()) return;

				common.removeClass(menuBtn,"off");

				common.removeClass(common.doc.querySelector("#tutorialContainer"),"show");
				common.removeClass(common.doc.querySelector("#baseContainer"),"type05");

				TutorialUtil.tutorialEnd("TU997");

				storyLink.removeEventListener(common.cgti, storyLinkFunc, false);
			},false);

			if(afterTrigger){
				TutorialUtil.TU560("save");
			}

			mainContent.removeEventListener("webkitAnimationEnd", animEndFunc, false);
		},false);
	};

	function TU998Init() {
	};


	var afterName = "";
	function nameChangeStoryCheck(storyId) {
		var storyReadFlag = false;
		_.each(common.storage.userQuestAdventureList.toJSON(),function(model,index) {
			if(storyId == model.adventureId) {
				storyReadFlag = true;
			}
		});

		return storyReadFlag;
	}

	function nameChangeConfirm(e){
		e.preventDefault();
		if(common.isScrolled()) return;

		common.tapBlock(true);
		afterName = {name:common.doc.getElementById("changeName").value};

		if(common.doc.getElementById("changeName").value === ""){
			new common.PopupClass({
				title:"プレイヤー名入力",
				content:"プレイヤー名を入力してください。",
				closeBtnText:"閉じる",
				popupType:"typeC"
			});
			common.tapBlock(false);
			return;
		}

		common.tapBlock(false);
		nameChange();
	}

	var nameChange = function(){
		// 名前変更
		var callback = function(res){
			if(res.resultCode !== "error") {
				$("#popupArea").off();
				$(common.ready.target).on("webkitAnimationEnd",function(){
					$(common.ready.target).off();
					$(common.ready.target).on("webkitAnimationEnd",function(e) {
						if(e.originalEvent.animationName == "readyFadeOut") {
							common.ready.target.className = "";
						}
					});
				});
				common.g_popup_instance.remove();
				common.addClass(common.ready.target,"gameStartFadeIn");
				TutorialUtil.tutorialEnd("TU999","#/MyPage");

			}
		};

		// DMM対応：もう１環境で入力済みの場合はリロードする
		$("#popupArea").on(common.cgti, "#resultCodeError .popupCloseBtn", function(e){
			e.preventDefault();
			if(common.isScrolled()) return;
			$("#popupArea").off();

			cmd.nativeReload("#/TopPage");
			return;
		});

		ajaxControl.ajaxPost(common.linkList.userChangeNamePrologue,afterName,callback);
	};

	function storyAdvStart(tuId) {
		var _tuId = tuId;
		var storyReadFlag = false;

		if(tuId == "TU998") {
			storyReadFlag = nameChangeStoryCheck(tutorialStoryId[_tuId]);

			if(storyReadFlag) {
				common.tapBlock(false);

				var popTemp = _.template($("#nameChangePop").text());

				new common.PopupClass({
					title:"プレイヤー名入力",
					popupId:"nameSettingPopup",
					content:popTemp(),
					decideBtnText:"OK",
					canClose: false
				});

				// 現在の文字数
				common.doc.getElementById("textCount").innerText = 0;

				common.doc.getElementById("popupArea").getElementsByClassName("decideBtn")[0].addEventListener(common.cgti, nameChangeConfirm);

				// ネイティブキーボードイベント登録
				// ID:changeName,8文字制限,日本語OK,文字数カウント:textCount
				common.nativeKeyBoard("changeName",8,0,"textCount");
				return;
			}
		}

		$(common.ready.target).on("webkitAnimationEnd",function(){
			cmd.endTop();
			cmd.changeBg("web_black.jpg");

			$(common.ready.target).off();
			$(common.ready.target).on("webkitAnimationEnd",function(e) {
				if(e.originalEvent.animationName == "readyFadeOut") {
					common.ready.target.className = "";
				}
			});

			$('#commandDiv').on('nativeCallback',function(e,res) { // ストーリー終わり
				$('#commandDiv').off();
				// console.log("_tuId: ",_tuId);
				if(_tuId == "TU998") {
					if(res && res.userName) {
						cmd.changeBg('web_common.ExportJson');
						cmd.endTop();

						// console.log("名前入力がありました",res);
						var callback = function(_res) {
							$("#popupArea").off();
							common.responseSetStorage(_res);
							TutorialUtil.tutorialEnd("TU999");
							location.href = tutorialResumePage[_tuId];
						};
						// ゲームユーザー作成
						var prm = {
							"name": res.userName
						};

						// DMM対応：もう１環境で入力済みの場合はリロードする
						$("#popupArea").on(common.cgti, "#resultCodeError .popupCloseBtn", function(e){
							e.preventDefault();
							if(common.isScrolled()) return;
							$("#popupArea").off();

							cmd.nativeReload("#/TopPage");
							return;
						});

						ajaxControl.ajaxPost(common.linkList.userChangeNamePrologue,prm,callback);
						setTimeout(function() {
							cmd.setWebView(true);
						},3000);
					}
				} else {
					location.href = tutorialResumePage[_tuId];
					setTimeout(function() {
						cmd.setWebView(true);
					},200);
				}
			});

			setTimeout(function() {
				cmd.setWebView(false);
				cmd.startStory(tutorialStoryId[_tuId]);
			},500);
		});

		common.addClass(common.ready.target,"preNativeFadeIn");
	}

	function questFunc(prm) {
		$(common.ready.target).on("webkitAnimationEnd",function(){
			cmd.changeBg("web_black.jpg");
			cmd.endL2d();

			$(common.ready.target).off();
			$(common.ready.target).on("webkitAnimationEnd",function(e) {
				if(e.originalEvent.animationName == "readyFadeOut") {
					common.ready.target.className = "";
				}
			});

			// ----------------------------------------------------------------.
			// クエストパラメータ生成
			var questPrm = {};
			questPrm.questBattleId = common.questBattleModel.questBattle.questBattleId;
			questPrm.deckType = 11;

			var deckModel = common.storage.userDeckList.findWhere({"deckType":11}).toJSON();

			_.each(deckModel,function(m,key) {
				if(key.indexOf("questPositionId") != -1) {
					questPrm[key] = m;
				}
				if(key.indexOf("userCardId") != -1) {
					questPrm[key] = m;
				}
			});

			if(prm.npcHelpId) {
				questPrm.npcHelpId = prm.npcHelpId;
			}
			var startStoryId   = common.questBattleModel.questBattle.startStory;

			if(window.isBrowser) {
				common.stubQuest = questPrm;
				common.stubQuest.resultUtl = prm.resultUrl;
				cmd.sendCommand("QuestStub");
				return;
			}

			var callback = function(res) {
				var _questPrm = res;
				$('#commandDiv').on('nativeCallback',function() { // ストーリー終わり
					$('#commandDiv').off();

					$('#commandDiv').on('nativeCallback',function(e,res) {
						$('#commandDiv').off();
						beforeQuestDataCreate(res);

						location.href = "#/QuestBackground";
					});

					var urls = {};
					urls.resultUrl = prm.resultUrl;
					urls.retireUrl = "/magica/index.html";

					questStart(_questPrm,urls);
					TutorialUtil.tutorialIdRegist(prm.questStartTutorialId);
				});

				TutorialUtil.tutorialIdRegist(prm.startStoryTutorialId);
				setTimeout(function() {
					cmd.setWebView(false);
					cmd.startStory(startStoryId);
				},500);
			};
			ajaxControl.ajaxPost(common.linkList.questStart,questPrm,callback);
		});

		common.addClass(common.ready.target,"preNativeFadeIn");
	}

	function beforeQuestDataCreate(json) {
		if(!json) return;
		var data            = json.webData;
		var questResultData = data.userQuestBattleResultList[0].questBattle;

		common.responseSetStorage(data);
		// questResultData
		var sectionModel = common.storage.userSectionList.findWhere({sectionId:questResultData.sectionId});
			sectionModel = (sectionModel) ? sectionModel.toJSON() : null;
		if(sectionModel) {
			var chapterModel = common.storage.userChapterList.findWhere({chapterId:sectionModel.section.genericId});
				chapterModel = (chapterModel) ? chapterModel.toJSON() : null;

			common.playChapter = chapterModel;
			common.playSection = sectionModel;
		}
	};

	function questStart(questPrm,urls) {
		// AP回復のインターバルを止める
		if(common.acpTimeCure) {
			clearInterval(common.acpTimeCure);
			common.acpTimeCure = null;
		}

		cmd.setWebView(false);
		cmd.startQuest(questPrm.userQuestBattleResultList[0].id,urls);
	};

	return TutorialUtil;
});
