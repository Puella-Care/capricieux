define([
	'underscore',
	'backbone',
	'backboneCommon'
], function (_,Backbone,common) {
	'use strict';

	var commandDiv = document.getElementById("commandDiv");
	var g_wkFlag = (window.webkit) ? true : false;
	var g_cwVer  = null;

	var c = {
		//DATA関連 (100未満）
		"DATA_CLEAR_WEB_CACHE"        : 1,
		"DATA_REMOVE_ASSET"           : 2,
		"DATA_REMOVE_ASSET_FILE"      : 3,
		"DATA_ASSET_FILE_EXIST"       : 4,

		"DATA_CALL_TOUCHES_BEGIN"     : 5,
		"DATA_CALL_TOUCHES_MOVE"      : 6,
		"DATA_CALL_TOUCHES_END"       : 7,
		"DATA_CALL_TOUCHES_CLEAR"     : 8,

		"DATA_AWAKE_PURCHASE"         : 10,
		"DATA_PURCHASE_ITEM"          : 11,
		"DATA_GET_PURCHASE_STATE": 12,
		"DATA_GET_SERVER_URL": 13,

		"DATA_GET_SNS_USER_ID"        : 20,
		"DATA_GET_APP_VERSION"        : 21,
		"DATA_GET_DOWNLOAD_CONFIG"    : 22,
		"DATA_GET_DEVICE_INFO"        : 23,
		"DATA_GET_ACCESS_TOKEN"       : 24,
		"DATA_CLOSE_APP"              : 25,
		"DATA_SET_DOWNLOAD_CONFIG"    : 26,
		"DATA_GET_STORY_STORED_DATA"  : 27,

		"DATA_GET_FONT"                  : 30,
		"DATA_INITIALIZE_SNS_USER_ID"    : 40,
		"DATA_INITIALIZE_CONFIG"         : 41,
		"DATA_OPEN_URL"                  : 50,
		"DATA_GET_BASE64"                : 60,
		"DATA_SET_CLIPBOARD"             : 62,
		"DATA_GET_CLIPBOARD"             : 63,
		"DATA_GET_REWARD"                : 70,
		"DATA_DELETE_REWARD"             : 71,
		"DATA_SET_FOX"                   : 80,
		"DATA_SET_ADJUST"                : 81,
		"DATA_SET_TD_LOGIN": 82,
		"DATA_OPEN_EDIT_BOX"             : 90,
		"DATA_GET_QUEST_REPLAY_VERSION"  : 97,
		"DATA_GET_USER_JSON": 98,
		"DATA_SET_USER_JSON": 99,

		//SOUND関連 (100番台）
		"SOUND_BGM_PLAY"      : 100,
		"SOUND_BGM_STOP"      : 101,
		"SOUND_BGM_RESUME"    : 102,
		"SOUND_BGM_PAUSE"     : 103,
		"SOUND_BGM_SET_VOL"   : 104,
		"SOUND_BGM_GET_VOL"   : 105,

		"SOUND_SE_PLAY"       : 110,
		"SOUND_SE_STOP"       : 111,
		"SOUND_SE_SET_VOL"    : 114,
		"SOUND_SE_GET_VOL"    : 115,

		"SOUND_VO_PLAY"       : 120,
		"SOUND_VO_STOP"       : 121,
		"SOUND_VO_SET_VOL"    : 124,
		"SOUND_VO_GET_VOL"    : 125,

		"SOUND_SUR_PLAY": 130,
		"SOUND_SUR_STOP": 131,

		//SCENE関連 (200番台 or 300番台 or 1000番台）
		"SCENE_PUSH_WEBVIEW"          : 201,
		"SCENE_POP_WEBVIEW"           : 202,
		"SCENE_REPLACE_WEBVIEW"       : 203,

		"SCENE_PUSH_LOADING"          : 211,
		"SCENE_PUSH_DOWNLOAD"         : 221,
		"SCENE_GET_CONF_DELETE_DATA"  : 222,
		"SCENE_SET_CONF_DELETE_DATA"  : 223,

		"SCENE_PUSH_GACHA"               : 231,
		"SCENE_PUSH_PRESENT"             : 232,
		"SCENE_POP_GACHA"                : 233,
		"SCENE_PUSH_EVOLUTION"           : 241,
		"SCENE_PUSH_MEMORIA_COMPOSE"     : 251,
		"SCENE_PUSH_STORY"               : 261,
		"SCENE_PUSH_QUEST_STORY"         : 262,
		"SCENE_PUSH_BRANCH_STORY"        : 263,
		"SCENE_PUSH_STORY_STORED_DATA"   : 264,

		"SCENE_PUSH_QUEST"              : 271,
		"SCENE_POP_QUEST"               : 272,
		"SCENE_PUSH_QUEST_REPLAY"       : 275,
		"SCENE_SEND_QUEST_REPLAY_DATA"  : 276,

		"SCENE_PUSH_CAMERA"           : 280,
		"SCENE_POP_CAMERA"            : 281,
		"SCENE_SWAP_CAMERA"           : 282,
		"SCENE_ZOOM_CAMERA"           : 283,
		"SCENE_CAPTURE_CAMERA"        : 284,

		"SCENE_PUSH_CHAT"             : 291,
		"SCENE_POP_CHAT"              : 292,

		"SCENE_PUSH_TOP"              : 301,
		"SCENE_POP_TOP"               : 302,

		"SCENE_PUSH_GENERAL_STORY"    : 311,
		"SCENE_POP_GENERAL_STORY"     : 312,

		"SCENE_PUSH_QUEST_STORED_DATA": 321,
		"SCENE_PUSH_PROLOGUE"         : 331,

		"SCENE_PUSH_ANOTHER_QUEST"    : 341,
		"SCENE_POP_ANOTHER_QUEST"     : 342,
		"SCENE_PLAY_ANOTHER_QUEST"    : 343,
		"SCENE_PUSH_ANOTHER_QUEST_PART2" : 344,
		"SCENE_PLAY_ANOTHER_QUEST_PART2" : 345,


		"SCENE_PUSH_MOVIE"            : 351,
		"SCENE_POP_MOVIE"             : 352,
		"SCENE_PUSH_CANT_SKIP_MOVIE": 353,
		"SCENE_PUSH_MOVIE_CHAR"       : 361,

		"SCENE_PUSH_EVENT_RAID"                 : 363,
		"SCENE_POP_EVENT_RAID"                  : 364,
		"SCENE_SHOW_REWARD_EVENT_RAID"          : 365,
		"SCENE_APP_BOSS_EVENT_RAID"             : 366,
		"SCENE_CANCEL_SELECTED_BOSS_EVENT_RAID" : 367,
		"SCENE_PUSH_MESSAGE_EVENT_RAID"         : 368,
		"SCENE_FOCUS_POINT_EVENT_RAID"          : 369,
		"SCENE_APP_ENEMY_EVENT_RAID"            : 397,

		"SCENE_PUSH_EVENT_BRANCH"     : 371,
		"SCENE_RESUME_EVENT_BRANCH"   : 372,
		"SCENE_POP_EVENT_BRANCH"      : 373,

		"SCENE_PUSH_EVENT_SINGLE_RAID"        : 381,
		"SCENE_HIDE_EVENT_SINGLE_RAID"        : 382,
		"SCENE_SHOW_EVENT_SINGLE_RAID"        : 383,
		"SCENE_POP_EVENT_SINGLE_RAID"         : 384,
		"SCENE_ENABLE_TAP_EVENT_SINGLE_RAID"  : 385,
		"SCENE_VIEW_SCALE_EVENT_SINGLE_RAID"  : 386,

		"SCENE_PUSH_EVENT_DUNGEON"           : 391,
		"SCENE_POP_EVENT_DUNGEON"            : 392,
		"SCENE_DECIDE_EVENT_DUNGEON"         : 393,
		"SCENE_FOCUS_EVENT_DUNGEON"          : 394,
		"SCENE_RANDOM_ICON_EVENT_DUNGEON"    : 398,
		"SCENE_PUSH_EVENT_PUELLA_RAID": 1008,
		"SCENE_RELOAD_EVENT_PUELLA_RAID": 1009,

		"SCENE_PUSH_EVENT_STORY_RAID" : 395,
		"SCENE_POP_EVENT_STORY_RAID"  : 396,

		"SCENE_PUSH_EMOTION_BOARD"  : 1000,
		"SCENE_POP_EMOTION_BOARD"   : 1001,
		"SCENE_SCALE_EMOTION_BOARD" : 1002,
		"SCENE_APLAY_EMOTION_BOARD" : 1003,
		"SCENE_CENTERING_EMOTION_BOARD" : 1004,
		"SCENE_PUSH_CHAPTER2_MIRROR_BATTLE" : 1005, //理違いバトル開始
		"SCENE_PUSH_PUELLA_HISTORIA" : 1006, //ピュエラヒストリアトップ用オブジェクト生成
		"SCENE_POP_PUELLA_HISTORIA" : 1007, //ピュエラヒストリアトップ用オブジェクト削除
		//scene0用コマンド
		"SCENE_PUSH_SCENARIO_PAGE" : 1020,
		"SCENE_POP_SCENARIO_PAGE" : 1021,
		"SCENE_UPDATE_SCENARIO_PAGE" : 1022,
		"SCENE_PUSH_SCENARIO_LIST" : 1023,
		"SCENE_POP_SCENARIO_LIST" : 1024,

		//魔女メモリア交換アニメ
		"SCENE_PUSH_EVENT_WITCH_EXCHANGE_ANIME" : 1025,
		"SCENE_POP_EVENT_WITCH_EXCHANGE_ANIME" : 1026,

		//DISPLAY関連 (400番台）
		"DISPLAY_SET_WEBVIEW_VISIBLE" : 400,

		"DISPLAY_CHANGE_BG"           : 410,
		"DISPLAY_REMOVE_BG"           : 411,

		"DISPLAY_ADD_L2D"             : 420,
		"DISPLAY_REMOVE_L2D"          : 421,
		"DISPLAY_PALY_L2D_MOTION"     : 422,

		"DISPLAY_ADD_MINI"            : 430,
		"DISPLAY_REMOVE_MINI"         : 431,
		"DISPLAY_ADD_MINI_ARRAY"      : 432,
		"DISPLAY_REMOVE_MINI_ARRAY"   : 433,

		"DISPLAY_PLAY_COMPOSE_EFFECT"   : 450,
		"DISPLAY_SHOW_COMPOSE_RESULT"   : 451,
		"DISPLAY_HIDE_COMPOSE"          : 452,
		"DISPLAY_PLAY_COMPOSE_MAGIA"    : 460,
		"DISPLAY_PLAY_AWAKE_ABILITY"    : 465,
		"DISPLAY_PLAY_AWAKE_ABILITIES"  : 466,
		"DISPLAY_PLAY_COMPOSE_ATTRIBUTES"  : 467,
		"DISPLAY_PLAY_NORMAL_GACHA_TOP" : 470,
		"DISPLAY_STOP_NORMAL_GACHA_TOP" : 471,
		"DISPLAY_PLAY_MEMORIA_TOP"    : 490,
		"DISPLAY_STOP_MEMORIA_TOP"    : 491,

		"DISPLAY_PLAY_GENERAL_STORY"  : 481,
		"DISPLAY_PLAY_ONE_SHOT_STORY" : 482,

		//PUSH通知関連 (500番台)
		"NOTI_GET_CONF_PNOTE"        : 500,
		"NOTI_AWAKE_PNOTE"           : 501,
		"NOTI_TURN_ON_PNOTE"         : 502,
		"NOTI_TURN_OFF_PNOTE"        : 503,
		"NOTI_GET_CONF_WEEKLY_QUEST" : 510,
		"NOTI_TURN_ON_WEEKLY_QUEST"  : 511,
		"NOTI_TURN_OFF_WEEKLY_QUEST" : 512,
		"NOTI_GET_CONF_AP_FULL"      : 520,
		"NOTI_TURN_ON_AP_FULL"       : 521,
		"NOTI_TURN_OFF_AP_FULL"      : 522,
		"NOTI_CANCEL_AP_FULL"        : 523,
		"NOTI_STORY_RAID_BOSS_DIED"  : 524,

		"DISPLAY_PLAY_FORMATION"     : 600,
		"DISPLAY_STOP_FORMATION"     : 601,

		"DISPLAY_PLAY_WEEKLY_QUEST_TOP" : 610,
		"DISPLAY_STOP_WEEKLY_QUEST_TOP" : 611,

		"DISPLAY_PLAY_FORMATION_ENEMY" : 620,
		"DISPLAY_STOP_FORMATION_ENEMY" : 621,

		"DISPLAY_PLAY_EFFECT" : 630,
		"DISPLAY_STOP_EFFECT" : 631,
	};

	c.sendCommand = function(command) {
		var _command = String(command);
		if (window.isDebug) {
			if(_command.split(",")[0] == "99"){
				console.log("native:command: 99 json続く");
			}else if(_command.split(",")[0] == "98"){
				console.log("native:command: 98 json続く");
			}else{
				console.log("native:command: "+_command);
			};
		}

		if (window.isBrowser) return;
		var msg = 'game:' + _command;
		if (common.ua.android) {
			if(!window.app_ver || (g_cwVer && g_cwVer < 158)){
				alert(msg);
			}else if(g_cwVer && g_cwVer > 157){
				androidCommand.jsCallback(msg);
			}else{
				var spl = window.app_ver.split(".");
				g_cwVer = spl.join('') | 0;

				if(g_cwVer < 158){
					alert(msg);
				}else{
					androidCommand.jsCallback(msg);
				}
			}
		} else {
			//wk分岐
			if(g_wkFlag){
				webkit.messageHandlers.gameCommand.postMessage(msg);
			}
		}
	};

	c.tipsObj = [
		{"type":1,"image":"tips_21001.png"},
		{"type":1,"image":"tips_21002.png"},
		{"type":1,"image":"tips_21003.png"},
		{"type":1,"image":"tips_21004.png"},
		{"type":1,"image":"tips_21005.png"},
		{"type":1,"image":"tips_21006.png"},
		{"type":1,"image":"tips_21007.png"},
		{"type":1,"image":"tips_21008.png"},
		{"type":1,"image":"tips_21009.png"},
		{"type":1,"image":"tips_21010.png"},
		{"type":1,"image":"tips_21011.png"},
		{"type":1,"image":"tips_21012.png"},
		{"type":1,"image":"tips_21013.png"},
		{"type":1,"image":"tips_21014.png"},
		{"type":1,"image":"tips_21016.png"},
		{"type":1,"image":"tips_21017.png"},
		{"type":1,"image":"tips_21018.png"},
		{"type":1,"image":"tips_21019.png"},
		{"type":1,"image":"tips_21020.png"},
		{"type":1,"image":"tips_21021.png"},
		{"type":1,"image":"tips_21022.png"},
		{"type":1,"image":"tips_21023.png"},
		{"type":1,"image":"tips_21024.png"},
		{"type":1,"image":"tips_21025.png"},
		{"type":1,"image":"tips_21026.png"},
		{"type":1,"image":"tips_21027.png"},
		{"type":1,"image":"tips_21028.png"},
		{"type":1,"image":"tips_21029.png"},
		{"type":1,"image":"tips_21030.png"},
		{"type":1,"image":"tips_21031.png"},
		{"type":1,"image":"tips_21032.png"},
		{"type":1,"image":"tips_21033.png"},
		{"type":1,"image":"tips_21034.png"},
		{"type":1,"image":"tips_21035.png"},
		{"type":1,"image":"tips_21037.png"},
		{"type":1,"image":"tips_21038.png"},
		{"type":1,"image":"tips_21039.png"},
		{"type":0,"title":"ミッション","text":"デイリーミッションは毎日0時に更新されます"},
		{"type":0,"title":"衣装切り替え","text":"魔法少女の衣装を入手した場合@ホーム画面の魔法少女の衣装を切り替えることができます"},
		{"type":0,"title":"引き継ぎ用パスワードの設定","text":"引き継ぎ用パスワードを設定しておくことで@端末が壊れてしまっても、データの引き継ぎができます"},
		{"type":0,"title":"機種変更の前に","text":"引き継ぎ用IDをメモ等で控え@パスワードの設定をお忘れなく"},
		{"type":0,"title":"Chargeディスク","text":"Chargeディスクを連続して使用すると@チャージが溜まり、大ダメージを与えられます"},
		{"type":0,"title":"Puella Combo","text":"同じ魔法少女で攻撃すると@Puella Comboとなりダメージが上昇します"},
		{"type":0,"title":"ターゲットの選択","text":"敵をタップするとターゲットすることができます"},
		{"type":0,"title":"コネクト","text":"同じ魔法少女で3回攻撃すると@コネクトが発動できるようになります"},
		{"type":0,"title":"魔法陣形","text":"陣形の前列は敵の攻撃を受けやすくなるため@防御力が高い魔法少女を配置しましょう"},
		{"type":0,"title":"サポート","text":"フォローしていないユーザーのサポートは@マギアとスキルが使用できないため注意が必要です"},
		{"type":0,"title":"Accele Combo","text":"Accele Comboを決めると@チーム全員のマギアゲージが増加します"},
		{"type":0,"title":"Blast Combo","text":"Blast Comboを決めたターンは@ダメージ量が大きくなります"},
		{"type":0,"title":"Puella Combo","text":"同じディスクでPuella Comboを決めると@更に大きなダメージを与えることができます"},
		{"type":0,"title":"ディスクキャンセル","text":"選択されたディスクをタッチするとキャンセルされて@ディスクを選び直すことができます"},
		{"type":0,"title":"マギア","text":"マギアゲージが100以上溜まると@いつでもマギアが発動できます"},
		{"type":0,"title":"スキル","text":"ディスク選択中でもスキルを@発動することができます"},
		{"type":0,"title":"オートバトル","text":"一度クリアしたバトルは二回目以降@オートバトルで進行することができます"},
		{"type":0,"title":"オートバトル","text":"オートを解除した場合、次のターンから@手動操作することができます"},
		{"type":0,"title":"サポートPt","text":"クエストでサポートとして使用された場合@翌日のログイン時にサポートPtが獲得できます"},
		{"type":0,"title":"ディスクのデザイン変更","text":"魔法少女詳細画面の設定から@ディスクのデザインを変更することができます"},
		{"type":0,"title":"デスティニージェム","text":"すでに所持している魔法少女を再度獲得した場合@その魔法少女のデスティニージェムを獲得できます"},
		{"type":0,"title":"デスティニージェム","text":"デスティニージェムは魔法少女の魔力解放に使用します@魔力解放をおこなうとメモリア装備枠が増加します"},
		{"type":0,"title":"デスティニージェムをマギアチップに変換","text":"余ったデスティニージェムは、アイテムリスト画面と@魔力解放画面でマギアチップに交換できます"},
		{"type":0,"title":"マギアチップ","text":"デスティニージェムはマギアチップに変換できます@マギアチップはショップでアイテムと交換できます"},
		{"type":0,"title":"ターゲットの選択","text":"ターゲットは3枚のディスクを選択する際に@毎回変更することができます"},
		{"type":0,"title":"Acceleディスク","text":"アクセルディスクで最初に攻撃すると@以降のディスクでマギアゲージが溜まりやすくなります"},
		{"type":0,"title":"Acceleディスク","text":"2枚め、3枚めのAcceleディスクほど@マギアゲージが溜まりやすくなります"},
		{"type":0,"title":"Blastディスク","text":"Blastディスクは2枚め、3枚めで@攻撃するほどダメージが上昇します"},
		{"type":0,"title":"Blastディスク","text":"Blastディスクには縦攻撃、横攻撃の@2種類が存在します"},
		{"type":0,"title":"Blastディスク","text":"Blastディスクで攻撃すると@マギアゲージが溜まらないので注意が必要です"},
		{"type":0,"title":"ディスクの出現","text":"リーダーに指定した魔法少女は@ディスクが出現しやすくなります"},
		{"type":0,"title":"ドッペル","text":"ドッペルを持つ魔法少女は@マギアゲージが150まで溜まると発動できます"},
		{"type":0,"title":"敵の情報","text":"敵を長押しすると敵の情報を@表示することができます"},
		{"type":0,"title":"Chargeの効果","text":"Chargeが溜まっている状態でAcceleを放つと@マギアゲージ獲得量が上昇します"},
		{"type":0,"title":"Chargeの効果","text":"Chargeが溜まっている状態でBlastを放つと@与えるダメージ量が上昇します"},
		{"type":0,"title":"ドッペル","text":"★5かつマギアLv5の魔法少女の@ドッペルクエストをクリアすることで解放されます"},
		{"type":0,"title":"メモリア","text":"メモリアはスキル・アビリティ2枚ずつ@最大4枚まで装備することができます"},
		{"type":0,"title":"マギアLv","text":"マギアLvを5にするとマギアゲージ上限が@150まで解放されます"},
		{"type":0,"title":"Charge Combo","text":"Charge Comboを決めるとCharge数が2増加します"},
		{"type":0,"title":"魔法少女の情報","text":"クエスト中に魔法少女を長押しすると@その魔法少女の情報を表示します"},
		{"type":0,"title":"サポート編成","text":"他プレイヤーがサポートとして使用できる魔法少女を@サポート編成で設定することができます"},
		{"type":0,"title":"マギアパスポート30","text":"マギアパスポート30を購入すると30日間@毎日のログイン時にマギアストーン5個を獲得できます"},
		{"type":0,"title":"デスティニークリスタルの入手方法","text":"初期レアリティが★4で最大まで魔力解放した魔法少女の@デスティニージェムを変換する際に付与されます"}
	];

	// ------------------------------------------------------------------------.
	// DATA
	// ------------------------------------------------------------------------.
	// キャッシュクリア
	c.clearWebCache = function(flag) {

		var _flag = (flag) ? true : false;
		var prm = {
			"includeDiskFiles" : flag
		}
		var json = JSON.stringify(prm);
		var command = c.DATA_CLEAR_WEB_CACHE + "," + json;;

		require(['ajaxControl'],function(ajaxControl) {
			ajaxControl.ajaxPost(common.linkList.cacheClear);
		});

		this.sendCommand(command);
	};

	/**
	 * ファイルリムーブ
	 * @param {string} type 削除するファイルタイプ(common:全て,voice:ボイスデータ,movie:ムービーデータ)
	 * @param {string} callbackName 叩いてもらうコールバック名
	 */
	c.removeAsset = function(type,callbackName) {
		var obj = {};
		obj.category = type;
		obj.callback = (callbackName) ? callbackName : "nativeCallback";
		var json = JSON.stringify(obj);
		var command = c.DATA_REMOVE_ASSET + "," + json;
		this.sendCommand(command);
	};

	c.removeFile = function(arr) {
		var json = JSON.stringify(arr);
		var command = c.DATA_REMOVE_ASSET_FILE + "," + json;
		this.sendCommand(command);
	};

	// ネイティブリソース存在確認
	c.existFile = function(arr) {
		var json = JSON.stringify(arr);
		var command = c.DATA_ASSET_FILE_EXIST + "," + json;
		this.sendCommand(command);
	};

	// タッチスタート
	c.callTouchesBegin = function(array) {
		var json = JSON.stringify(array);
		var command = c.DATA_CALL_TOUCHES_BEGIN + "," + json;
		this.sendCommand(command);
	};
	// タッチムーブ
	c.callTouchesMove = function(array) {
		var json = JSON.stringify(array);
		var command = c.DATA_CALL_TOUCHES_MOVE + "," + json;
		this.sendCommand(command);
	};
	// タッチエンド
	c.callTouchesEnd = function(array) {
		var json = JSON.stringify(array);
		var command = c.DATA_CALL_TOUCHES_END + "," + json;
		this.sendCommand(command);
	};

	c.callTouchesClear = function() {
		var command = c.DATA_CALL_TOUCHES_CLEAR;
		this.sendCommand(command);
	};

	// 課金再開処理
	c.awakePurchase = function() {
		var command = c.DATA_AWAKE_PURCHASE;
		this.sendCommand(command);
	};

	// アイテム購入
	c.purchaseItem = function(model) {
		var pack = {};
		if(window.isDebug) {
			// debug
			pack.productId = 'jp.f4samurai.madomagi.purchase.item.' + model.moneyCode;
		} else {
			// 本番
			pack.productId = 'com.aniplex.magireco.item.' + model.moneyCode;

		}
		pack.userId = common.storage.gameUser.toJSON().userId;

		// DMM対応
		pack.itemId    = pack.productId;
		pack.itemName  = model.commonMoney.name;
		pack.unitPrice = model.commonMoney.coin;
		pack.quantity  = 1;
		pack.imageUrl  = model.commonMoney.imagePath;
		pack.description = (!model.commonMoney.limitDescription) ?
								model.commonMoney.description :
								model.commonMoney.limitDescription + model.commonMoney.description;

		pack = JSON.stringify(pack);

		var command = c.DATA_PURCHASE_ITEM + "," + pack;
		this.sendCommand(command);
	};

	// SNS_USER_ID取得
	var snsAlready = false;
	c.getSNS = function() {
		if(snsAlready) return;
		snsAlready = true;

		var command = c.DATA_GET_SNS_USER_ID;
		this.sendCommand(command);
	};

	// バージョンを取得
	c.getAppVersion = function() {
		var command = c.DATA_GET_APP_VERSION;
		this.sendCommand(command);
	};

	// リソースダウンロードの設定を取得
	c.getDownloadConfig = function(callbackTarget){
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.DATA_GET_DOWNLOAD_CONFIG + set;
		this.sendCommand(command);
	};

	// 端末情報の取得
	c.getDeviceInfo = function(callbackFuncName){
		var set  = (callbackFuncName) ? "," + callbackFuncName : "";
		var command = c.DATA_GET_DEVICE_INFO + set;
		this.sendCommand(command);
	};

	// テスト環境アクセストークンの取得
	c.getAccessToken = function(){
		var command = c.DATA_GET_ACCESS_TOKEN;
		this.sendCommand(command);
	}

	// アプリ終了コマンド（Androidのみ)
	c.closeGame = function(){
		var command = c.DATA_CLOSE_APP;
		this.sendCommand(command);
	}

	// ムービーデータの品質設定コマンド
	// @param {init} movie 0:ダウンロードしない, 1:低品質, 2:高品質
	c.setMovieConfig = function(key){
		var object = {};
			object.movie = key;
		var json = JSON.stringify(object);
		var command = c.DATA_SET_DOWNLOAD_CONFIG + "," + json;
		this.sendCommand(command);
	}

	// ストーリ中断データの取得
	c.getStorySaveData = function() {
		var command = c.DATA_GET_STORY_STORED_DATA + ',saveDataCallback';
		this.sendCommand(command);
	};

	// base64に変換したフォントデータをJSON形式で受け取る
	// 実行すると、ネイティブがbase.jsで宣言してるfontDataGet()を実行します
	c.getFontData = function() {
		var command = c.DATA_GET_FONT;
		this.sendCommand(command);
	};

	// SNSユーザーIDを初期化
	c.userDataInitilize = function() {
		var command = c.DATA_INITIALIZE_SNS_USER_ID;
		this.sendCommand(command);
	};

	// コンフィグ設定の初期化＆中断データの削除＆プッシュ通知のキャンセル
	c.configDataInitilize = function() {
		var command = c.DATA_INITIALIZE_CONFIG;
		this.sendCommand(command);
	};

	/**
	 * ブラウザを立ち上げる
	 * @param {string} url 遷移先URL
	 */
	c.browserOpen = function(url) {
		var command = c.DATA_OPEN_URL + "," + url;
		this.sendCommand(command);
	};

	// 画像などのデータをbase64文字列に変換してを返します
	c.getBaseData = function(obj) {
		var json = JSON.stringify(obj);
		var command = c.DATA_GET_BASE64 + ',' + json;
		this.sendCommand(command);
	};

	/**
	 * クリップボードにコピーする
	 * @param {string} str クリップボードに貼り付けたい文字列
	 */
	c.copyClipboard = function(str){
		var toStr = str.toString();
		var command = c.DATA_SET_CLIPBOARD + ','+toStr;
		this.sendCommand(command);
	};

	/**
	 * クリップボードにコピーする
	 * @param {string} str クリップボードに貼り付けたい文字列
	 */
	c.pasteClipboard = function(){
		var command = c.DATA_GET_CLIPBOARD;
		this.sendCommand(command);
	};

	// santaパラメータ受取
	c.getRewardPrm = function() {
		var command = c.DATA_GET_REWARD + ',nativeCallback';
		this.sendCommand(command);
	};

	// santaパラメータ削除
	c.deleteRewardPrm = function() {
		var command = c.DATA_DELETE_REWARD;
		this.sendCommand(command);
	};

	// FOX成果通知
	c.setFoxData = function(obj,adjust) {
		// adjust
		if(!window.isDebug && obj){
			var json = JSON.stringify(obj);
			var command = c.DATA_SET_FOX + ',' + json;
			this.sendCommand(command);
		}
		if(adjust){
			var objAdjust = {};
			objAdjust.token     = adjust.token;
			objAdjust.eventName = adjust.eventName;
			if(adjust.currency)   objAdjust.currency = adjust.currency;
			if(adjust.price) objAdjust.price         = adjust.price;
			var jsonAdjust = JSON.stringify(objAdjust);
			var commandAlpha = c.DATA_SET_ADJUST + ',' + jsonAdjust;
			this.sendCommand(commandAlpha);
		}
	};

	/**
	 * ThinkingData用のユーザーIDを送る
	 * @param {string} userId gameUser.userId
	 */
	c.setUserId = function(userId){
		var _userId = String(userId);
		var command = c.DATA_SET_TD_LOGIN + ','+_userId;
		this.sendCommand(command);
	};

	// ネイティブキーボードを開く
	// @param {string} text 入力エリアに表示する初期の文字列
	// @param {int}    maxLength 最大文字長
	// @param {int}    keyboardType 0:default 1:英数字のみ
	// @param {string} callbackName コールバックに指定する変数名(指定なしの場合はnativeCallback)
	c.openKeyBoard = function(text,maxLength,keyboardType,callbackName){
		var obj = {};
		obj.text = (text) ? text : "";
		if(maxLength && maxLength > 0) obj.maxLength = Number(maxLength);
		if(keyboardType && keyboardType > 0) obj.keyboardType = 1;
		if(callbackName) obj.callback = callbackName;
		var json = JSON.stringify(obj);
		var command = c.DATA_OPEN_EDIT_BOX + ',' + json;
		this.sendCommand(command);
	};

	// santaパラメータ削除
	c.getReplayVersion = function() {
		var command = c.DATA_GET_QUEST_REPLAY_VERSION;
		this.sendCommand(command);
	};

	// マギアストーン購入ステータス取得
	c.getPurchaseStatus = function() {
		var command = c.DATA_GET_PURCHASE_STATE;
		this.sendCommand(command);
	};

	// 各環境のサーバーURL取得
	c.getServerUrl = function() {
		var command = c.DATA_GET_SERVER_URL;
		this.sendCommand(command);
	};

	// ------------------------------------------------------------------------.
	// SOUND
	// ------------------------------------------------------------------------.

	// BGMスタート
	c.startBgm = function(fileName,noCacheFlag) {
		if(!noCacheFlag) common.bgm = fileName;
		var command = c.SOUND_BGM_PLAY + "," + fileName;
		this.sendCommand(command);
	};

	// BGMストップ
	c.stopBgm = function() {
		var command = c.SOUND_BGM_STOP;
		this.sendCommand(command);
	};

	// BGM音量設定(param = 100分率)
	c.setBGMVolume = function(param) {
		var command = c.SOUND_BGM_SET_VOL;
		this.sendCommand(command+","+param);
	};

	// BGM音量取得(100分率)
	c.getBGMVolume = function(callbackTarget) {
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.SOUND_BGM_GET_VOL + set;
		this.sendCommand(command);
	};

	// SEスタート
	// fileName{int}
	c.startSe = function(fileName) {
		var command = c.SOUND_SE_PLAY + "," + fileName;
		this.sendCommand(command);
	};
	c.stopSe = function() {
		var command = c.SOUND_SE_STOP;
		this.sendCommand(command);
	};

	// SE音量設定(param = 100分率)
	c.setSEVolume = function(param) {
		var command = c.SOUND_SE_SET_VOL;
		this.sendCommand(command+","+param);
	};

	// SE音量取得(100分率)
	c.getSEVolume = function(callbackTarget) {
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.SOUND_SE_GET_VOL + set;
		this.sendCommand(command);
	};

	// VOICEスタート
	c.startVoice = function(fileName) {
		var command = c.SOUND_VO_PLAY + "," + fileName;
		this.sendCommand(command);
	};

	// VOICEストップ
	c.stopVoice = function() {
		var command = c.SOUND_VO_STOP;
		this.sendCommand(command);
	};

	// VOICE音量設定(param = 100分率)
	c.setVOVolume = function(param) {
		var command = c.SOUND_VO_SET_VOL;
		this.sendCommand(command+","+param);
	};

	// VOICE音量取得(100分率)
	c.getVOVolume = function(callbackTarget) {
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.SOUND_VO_GET_VOL + set;
		this.sendCommand(command);
	};

	// サラウンドスタート
	// fileName{String}
	c.startSur = function(fileName) {
		var command = c.SOUND_SUR_PLAY + "," + fileName;
		this.sendCommand(command);
	};
	c.stopSur = function() {
		var command = c.SOUND_SUR_STOP;
		this.sendCommand(command);
	};

	// ------------------------------------------------------------------------.
	// SCENE
	// ------------------------------------------------------------------------.

	/**
	 * webView削除
	 */
	c.killWebView = function() {
		var command = c.SCENE_POP_WEBVIEW;
		this.sendCommand(command);
	};

	/**
	 * ネイティブリロード
	 * @param {object} object
	 *  object.url : 遷移先url(ex. /magica/index.html#/MyPage);
	 *  object.isNeedNativeRequest : ネイティブ読み込み(通信ヘッダのためにtrue)
	 */

	c.nativeReload = function(hash){
		var prm = {};
			prm.url = "/magica/index.html" + hash;
			prm.isNeedNativeRequest = true;
		var json = JSON.stringify(prm);
		var command = c.SCENE_REPLACE_WEBVIEW + "," + json;
		this.sendCommand(command);
	};

	/**
	 * ローディング表示
	 * @param {object} object
	 *  object.tips Tipsを表示するために必要な情報
	 */
	c.startLoading = function(object) {
		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_LOADING + "," + json;
		this.sendCommand(command);
	};

	/**
	 * ファイルダウンロード（トップページ用）
	 * @param {string} type ダウンロードタイプ(common:全て,voice:ボイスデータ,movie:ムービーデータ)
	 */
	c.downloadFile = function(type,obj) {
		var json;
		if(type !== "common"){
			var param = {};
			console.log(type.indexOf("movie"))
			param.category = type;
			if(obj){
				param.isVisibleCancel = (!obj.isVisibleCancel) ? false : true;
				param.description     = (!obj.description || !obj.isVisibleCancel) ? "" :
										(type.indexOf("movie") > -1) ? "ムービーデータのダウンロードを開始します。" :
										(type.indexOf("voice") > -1) ? "ボイスデータのダウンロードを開始します。" :
										obj.description;
				param.note            = (!obj.note || !obj.isVisibleCancel) ? "" :
										(type.indexOf("movie") > -1)  ? "※ムービーデータは、後からダウンロードすることも可能です。\n※Wi-Fi環境でのダウンロードをお勧めします。" :
										obj.note;
			}
			json = JSON.stringify(param);
		}else{
			json = "common";
		}
		var command = c.SCENE_PUSH_DOWNLOAD + "," + json;
		this.sendCommand(command);

	};

	/**
	 * ファイルダウンロード（設定ページ用）
	 * @param {string} type ダウンロードタイプ(common:全て,voice:ボイスデータ,movie:ムービーデータ)
	 * toDo: 分ける必要なくなった気がするのでいずれdonwloadFileと統合
	 */
	c.downloadFileConfigPage = function(type,obj) {
		c.downloadFile(type,obj);
		// var param = {};
		// 	param.category      = type;
		// 	param.isNeedConfirm = true;// ポップアップ表示（容量表示のためtrueに)
		// 	param.isVisibleCancel = (!cancel) ? false : true;
		// 	param.description     = (!description || !isVisibleCancel) ? "" :
		// 							(category.indexOf("movie") > -1) ? "ムービーデータのダウンロードを開始します。" :
		// 							(category.indexOf("voice") > -1) ? "ボイスデータのダウンロードを開始します。" :
		// 							description;
		// 	param.note            = (!note || !isVisibleCancel) ? "" :
		// 							(category.indexOf("movie") > -1)  ? "※ムービーデータは、後からダウンロードすることも可能です。\n（Wi-Fiと同じフォントサイズ、フォントカラー）\n※Wi-Fi環境でのダウンロードをお勧めします。" :
		// 							note;
		// var json = JSON.stringify(param);

		// var command = c.SCENE_PUSH_DOWNLOAD + "," + json;
		// this.sendCommand(command);
	};

	/**
	 * ファイルダウンロード（ストーリーリソース用用）
	 * @param {string} sectionId 対象のセクションID
	 */
	c.downloadFileFullVoice = function(sectionId) {
		var param = {};
			param.category      = sectionId;
			param.isNeedConfirm = true;// ポップアップ表示（容量表示のためtrueに)//toDo:どっちか確認
		var json = JSON.stringify(param);

		var command = c.SCENE_PUSH_DOWNLOAD + "," + json;
		this.sendCommand(command);
	};

	/**
	 * ダウンロードデータの削除設定を取得
	 */
	c.getDownloadDeleteConfig = function(callbackTarget) {
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.SCENE_GET_CONF_DELETE_DATA + set;
		this.sendCommand(command);
	};

	/**
	 * ダウンロードデータの削除設定を設定
	 * @param {object} object 削除設定パラメータ
	 */
	c.setDownloadDeleteConfig = function(object) {
		var json = JSON.stringify(object);
		var command = c.SCENE_SET_CONF_DELETE_DATA + "," + json;
		this.sendCommand(command);
	};


	/**
	 * ガチャアニメーション開始
	 * @param {object} object ガチャを引いた情報
	 */
	c.startGachaAnimation = function(object) {
		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_GACHA + "," + json;
		this.sendCommand(command);
	};

	c.startPresentAnimation = function(object) {
		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_PRESENT + "," + json;
		this.sendCommand(command);
	};

	/**
	 * ガチャ/プレゼントアニメーション終了コマンド
	 */
	c.endGachaAnimation = function() {
		var command = c.SCENE_POP_GACHA;
		this.sendCommand(command);
	};

	/**
	 * レアリティアップ演出
	 */
	c.startEvolution = function(object) {
		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_EVOLUTION + "," + json;
		this.sendCommand(command);
	};

	/**
	 * メモリア強化アニメーション開始
	 */
	c.startMemoriaAnimation = function(object) {
		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_MEMORIA_COMPOSE + "," + json;
		this.sendCommand(command);
	};

	/**
	 * ストーリー開始
	 * @param {string} storyId 開始するストーリーID
	 */
	c.startStory = function(storyId,prm) {
		var tutorialId = common.storage.user.get("tutorialId");

		var obj = {};
		obj.storyId = storyId;

		if(common.storage.user && common.storage.user.toJSON().loginName !== "？？？？？") {
			obj.userName = common.storage.user.toJSON().loginName;
		}

		if(tutorialId == "TU998") {
			if(storyId == "101103-10") {
				obj.canSkip = false;
			}
		}
		if(prm) {
			_.each(prm,function(value, key) {
				obj[key] = value;
			});
		}


		var _obj = JSON.stringify(obj);

		var command = c.SCENE_PUSH_STORY + "," + _obj;
		this.sendCommand(command);
	};

	/**
	 * クエストストーリー開始
	 * @param {string} storyId 開始するストーリーID
	 */
	c.startQuestStory = function(storyId) {
		var tutorialId = common.storage.user.get("tutorialId");

		var obj = {};
		obj.storyId = storyId;

		if(common.storage.user && common.storage.user.toJSON().loginName !== "？？？？？") {
			obj.userName = common.storage.user.toJSON().loginName;
		}

		if(tutorialId == "TU998") {
			if(storyId == "101103-10") {
				obj.canSkip = false;
			}
		}

		var _obj = JSON.stringify(obj);

		var command = c.SCENE_PUSH_QUEST_STORY + "," + _obj;
		this.sendCommand(command);
	};
	c.startBranchStory = function(obj) {
		// var tutorialId = common.storage.user.get("tutorialId");
		if(common.storage.user && common.storage.user.toJSON().loginName !== "？？？？？") {
			obj.userName = common.storage.user.get("loginName");
		}

		var _obj = JSON.stringify(obj);

		var command = c.SCENE_PUSH_BRANCH_STORY + "," + _obj;
		this.sendCommand(command);
	};
	c.startStoredStory = function() {
		var command = c.SCENE_PUSH_STORY_STORED_DATA;
		this.sendCommand(command);
	};

	/**
	 * クエスト開始
	 * @param {object} object クエスト情報
	 */
	c.startQuest = function(questId,urls,isLoop) {
		var object = {};
		object.questId   = questId;

		// todo:固定でなくプレイするクエストにあったURLをセットすること
		if(!urls) {
			object.resultUrl = "/magica/index.html#/QuestResult";
			object.retireUrl = "/magica/index.html#/MainQuest";
		} else {
			object.resultUrl = urls.resultUrl;
			object.retireUrl = urls.retireUrl;
		}

		// 自動周回フラグ
		object.questLoop = !isLoop ? false : true;

		object.tips = c.tipsObj[Math.floor(Math.random() * c.tipsObj.length)];
		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_QUEST + "," + json;

		this.sendCommand(command);
	};

	/**
	 * クエスト終了
	 */
	c.endQuest = function(){
		var command = c.SCENE_POP_QUEST;
		this.sendCommand(command);
	};

	/**
	 * アリーナ開始
	 * @param {object} object クエスト情報
	 */
	c.startArena = function(object) {
		object.tips = c.tipsObj[Math.floor(Math.random() * c.tipsObj.length)];
		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_QUEST + "," + json;
		this.sendCommand(command);
	};

	/**
	 * アリーナ終了
	 */
	c.endArena = function(){
		var command = c.SCENE_POP_QUEST;
		this.sendCommand(command);
	};

	/**
	 * クエストリプレイ
	 */
	c.startQuestRelpay = function(object) {
	 var json = JSON.stringify(object);
	 var command = c.SCENE_PUSH_QUEST_REPLAY + "," + json;
	 this.sendCommand(command);
	};

	c.saveQuestRelpay = function(object) {
	 var json = JSON.stringify(object);
	 var command = c.SCENE_SEND_QUEST_REPLAY_DATA + "," + json;
	 this.sendCommand(command);
 };

	/**
	 * チャット表示
	 */
	c.startChat = function() {
		var command = c.SCENE_PUSH_CHAT + ",0";
		this.sendCommand(command);
	};

	/**
	 * チャット非表示
	 */
	c.endChat = function() {
		var command = c.SCENE_POP_CHAT + ",0";
		this.sendCommand(command);
	};

	c.startTop = function() {
		var command = c.SCENE_PUSH_TOP;
		this.sendCommand(command);
	};

	c.endTop = function() {
		var command = c.SCENE_POP_TOP;
		this.sendCommand(command);
	};

	/**
	 * Live2Dシーン追加
	 * モーションID -> JSON読み込みに変わった
	 * マイページ・ショップ・クエスト選択ページで使用
	 */
	 c.startL2d = function(object) {

	 	// 字幕追加用
	 	// object.textFieldSizeX (float) 字幕のX方向サイズ指定;
	 	// object.textFieldSizeY (float) 字幕のY方向サイズ指定;

	 	if(object.txtVisible === "true"){
		 	// if(!object.txtAdjustX) object.txtAdjustX = object.x;
		 	// if(!object.txtAdjustY) object.txtAdjustY = object.y;
		 	if(!object.fontSize) object.fontSize = 24;
	 	}

		object.isOffset = true;

		var json = JSON.stringify(object);
		var command = c.SCENE_PUSH_GENERAL_STORY + "," + json;
		this.sendCommand(command);
	};
	 c.endL2d = function() {
		var command = c.SCENE_POP_GENERAL_STORY;
		this.sendCommand(command);
	};

	// クエスト中断データ確認
	c.checkQuestStored = function() {
		var command = c.SCENE_PUSH_QUEST_STORED_DATA + ",saveDataCallback";
		this.sendCommand(command);
	};

	/**
	 * プロローグの開始
	 * @param {string} beginningId 開始するページ名
	 * @param {string} callback    callback関数名
	 */
	c.startPrologue = function(beginningId) {
		var prm = {
			"beginningId" : beginningId
		};
		var json = JSON.stringify(prm);

		var command = c.SCENE_PUSH_PROLOGUE + "," + json;
		this.sendCommand(command);
	};

	c.showSubQuestBg = function(array) {
		var json = JSON.stringify(array);

		var command = c.SCENE_PUSH_ANOTHER_QUEST + "," + json;
		this.sendCommand(command);
	};
	/**
	 * 2部アナザーアニメーション開始
	 */
	c.showSubQuestBgPart2 = function(array) {
		var json = JSON.stringify(array);

		var command = c.SCENE_PUSH_ANOTHER_QUEST_PART2 + "," + json;
		this.sendCommand(command);
	};
	c.hideSubQuestBg = function() {
		var command = c.SCENE_POP_ANOTHER_QUEST;
		this.sendCommand(command);
	};
	c.moveSubQuestBg = function(id,bool) {
		var _id   = Number(id);;
		var prm = {
			"focusId"         : _id,
			"isRightRotation" : bool
		};
		var json = JSON.stringify(prm);

		var command = c.SCENE_PLAY_ANOTHER_QUEST + "," + json;
		this.sendCommand(command);
	};
	c.moveSubQuestBgPart2 = function(array) {
		var json = JSON.stringify(array);

		var command = c.SCENE_PLAY_ANOTHER_QUEST_PART2 + "," + json;
		this.sendCommand(command);
	};

	c.playCharaMovie = function(fileName) {
		fileName = String(fileName);
		var _fileName = (fileName.indexOf(".usm") !== -1) ? fileName : "movie_" + fileName + ".usm";
		var command = c.SCENE_PUSH_MOVIE_CHAR + "," + _fileName;
		this.sendCommand(command);
	};
	c.playMovie = function(fileName) {
		fileName = String(fileName);
		var _fileName = (fileName.indexOf(".usm") !== -1) ? fileName : "movie_" + fileName + ".usm";
		var command = c.SCENE_PUSH_MOVIE + "," + _fileName;
		this.sendCommand(command);
	};
	c.endPlayMovie = function() {
		var command = c.SCENE_POP_MOVIE;
		this.sendCommand(command);
	};
	c.playMovieNoSkip = function(fileName) {
		fileName = String(fileName);
		var _fileName = (fileName.indexOf(".usm") !== -1) ? fileName : "movie_" + fileName + ".usm";
		var command = c.SCENE_PUSH_CANT_SKIP_MOVIE + "," + _fileName;
		this.sendCommand(command);
	};

	c.pushEventRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.hideEventRaid = function() {
		var command = c.SCENE_POP_EVENT_RAID;
		this.sendCommand(command);
	};
	c.showRewardEventRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_SHOW_REWARD_EVENT_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.appBossEventRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_APP_BOSS_EVENT_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.cancelSelectBossEventRaid = function() {
		var command = c.SCENE_CANCEL_SELECTED_BOSS_EVENT_RAID;
		this.sendCommand(command);
	};
	c.pushMessageEventRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_MESSAGE_EVENT_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.focusPointEventRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_FOCUS_POINT_EVENT_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.appEnemyEventRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_APP_ENEMY_EVENT_RAID + "," + _json;
		this.sendCommand(command);
	};

	// SCENE_PUSH_EVENT_BRANCH
	c.pushEventBranch = function(questList,centerPointId,newPointIdList) {
		var json = {
			"questList":questList
		};
		if(centerPointId) {
			json.centerPointId = centerPointId;
		}
		if(newPointIdList) {
			json.newPointIdList = newPointIdList;
		}

		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_BRANCH + "," + _json;
		this.sendCommand(command);
	};
	c.pushMainQuestEventBranch = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_BRANCH + "," + _json;
		this.sendCommand(command);
	};
	c.resumeEventBranch = function() {
		var command = c.SCENE_RESUME_EVENT_BRANCH;
		this.sendCommand(command);
	};
	c.popEventBranch = function() {
		var command = c.SCENE_POP_EVENT_BRANCH;
		this.sendCommand(command);
	};

	// EventSingleRaid
	c.pushEventSingleRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_SINGLE_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.hideEventSingleRaid = function() {
		var command = c.SCENE_HIDE_EVENT_SINGLE_RAID;
		this.sendCommand(command);
	};
	c.resumeEventSingleRaid = function() {
		var command = c.SCENE_SHOW_EVENT_SINGLE_RAID;
		this.sendCommand(command);
	};
	c.popEventSingleRaid = function() {
		var command = c.SCENE_POP_EVENT_SINGLE_RAID;
		this.sendCommand(command);
	};
	c.enableTapEventSingleRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_ENABLE_TAP_EVENT_SINGLE_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.scaleEventSingleRaid = function(prm) {
		var _json = JSON.stringify({scale:prm});
		var command = c.SCENE_VIEW_SCALE_EVENT_SINGLE_RAID + "," + _json;
		this.sendCommand(command);
	};

	// EventDungeon
	c.pushEventDungeon = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_DUNGEON + "," + _json;
		this.sendCommand(command);
	};
	c.hideEventDungeon = function() {
		var command = c.SCENE_POP_EVENT_DUNGEON;
		this.sendCommand(command);
	};
	c.decideEventDungeon = function() {
		var command = c.SCENE_DECIDE_EVENT_DUNGEON;
		this.sendCommand(command);
	};
	c.positionResetEventDungeon = function() {
		var command = c.SCENE_FOCUS_EVENT_DUNGEON;
		this.sendCommand(command);
	}
	c.randomIconEventDungeon = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_RANDOM_ICON_EVENT_DUNGEON + "," + _json;
		this.sendCommand(command);
	}

	//ピュエラヒストリアグループレイド
	c.pushEventPuellaRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_PUELLA_RAID + "," + _json;
		this.sendCommand(command);
	}
	c.reloadEventPuellaRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_RELOAD_EVENT_PUELLA_RAID + "," + _json;
		this.sendCommand(command);
	}

	// EventStoryRaid
	c.pushEventStoryRaid = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_STORY_RAID + "," + _json;
		this.sendCommand(command);
	};
	c.popEventStoryRaid = function() {
		var command = c.SCENE_POP_EVENT_STORY_RAID;
		this.sendCommand(command);
	};

	// EmotionBoard
	c.pushEmotionBoard = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EMOTION_BOARD + "," + _json;
		this.sendCommand(command);
	};
	c.popEmotionBoard = function() {
		var command = c.SCENE_POP_EMOTION_BOARD;
		this.sendCommand(command);
	};
	c.scaleEmotionBoard = function(prm) {
		var _json = JSON.stringify({scale:prm});
		var command = c.SCENE_SCALE_EMOTION_BOARD + "," + _json;
		this.sendCommand(command);
	};
	c.awakenEmotionBoard = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_APLAY_EMOTION_BOARD + "," + _json;
		this.sendCommand(command);
	};
	c.centeringEmotionBoard = function(){
		var command = c.SCENE_CENTERING_EMOTION_BOARD;
		this.sendCommand(command);
	}
	// 理違いバトル開始
	c.startMirrorBattle = function(prm) {
		var _prm = { //指定がない場合はトップに戻す
			resultUrl:'/magica/index.html#/TopPage',
			retireUrl:'/magica/index.html#/TopPage',
		};
		_.each(_prm, function(_val, _key, _list){
			if(prm[_key]){
				_prm[_key] = prm[_key];
			};
		});
		var _json = JSON.stringify(_prm);
		var command = c.SCENE_PUSH_CHAPTER2_MIRROR_BATTLE + "," + _json;
		this.sendCommand(command);
	};
	// ピュエラヒストリアトップ用オブジェクト生成
	c.setPuellaHistoriaObject = function(prm) {
		// 以下のパラメータが必要
		// prm = {
		// 	vesselSoul:{ //魂の器の情報
		// 		x: 0, //表示するx座標
		// 		y: 0, //表示するy座標
		// 		opened: 0, //開放済みのマスの個数
		// 	},
		// 	itemList:[ //鏡の表示情報。鏡の個数分配列で持つ
		// 		{
		// 			id: 1, //アイテムの識別ID
		// 			x: 0, //表示するx座標
		// 			y: 0, //表示するy座標
		// 			//鏡のアニメーションの表示状態
		// 			// 0: 開催前
		// 			// 1: 開催中で未クリア
		// 			// 2: 開催中でクリア済み
		// 			// 3: 開催後（常設未開放）で未クリア
		// 			// 4: 開催後（常設未開放）でクリア済み
		// 			// 5: 開催後（常設開放済）で未クリア
		// 			// 6: 開催後（常設開放済）でクリア済み"
		// 			state: 0,
		// 			isClear: false, //クリア済み演出を再生するかどうか
		// 			openUp: 0, //魂の器の開放するのマスの個数
		// 		}
		// 	],
		// }
		var _json = JSON.stringify(prm);
		var command = c.SCENE_PUSH_PUELLA_HISTORIA + "," + _json;
		this.sendCommand(command);
	};
	// ピュエラヒストリアトップ用オブジェクト削除
	c.deletePuellaHistoriaObject = function(){
		var command = c.SCENE_POP_PUELLA_HISTORIA;
		this.sendCommand(command);
	}

	// scene0用ストーリーセレクトオブジェクト生成
	c.setScene0StorySelectObject = function(prm){
		var _json = JSON.stringify(prm);
		var command = c.SCENE_PUSH_SCENARIO_PAGE + "," + _json;
		this.sendCommand(command);
	}
	// scene0用ストーリーセレクトオブジェクト削除
	c.deleteScene0StorySelectObject = function(){
		var command = c.SCENE_POP_SCENARIO_PAGE;
		this.sendCommand(command);
	}
	// scene0用ストーリーセレクトオブジェクト更新
	c.updateScene0StorySelectObject = function(prm){
		var _json = JSON.stringify(prm);
		var command = c.SCENE_UPDATE_SCENARIO_PAGE + "," + _json;
		this.sendCommand(command);
	}
	// scene0用ストーリーリストオブジェクト更新
	c.setScene0StoryListObject = function(){
		var command = c.SCENE_PUSH_SCENARIO_LIST;
		this.sendCommand(command);
	}
	// scene0用ストーリーリストオブジェクト削除
	c.deleteScene0StoryListObject= function(){
		var command = c.SCENE_POP_SCENARIO_LIST;
		this.sendCommand(command);
	}

	//魔女メモリア交換アニメ
	c.pushEventWitchExchangeAnime = function(json) {
		var _json = JSON.stringify(json);
		var command = c.SCENE_PUSH_EVENT_WITCH_EXCHANGE_ANIME + "," + _json;
		this.sendCommand(command);
	};
	c.deleteEventWitchExchangeAnime = function() {
		var command = c.SCENE_POP_EVENT_WITCH_EXCHANGE_ANIME;
		this.sendCommand(command);
	};


	// ------------------------------------------------------------------------.
	// DISPLAY
	// ------------------------------------------------------------------------.

	/**
	 * WebView表示非表示
	 * @param {bool} bool true:表示 false:非表示 null:表示
	 */
	c.setWebView = function(bool) {
		var _bool = (bool !== undefined) ? bool : true;
		var command = c.DISPLAY_SET_WEBVIEW_VISIBLE + "," + _bool;
		this.sendCommand(command);
	};

	/**
	 * 背景の変更
	 * @param {string} fileName ファイルネーム(.jpg or .png or .ExportJson)
	 */
	c.changeBg = function(fileName,isPortrait) {
		var _isPortrait = isPortrait || false;

		if(fileName !== "web_black.jpg") {
			common.background = fileName;
		}

		var prm = {};
		prm.filename = fileName;

		if(fileName.indexOf("web_") !== -1) {
			prm.filedir = "resource/image_native/bg/web/";
		} else if(fileName.indexOf("adv_") !== -1) {
			prm.filedir = "resource/image_native/bg/story/";
		} else if(fileName.indexOf("map_") !== -1) {
			prm.filedir = "resource/image_native/bg/quest_top/";
		} else {
			prm.filedir = "resource/image_native/bg/web/doppelMission/";
		}

		prm.isPortrait = _isPortrait;

		if(fileName.indexOf("map_") !== -1) {
			prm.fade = {};
			prm.fade.type = 0;
			prm.fade.time = 0.3;
		} else {
			prm.fade = {};
			prm.fade.type = 0;
			prm.fade.time = 0.2;
		}

		var json = JSON.stringify(prm);

		var command = c.DISPLAY_CHANGE_BG + "," + json;
		this.sendCommand(command);
	};

	/* 背景非表示(カメラ用)
	 */
	c.removeBg = function(){
		var command = c.DISPLAY_REMOVE_BG;
		this.sendCommand(command);
	};

	/**
	 * Live2d表示
	 * @param {object} object Live2d表示オプション
	 *  object.id   表示するキャラID
	 *  object.x    表示位置（基点はデータ中心）
	 *  object.y    表示位置（基点はデータ中心）
	 *  object.fade fade inする時間
	 */
	c.showL2d = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_ADD_L2D + "," + json;
		this.sendCommand(command);
	};

	/**
	 * Live2d非表示
	 */
	c.hideL2d = function() {
		var command = String(c.DISPLAY_REMOVE_L2D);
		this.sendCommand(command);
	};

	/**
	 * Live2dタッチ
	 * @param {object} object タッチ座標
	 *  {number} object.x タッチx座標
	 *  {number} object.y タッチy座標
	 */
	c.motionL2d = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PALY_L2D_MOTION + "," + json;
		this.sendCommand(command);
	};

	/**
	 * SDキャラ表示
	 * @param {object} object SDキャラ表示オプション
	 *  {string} object.id   SDキャラのExportJsonファイル名(こっちは拡張子いらない)
	 *  {number} object.x    表示位置（基点はデータ中心）
	 *  {number} object.y    表示位置（基点はデータ中心）
	 *  {float}  object.fade fade inする時間
	 */
	c.showMiniChara = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_ADD_MINI + "," + json;
		this.sendCommand(command);
	};

	// SDキャラ非表示
	c.hideMiniChara = function() {
		var command = c.DISPLAY_REMOVE_MINI;
		this.sendCommand(command);
	};

	/**
	 * SDキャラ複数表示
	 * @param {object} object
	 *  {float} object.x タッチ座標
	 *  {float} object.y タッチ座標
	 */
	c.showMultiMiniChara = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_ADD_MINI_ARRAY + "," + json;
		this.sendCommand(command);
	};

	// SDキャラ非表示
	c.hideMultiMiniChara = function() {
		var command = c.DISPLAY_REMOVE_MINI_ARRAY;
		this.sendCommand(command);
	};

	/**
	 * SDキャラエフェクト強化
	 * @param {object} object
	 *  {float} object.x     タッチ座標
	 *  {float} object.y     タッチ座標
	 *  {float} object.scale 拡大率(初期値1.0)
	 */
	// playMiniCharaEffect
	c.playComposeEffect = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_COMPOSE_EFFECT + "," + json;
		this.sendCommand(command);
	};

	/**
	 * SDキャラエフェクト強化結果
	 * @param {object} object
	 *  {int}   object.type  1:成功 2:大成功 3:超成功
	 *  {float} object.x     タッチ座標
	 *  {float} object.y     タッチ座標
	 *  {float} object.scale 拡大率(初期値1.0)
	 */
	c.playComposeResultEffect = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_SHOW_COMPOSE_RESULT + "," + json;
		this.sendCommand(command);
	};

	// SDキャラエフェクト非表示
	// stopMiniCharaEffect
	c.stopComposeEffect = function() {
		var command = c.DISPLAY_HIDE_COMPOSE;
		this.sendCommand(command);
	};

	/**
	 * SDキャラエフェクト強化結果
	 * @param {object} object
	 *  {float} object.x     タッチ座標
	 *  {float} object.y     タッチ座標
	 *  {float} object.scale 拡大率(初期値1.0)
	 */
	c.playComposeMagiaEffect = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_COMPOSE_MAGIA + "," + json;
		this.sendCommand(command);
	};

	/**
	 * SDキャラエフェクト覚醒素材セット
	 * @param {object} object
	 *  {string} object.type  どのステータスが上昇したか
	 *  {int}    object.value 何％上昇したか
	 *  {float}  object.x     タッチ座標
	 *  {float}  object.y     タッチ座標
	 *  {float}  object.scale 拡大率(初期値1.0)
	 */
	c.playCustomizeEffect = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_AWAKE_ABILITY + "," + json;
		this.sendCommand(command);
	};

	/**
	 * SDキャラエフェクト属性強化
	 * @param {object} object
	 *  {float}  object.x     タッチ座標
	 *  {float}  object.y     タッチ座標
	 *  {float}  object.scale 拡大率(初期値1.0)
	 *  {string} object.type  どのステータスが上昇したか
	 *  {int}    object.value 何ポイント上昇したか
	 *  ※typeとvalueは下記でも記述可能
	 * 	{array} object.abbilityList アビリティのリスト
	 *  {string} abilityList[i].type どのステータスが上昇したか
	 *  {int} abilityList[i].value  何ポイント上昇したか
	 */
	 c.playComposeAttributeEffect = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_COMPOSE_ATTRIBUTES + "," + json;
		this.sendCommand(command);
	};

	/**
	 * SDキャラエフェクト覚醒素材複数個セット
	 * @param {object} object
	 *  {float}  object.x     タッチ座標
	 *  {float}  object.y     タッチ座標
	 *  {float}  object.scale 拡大率(初期値1.0)
	 *  {array}  object.abbilityList アビリティのリスト
	 *  {string} abilityList[i].type どのステータスが上昇したか
	 *  {string} abilityList[i].int  何%上昇したか
	 */
	c.playBulkCustomizeEffect = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_AWAKE_ABILITIES + "," + json;
		this.sendCommand(command);
	};

	/**
	 * ノーマルガチャTOP専用メモリア演出
	 * @param {object} object
	 *  {float} object.x     表示x座標
	 *  {float} object.y     表示y座標
	 *  {array} object.memoriaIdList メモリアIDのリスト
	 */
	c.playNormalGachaMemoria = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_NORMAL_GACHA_TOP + "," + json;
		this.sendCommand(command);
	};
	c.stopNormalGachaMemoria = function() {
		var command = c.DISPLAY_STOP_NORMAL_GACHA_TOP;
		this.sendCommand(command);
	};

	/**
	 * メモリアトップの背景アニメーション
	 * @param {object} object (int)メモリアのIDリスト
	 */
	c.displayMemoriaTop = function(object){
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_MEMORIA_TOP + "," + json;
		this.sendCommand(command);
	};
	/**
	 * メモリアトップの背景アニメーション停止
	 */
	c.stopMemoriaTop = function(){
		var command = c.DISPLAY_STOP_MEMORIA_TOP;
		this.sendCommand(command);
	};

	c.storyMotionL2dVoice = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_GENERAL_STORY + "," + json;
		this.sendCommand(command);
	};

	c.storyMotionL2d = function(object) {
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_ONE_SHOT_STORY + "," + json;
		this.sendCommand(command);
	};


	// ------------------------------------------------------------------------.
	// NOTICE
	// ------------------------------------------------------------------------.

	/**
	 * PUSH通知(ON/OFF取得)
	 */
	c.noticeGetStatus = function(callbackTarget){
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.NOTI_GET_CONF_PNOTE + set;
		this.sendCommand(command);
	};

	/**
	 * PUSH通知(PNOTE登録)
	 * ※ 端末起動時に呼び出し
	 * @param {object} object
	 *  {number} object.tag1～tag5 タグ情報（ある場合)
	 */
	c.noticeRegist = function(object){
		var command = (!object) ? c.NOTI_AWAKE_PNOTE : c.NOTI_AWAKE_PNOTE + "," + JSON.stringify(object);
		this.sendCommand(command);
	};

	/**
	 * PUSH通知(再登録)
	 * @param {object} object
	 *  {number} object.tag1～tag5 タグ情報（ある場合)
	 */
	c.noticeTurnOn = function(object){
		var command = (!object) ? c.NOTI_TURN_ON_PNOTE : c.NOTI_TURN_ON_PNOTE + "," + JSON.stringify(object);
		this.sendCommand(command);
	};

	/**
	 * PUSH通知(PNOTE連携解除)
	 */
	c.noticeRestore = function(){
		var command = c.NOTI_TURN_OFF_PNOTE;
		this.sendCommand(command);
	};

	/**
	 * 曜日クエストの通知設定を取得
	 */
	c.noticeGetWeekly = function(callbackTarget){
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.NOTI_GET_CONF_WEEKLY_QUEST + set;
		this.sendCommand(command);
	};

	/**
	 * 曜日クエスト登録
	 * 変更があるキーのみ渡す
	 * @param {object} object
	 *  {object} object.Sun(Mon,Tue,Wed,Thu,Fri,Sat) object
	 *  {int}    object.Sun.isEnable 0:OFF 1:ON
	 *  {int}    object.Sun.hour     通知を表示する時間
	 *  {int}    object.Sun.min      通知を表示する分
	 */
	c.noticeSetWeekly = function(object){
		var json = JSON.stringify(object);
		var command = c.NOTI_TURN_ON_WEEKLY_QUEST + "," + json;
		this.sendCommand(command);
	};

	/**
	 * 曜日クエスト通知削除
	 * @param [string] array 削除する曜日を渡す
	 * e.g)  [”Sun”, ”Mon”, ”Tue”, ”Wed”, ”Thu”, ”Fri”, "Sat"]
	 */
	c.noticeOffWeekly = function(object){
		var command = c.NOTI_TURN_OFF_WEEKLY_QUEST + "," + object;
		this.sendCommand(command);
	};

	/**
	 * AP回腹通知設定取得(ON/OFF)
	 */
	c.noticeApConfig = function(callbackTarget){
		var set  = (callbackTarget) ? "," + callbackTarget : "";
		var command = c.NOTI_GET_CONF_AP_FULL + set;
		this.sendCommand(command);
	};

	/**
	 * AP回復通知ON
	 * @param {number} sec 何秒後に全快通知を出すか
	 */
	c.noticeApFullSet = function(sec){
		var command;
		// 1秒以上の時通知登録
		// 0のときはキャンセルコマンド
		if(sec > 0){
			command = c.NOTI_TURN_ON_AP_FULL + "," + sec;
		}else{
			command = c.NOTI_CANCEL_AP_FULL;
		}
		this.sendCommand(command);
	};

	/**
	 * AP回復通知ON
	 * (OFF->ONに切り替えかつ、全快しているとき用)
	 */
	 c.noticeApFullTurnOn = function(){
		var command;
		command = c.NOTI_TURN_ON_AP_FULL + "," + 0;
		this.sendCommand(command);
	};

	/**
	 * AP回復通知OFF
	 */
	c.noticeApFullOff = function(){
		var command = c.NOTI_TURN_OFF_AP_FULL;
		this.sendCommand(command);
	};

	/**
	 * AP回復通知OFF
	 */
	c.noticeStoryRaidBossDied = function(json) {
		var _json = JSON.stringify(json);
		var command = c.NOTI_STORY_RAID_BOSS_DIED + "," + _json;
		this.sendCommand(command);
	};

	/**
	 * クエスト出撃デッキをプレビューします
	 * 以下のオブジェクトを配列で
	 * @param {int} miniCharId miniキャラID
	 * @param {int} positionId マス目の位置
	 * 210
	 * 543
	 * 876
	 * @param {boolean} isLeader リーダーかどうか
	 * @param {boolean} isSupport サポートかどうか
	 */
	c.formationPreview = function(array){
		var json = JSON.stringify(array);
		var command = c.DISPLAY_PLAY_FORMATION + "," + json;
		this.sendCommand(command);
	};
	c.formationPreviewRemove = function(){
		var command = c.DISPLAY_STOP_FORMATION;
		this.sendCommand(command);
	};

	c.enemyFormationPreview = function(array){
		var json = JSON.stringify(array);
		var command = c.DISPLAY_PLAY_FORMATION_ENEMY + "," + json;
		this.sendCommand(command);
	};
	c.enemyFormationPreviewRemove = function(){
		var command = c.DISPLAY_STOP_FORMATION_ENEMY;
		this.sendCommand(command);
	};
	/**
	 * 曜日クエストトップ背景表示
	 * @param {object} object 背景に出したい画像のパス（最小１、最大６）
	 */
	c.weekQuestTopSet = function(object){
		var json = JSON.stringify(object);
		var command = c.DISPLAY_PLAY_WEEKLY_QUEST_TOP+","+json;
		this.sendCommand(command);
	};
	/**
	 * 曜日クエストトップ背景非表示
	 */
	 c.weekQuestTopUnset = function(){
		var command = c.DISPLAY_STOP_WEEKLY_QUEST_TOP;
		this.sendCommand(command);
	};
	/**
	 * エフェクト再生（image_native/effect/web/）
	 */
	c.playEffect = function(array){
		var json = JSON.stringify(array);
		var command = c.DISPLAY_PLAY_EFFECT + "," + json;
		this.sendCommand(command);
	};
	c.stopEffect = function(){
		var command = c.DISPLAY_STOP_EFFECT;
		this.sendCommand(command);
	};

	/**
	 * カメラ関連
	 * 280-284
	 */

	/**
	 * カメラ起動
	 */
	c.turnOnCamera = function(){
		var command = c.SCENE_PUSH_CAMERA;
		this.sendCommand(command);
	};
	/**
	 * カメラ終了
	 */
	c.turnOffCamera = function(){
		var command = c.SCENE_POP_CAMERA;
		this.sendCommand(command);
	};
	/**
	 * カメラ切り替え
	 */
	c.swapCamera = function(){
		var command = c.SCENE_SWAP_CAMERA;
		this.sendCommand(command);
	};
	/**
	 * カメラズーム
	 * ratio{float} 1.0〜2.0でズーム倍率
	 */
	c.zoomCamera = function(ratio){
		var prm = {};
		prm.ratio = ratio;
		var json = JSON.stringify(prm);
		var command = c.SCENE_ZOOM_CAMERA+","+json;
		this.sendCommand(command);
	};
	/**
	 * カメラ撮影
	 */
	c.captureCamera = function(){
		var command = c.SCENE_CAPTURE_CAMERA;
		this.sendCommand(command);
	};
	//ユーザーデータ取得
	c.getUserJson = function(){
		var command = c.DATA_GET_USER_JSON;
		this.sendCommand(command);
	};
	//ユーザーデータ保存
	c.setUserJson = function(userData) {
		var json = JSON.stringify(userData);
		var command = c.DATA_SET_USER_JSON + "," + json;
		this.sendCommand(command);
	};
	return c;
});
