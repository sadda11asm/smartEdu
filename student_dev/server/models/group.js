let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.getGroup = async function(id) {
	var db = await connect();
	let result = {};
	try {
		// console.log(id);
		var data= await db.query('SELECT COUNT(*) FROM student WHERE id = ?', [id]);
		var info = await db.query('SELECT _group.id as group_id, _group.name as group_name, _group.type as group_type, _group.started, _group.teacher, rate.name as rate_name FROM smartEdu._group, smartEdu.rate WHERE _group.rate = rate.id AND _group.id in (SELECT _group FROM smartEdu.studentGroup WHERE student = ?)', [id]);
		// console.log(info);
		if (data[0][0]["cnt"]==0) {
			result = {
				status: 418,
				message: 'no such student'
			}
		} else {
			result = {
				status: 200,
				message: "getting student groups",
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