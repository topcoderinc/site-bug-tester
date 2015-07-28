'use strict';

var config=require('config');
var express = require('express');

var router=express.Router();

/* GET home page. */
router.get('/',function(req, res) {
	var data={
		title: config.TRELLO_APPNAME,
		trello: req.session.trello
	};

	res.render('index',data);
});

module.exports = router;
