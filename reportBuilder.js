'use strict';

var config=require('config');
var _=require('lodash');
var path=require('path');
var nodemailer=require('nodemailer');
var hbs=require('nodemailer-express-handlebars');
var mongoose=require('mongoose');
var Report=require('./model/Report.js');
var Card=require('./model/Card.js');

function ReportBuilder(){
	var self=this;

	self.transporter=nodemailer.createTransport({
		service: config.EMAIL_SERVICE,
		auth: {
			user: config.EMAIL_USER,
			pass: config.EMAIL_PASS
		}
	});

	self.transporter.use('compile', hbs({
		viewPath: path.join(__dirname, 'views'),
		extName: '.hbs'
	}));
}

ReportBuilder.prototype.buildReport=function(doc,callback) {
	Card.find({ report: doc._id}, function (err, cards) {

		if(err) {
			console.log(err);
			callback(err);
			return;
		} else {
			//console.log(cards);
			var payload={
				reportName: doc.name,
				boards: []
			};

			_.forEach(cards,function(card){
				var o={ name: card.boardName, cards: [] };

				if(payload.boards[card.idBoard]){
					o=payload.boards[card.idBoard];
				} 

				o.cards[o.cards.length]=card;
				payload.boards[card.idBoard]=o;
			});

			payload.boards=_.values(payload.boards);
			callback(null,payload);
		}		
	});
};

ReportBuilder.prototype.sendMail=function(to, subject, context, callback){
	var self=this;
	var mailOptions={
		from: config.EMAIL_FROM,
		to: to,
		subject: config.EMAIL_SUBJECT+subject,
		template: config.EMAIL_TEMPLATE,
		context: context
	};

	self.transporter.sendMail(mailOptions,function(error, info){
		if(error){
			console.log(error);
			callback(error);
			return;
		} else {
			console.log('Message sent: ' + info.response);
			callback(null,info);
			return;
		}
	});
};

module.exports=ReportBuilder;