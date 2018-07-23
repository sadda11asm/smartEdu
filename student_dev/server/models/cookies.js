let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.checkCookies = async function(phone, password) {
	var db = await connect();
	let result;
	try {
		var info = await db.query(`SELECT COUNT(*) as cnt FROM student WHERE phone = ? AND password = ?`, [phone, password]);
		if (info[0][0]["cnt"]>0) {
			result = true;
		} else {
			result = false;
		}
	} catch (err) {
		result = false;
		console.log(err.message);
	} finally {
		db.end();
		console.log("DB closed!");
		return result;
	}
}