 let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.getLessonsNumber = async function(id, rate) {
	console.log(rate)
	var db = await connect();
	let result = {};
	try {
		var info = await db.query(`	SELECT lessons
									FROM rate 
									WHERE id = ?`, [rate]);	
		if (info[0][0]["lessons"]==null) {
			result = {
				status: 202,
				message: "empty data"
			}
		} else {
			result = {
				status: 200,
				message: "getting number of lessons",
				count: info[0][0]["lessons"]
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

exports.getTeachers = async function(id, rate) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('select * from teacher');
		// console.log(info);
		if (info[0][0]==null) {
			result = {
				status: 202,
				message: "empty data"
			}
		} else {
			result = {
				status: 200,
				message: "getting teachers",
				body: info
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

exports.getTeacherGraph = async function(id) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query( `select graph.nday, graph.start, graph.finish from smartEdu.teacher, smartEdu.graph
									where teacher.id = graph.teacher and teacher.id = ?`, [id]);
		if (info[0][0]==null) {
			result = {
				status: 202,
				message: "empty data"
			}
		} else {
			result = {
				status: 200,
				message: "getting test by the id",
				body: info[0]
			}
		}
	} catch (err) {
		result = {
			status: 400,
			message: err.message
		}
		console.log(err.message);
	} finally {
		db.end();
		console.log("DB Closed!");
		return result;
	}
}

exports.getLowestLevel = async function (rate) {
	var db = await connect();
	let result;
	try {
		let info = await db.query('SELECT MIN(id) as id, name  FROM smartEdu.level WHERE rate = ?', [rate])
		// console.log(info);
		result = info[0][0]["id"];
	} catch (err) {
		result = null;
		console.log(err);
	} finally {
		db.end();
		console.log("DB Closed!");
		return result;
	}
}

exports.sendRequest = async function (id, rate, teacher, request, level) {
	var db = await connect();
	let result = {};
	try {
		for (let i=0;i<request.length;i++) {
			let day = request[i]['day'];
			let periods = request[i]['periods']; 
			for (let j=0;j<periods.length;j++) {
				await db.query('INSERT INTO request (student, start, finish, nday, rate, teacher, level) VALUES (?,?,?,?,?,?,?)', 
					[id, periods[j]["start"], periods[j]["finish"], day, rate, teacher, level]);
			}
		}
		result = {
			status: 200,
			message: "sending request"
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