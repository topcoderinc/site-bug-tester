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
	console.log('processing board: ',boardId,'/',lists,' for reportId: ',reportId,'(',key,'/',token,')');
	/* CWD--  
		- fetch data from trello
		- shove into mongo
		- update report job ?
	*/
	if(key && token) {
		var tp=new TrelloProcessor(key,token);
		tp.getCards(boardId,function(err,results){
			//console.log(results);

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
					console.log(c._id,c.name);
				});

				if(cards.length>0) {
					console.log('inserting cards');
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
								done(err);
							} else {
								console.log('saved card',doc._id);
								done(null,doc);
							}
						});
					});
				} else {
					console.log('no cards found!');
					done();
				}
				
			}
		});
	} else {
		console.log('skipping board job due to lack of trello creds',reportId,'/',boardId);
		done();
	}
};

var sendEmail=function(result){
	console.log('sending email: ',result);
};

var processReport=function(job,done){
	var rpt=new Report(job.data);
	console.log('proccessing report: ',rpt._id);

	rpt.save(function (err,doc) {
		if(err) {
			console.log('error while saving report:',rpt,err);
		} else {
			var boardCompleteCount=0;
			var boardsCount=doc.boardIds.length;

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
						done(err);
					} else {
						console.log('saved board job:', boardJob.id);
					}
				});

				boardJob.on('complete',function(result){
					++boardCompleteCount;
					job.progress(boardCompleteCount,boardsCount,result);
console.log('boardCompleteCount/boardsCount:',boardCompleteCount,boardsCount);
					if(boardCompleteCount===boardsCount){
						console.log('done with report job!');
						done(null,doc);
					}
				});

				//CWD-- really should handle failures here too so we don't have zombies
			});
		}
	});
};

queue.process('report', function(job, done){
	processReport(job, done);
});

queue.on('job complete', function(id, result){
	kue.Job.get(id, function(err, job){
		if (err) return;

		console.log('Job completed ', result);
		sendEmail(result);
/*		
		job.remove(function(err){
			if (err) throw err;
			console.log('removed completed job #%d', job.id);
		});
*/
	});
});

queue.process('board', function(job, done){
	var data=job.data;
	processBoard(data.apiKey,data.accessToken,data.reportId,data.boardId,data.lists,done);
});