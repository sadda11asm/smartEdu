let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.getProfile = async function(id) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('SELECT firstname, lastname, phone, ava, age FROM student WHERE id = ?', [id]);
		if (info[0][0]["firstname"]==null) {
			result = {
				status: 418,
				message: 'no such student'
			}
		} else {
			result = {
				status: 200,
				message: "getting student profile",
				body: info[0][0]
			}
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB Closed!");
		return result;
	}
}

exports.getStudents = async function(group) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('SELECT id, firstname, lastname, phone, ava, age FROM student WHERE id in (SELECT student FROM studentGroup WHERE _group = ?)', [group]);
		if (info[0][0]["firstname"]==null) {
			result = {
				status: 418,
				message: 'no students in group'
			}
		} else {
			result = {
				status: 200,
				message: "getting students",
				body: info[0]
			}
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
	} finally {
		db.end();
		console.log("DB Closed!");
		return result;
	}
}
exports.updateProfile= async function(id, firstname, lastname, age) {
	var db = await connect();
	let result = {};
	try {
		var data = await db.query('SELECT COUNT(*) as cnt FROM student WHERE id = ?', [id]);
		var info = await db.query('UPDATE student SET firstname = ?, lastname = ?, age = ? WHERE id = ?', [firstname, lastname, age, id]);
		if (data[0][0]["cnt"]==0) {
			result = {
				status: 403, 
				message: "student does not exist!"
			}
		} else {
			result = {
				status: 200,
				message: 'info has been updated!',
				id: id
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

exports.deleteProfile= async function(id) {
	var db = await connect();
	let result = {};
	try {
		var data = await db.query('SELECT COUNT(*) as cnt FROM student WHERE id = ?', [id]);
		var info = await db.query('DELETE FROM student WHERE id = ?', [id]);
		if (data[0][0]["cnt"]==0) {
			result = {
				status: 403, 
				message: "student does not exist!"
			}
		} else {
			result = {
				status: 200,
				message: 'info has been deleted!',
				id: id
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