'use strict';

var config=require('config');
var _=require('lodash');
var express = require('express');
var kue = require('kue');

var queue = kue.createQueue({redis: config.REDIS_URL});
var router=express.Router();

var Report=require('../model/Report.js');


router.get('/', function(req,res){
	res.json({ msg: 'jobs here man'});
});

router.post('/', function(req, res, next) {
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

router.get('/clear/:state/:n',function(req,res){ //CWD-- should really be a delete maybe?
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
