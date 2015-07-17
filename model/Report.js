'use strict';

/**
 * Module dependencies.
 */
var _=require('lodash');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

 /**
 * Report Schema
 */
var ReportSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  emailRecipient:{
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  boardIds: [{ type : String }],
  lists: [ { type : String } ],
  accessKey: {
    type: String,
    required: true,
    trim: true
  },
  accessToken: {
    type: String,
    required: true,
    trim: true
  },
});

/**
 * Validations
 */

ReportSchema.path('boardIds').validate(function (boardIds) {
  return _.isArray(boardIds);
}, 'boardIds must be an array');

ReportSchema.path('name').validate(function (name) {
  return !!name;
}, 'name cannot be blank');

/**
 * Statics
 */

module.exports=mongoose.model('Report', ReportSchema);