'use strict';

var config=require('config');
var express = require('express');
var router=express.Router();
var rb=new (require('../reportBuilder'))();
var Report=require('../model/Report.js');

router.param('id',function(req, res, next, id){
	req.id=id;

	if(req.id){ 
		Report.findById(id,function(err,doc){
			if(err){
				console.log(err);
				next(err);
			} else{
				console.log(doc);
				req.report=doc;
				next();
			}
		}); 
	} else {
		next();
	}

});

router.get('/', function(req,res){
	Report.find({}, function(err,docs){
		if(err){
			res.status(500).json(err);
		} else {
			res.json(docs);
		}
	});
});

router.get('/:id', function(req,res){
	res.json(req.report || { err: 'cannot find report: '+req.id} );
});

router.get('/:id/build',function(req,res){

	if(req.report) {
		rb.buildReport(req.report,function(err, payload){
			res.render(config.EMAIL_TEMPLATE,payload);
		});
	} else {
		res.status(500).json({ err: 'no report found'});
	}

});

module.exports = router;
