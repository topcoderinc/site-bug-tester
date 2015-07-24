'use strict';

var config=require('config');
var _=require('lodash');
var express = require('express');
var kue = require('kue');
var TrelloProcessor=require('../trelloProcessor');


var queue = kue.createQueue({redis: config.REDIS_URL});
var router=express.Router();

var Report=require('../model/Report.js');

var authRedirectPath='/oauth/authredirect';
var authEndPath='/oauth/complete';


/* GET home page. */
router.get('/',function(req, res) {
	var data={
		title: config.TRELLO_APPNAME,
		trello: req.session.trello
	};

	res.render('index',data);
});

router.get('/user',function(req, res){
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	res.json({ user: 'data goes here', isAuthenticated: tp.isAuthorized });
});

router.get('/buildJob',function(req, res) {
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	if(!tp.isAuthorized){
		res.redirect('/oauth?landing=/buildJob');
		return;
	}

	var data={
		title: config.TRELLO_APPNAME,
		trello: tp
	};

	res.render('buildJob',data);
});


router.get('/me', function(req, res, next) {
	var list=(req.query.list?req.query.list:'Done');
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

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
				res.session.user=data;
				res.json(data);
			}
		}
	});
});

router.get('/oauth',function(req,res,next){
	var landing=(req.query.landing || authEndPath);
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	tp.oAuthTrello(req.protocol+'://'+req.headers.host+req.baseUrl+authRedirectPath+'?landing='+landing);
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

router.get(authEndPath,function(req,res,next){
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

	if(!tp.isAuthorized){
		res.redirect('/oauth');
		return;
	}

	res.json({ msg: 'oAuth success!'});
});

router.get(authRedirectPath,function(req,res){
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

router.post('/jobs', function(req, res, next) {
	var tp=new TrelloProcessor().initFromSessionObject(req.session.trello);

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
			var job = queue.create('report',rpt).removeOnComplete(false).save( function(err){
				if(err) {
					console.log(err);
				} else {
					console.log('posted report job: ',job.id );
				}
			});

			job.on('complete',function(result){
				console.log('job done!',result);
			});

			res.json(job);
		}		
	});
});

router.get('/clearkue/:state/:n',function(req,res){
	kue.Job.rangeByState(req.params.state, 0, req.params.n, 'asc', function( err, jobs ) {
		_.forEach(jobs, function( job ) {
			job.remove( function(){
				console.log('removed ', job.id );
			});
		});

		res.json(jobs);
	});

});

module.exports = router;
