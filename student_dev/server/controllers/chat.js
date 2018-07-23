let bcrypt = require('bcryptjs');
let model = require('../models/chat');
let axios = require('axios');

exports.getChats = async function (req){
	try {
		let info = await model.getChats(req.cookies['SAI']);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.getMessages = async function (req){
	try {
		let info = await model.getMessages(req.body.group);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
} 

exports.readChat = async function (req){
	try {
		let info = await model.readChat(req.cookies['SAI'], req.body.group);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}   