 let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.getHomeworksList = async function(id) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query(`	SELECT h.id, h.template, h.checked, h.score, h.filepath, h.dt,
									r.name, r.id as rate, l.name as level_name
									FROM smartEdu.homework as h
									JOIN smartEdu.template as t on t.id = h.template
									JOIN smartEdu.rate as r on r.id = t.rate
									JOIN smartEdu.studentGroup as sg on sg.student = ?
									JOIN smartEdu._group as g on g.id = sg._group
									JOIN smartEdu.level as l on l.id = g.level
									WHERE h.student = ?`, [id, id]);	
		console.log(info[0]);
		if (info[0][0]==null) {
			result = {
				status: 202,
				message: "empty data"
			}
		} else {
			result = {
				status: 200,
				message: "getting course list",
				body: info[0]
			}
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
		console.log(err);
	} finally {
		db.end();
		console.log("DB Closed!");
		return result;
	}
}

exports.getTemplate = async function(id, homework) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('	SELECT id, type, content FROM smartEdu.content WHERE template in (SELECT template FROM homework WHERE id = ?)', [homework]);
		console.log(info)
		if (info[0].length==0) {
			result = {
				status: 202,
				message: "empty data"
			}
		} else {
			result = {
				status: 200,
				message: "getting contents of the template",
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

exports.uploadFile = async function (id, homework, filepath) {
	let path = '/public/files/' + filepath
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('UPDATE homework SET filepath = ? WHERE id = ?', [path, homework]);
		result = {
			status: 200,
			message: "the file has been uploaded",
			body: info
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
		console.log(err);
	} finally {
		db.end();
		console.log("DB Closed!");
		return result;
	}
}