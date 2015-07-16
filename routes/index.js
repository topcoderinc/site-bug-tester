'use strict';

var config=require('config');
var _=require('lodash');
var express = require('express');
var kue = require('kue');

var queue = kue.createQueue();
var router=express.Router();

var Report=require('../model/Report.js');
var TrelloProcessor=require('../trelloProcessor.js');

router.param('boardId', function(req, res, next, boardId) {
	req.boardId=boardId;
	next();
});


/* GET home page. */
router.get('/me', function(req, res, next) {
	var list=(req.query.list?req.query.list:'Done');
	var tp=new TrelloProcessor();

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

router.post('/jobs', function(req, res, next) {
	var rpt=new Report(req.body);
	rpt.lists=['Done']; //CWD-- hard coding for now

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
