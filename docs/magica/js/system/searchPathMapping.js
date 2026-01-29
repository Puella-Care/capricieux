define([
	'backboneCommon'
],function (common) {
	'use strict';

	var searchObj = {};
	var searchPathList = {
		// "friend": "/friend_search/_search"
		"friend": "/friend_search/_search"
	};

	// ------------------------------------------------------------------------.
	var jsonPath = "/search";
	var jsonEx = "";
	//ローカル判定
	if(location.href.match("file://") || location.href.match("http://localhost:5963") || location.href.match("https://localhost:5963")){
		jsonPath = "/magica/json";
		jsonEx = ".json";
	}
	common.searchLinkList = [];
	searchObj.pathSet = function() {
		for (var key in searchPathList) {
			common.searchLinkList[key] = jsonPath + searchPathList[key] + jsonEx;
		}
	};

	return searchObj;
});