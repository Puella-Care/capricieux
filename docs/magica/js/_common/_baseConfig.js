// assign(polyfil)
// Android4.4.x
if (typeof Object.assign != 'function') {
  console.log("assign over ride");
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target === null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

// hotReload用の仕組み
window.breforeReleaseTime = window.document.getElementById("replaceTag").getAttribute("src").split("v=")[1];

var pathBlackList = { // undefしちゃいけないpath群
	jquery :            'js/libs/jquery-3.7.1.min',
	underscore :        'js/libs/underscore-min',
	backbone :          'js/libs/backbone-min',
	text :              'js/libs/text',
	iscroll :           'js/libs/iscroll5',
	iscroll_stage :     'js/libs/iscroll5_stage',

	isBrowser :         'js/_common/isBrowser',
	ajaxControl :       'js/_common/ajaxControl',
	router :            'js/_common/router',
	backboneCommon :    'js/_common/backboneCommon',
	backboneCustom :    'js/_common/backboneCustom',
	command :           'js/_common/nativeCommand',
	commonEvent :       'js/_common/commonEvent',

	apiPathMapping :    'js/system/apiPathMapping',
	searchPathMapping : 'js/system/searchPathMapping',
	releaseInfo :       'js/system/releaseInfo',
	replacement :       'js/system/replacement',

	cardUtil :          'js/util/CardUtil',
	memoriaUtil :       'js/util/MemoriaUtil',
	sortUtil :          'js/util/SortUtil',
	memoriaSortUtil :   'js/util/MemoriaSortUtil',

	GlobalView :        'js/view/user/GlobalMenuView',

	routes:             'js/_common/routes',
	eRoutes:            'js/_common/eventRoutes',
	bRoutes:            'js/_common/backdoorRoutes'
};

var pathWhiteList = { // MyPageに遷移したときにundefするJS（ページJSのみおくこと）
	ArenaFreeRank :     'js/arena/ArenaFreeRank',
	ArenaHistory :      'js/arena/ArenaHistory',
	ArenaRanking :      'js/arena/ArenaRanking',
	ArenaResult :       'js/arena/ArenaResult',
	ArenaReward :       'js/arena/ArenaReward',
	ArenaSimulate :     'js/arena/ArenaSimulate',
	ArenaTop :          'js/arena/ArenaTop',
	BackgroundSet :     'js/user/BackgroundSet',
	Ban :               'js/user/Ban',
	CameraTop :         'js/camera/CameraTop',
	CharaCollection :   'js/collection/CharaCollection',
	CharaCommon :       'js/chara/CharaCommon',
	CharaCompose :      'js/chara/CharaCompose',
	CharaComposeMagia : 'js/chara/CharaComposeMagia',
	CharaCustomize :    'js/chara/CharaCustomize',
	CharaEquip :        'js/chara/CharaEquip',
	CharaEnhancementTree : 'js/chara/CharaEnhancementTree',
	CharaQuest :        'js/quest/CharaQuest',
	CharaTop :          'js/chara/CharaTop',
	CharaComposeAttribute : 'js/chara/CharaComposeAttribute/CharaComposeAttribute',
	CollectionTop :     'js/collection/CollectionTop',
	ConfigTop :         'js/config/ConfigTop',
	DoppelCollection :  'js/collection/DoppelCollection',
	DeckFormation :     'js/formation/DeckFormation',
	DeckUtil :          'js/formation/DeckFormationUtil',
	EnemyCollection :   'js/collection/EnemyCollection',
	EventQuest :        'js/quest/EventQuest',
	EventRecord :       'js/user/EventRecord',
	FollowTop :         'js/follow/FollowTop',
	FormationArena :    'js/formation/FormationArena',//消し
	FormationQuest :    'js/formation/FormationQuest',//消し
	FormationSupport :  'js/formation/FormationSupport',//消し
	FormationTop :      'js/formation/FormationTop',
	GachaAnimation :    'js/gacha/GachaAnimation',
	GachaResult :       'js/gacha/GachaResult',
	GachaTop :          'js/gacha/GachaTop',
	SelectableGachaCharaSelect : 'js/gacha/SelectableGachaCharaSelect',
	SelectableGachaPieceSelect : 'js/gacha/SelectableGachaPieceSelect',
	Help :              'js/etc/Help',
	HelpPopup :         'js/view/etc/HelpPopupView',
	ItemListTop :       'js/item/ItemListTop',
	LoginBonus :        'js/user/LoginBonus',
	NewVersionRecommend:'js/top/NewVersionRecommend',
	MainQuest :         'js/quest/MainQuest',
	MainQuestSingleRaid :    'js/quest/MainQuestSingleRaid',
	MainQuestBranch :        'js/quest/MainQuestBranch',
	Maintenance :       'js/top/Maintenance',
	MemoriaCollection : 'js/collection/MemoriaCollection',
	MemoriaCompose :         'js/memoria/MemoriaCompose',
	MemoriaComposeAnimation: 'js/memoria/MemoriaComposeAnimation',
	MemoriaComposeResult :   'js/memoria/MemoriaComposeResult',
	MemoriaList :            'js/memoria/UserMemoriaList',
	MemoriaEquip :           'js/memoria/MemoriaEquip',
	MemoriaSetList :         'js/memoria/MemoriaSetList',
	MemoriaSetEquip :        'js/memoria/MemoriaSetEquip',
	PieceArchive:            'js/memoria/PieceArchive',
	MemoriaTop :             'js/memoria/MemoriaTop',
	MissionTop :        'js/mission/MissionTop',
	MagiRepo :          'js/collection/MagiRepo',
	MagiRepoDetail :    'js/collection/MagiRepoDetail',
	DoppelMissionTop :  'js/mission/DoppelMissionTop',
	PanelMissionTop :  'js/mission/PanelMissionTop',
	MyPage :            'js/user/MyPage',
	ProfileFormationSupport : 'js/formation/ProfileFormationSupport',
	QuestBackground :   'js/quest/QuestBackground',
	QuestBattleSelect : 'js/quest/QuestBattleSelect',
	QuestResult :       'js/quest/QuestResult',
	QuestUtil :         'js/quest/QuestUtil',
	SecondPartLastRouter:'js/quest/secondPartLast/Router',
	SecondPartLastTop:'js/quest/secondPartLast/Top',
	SecondPartLastBattleConfirm:'js/quest/secondPartLast/BattleConfirm',
	SecondPartLastFormation:'js/quest/secondPartLast/Formation',
	SecondPartLastBoss:'js/quest/secondPartLast/Boss',
	QuestStoryOnly:'js/quest/QuestStoryOnly',
	PuellaHistoriaTop:'js/quest/puellaHistoria/Top',
	ResumeBackground :  'js/user/ResumeBackground',
	ShopTop :           'js/shop/ShopTop',
	StoryCollection :   'js/collection/StoryCollection',
	SubQuest :          'js/quest/SubQuest',
	SupportSelect :     'js/quest/SupportSelect',
	SearchQuest :       'js/util/SearchQuest',
	Terms :             'js/terms/Terms',
	TopPage :           'js/top/TopPage',
	TutorialUtil :      'js/util/TutorialUtil',

	// EVENT ------------------------------------------------------------------.
	EventTrainingTop         : 'js/event/training/EventTrainingTop',
	EventTrainingCharaSelect : 'js/event/training/EventTrainingCharaSelect',

	EventTowerTop      : 'js/event/tower/EventTowerTop',
	EventDailyTowerTop : 'js/event/dailytower/EventDailyTowerTop',
	EventBranchTop     : 'js/event/branch/EventBranchTop',

	// todo: キャメルケースなおしておく
	EventArenaMissionTop    : 'js/event/arenaMission/EventArenaMissionTop',
	EventArenaMissionStage  : 'js/event/arenaMission/EventArenaMissionStage',
	EventArenaMissionResult : 'js/event/arenaMission/EventArenaMissionResult',

	EventSingleRaidTop : 'js/event/singleraid/EventSingleRaidTop',

	EventStoryRaidTop : 'js/event/storyraid/EventStoryRaidTop',

	EventArenaRankingTop     : 'js/event/arenaranking/EventArenaRankingTop',
	EventArenaRankingResult  : 'js/event/arenaranking/EventArenaRankingResult',
	EventArenaRankingHistory : 'js/event/arenaranking/EventArenaRankingHistory',

	EventAccomplishTop         : 'js/event/accomplish/EventAccomplishTop',
	EventAccomplishEnemyDetail : 'js/event/accomplish/EventAccomplishEnemyDetail',
	EventAccomplishDeck        : 'js/event/accomplish/EventAccomplishDeck',
	EventAccomplishRecovery    : 'js/event/accomplish/EventAccomplishRecovery',

	EventAprilFoolTop    : 'js/event/aprilfool2018/EventAprilFoolTop',

	EventDungeonTop    : 'js/event/dungeon/EventDungeonTop',
	EventDungeonMap    : 'js/event/dungeon/EventDungeonMap',

	EventRaidTop         : 'js/event/raid/EventRaidTop',
	EventRaidCloseTop    : 'js/event/raid/EventRaidCloseTop',

	//ミラーズランクマッチイベント
	RegularEventArenaRankMatchTop: 'js/event/EventArenaRankMatch/Top',
	RegularEventArenaRankMatchRedirectTop: 'js/event/EventArenaRankMatch/RedirectTop',
	RegularEventArenaRankMatchResult: 'js/event/EventArenaRankMatch/Result',
	RegularEventArenaRankMatchHistory: 'js/event/EventArenaRankMatch/History',

	// REGULAR_EVENT ------------------------------------------------------------------.
	RegularEventGroupBattleTop           : 'js/regularEvent/groupBattle/RegularEventGroupBattleTop',
	RegularEventGroupBattleSelectUnion   : 'js/regularEvent/groupBattle/RegularEventGroupBattleSelectUnion',

	RegularEventExterminationTop           : 'js/regularEvent/extermination/RegularEventExterminationTop',
	RegularEventExterminationBattleSelect  : 'js/regularEvent/extermination/RegularEventExterminationBattleSelect',
	RegularEventExterminationBattleConfirm  : 'js/regularEvent/extermination/RegularEventExterminationBattleConfirm',
	RegularEventExterminationFormation  : 'js/regularEvent/extermination/RegularEventExterminationFormation',

	RegularEventAccomplishTop : 'js/regularEvent/accomplish/RegularEventAccomplishTop',//バトルミュージアム

	// CAMPAIGN --------------------------------------------------------------.
	CampaignBoxGachaTop : 'js/campaign/box_gacha/CampaignBoxGachaTop',
	CampaignGachaLineUp : 'js/campaign/gacha_lineup/CampaignGachaLineUp',
	CampaignStoryMission : 'js/campaign/story_mission/CampaignStoryMission',
	CampaignQuizTop : 'js/campaign/quiz/CampaignQuizTop',
	CampaignSumoTop : 'js/campaign/sumo/CampaignSumoTop',
	CampaignSumoCharaSelect : 'js/campaign/sumo/CampaignSumoCharaSelect',
	CampaignSumoMain : 'js/campaign/sumo/CampaignSumoMain',
	NewYearLogin : 'js/campaign/newyear_login/NewYearLogin',
	CampaignSummerMissionTop : 'js/campaign/summer_mission/CampaignSummerMissionTop',
};

// 常に最新をとる3ファイル(requireの仕様でパラメータをつけるため余計なものをつけない)
var requireNoCash = [
	'json/announcements/light_top50.json',  // おしらせ新着50件
	'json/announcements/announcements.json', // お知らせ
	'json/event_banner/event_banner.json'  // イベントバナー
];

require.config({
	baseUrl: '/magica/',
	name: 'magica',
	waitSeconds : 10,
	urlArgs: function(id, url){
		var filePath = url.split("/magica/")[1];
		if (window.fileTimeStamp[filePath]) {
			return (url.indexOf("?") === -1 ? "?" : "&") + window.fileTimeStamp[filePath];
		} else {
			// キャッシュしないファイルか確認
			var i = requireNoCash.length;
			var cashCheck = false;
			while(i>0){
				i = (i - 1) | 0;
				if(url.indexOf(requireNoCash[i]) !== -1) {
					i = 0;
					cashCheck = true;
				}
			}

			// noCashに該当しなければ今まで通り
			if(!cashCheck){
				return (url.indexOf("?") === -1 ? "?" : "&") + "v=" + new Date().getTime();
			} else {
				// noCashに該当した場合はすでにパラメータついてるので追加はナシ
				return "";
			}
		}
	},
	shim: {
		jquery: {
			exports: '$'
		},
		underscore: {
			exports: '_'
		},
		backbone: {
			deps: [
				'underscore','jquery'
			],
			exports: 'Backbone'
		},
		movieclip: {
			deps: [
				'jquery','createjs'
			]
		}
	},
	paths: $.extend({}, pathWhiteList, pathBlackList)
});
