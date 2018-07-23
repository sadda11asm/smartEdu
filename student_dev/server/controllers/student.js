let bcrypt = require('bcryptjs');
let model = require('../models/student');
let axios = require('axios');

exports.getProfile = async function (req){
	let id = req.body.id;
	try {
		let info = await model.getProfile(id);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
} 

exports.getStudents = async function (req){
	let group = req.body.group;
	try {
		let info = await model.getStudents(group);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
} 


exports.updateProfile = async function(req) {
	let id = req.body.id;
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let age = req.body.age;
	let res = await model.updateProfile(id, firstname, lastname, age);
	return res;
}

exports.deleteProfile = async function(req) {
	let id = req.body.id;
	let res = await model.deleteProfile(id);
	return res;
}