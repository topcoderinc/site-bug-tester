'use strict';

var config={};

config.TRELLO_KEY=process.env.TRELLO_KEY || '';
config.TRELLO_SECRET=process.env.TRELLO_SECRET || '';
config.TRELLO_TOKEN=process.env.TRELLO_TOKEN || '';
config.TRELLO_APPNAME='Trello Baer';
config.db=(process.env.MONGOLAB_URI || ('mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/trelloBaer') );
config.EMAIL_SERVICE=process.env.EMAIL_SERVICE || 'Gmail';
config.EMAIL_USER=process.env.EMAIL_USER;
config.EMAIL_PASS=process.env.EMAIL_PASS;
config.EMAIL_FROM=process.env.EMAIL_FROM || 'no-reply@trellobaer.com';
config.EMAIL_SUBJECT=process.env.EMAIL_SUBJECT || 'Trello Baer Report: ';
config.EMAIL_TEMPLATE=process.env.EMAIL_TEMPLATE || 'email';

module.exports=config;