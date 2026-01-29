define([
	'underscore',
	'backbone',
	'backboneCommon'
], function (_,Backbone,common) {
	'use strict';

	var backdoorRoutes = {
		"ArenaStub": {
			"url"      : "ArenaStub(/:query)",
			"pageInit" : function() {
				require(["js/test/ArenaStub"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"Backdoor": {
			"url"      : "Backdoor",
			"pageInit" : function() {
				require(["js/test/Backdoor"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"BackdoorEpLv": {
			"url"      : "BackdoorEpLv",
			"pageInit" : function() {
				require(["js/test/BackdoorEpLv"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"BackdoorLive2d": {
			"url"      : "BackdoorLive2d",
			"pageInit" : function() {
				require(["js/test/BackdoorLive2d"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"BackdoorQuestBattle": {
			"url"      : "BackdoorQuestBattle",
			"pageInit" : function() {
				require(["js/test/BackdoorQuestBattle"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"BackdoorQuestList": {
			"url"      : "BackdoorQuestList",
			"pageInit" : function() {
				require(["js/test/BackdoorQuestList"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"CreateTestUser": {
			"url"      : "CreateTestUser",
			"pageInit" : function() {
				require(["js/test/CreateTestUser"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"StyleTemplate": {
			"url"      : "StyleTemplate",
			"pageInit" : function() {
				require(["js/test/StyleTemplate"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"ScrollTest": {
			"url"      : "ScrollTest",
			"pageInit" : function() {
				require(["js/test/ScrollTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"RaidAnimationTest": {
			"url"      : "RaidAnimationTest",
			"pageInit" : function() {
				require(["js/test/RaidAnimationTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"FriendSearch": {
			"url"      : "FriendSearch",
			"pageInit" : function() {
				require(["js/test/FriendSearch"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"QuestStub": {
			"url"      : "QuestStub(/:query)",
			"pageInit" : function() {
				require(["js/test/QuestStub"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"SelectStoryTest": {
			"url"      : "SelectStoryTest",
			"pageInit" : function() {
				require(["js/test/SelectStoryTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"CardStatusChecker": {
			"url"      : "CardStatusChecker",
			"pageInit" : function() {
				require(["js/test/CardStatusChecker"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"MiniCharaTest": {
			"url"      : "MiniCharaTest",
			"pageInit" : function() {
				require(["js/test/MiniCharaTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"TapEffectTest": {
			"url"      : "TapEffectTest",
			"pageInit" : function() {
				require(["js/test/TapEffectTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"SoundTest": {
			"url"      : "SoundTest",
			"pageInit" : function() {
				require(["js/test/SoundTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"DoubleUnitTest": {
			"url"      : "DoubleUnitTest",
			"pageInit" : function() {
				require(["js/test/DoubleUnitTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"TipsTest": {
			"url"      : "TipsTest",
			"pageInit" : function() {
				require(["js/test/TipsTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"EffectTest": {
			"url"      : "EffectTest",
			"pageInit" : function() {
				require(["js/test/EffectTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"NativeSandBox": {
			"url"      : "NativeSandBox",
			"pageInit" : function() {
				require(["js/test/NativeSandBox"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"SdCharaTest": {
			"url"      : "SdCharaTest",
			"pageInit" : function() {
				require(["js/test/SdCharaTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		// EVENT TEST
		"EventArenaMissionStub": {
			"url"      : "EventArenaMissionStub",
			"pageInit" : function() {
				require(["js/test/EventArenaMissionStub"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		// AnimeJapan2018
		"RealGachaTop": {
			"url"      : "RealGachaTop",
			"pageInit" : function() {
				require(["js/test/RealGachaTop"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"RealGachaAnimation": {
			"url"      : "RealGachaAnimation",
			"pageInit" : function() {
				require(["js/test/RealGachaAnimation"],function(page){common.pageObj = page; page.fetch();});
			}
		},
		"RealGachaResult": {
			"url"      : "RealGachaResult",
			"pageInit" : function() {
				require(["js/test/RealGachaResult"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		"DeleteDataTest": {
			"url"      : "DeleteDataTest",
			"pageInit" : function() {
				require(["js/test/DeleteDataTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		"VideoTest": {
			"url"      : "VideoTest",
			"pageInit" : function() {
				require(["js/test/VideoTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		"SubSecondTest": {
			"url"      : "SubSecondTest",
			"pageInit" : function() {
				require(["js/test/SubSecondTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		"ShopReworkTest": {
			"url"      : "ShopReworkTest",
			"pageInit" : function() {
				require(["js/test/ShopReworkTest"],function(page){common.pageObj = page; page.fetch();});
			}
		},

		"MailSendTest": {
			"url": "MailSendTest",
			"pageInit": function() {
				require(
					["js/test/MailSendTest"],
					function(page){
						common.pageObj = page;
						page.fetch();
					}
				);
			}
		},
	}

	return backdoorRoutes;
});
