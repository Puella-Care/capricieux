// ビルド時に書き換わる
window.resDir = "";
window.isDebug = false; //本番環境がデフォルト
var fileTimeStamp = {};
var deleteConfirms = [];

window.hotReload = function(mypageFetch){
	// console.log(pathWhiteList);
	require.undef("releaseInfo");
	require(["releaseInfo"],function(){
		// console.log("window.breforeReleaseTime",window.breforeReleaseTime);
		// console.log("releaseTime",releaseTime);
		if(!window.breforeReleaseTime || window.breforeReleaseTime !== releaseTime){
			window.breforeReleaseTime = releaseTime;
			require.undef("replacement");
			require(["replacement"],function(){
				// console.log("run hotreload replacement")
				_.each(pathWhiteList,function(content,key) {
					require.undef(key);
				});
				_.each(fileTimeStamp,function(content,key) {
					if(key.indexOf("css/") !== -1 || key.indexOf("template/") !== -1) {
						require.undef("text!"+key);
						// console.log("text!"+key);
					}
				});
				mypageFetch();
			});
		}else{
			mypageFetch();
		}
	});
};

window.deleteAssetArr = function(){
	return deleteConfirms;
};