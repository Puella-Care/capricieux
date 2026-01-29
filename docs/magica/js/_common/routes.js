define([
	'underscore',
	'backbone',
	'backboneCommon'
], function (_,Backbone,common) {
	'use strict';

	var routes = {
		"TopPage" : { // トップページ
			"url"      : "TopPage",
			"pageInit" : function() {
				require(["TopPage"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"Maintenance" : { // メンテナンス
			"url"      : "Maintenance",
			"pageInit" : function() {
				require(["Maintenance"],function(page){common.pageObj = page; page.init();});
			}
		},
		"MyPage" : { // マイページ
			"url"      : "MyPage",
			"pageInit" : function() {
				require(["MyPage"],function(page){
					var pageFetch = function(){
						page.fetch();
					};
					hotReload(pageFetch);
					common.pageObj = page;
				});
			}
		},
		"BackgroundSet" : { // 背景変更
			"url"      : "BackgroundSet",
			"pageInit" : function() {
				require(["BackgroundSet"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"LoginBonus" : { // ログボ
			"url"      : "LoginBonus",
			"pageInit" : function() {
				require(["LoginBonus"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"FormationTop" : { // 編成トップ
			"url"      : "FormationTop(/:tuId)",
			"pageInit" : function(tuId) {
				require(["FormationTop"],function(page){common.pageObj = page; page.fetch(tuId);});
			}
		},
		"FormationQuest" : { // 編成クエスト
			"url"      : "FormationQuest(/:id)(/:tuId)",
			"pageInit" : function(id,tuId) {
				require(["FormationQuest"],function(page){common.pageObj = page; page.fetch(id,tuId);});
			}
		},
		"FormationArena" : { // 編成アリーナ
			"url"      : "FormationArena(/:id)",
			"pageInit" : function(id) {
				require(["FormationArena"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"FormationSupport" : { // 編成サポート
			"url"      : "FormationSupport(/:id)",
			"pageInit" : function(id) {
				require(["FormationSupport"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"SupportSelect" : { // サポート選択
			"url"      : "SupportSelect(/:tuId)",
			"pageInit" : function(tuId) {
				require(["SupportSelect"],function(page){common.pageObj = page; page.fetch(tuId);});
			}
		},
		"MainQuest" : { // クエストマップ
			"url"      : "MainQuest(/:tuId)",
			"pageInit" : function(tuId) {
				require(["MainQuest"],function(page){common.pageObj = page; page.fetch(tuId);});
			}
		},
		"MainQuestSingleRaid" : { // クエストマップ
			"url"      : "MainQuestSingleRaid",
			"pageInit" : function() {
				require(["MainQuestSingleRaid"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MainQuestBranch" : { // クエスト分岐
			"url"      : "MainQuestBranch",
			"pageInit" : function() {
				require(["MainQuestBranch"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"SubQuest" : { // 外伝クエスト
			"url"      : "SubQuest",
			"pageInit" : function() {
				require(["SubQuest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"CharaQuest" : { // 魔法少女クエスト
			"url"      : "CharaQuest",
			"pageInit" : function() {
				require(["CharaQuest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventQuest" : { // その他クエスト
			"url"      : "EventQuest(/:qId)",
			"pageInit" : function(qId) {
				require(["EventQuest"],function(page){common.pageObj = page; page.fetch(qId);});
			}
		},
		"EventRecord" : { // その他クエスト
			"url"      : "EventRecord",
			"pageInit" : function() {
				require(["EventRecord"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"QuestBackground" : { // クエスト中
			"url"      : "QuestBackground",
			"pageInit" : function() {
				require(["QuestBackground"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"QuestResult" : { // クエスト結果画面
			"url"      : "QuestResult(/:tuId)",
			"pageInit" : function(tuId) {
				require(["QuestResult"],function(page){common.pageObj = page; page.fetch(tuId);});
			}
		},
		"QuestBattleSelect" : { // クエスト選択
			"url"      : "QuestBattleSelect(/:id)(/:tuId)",
			"pageInit" : function(id,tuId) {
				require(["QuestBattleSelect"],function(page){common.pageObj = page; page.fetch(id,tuId);});
			}
		},
		"SecondPartLastRouter" : { // 第二部ラストバトルルーター
			"url"      : "SecondPartLastRouter(/:conditionType)(/:questBattleId)", 
			"pageInit" : function(conditionType, questBattleId) {
				require(
					["SecondPartLastRouter"],
					function(page){
						common.pageObj = page;
						page.fetch({
							conditionType: conditionType,
							questBattleId: questBattleId,
						});
					}
				);
			}
		},
		"SecondPartLastTop" : { // 第二部ラストバトルトップ
			"url"      : "SecondPartLastTop(/:questBattleId)", //勝利した時questBattleIdをパラメータとしてもらう
			"pageInit" : function(questBattleId) {
				require(
					["SecondPartLastTop"],
					function(page){
						common.pageObj = page;
						page.fetch(questBattleId);
					}
				);
			}
		},
		"SecondPartLastBattleConfirm" : { // 第二部ラストバトル確認
			"url"      : "SecondPartLastBattleConfirm",
			"pageInit" : function() {
				require(
					["SecondPartLastBattleConfirm"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"SecondPartLastFormation" : { // 第二部ラストバトルチーム編成一覧
			"url"      : "SecondPartLastFormation",
			"pageInit" : function() {
				require(
					["SecondPartLastFormation"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"SecondPartLastBoss" : { // 第二部ラストバトルラストボス
			"url"      : "SecondPartLastBoss", 
			"pageInit" : function() {
				require(
					["SecondPartLastBoss"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"QuestStoryOnly" : { // バトル無しクエスト
			"url": "QuestStoryOnly", 
			"pageInit": function() {
				require(
					["QuestStoryOnly"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"PuellaHistoriaTop" : { // ピュエラ・ヒストリア（先代魔法少女）トップ
			"url"      : "PuellaHistoriaTop", 
			"pageInit" : function() {
				require(
					["PuellaHistoriaTop"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"PuellaHistoriaSingleRaid" : { // ピュエラ・ヒストリア個人クエスト
			"url"      : "PuellaHistoriaSingleRaid", 
			"pageInit" : function() {
				require(
					["PuellaHistoriaSingleRaid"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"EventPuellaRaidTop" : { // ピュエラ・ヒストリア全体レイド
			"url"      : "EventPuellaRaidTop", 
			"pageInit" : function() {
				require(
					["EventPuellaRaidTop"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"PuellaHistoriaRouter" : { // ピュエラ・ヒストリアRouter
			"url"      : "PuellaHistoriaRouter", 
			"pageInit" : function() {
				require(
					["PuellaHistoriaRouter"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"PuellaHistoriaGroupRaidQuestResultMainBoss" : { // ピュエラ・ヒストリアグループレイドボス結果ページ
			"url"      : "PuellaHistoriaGroupRaidQuestResultMainBoss", 
			"pageInit" : function() {
				require(
					["PuellaHistoriaGroupRaidQuestResultMainBoss"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"PuellaHistoriaGroupRaidQuestResultSubBoss" : { // ピュエラ・ヒストリアグループレイド取巻結果ページ
			"url"      : "PuellaHistoriaGroupRaidQuestResultSubBoss", 
			"pageInit" : function() {
				require(
					["PuellaHistoriaGroupRaidQuestResultSubBoss"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"Scene0Top": { // scene0トップ
			"url": "Scene0Top", 
			"pageInit": function() {
				require(
					["Scene0Top"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"Scene0StorySelectBeforeFilm1": { // scene0ストーリー選択BeforeFilm1
			"url": "Scene0StorySelectBeforeFilm1", 
			"pageInit": function() {
				require(
					["Scene0StorySelectBeforeFilm1"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"Scene0StorySelectAfterFilm1": { // scene0ストーリー選択AfterFilm1
			"url": "Scene0StorySelectAfterFilm1", 
			"pageInit": function() {
				require(
					["Scene0StorySelectAfterFilm1"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"Scene0BattleSelect": { // scene0バトルページ
			"url": "Scene0BattleSelect", 
			"pageInit": function() {
				require(
					["Scene0BattleSelect"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"Scene0SideStorySelect": { // scene0サイドストーリーページ
			"url": "Scene0SideStorySelect", 
			"pageInit": function() {
				require(
					["Scene0SideStorySelect"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"MemoriaTop" : { // メモリアトップ
			"url"      : "MemoriaTop",
			"pageInit" : function() {
				require(["MemoriaTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MemoriaList" : { // メモリア一覧
			"url"      : "MemoriaList(/:prm)(/:obj)",
			"pageInit" : function(prm,obj) {
				require(["MemoriaList"],function(page){common.pageObj = page; page.fetch(prm,obj);});
			}
		},
		"MemoriaEquip" : { // メモリア装備
			"url"      : "MemoriaEquip",
			"pageInit" : function() {
				require(["MemoriaEquip"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MemoriaSetEquip" : { // メモリアセット装備
			"url"      : "MemoriaSetEquip",
			"pageInit" : function() {
				require(["MemoriaSetEquip"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MemoriaSetList" : { // メモリアセット
			"url"      : "MemoriaSetList",
			"pageInit" : function() {
				require(["MemoriaSetList"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MemoriaCompose" : { // メモリア強化
			"url"      : "MemoriaCompose(/:pattern)",
			"pageInit" : function(pattern) {
				require(["MemoriaCompose"],function(page){common.pageObj = page; page.fetch(pattern);});
			}
		},
		"MemoriaComposeAnimation" : { // メモリアアニメーション
			"url"      : "MemoriaComposeAnimation",
			"pageInit" : function() {
				require(["MemoriaComposeAnimation"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MemoriaComposeResult" : { // メモリア強化結果
			"url"      : "MemoriaComposeResult",
			"pageInit" : function() {
				require(["MemoriaComposeResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"PieceArchive" : { // メモリア倉庫
			"url"      : "PieceArchive(/:prm)",
			"pageInit" : function(prm) {
				require(["PieceArchive"],function(page){common.pageObj = page; page.fetch(prm);});
			}
		},
		"MissionTop" : { // ミッション一覧
			"url"      : "MissionTop(/:id)",
			"pageInit" : function(id) {
				require(["MissionTop"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"DoppelMissionTop" : { // ミッション一覧
			"url"      : "DoppelMissionTop(/:id)",
			"pageInit" : function(id) {
				require(["DoppelMissionTop"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"PanelMissionTop" : { // ミッション一覧
			"url"      : "PanelMissionTop(/:id)",
			"pageInit" : function(id) {
				require(["PanelMissionTop"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"ItemListTop" : { // アイテム一覧
			"url"      : "ItemListTop(/:id)",
			"pageInit" : function(id) {
				require(["ItemListTop"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"FollowTop" : { //フォロー関連トップ
			"url"      : "FollowTop",
			"pageInit" : function() {
				require(["FollowTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"GachaTop" : { // ガチャトップ
			"url"      : "GachaTop(/:id)(/:tuId)",
			"pageInit" : function(id,tuId) {
				require(["GachaTop"],function(page){common.pageObj = page; page.fetch(id,tuId);});
			}
		},
		"SelectableGachaCharaSelect" : { // ガチャキャラ選択
			"url"      : "SelectableGachaCharaSelect(/:id)",
			"pageInit" : function(id) {
				require(["SelectableGachaCharaSelect"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"SelectableGachaPieceSelect" : { // ガチャメモリア選択
			"url"      : "SelectableGachaPieceSelect",
			"pageInit" : function() {
				require(["SelectableGachaPieceSelect"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"GachaAnimation" : { // ガチャアニメーション
			"url"      : "GachaAnimation(/:tuId)",
			"pageInit" : function(tuId) {
				require(["GachaAnimation"],function(page){common.pageObj = page; page.fetch(tuId);});
			}
		},
		"GachaResult" : { // ガチャリザルト
			"url"      : "GachaResult(/:tuId)",
			"pageInit" : function(tuId) {
				require(["GachaResult"],function(page){common.pageObj = page; page.fetch(tuId);});
			}
		},
		"CharaTop" : { // 魔法少女 一覧
			"url"      : "CharaListTop(/:id)",
			"pageInit" : function(id) {
				require(["CharaTop"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"CharaCompose" : { // 魔法少女 強化
			"url"      : "CharaListCompose(/:id)",
			"pageInit" : function(id) {
				require(["CharaCompose"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"CharaComposeMagia" : { // 魔法少女 マギア強化
			"url"      : "CharaListComposeMagia(/:id)",
			"pageInit" : function(id) {
				require(["CharaComposeMagia"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"CharaCustomize" : { // 魔法少女 覚醒
			"url"      : "CharaListCustomize(/:id)",
			"pageInit" : function(id) {
				require(["CharaCustomize"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"CharaEquip" : { // 魔法少女 装備
			"url"      : "CharaListEquip(/:id)",
			"pageInit" : function(id) {
				require(["CharaEquip"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"CharaEnhancementTree" : { // 魔法少女 感情調整
			"url"      : "CharaEnhancementTree(/:id)",
			"pageInit" : function(id) {
				require(["CharaEnhancementTree"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"CharaComposeAttribute" : { // 魔法少女 属性強化
			"url"      : "CharaListComposeAttribute(/:id)",
			"pageInit" : function(id) {
				require(
					["CharaComposeAttribute"],
					function(page){
						common.pageObj = page; 
						page.fetch(id);
					}
				);
			}
		},
		"ShopTop" : { // ショップ
			"url"      : "ShopTop(/:shopId)",
			"pageInit" : function(shopId) {
				require(["ShopTop"],function(page){common.pageObj = page; page.fetch(shopId);});
			}
		},
		"ArenaTop" : { // アリーナトップ
			"url"      : "ArenaTop",
			"pageInit" : function() {
				require(["ArenaTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ArenaFreeRank" : { // アリーナフリーランク
			"url"      : "ArenaFreeRank",
			"pageInit" : function() {
				require(["ArenaFreeRank"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ArenaRanking" : { // アリーナランキング
			"url"      : "ArenaRanking",
			"pageInit" : function() {
				require(["ArenaRanking"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ArenaResult" : { // アリーナリザルト
			"url"      : "ArenaResult",
			"pageInit" : function() {
				require(["ArenaResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ArenaHistory" : { // アリーナ対戦履歴
			"url"      : "ArenaHistory(/:id)",
			"pageInit" : function(id) {
				require(["ArenaHistory"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"ArenaReward" : { // アリーナ報酬一覧
			"url"      : "ArenaReward",
			"pageInit" : function() {
				require(["ArenaReward"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ArenaSimulate" : { // アリーナ模擬戦
			"url"      : "ArenaSimulate",
			"pageInit" : function() {
				require(["ArenaSimulate"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"CollectionTop" : { // 図鑑トップ
			"url"      : "CollectionTop",
			"pageInit" : function() {
				require(["CollectionTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"CharaCollection" : { // 魔法少女図鑑
			"url"      : "CharaCollection",
			"pageInit" : function() {
				require(["CharaCollection"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MemoriaCollection" : { // メモリア図鑑
			"url"      : "PieceCollection",
			"pageInit" : function() {
				require(["MemoriaCollection"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"DoppelCollection" : { // ドッペル図鑑
			"url"      : "DoppelCollection",
			"pageInit" : function() {
				require(["DoppelCollection"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"StoryCollection" : { // ストーリー図鑑
			"url"      : "StoryCollection(/:id)",
			"pageInit" : function(id) {
				require(["StoryCollection"],function(page){common.pageObj = page; page.fetch(id);});
			}
		},
		"EnemyCollection" : { // 魔女図鑑
			"url"      : "EnemyCollection",
			"pageInit" : function() {
				require(["EnemyCollection"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ConfigTop" : { // 設定ページ
			"url"      : "ConfigTop",
			"pageInit" : function() {
				require(["ConfigTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"Help" : { // ヘルプページ
			"url"      : "Help",
			"pageInit" : function() {
				require(["Help"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"Terms" : { // 利用規約
			"url"      : "Terms",
			"pageInit" : function() {
				require(["Terms"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"Ban" : { // アカウント停止
			"url"      : "Ban",
			"pageInit" : function() {
				require(["Ban"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"NewVersionRecommend" : { // 強制アップデート
			"url"      : "NewVersionRecommend",
			"pageInit" : function() {
				require(["NewVersionRecommend"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"PresentList" : { // プレゼントリスト
			"url"      : "PresentList",
			"pageInit" : function() {
				require(["js/present/PresentList"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"PresentHistory" : { // プレゼント履歴
			"url"      : "PresentHistory",
			"pageInit" : function() {
				require(["js/present/PresentHistory"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"GachaHistory" : { // プレゼント履歴
			"url"      : "GachaHistory",
			"pageInit" : function() {
				require(["js/present/GachaHistory"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ProfileFormationSupport" : { // サポート編成確認
			"url"      : "ProfileFormationSupport",
			"pageInit" : function() {
				require(["js/formation/ProfileFormationSupport"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ResumeBackground" : { // サスペンド復帰時の時間をとるページ
			"url"      : "ResumeBackground",
			"pageInit" : function() {
				require(["ResumeBackground"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"SearchQuest" : { // クエスト検索
			"url"      : "SearchQuest(/:questId)",
			"pageInit" : function(questId) {
				require(["SearchQuest"],function(page){common.pageObj = page; page.fetch(questId);});
			}
		},
		"DeckFormation" : { // クエスト検索
			"url"      : "DeckFormation(/:deckType)",
			"pageInit" : function(deckType) {
				require(["DeckFormation"],function(page){common.pageObj = page; page.fetch(deckType);});
			}
		},
		"PatrolTop" : {	// 遠征トップ
			"url"      : "PatrolTop",
			"pageInit" : function() {
				require(["js/patrol/PatrolTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"PatrolCutin" : { // 遠征カットイン
			"url"      : "PatrolCutin(/:mode)",
			"pageInit" : function(mode) {
				require(["js/patrol/PatrolCutin"],function(page){common.pageObj = page; page.fetch(mode);});
			}
		},
		"PatrolResult" : { // 遠征リザルト
			"url"      : "PatrolResult()",
			"pageInit" : function() {
				require(["js/patrol/PatrolResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"PatrolLumpResult" : { // 一括遠征リザルト
			"url"      : "PatrolLumpResult()",
			"pageInit" : function() {
				require(["js/patrol/PatrolLumpResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"PatrolLumpFormation" : { // 一括遠征のチーム編成一覧
			"url"      : "PatrolLumpFormation()",
			"pageInit" : function() {
				require(["js/patrol/PatrolLumpFormation"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"CameraTop" : { // カメラ
			"url"      : "CameraTop",
			"pageInit" : function() {
				require(["CameraTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MagiRepo" : { // マギレポ
			"url"      : "MagiRepo",
			"pageInit" : function() {
				require(["MagiRepo"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MagiRepoDetail" : { // マギレポ
			"url"      : "MagiRepoDetail(/:part)(/:number)",
			"pageInit" : function(part,number) {
				require(["MagiRepoDetail"],function(page){common.pageObj = page; page.fetch(part,number);});
			}
		},
		"TestResult" : {
			"url"      : "TestResult",
			"pageInit" : function() {
				require(["js/test/TestResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"TestResult2" : {
			"url"      : "TestResult2",
			"pageInit" : function() {
				require(["js/test/TestResult2"],function(page){common.pageObj = page; page.fetch();});
			}
		}
	}

	return routes;
});
