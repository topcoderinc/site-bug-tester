'use strict';

var config={};

config.TRELLO_KEY=process.env.TRELLO_KEY || '';
config.TRELLO_SECRET=process.env.TRELLO_SECRET || '';
config.TRELLO_TOKEN=process.env.TRELLO_TOKEN || '';
config.TRELLO_APPNAME='Trello Baer';
config.db=(process.env.MONGOLAB_URI || ('mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/trelloBaer') );


module.exports=config;