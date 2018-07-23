 let bcrypt = require('bcryptjs');
let model = require('../models/homework');
let axios = require('axios');

exports.getHomeworksList = async function (req){
	try {
		let info = await model.getHomeworksList(req.cookies['SAI']);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.getTemplate = async function (req){
	try {
		let info = await model.getTemplate(req.cookies['SAI'], req.body.homework);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.uploadFile = async function (req){
	try {
		let info = await model.uploadFile(req.cookies['SAI'], req.body.homework, req.body.filepath);
		// console.log(req.body)
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  