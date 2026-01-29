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
	command :           'js/_common/nativeCommand2',
	commonEvent :       'js/_common/commonEvent',

	apiPathMapping :    'js/system/apiPathMapping',
	searchPathMapping : 'js/system/searchPathMapping',
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
	CharaQuest :        'js/quest/CharaQuest',
	CharaTop :          'js/chara/CharaTop',
	CollectionTop :     'js/collection/CollectionTop',
	ConfigTop :         'js/config/ConfigTop',
	CharaComposeAttribute : 'js/chara/CharaComposeAttribute/CharaComposeAttribute',
	DoppelCollection :  'js/collection/DoppelCollection',
	DeckFormation :     'js/formation/DeckFormation',
	EnemyCollection :   'js/collection/EnemyCollection',
	EventQuest :        'js/quest/EventQuest',
	EventRecord :       'js/user/EventRecord',
	FollowTop :         'js/follow/FollowTop',
	FormationArena :    'js/formation/FormationArena',
	FormationQuest :    'js/formation/FormationQuest',
	FormationSupport :  'js/formation/FormationSupport',
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
	MemoriaTop :             'js/memoria/MemoriaTop',
	MissionTop :        'js/mission/MissionTop',
	DoppelMissionTop :  'js/mission/DoppelMissionTop',
	MyPage :            'js/user/MyPage',
	ProfileFormationSupport : 'js/formation/ProfileFormationSupport',
	QuestBackground :   'js/quest/QuestBackground',
	QuestBattleSelect : 'js/quest/QuestBattleSelect',
	QuestResult :       'js/quest/QuestResult',
	QuestUtil :         'js/quest/QuestUtil',
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

	EventAprilFoolTop    : 'js/event/aprilfool2018/EventAprilFoolTop'
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
				return (url.indexOf("?") === -1 ? "?" : "&") + new Date().getTime();
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
