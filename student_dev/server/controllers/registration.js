let bcrypt = require('bcryptjs');
let model = require('../models/registration');
let axios = require('axios');


exports.addStudent = async function (req){
	
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let password  = req.body.password;
	let phone = "+7" + req.body.phone;
	console.log("phone: "+ phone);
	let age = req.body.age;
	if (!firstname || !lastname || !password || !phone || !age) {
		return {
			status: 418,
			message: "NOT FULL INFORMATION!"
		}
	}
	let salt = await bcrypt.genSalt(10) 
	let hash = await bcrypt.hash(password, salt);
	let info = await model.addStudent(firstname, lastname, phone, hash, age); 
	return info;
}

exports.verifyStudent = async function(req) {

	let code = req.body.code;
	let phone = "+7" + req.body.phone;

	let info = await model.getAuthId(phone);
	if (!info["auth_id"]) {
		return {
			status: 401,
			message: 'No such phone number'
		}
	}
	let result = {};
	if (code == info["auth_id"] && req.body.active) {
		result = await model.setActive(phone, true);
	} else if (req.body.active) {
		result = await model.setActive(phone, false);
	} else if (code == info["auth_id"]) {
		return {
			status: 200,
			message: "code coincides! but active not found"
		}
	} else {
		return {
			status:400,
			message: "code does not coincide and active is not found!"
		}
	}
	return result;
}

exports.loginStudent = async function (req){
	let result;
	try {
		let phone = "+7" + req.body.phone;
		let password  = req.body.password;

		let data = await model.loginStudent(phone);
		var info = data.info;
		var status = data.status;
		if (status==400 || status==403) {
			return {
				status: status,
				message: data.message
			}
		}
		if (!info["is_active"]) {
			return {
				status: 401, 
				message: "student account is not active"
			}
		}
		var res =  await bcrypt.compare(password, info["password"]);
		if (res) {
			return {
				status:200,
				message: "correct entry!", 
				password: info["password"],
				phone: phone, 
				id: info["id"]
			}
		} else {
			return {
				status: 402,
				message: "not correct password!"
			}
		}
	} catch (err) {
		return {
			status: 404,
			message: err.message
		}
	}
} 

exports.sendSMS = async function(req) {
	let phone = "+7" + req.body.phone;
	/*let code = Math.floor(Math.random()*9000)+1000;
	let url = 'https://smsc.kz/sys/send.php?login=nixhibrid&psw=Mandriva2012&phones=' + phone +'&mes='+ code
	let res = await axios.get(url);
	console.log(res.data);
	let data = res.data.split(' ');
	if (data[0]=='ERROR') {
		return {
			status: 405,
			message: "phone number is incorrect!"
		}
	}*/

	let info = await model.updateCode(phone, 1234); 
	return info;
}

exports.updatePassword = async function(req) {
	let phone = "+7" + req.body.phone;
	let password = req.body.password;
	let code = req.body.code;
	let old = req.body.old;
	if (code) {
		let info = await model.getAuthId(phone);
		if (!info["auth_id"]) {
			return {
				status: 401,
				message: 'No such phone number'
			}
		}
		if (info["auth_id"]==code) {
			let salt = await bcrypt.genSalt(10) 
			let hash = await bcrypt.hash(password, salt);
			let res = await model.updatePassword(phone, hash);
			return res;
		} else {
			return {
				status: 405,
				message: 'code does not coincide'
			}
		}
	} else if (old){
		let data = await model.getOld(phone);
		if (!data["password"]) {
			return {
				status: 401,
				message: 'No such phone number'
			}
		}
		var check =  await bcrypt.compare(old, data["password"]);
		if (check) {
			let salt = await bcrypt.genSalt(10) 
			let hash = await bcrypt.hash(password, salt);
			let res = await model.updatePassword(phone, hash);
			return res;
		} else {
			return {
				status: 405,
				message: 'old password does not coincide'
			}
		}
	} else {
		return {
			status: 202,
			message: 'not type renewing specified'
		}
	}
}