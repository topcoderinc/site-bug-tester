'use strict';

var config=require('config');
//var _=require('lodash');

var Trello=require('node-trello');


function TrelloProcessor(key,token){
	var self=this;
	self.trello=new Trello((key || config.TRELLO_KEY),(token || config.TRELLO_TOKEN));
}

TrelloProcessor.prototype.getData=function(route,data,callback){
	this.trello.get(route,data,function(err,results){
		if(callback instanceof Function){
			callback(err,results);
		}
	});
};

TrelloProcessor.prototype.getMe=function(callback){
	this.getData('/1/members/me',{ cards: 'open', lists: 'open', boards: 'all',organizations: 'all'},callback);
};

TrelloProcessor.prototype.getCards=function(boardId,callback){
	this.getData('/1/board/'+boardId,{ cards: 'open', lists: 'open', boards: 'all',organizations: 'all'},callback);
};


module.exports=TrelloProcessor;