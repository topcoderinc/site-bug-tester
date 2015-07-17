'use strict';

var config=require('config');
var _=require('lodash');
var express = require('express');
var kue = require('kue');

var queue = kue.createQueue();
var router=express.Router();

var Report=require('../model/Report.js');
var TrelloProcessor=require('../trelloProcessor.js');
var tp=new TrelloProcessor();

var authRedirectPath='/oauth/authredirect';


/* GET home page. */
router.get('/me', function(req, res, next) {
	var list=(req.query.list?req.query.list:'Done');

	if(!tp.isAuthorized){
		res.redirect('/oauth?landing=/me');
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
				res.json(data);
			}
		}
	});
});

router.get('/oauth',function(req,res,next){
	var landing=(req.query.landing || '/');
	tp.oAuthTrello(req.protocol+'://'+req.headers.host+req.baseUrl+authRedirectPath+'?landing='+landing);	
	tp.getRequestToken(function(err,redirectURL){
		if(err){
			res.status(500).json(err);
		} else {
			//res.json(redirectURL);
			console.log('redirecting to:',redirectURL);
			res.redirect(redirectURL);
		}
	});
});

router.get(authRedirectPath,function(req,res){
	var landing=(req.query.landing || '/');
	console.log('calling for access token: ',req.query.oauth_verifier);
	tp.getAccessToken(req.query.oauth_verifier, function(err,data){
		if(err){
			console.log(err);
			res.status(500).json(err);
		} else {
			//res.json(data);
			res.redirect(landing);
		}
	});
	
});

router.post('/jobs', function(req, res, next) {
	if(!tp.isAuthorized){
		res.status(500).json({ error: 'no oAuth tokens' });
		return;
	}


	var rpt=new Report(req.body);
	rpt.lists=['Done']; //CWD-- hard coding for now
	rpt.accessKey=tp.bag.api_key;
	rpt.accessToken=tp.bag.oauth_access_token;

	rpt.validate(function(err) { 
		if(err){
			res.status(500).json(err);
		} else {
			var job = queue.create('report',rpt).removeOnComplete(true).save( function(err){
				if(err) {
					console.log(err);
				} else {
					console.log('posted report job: ',job.id );
				}
			});

			res.json(job);
		}		
	});
});

module.exports = router;
