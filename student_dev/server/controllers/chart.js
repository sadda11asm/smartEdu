let bcrypt = require('bcryptjs');
let model = require('../models/chart');
let axios = require('axios');

exports.getChart = async function (req){
	let id = req.cookies['SAI'];
	let day = req.body.day;
	try {
		let info = await model.getChart(id, day);
		return info;	
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
} 

exports.getDays = async function (req){
	// console.log(req);
	let id = req.cookies['SAI'];
	try {
		let dt = new Date(req.body.day);
		let info = await model.getDays(id, req.body.day);
		if (info.status==418 || info.status==400) {
			return info;
		}	
		let days = info.days;
		let res = [];
		for (let i=0;i<days.length;i++) {
			let date = new Date(days[i]["day"]);
			// console.log(date);
			if (date.getFullYear()==dt.getFullYear() && date.getMonth() == dt.getMonth()) {
				let day = date.getDate();
				if (!res.includes(day)) {
					res.push(day);
				}
			} 
		}
		info.days = res;
		return info;
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
}