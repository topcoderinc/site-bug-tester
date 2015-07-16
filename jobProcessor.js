'use strict';

var config=require('config');
var _=require('lodash');
var TrelloProcessor=require('./trelloProcessor');

var kue=require('kue');
var queue=kue.createQueue();
var mongoose=require('mongoose');

var Report=require('./model/Report.js');
var Card=require('./model/Card.js');

mongoose.connect(config.db);

mongoose.connection.on('connected', function() {
      console.log('connected to mongo db: '+config.db);
    })
    .on('disconnected',function(err){ console.log('disconnected'); })
    .on('error', function(err) {
      console.log('could not connect to mongo db: ',err);
      console.error.bind(console, 'connection error:');
    })
    .once('open', function (callback) { console.log('db opened: ',mongoose.connection.host+':'+mongoose.connection.port);  });



var processBoard=function(key,token,reportId,boardId,lists,done){
	console.log('processing board: ',boardId,'/',lists,' for reportId: ',reportId);
	/* CWD--  
		- fetch data from trello
		- shove into mongo
		- update report job ?
	*/
	if(key && token) {
		var tp=new TrelloProcessor(key,token);
		tp.getCards(boardId,function(err,results){
			console.log(results);

			if(err) {
				console.log(err);
			} else {
				var selectedLists=[];
				var tCards=[];
				var cards=[];

				_.forEach(lists,function(list){
					selectedLists=selectedLists.concat(_.filter(results.lists,{ name: list }));
				});

				_.forEach(selectedLists,function(list){
					tCards=tCards.concat(_.filter(results.cards,{ idList: list.id }));
				});

				_.forEach(tCards,function(card){
					var c=new Card(card); //CWD-- this won't work with Card.collection.insert()
					c.report=reportId;
					cards.push(c);
					console.log(c);
				});

				if(cards.length>0) {
					console.log('inserting cards',cards);
/*
//CWD-- this won't work with new Card(). 
//CWD-- Instead the raw card back from trello must be used. This is a bummer as it doesn't subscribe to the schema exactly.
//CWD-- so instead... we must loop and save indivdual docs
					Card.collection.insert(cards,function(err, docs) {
						if(err) {
							console.log(err);
						} else {
							console.log('inserted cards',docs);
						}
					});
*/
					_.forEach(cards,function(card){
						card.save(function(err,doc){
							if(err){
								console.log(err);
							} else {
								console.log('saved doc',doc);
							}
						});
					});


				} else {
					console.log('no cards found!');
				}
				
			}
		});
	} else {
		console.log('skipping board job due to lack of trello creds',reportId,'/',boardId);
	}

	done();
};

var processReport=function(report,done){
	var rpt=new Report(report);
	console.log('proccessing report: ',rpt);

	rpt.save(function (err,doc) {
		if(err) {
			console.log('error while saving report:',rpt,err);
		} else {
			_.forEach(doc.boardIds,function(boardId){ //loop through board list and create jobs
				var boardJob=queue.create('board',{ 
						boardId: boardId, 
						reportId: doc._id,
						lists: doc.lists,
						apiKey: doc.accessKey,
						accessToken: doc.accessToken
					}).save(function(err){
						if(err) {
							console.log(err);
						} else {
							console.log( boardJob.id );
						}
					});
			});

			done();
		}
	});
};

queue.process('report', function(job, done){
	processReport(job.data, done);
});

queue.process('board', function(job, done){
	var data=job.data;
	processBoard(data.apiKey,data.accessToken,data.reportId,data.boardId,data.lists,done);
});