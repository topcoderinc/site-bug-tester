'use strict';

var _=require('lodash');
var express = require('express');
var TrelloProcessor=require('../trelloProcessor');

var router=express.Router();

var oAuthPath='/oauth';
var oAuthRedirectPath='/oauth/authredirect';
var oAuthEndPath='/oauth/complete';


router.get('/user',function(req, res){
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	if(tp.isAuthorized){
		tp.getMe(function(err,data){
			if(err){
				res.status(500).json(err);
			} else {
				req.session.user=data;
				res.json({ user: req.session.user, isAuthenticated: tp.isAuthorized, err: '' });
			}
		});
	} else {
		res.json({ user: 'user not authenticated', isAuthenticated: tp.isAuthorized, err: 'not authenticated' });
	}
	
});

router.get('/boards', function(req, res, next) {
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	if(tp.isAuthorized){
		tp.getMe(function(err,data){
			if(err){
				res.status(500).json(err);
			} else {
				var boards=data.boards;
				var orgs=data.organizations;

				_.forEach(boards,function(board){
					var org=_.find(orgs,{ id: board.idOrganization});
					board.nameOrganization=_.result(org,'name','');
					board.displayNameOrganization=_.result(org,'displayName','');
				});

				res.json({ boards: boards, organizations: orgs, err: '' });
			}
		});
	} else {
		res.json({ boards: [], err: 'not authenticated'});
	}
});

router.get('/me', function(req, res, next) {
	var list=(req.query.list?req.query.list:'Done');
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	if(!tp.isAuthorized){
		res.redirect(req.baseUrl+oAuthPath+'?landing=/me');
		return;
	}

	var listFilter=list; //CWD-- temp
	var template='card'; //CWD-- temp

	tp.getMe(function(err,data){
		if(req.query.format==='html') {
			if(err){
				res.render('error', err);
			} else {
				var listId=_.pluck(_.filter(data.lists, { 'name': listFilter }), 'id')[0];
				var cards=_.filter(data.cards,{ idList: listId });
				res.render(template, { boardName: data.name , organizationName: data.organization.displayName, cards: cards});
			}
		} else {
			if(err){
				res.status(500).json(err);
			} else {
				req.session.user=data;
				res.json(data);
			}
		}
	});
});

router.get(oAuthPath,function(req,res,next){
	var landing=(req.query.landing || oAuthEndPath);
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	tp.oAuthTrello(req.protocol+'://'+req.headers.host+req.baseUrl+oAuthRedirectPath+'?landing='+landing);
	req.session.trello=tp;

	tp.getRequestToken(function(err,redirectURL){
		if(err){
			res.status(500).json(err);
		} else {
			//res.json(redirectURL);
			console.log('redirecting to:',redirectURL);
			req.session.trello=tp;
			res.redirect(redirectURL);
		}
	});
});

router.get(oAuthEndPath,function(req,res,next){
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	if(!tp.isAuthorized){
		res.redirect(req.baseUrl+oAuthPath);
		return;
	}

	res.json({ msg: 'oAuth success!'});
});

router.get(oAuthRedirectPath,function(req,res){
	var landing=(req.query.landing || '/');
	console.log('calling for access token: ',req.query.oauth_verifier);
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	tp.getAccessToken(req.query.oauth_verifier, function(err,data){
		if(err){
			console.log(err);
			res.status(500).json(err);
		} else {
			//res.json(data);
			req.session.trello=tp;
			res.redirect(landing);
		}
	});
	
});

module.exports = router;
