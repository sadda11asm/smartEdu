let bcrypt = require('bcryptjs');
let model = require('../models/course');
let axios = require('axios');

exports.getCourses = async function (req){
	try {
		let info = await model.getCourses(req.cookies['SAI']);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  

exports.getCourse = async function (req){
	try {
		let info = await model.getCourse(req.body.rate);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}  