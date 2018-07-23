let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.getChart = async function(id, day) {
	var db = await connect();
	let result = {};
	try {
		var data = await db.query('SELECT COUNT(*) FROM student WHERE id = ?', [id]);
		var info = await db.query(` select g.type as group_type, r.name as rate_name, g.id as group_id,
									c.day, c.start, c.finish, l.name as lvl_name
									from smartEdu.studentGroup as sg
									join smartEdu.student as s on sg.student = s.id
									join smartEdu._group as g on sg._group = g.id
									join smartEdu.chart as c on g.id = c._group
									join smartEdu.level as l on g.level = l.id
									join smartEdu.rate as r on r.id = g.rate
									where s.id = ? 
									and c.day = ?`, [id, day]);
		if (data[0][0]["cnt"]==0) {
			result = {
				status: 418,
				message: 'no such student'
			}
		} else {
			result = {
				status: 200,
				message: "getting student chart",
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

exports.getDays = async function(id) {
	var db = await connect();
	let result = {};
	try {
		var data= await db.query('SELECT COUNT(*) FROM student WHERE id = ?', [id]);
		var info = await db.query('SELECT day FROM chart WHERE _group in (SELECT _group FROM studentGroup WHERE student = ?) GROUP BY day', [id]);
		if (data[0][0]["cnt"]==0) {
			result = {
				status: 418,
				message: 'no such student'
			}
		} else {
			result = {
				status: 200,
				message: "getting student chart",
				days: info[0]
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