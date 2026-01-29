/*global define*/
define([
	'backbone'
], function (Backbone) {
	'use strict';


	//#####################################
	//ルーティング前イベント、後イベント発火
	//#####################################
	Backbone.Router.prototype.before = function () {};
	Backbone.Router.prototype.after = function () {};
	Backbone.Router.prototype.route = function (route, name, callback) {
		if (!_.isRegExp(route)) route = this._routeToRegExp(route);
		if (_.isFunction(name)) {
			callback = name;
			name = '';
		}
		if (!callback) callback = this[name];

		var router = this;

		Backbone.history.route(route, function(fragment) {
			var args = router._extractParameters(route, fragment);

			 // console.log("fragment",fragment);
			// console.log("arguments",arguments);
			//router.before.apply(router, arguments);
			router.before.apply(router, [fragment.replace(args[0],""),args[0]]);
			callback && callback.apply(router, args);
			router.after.apply(router, arguments);

			router.trigger.apply(router, ['route:' + name].concat(args));
			router.trigger('route', name, args);
			Backbone.history.trigger('route', router, name, args);
		});
		return this;
	};

	// ------------------------------------------------------------------------.
	// 自身のattributesを返す
	Backbone.View.prototype.attr = function(key, val){
		if(!this.attributes.hasOwnProperty(key)) {
			// console.log('TargetView not has ' + key + ' attribute!');
		}
		if(!val) {
			return this.attributes[key];
		}
		this.attributes[key] = val;
	};

	//##########################
	// sync上書き
	//
	// fetchをPOSTに変換する必要がなくなったためコメントアウト
	//##########################
	//共通パラメータ用オブジェクト
	// Backbone.sync = function(method, model, options) {
	// 	var type = methodMap[method];

	// 	// Default options, unless specified.
	// 	_.defaults(options || (options = {}), {
	// 		emulateHTTP: Backbone.emulateHTTP,
	// 		emulateJSON: Backbone.emulateJSON
	// 	});

	// 	// Default JSON-request options.
	// 	var params = {type: type, dataType: 'json'};

	// 	// Ensure that we have a URL.

	// 	if (!options.url) {
	// 		params.url = _.result(model, 'url') || urlError();
	// 	}

	// 	// Ensure that we have the appropriate request data.
	// 	if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
	// 		params.contentType = 'application/json';
	// 		params.data = JSON.stringify(options.attrs || model.toJSON(options));
	// 	}

	// 	// For older servers, emulate JSON by encoding the request into an HTML-form.
	// 	if (options.emulateJSON) {
	// 		params.contentType = 'application/x-www-form-urlencoded';
	// 		params.data = params.data ? {model: params.data} : {};
	// 	}

	// 	// For older servers, emulate HTTP by mimicking the HTTP method with `_method`
	// 	// And an `X-HTTP-Method-Override` header.
	// 	if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
	// 		params.type = 'POST';
	// 		if (options.emulateJSON) params.data._method = type;
	// 		var beforeSend = options.beforeSend;
	// 		options.beforeSend = function(xhr) {
	// 			xhr.setRequestHeader('X-HTTP-Method-Override', type);
	// 			if (beforeSend) return beforeSend.apply(this, arguments);
	// 		};
	// 	}

	// 	// Don't process data on a non-GET request.
	// 	if (params.type !== 'GET' && !options.emulateJSON) {
	// 		params.processData = false;
	// 	}

	// 	if(method == "read"){
	// 		params.contentType = 'application/json';
	// 		params.data = options.data;
	// 	}

	// 	// Pass along `textStatus` and `errorThrown` from jQuery.
	// 	var error = options.error;
	// 	options.error = function(xhr, textStatus, errorThrown) {
	// 		options.textStatus = textStatus;
	// 		options.errorThrown = errorThrown;
	// 		if (error) error.call(options.context, xhr, textStatus, errorThrown);
	// 	};

	// 	 console.log("Backbone sync params",params);
	// 	// console.log("Backbone sync options",options);

	// 	// Make the request, allowing the user to override any Ajax options.
	// 	var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
	// 	model.trigger('request', model, xhr, options);
	// 	return xhr;
	// };

	// // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
	// var methodMap = {
	// 	'create':	'POST',
	// 	'update':	'POST',
	// 	'patch':	'PATCH',
	// 	'delete':	'DELETE',
	// 	'read':		'GET'
	// };

});
