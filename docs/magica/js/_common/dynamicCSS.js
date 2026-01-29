
/**
 * DynamicCSSモジュール
 */

var DynamicCSS = function(){
	var head = document.getElementsByTagName( "head" )[0];
	var style = head.getElementsByTagName("style" )[0];
	if(style){
	  	//styleが準備されていたら新しくノード作らない
	}else{
		style = document.createElement( "style" );
		style.setAttribute( "type", "text/css" );
		style.appendChild( document.createTextNode( "" ) );
		head.appendChild( style );
	}
	var sheet = style.sheet;
	var that = {
		//新しいCSSを追加する
		appendRule : function(selector, rules){
			var r = new Array();
			for( var i in rules ) {
				if( rules.hasOwnProperty( i ) ) r.push( i + ":" + rules[i] );
			}
			sheet.insertRule( selector + "{" + r.join( ";" ) + ";}", sheet.cssRules.length );
			// console.log(sheet);
			// console.log(selector + "{" + r.join( ";" ) + ";}");
		},
		//新しいKeyframesを追加する
		appendKeyframes : function(anime, frames){
			var keys = new Array();
			for( var f in frames ) {
				var frame = frames[f];
				var rules = new Array();
				for( var r in frame ) {
					if( frame.hasOwnProperty( r ) ) rules.push( r + ":" + frame[r] );
				}
				keys.push( f + "{" + rules.join( ";" ) + ";}" );
			}
			sheet.insertRule( "@-webkit-keyframes " + anime + "{" + keys.join( " " ) + "}", sheet.cssRules.length );

			//console.log("@-webkit-keyframes " + anime + "{" + keys.join( " " ) + "}");
		},
		//Keyframesを削除
		deleteKeyframes : function(index){
			var num = sheet.cssRules.length;
			if( num <= 0 ){
				return;
			}
			if( typeof index == "undefined" || index >= num ){
				index = num-1; // 最後のものの削除
			}
			sheet.deleteRule(index);
		},
		clearSheet : function(){
			var num = sheet.cssRules.length;
			for(var i = num-1 ; i>=0 ; i--){
				sheet.deleteRule(i);
			}
		},
		// 登録数を取得
		getLength : function(){
			return sheet.cssRules.length-1;
		},
		transform : function(x, y, r, s){
			return {"-webkit-transform":"translate(" + x + "px," + y + "px) rotate(" + r + "deg) scale(" + s + ")"};
		},
		showSheet : function(){
			// console.log(sheet);
		}
	}
	return that;
}

