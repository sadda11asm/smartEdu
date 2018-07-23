let bcrypt = require('bcryptjs');
let model = require('../models/group');
let axios = require('axios');

exports.getGroup = async function (req){
	let id = req.cookies['SAI'];
	try {
		let info = await model.getGroup(id);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
} 
