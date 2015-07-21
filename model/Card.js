'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

 /**
 * Card Schema
 */
var CardSchema = new Schema({
	dateLastActivity: {
		type: Date,
		default: Date.now
	},
	id: {
		type: String,
		required: true,
		trim: true
	},
	idList: {
		type: String,
		required: true,
		trim: true	
	},
	name: {
		type: String,
		required: true,
		trim: true
	},
	shortUrl: {
		type: String,
		required: true,
		trim: true
	},
	url: {
		type: String,
		required: true,
		trim: true
	},
	desc: {
		type: String,
		required: false,
		trim: true
	},
	idBoard: {
		type: String,
		required: true,
		trim: true
	},
	boardName:{
		type: String,
		required: true,
		trim: true
	},
	pubDate: {
		type: Date,
		default: Date.now
	},
	report: {
		type: Schema.ObjectId,
		ref: 'Report',
		required: true
	}
});

/**
 * Validations
 */
CardSchema.path('id').validate(function (id) {
  return !!id;
}, 'id cannot be blank');

CardSchema.path('idBoard').validate(function (idBoard) {
  return !!idBoard;
}, 'idBoard cannot be blank');

CardSchema.path('name').validate(function (name) {
  return !!name;
}, 'name cannot be blank');

/**
 * Statics
 */

module.exports=mongoose.model('Card', CardSchema);