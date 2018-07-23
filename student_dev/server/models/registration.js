let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.addStudent = async function(firstname, lastname, phone, password, age) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('INSERT INTO student (firstname, lastname, phone, password, age) VALUES (?,?,?,?,?)', [firstname, lastname, phone, password, age])
		result = {
			status: 200,
			message: "adding a student",
			id: info[0]["insertId"]
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}


exports.getAuthId = async function (phone) {
	let db = await connect();
	let result = {};
	try {
		var info = await db.query('SELECT auth_id FROM student WHERE phone = ?', [phone])
		result = info[0][0];
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}

exports.getOld = async function (phone) {
	let db = await connect();
	let result = {};
	try {
		var info = await db.query('SELECT password FROM student WHERE phone = ?', [phone])
		result = info[0][0];
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}


exports.setActive = async function (phone, is_active) {
	if (!is_active) return {
		status: 400,
		message: 'code is not correct!',
		phone: phone
	}
	let db = await connect();
	let result = {};
	try {
		var info = await db.query('UPDATE student SET is_active = ? WHERE phone =?', [is_active, phone])
		result = {
			status: 200,
			message: "student is active!",
			phone: phone
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}

exports.loginStudent = async function(phone) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('SELECT password, is_active, id FROM student WHERE phone = ?', [phone]);
		if (!info[0].length) {
			result = {
				status: 403, 
				message: "phone does not exist!"
			}
		} else {
			result = {
				status: 200,
				message: 'student info have been taken',
				info: info[0][0]
			}
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}

exports.updateCode= async function(phone, code) {
	var db = await connect();
	let result = {};
	try {
		var data = await db.query('SELECT COUNT(*) as cnt FROM student WHERE phone = ?', [phone]);
		var info = await db.query('UPDATE student SET auth_id = ? WHERE phone = ?', [code, phone]);
		if (data[0][0]["cnt"]==0) {
			result = {
				status: 403, 
				message: "phone does not exist!"
			}
		} else {
			result = {
				status: 200,
				message: 'code has been updated!',
				phone: phone
			}
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}

exports.updatePassword= async function(phone, password) {
	var db = await connect();
	let result = {};
	try {
		var data = await db.query('SELECT COUNT(*) as cnt FROM student WHERE phone = ?', [phone]);
		var info = await db.query('UPDATE student SET password = ? WHERE phone = ?', [password, phone]);
		if (data[0][0]["cnt"]==0) {
			result = {
				status: 401, 
				message: "phone does not exist!"
			}
		} else {
			result = {
				status: 200,
				message: 'password has been updated!',
				phone: phone
			}
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}
