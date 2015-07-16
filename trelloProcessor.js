'use strict';

var config=require('config');
//var _=require('lodash');

var Trello=require('node-trello');
var V=1;

function TrelloProcessor(key,token){
	var self=this;
	self.bag={};
	self.isAuthorized=false;

	self.bag.oauth_token='';
	self.bag.oauth_token_secret='';
	self.bag.api_key='';
	self.bag.api_token='';

	if(key && token) {
		self.trello=self.initTrello(key,token);
	}
}

TrelloProcessor.prototype.initTrello=function(key,token) {
	var self=this;
	self.bag.api_key=(key || config.TRELLO_KEY);
	self.bag.api_token=(token || config.TRELLO_TOKEN);

	self.trello=new Trello(self.bag.api_key,self.bag.api_token);
	self.isAuthorized=true;
	return self;
};

TrelloProcessor.prototype.oAuthTrello=function(loginCallback, key, secret, appName){
	var self=this;
	
	self.isAuthorized=false;
	self.bag.api_key=(key || config.TRELLO_KEY);
	self.bag.api_secret=(secret || config.TRELLO_SECRET);
	self.bag.redirect=loginCallback;
	console.log('setting up oAuth with: ',self.bag.api_key,self.bag.api_secret,loginCallback,(appName || config.TRELLO_APPNAME));

	self.oAuth=new Trello.OAuth(self.bag.api_key,self.bag.api_secret,self.bag.redirect,(appName || config.TRELLO_APPNAME));
};

TrelloProcessor.prototype.getRequestToken=function(callback){
	var self=this;

	self.oAuth.getRequestToken(function(err,data){
		if(err){
			callback(err);
		} else {
			console.log(data);
			self.bag.oauth_token=data.oauth_token;
			self.bag.oauth_token_secret=data.oauth_token_secret;
			self.bag.auth_redirect=data.redirect;
			callback(null,self.bag.auth_redirect);
		}
	});
};

TrelloProcessor.prototype.getAccessToken=function(oauth_verifier,callback) {
	var self=this;

	self.bag.oauth_verifier=oauth_verifier;
	console.log('attempting access token with:', self.bag);
	self.oAuth.getAccessToken(self.bag,function(err,data){
		console.log(data);
		if(err) {
			console.log(err);
			callback(err);
		} else {
			self.bag.oauth_access_token=data.oauth_access_token;
			self.bag.oauth_access_token_secret=data.oauth_access_token_secret;
			self.initTrello(self.bag.api_key,self.bag.oauth_access_token);
			self.isAuthorized=true;
			callback(null,self.bag);
		}
	});
}

TrelloProcessor.prototype.getData=function(route,data,callback){
	this.trello.get(route,data,function(err,results){
		if(callback instanceof Function){
			callback(err,results);
		}
	});
};

TrelloProcessor.prototype.getMe=function(callback){
	this.getData('/'+V+'/members/me',{ cards: 'open', lists: 'open', boards: 'all',organizations: 'all'},callback);
};

TrelloProcessor.prototype.getCards=function(boardId,callback){
	this.getData('/'+V+'/board/'+boardId,{ cards: 'open', lists: 'open', boards: 'all',organizations: 'all'},callback);
};


module.exports=TrelloProcessor;