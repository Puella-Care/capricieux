define([
	'underscore',
	'backbone',
	'backboneCommon'
], function (_,Backbone,common) {
	'use strict';

	var eventRoutes = {
		// --------------------------------------------------------------------.
		// EVENT

		// TRAINING
		"EventTrainingTop" : { // 特訓トップ
			"url"      : "EventTrainingTop(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["EventTrainingTop"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},
		"EventTrainingCharaSelect" : { // 特訓キャラセレクト
			"url"      : "EventTrainingCharaSelect",
			"pageInit" : function() {
				require(["EventTrainingCharaSelect"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// ACCOMPLISH
		"EventAccomplishTop" : { // 踏破トップ
			"url"      : "EventAccomplishTop",
			"pageInit" : function() {
				require(["EventAccomplishTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventAccomplishEnemyDetail" : { // 踏破敵情報
			"url"      : "EventAccomplishEnemyDetail",
			"pageInit" : function() {
				require(["EventAccomplishEnemyDetail"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventAccomplishRecovery" : { // 踏破回復
			"url"      : "EventAccomplishRecovery",
			"pageInit" : function() {
				require(["EventAccomplishRecovery"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventAccomplishDeck" : { // 踏破編成
			"url"      : "EventAccomplishDeck",
			"pageInit" : function() {
				require(["EventAccomplishDeck"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// TOWER
		"EventTowerTop" : { // タワーイベント
			"url"      : "EventTowerTop(/:questType)(/:questId)",
			"pageInit" : function(questType,questId) {
				require(["EventTowerTop"],function(page){common.pageObj = page; page.fetch(questType,questId);});
			}
		},
		// DAILYTOWER
		"EventDailyTowerTop" : { // タワーイベント
			"url"      : "EventDailyTowerTop(/:questType)(/:questId)",
			"pageInit" : function(questType,questId) {
				require(["EventDailyTowerTop"],function(page){common.pageObj = page; page.fetch(questType,questId);});
			}
		},

		// BRANCH
		"EventBranchTop" : { // 分岐イベント
			"url"      : "EventBranchTop(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["EventBranchTop"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},

		// ARENAMISSION
		"EventArenaMissionTop" : { // ミラーズミッションイベント
			"url"      : "EventArenaMissionTop",
			"pageInit" : function() {
				require(["EventArenaMissionTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventArenaMissionStage" : { // ミラーズミッションイベント
			"url"      : "EventArenaMissionStage(/:stageId)",
			"pageInit" : function(stageId) {
				require(["EventArenaMissionStage"],function(page){common.pageObj = page; page.fetch(stageId);});
			}
		},
		"EventArenaMissionResult" : { // ミラーズミッションイベント
			"url"      : "EventArenaMissionResult",
			"pageInit" : function() {
				require(["EventArenaMissionResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// SINGLERAID
		"EventSingleRaidTop" : { // シングルレイドイベント
			"url"      : "EventSingleRaidTop(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["EventSingleRaidTop"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},

		// STORYRAID
		"EventStoryRaidTop" : { // ストーリーレイドイベント
			"url"      : "EventStoryRaidTop(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["EventStoryRaidTop"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},

		// ARENARANKING
		"EventArenaRankingTop" : { // ミラーズミッションイベント
			"url"      : "EventArenaRankingTop",
			"pageInit" : function() {
				require(["EventArenaRankingTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventArenaRankingResult" : { // ミラーズミッションイベント
			"url"      : "EventArenaRankingResult",
			"pageInit" : function() {
				require(["EventArenaRankingResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventArenaRankingHistory" : { // ミラーズミッションイベント
			"url"      : "EventArenaRankingHistory",
			"pageInit" : function() {
				require(["EventArenaRankingHistory"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventAprilFoolTop" : { // エイプリルフールカメラトップ
			"url"      : "EventAprilFoolTop",
			"pageInit" : function() {
				require(["EventAprilFoolTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// DUNGEON
		"EventDungeonTop" : { // ダンジョントップ
			"url"      : "EventDungeonTop(/:partNo)",
			"pageInit" : function(partNo) {
				require(["EventDungeonTop"],function(page){common.pageObj = page; page.fetch(partNo);});
			}
		},
		"EventDungeonMap" : { // ダンジョンマップ
			"url"      : "EventDungeonMap",
			"pageInit" : function() {
				require(["EventDungeonMap"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// RAID
		"EventRaidTop" : { // レイドトップ
			"url"      : "EventRaidTop()",
			"pageInit" : function() {
				require(["EventRaidTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EventRaidCloseTop" : { // レイド終了
			"url"      : "EventRaidCloseTop()",
			"pageInit" : function() {
				require(["EventRaidCloseTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// バトルミュージアム(恒常踏破)
		"RegularEventAccomplishTop" : { // バトルミュージアム
			"url"      : "RegularEventAccomplishTop(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["RegularEventAccomplishTop"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},

		// キモチ線
		"RegularEventGroupBattleTop" : {
			"url"      : "RegularEventGroupBattleTop(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["RegularEventGroupBattleTop"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},
		"RegularEventGroupBattleSelectUnion" : {
			"url"      : "RegularEventGroupBattleSelectUnion()",
			"pageInit" : function() {
				require(["RegularEventGroupBattleSelectUnion"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// 殲滅戦
		"RegularEventExterminationTop" : {
			"url"      : "RegularEventExterminationTop(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["RegularEventExterminationTop"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},
		"RegularEventExterminationBattleSelect" : {
			"url"      : "RegularEventExterminationBattleSelect(/:questBattleId)",
			"pageInit" : function(questBattleId) {
				require(["RegularEventExterminationBattleSelect"],function(page){common.pageObj = page; page.fetch(questBattleId);});
			}
		},
		"RegularEventExterminationBattleConfirm" : {
			"url"      : "RegularEventExterminationBattleConfirm()",
			"pageInit" : function() {
				require(["RegularEventExterminationBattleConfirm"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"RegularEventExterminationFormation" : {
			"url"      : "RegularEventExterminationFormation()",
			"pageInit" : function() {
				require(["RegularEventExterminationFormation"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		// CAMPAIGN
		"CampaignBoxGachaTop" : { // ボックスガチャトップ
			"url"      : "CampaignBoxGachaTop",
			"pageInit" : function() {
				require(["CampaignBoxGachaTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// ガチャ告知ページ
		"CampaignGachaLineUp" : {
			"url"      : "CampaignGachaLineUp",
			"pageInit" : function() {
				require(["CampaignGachaLineUp"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// ミッションストーリー告知
		"CampaignStoryMission" : {
			"url"      : "CampaignStoryMission",
			"pageInit" : function() {
				require(["CampaignStoryMission"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// クイズキャンペーン
		"CampaignQuizTop" : {
			"url"      : "CampaignQuizTop",
			"pageInit" : function() {
				require(["CampaignQuizTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// すもう
		"CampaignSumoTop" : {
			"url"      : "CampaignSumoTop",
			"pageInit" : function() {
				require(["CampaignSumoTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		"CampaignSumoCharaSelect" : {
			"url"      : "CampaignSumoCharaSelect",
			"pageInit" : function() {
				require(["CampaignSumoCharaSelect"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		"CampaignSumoMain" : {
			"url"      : "CampaignSumoMain",
			"pageInit" : function() {
				require(["CampaignSumoMain"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// おみくじCP
		"NewYearLogin" : {
			"url"      : "NewYearLogin",
			"pageInit" : function() {
				require(["NewYearLogin"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		// CAMPAIGN
		"CampaignSummerMissionTop" : { // サマーキャンペーン
			"url"      : "CampaignSummerMissionTop(/:missionId)",
			"pageInit" : function(missionId) {
				require(["CampaignSummerMissionTop"],function(page){common.pageObj = page; page.fetch(missionId);});
			}
		},

		//ミラーズランクマッチイベント
		"RegularEventArenaRankMatchTop" : { //トップ
			"url": "RegularEventArenaRankMatchTop()",
			"pageInit": function() {
				require(["RegularEventArenaRankMatchTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"RegularEventArenaRankMatchRedirectTop" : { //トップにリダイレクト
			"url": "RegularEventArenaRankMatchRedirectTop()",
			"pageInit": function() {
				require(["RegularEventArenaRankMatchRedirectTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"RegularEventArenaRankMatchResult" : { //バトル結果ページ
			"url": "RegularEventArenaRankMatchResult()",
			"pageInit": function() {
				require(["RegularEventArenaRankMatchResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"RegularEventArenaRankMatchHistory" : { //戦績ページ
			"url": "RegularEventArenaRankMatchHistory()",
			"pageInit": function() {
				require(["RegularEventArenaRankMatchHistory"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		//メモリア新イベント
		//トップページ
		"EventWitchTopPage" : {
			"url": "EventWitchTopPage",
			"pageInit": function() {
				require(
					["EventWitchTop"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"EventWitchExchangePage" : {
			"url": "EventWitchExchangePage",
			"pageInit": function() {
				require(
					["EventWitchExchangeTop"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"EventWitchExchangeAnimePage" : {
			"url": "EventWitchExchangeAnimePage",
			"pageInit": function() {
				require(
					["EventWitchExchangeAnime"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"EventWitchIconTest" : {
			"url": "EventWitchIconTest",
			"pageInit": function() {
				require(
					["EventWitchIconTest"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"EventWalpurgisRaidTop" : { //ワルプルイベント全体レイド
			"url": "EventWalpurgisRaidTop", 
			"pageInit": function() {
				require(
					["EventWalpurgisRaidTop"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"EventWalpurgisRaidQuestResultMainBoss" : { //ワルプルイベントボス結果ページ
			"url": "EventWalpurgisRaidQuestResultMainBoss", 
			"pageInit": function() {
				require(
					["EventWalpurgisRaidQuestResultMainBoss"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
		"EventWalpurgisRaidQuestResultSubBoss" : { //ワルプルイベント取巻結果ページ
			"url": "EventWalpurgisRaidQuestResultSubBoss", 
			"pageInit": function() {
				require(
					["EventWalpurgisRaidQuestResultSubBoss"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
	};

	return eventRoutes;
});
