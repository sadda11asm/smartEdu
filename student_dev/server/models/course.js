let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}


exports.getCourses = async function(id) {
	var db = await connect();
	let result = {};
	let companies = []
	try {
		let data = await db.query('SELECT id, name, bot, email FROM company');
		for (let i = 0; i<data[0].length;i++) {
			var info = await db.query('SELECT id, name,title, content, cost, lessons, unlim, type FROM smartEdu.rate WHERE company = ? AND id not in (SELECT rate FROM smartEdu.request WHERE student = ?) AND id not in (SELECT rate FROM smartEdu._group as g, smartEdu.studentGroup as sg WHERE sg.student = ? AND sg._group = g.id)', [data[0][i]["id"], id, id]);
			data[0][i]["rates"] = info[0];
			companies.push(data[0][i]);
		}
		result = {
			status: 200,
			message: "getting courses",
			body: companies
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

exports.getCourse = async function(id) {
	var db = await connect();
	let result = {};
	let companies = []
	try {
		var info = await db.query(`	SELECT rate.id, rate.name, rate.title, rate.content, rate.cost, rate.lessons, rate.unlim, rate.type,
									company.name as company_name, company.bot, company.email as company_email 
									FROM smartEdu.rate, smartEdu.company 
									WHERE rate.id = ? AND company.id = rate.company`, [id]);
		result = {
			status: 200,
			message: "getting course info",
			body: info[0]
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