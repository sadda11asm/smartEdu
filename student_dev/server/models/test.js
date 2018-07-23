 let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}

exports.getCourseList = async function(id) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query(`	select r.id, r.name, 
									(
									    select count(res.id) 
									    from smartEdu.result res
									    join smartEdu.test t on res.test = t.id
									    where t.rate = r.id and res.count = null 
									) 
									cnt
									from smartEdu.rate r
									join smartEdu._group g on g.rate = r.id
									join smartEdu.studentGroup sg on sg._group = g.id
									where sg.student = ?`, [id]);	
		console.log("INFO", info);
		if (info[0].length==0) {
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

exports.getTests = async function(id, rate) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('	select t.id, t.name, l.name level, r.dt, r.isread, r.count\
									from smartEdu.test t\
									join smartEdu.result r on r.test = t.id\
									join smartEdu.level l on l.id = t.level\
									WHERE r.student = ? AND t.rate = ?', [id, rate]);
		if (info[0][0]==null) {
			result = {
				status: 202,
				message: "empty data"
			}
		} else {
			result = {
				status: 200,
				message: "getting tests of the course",
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

exports.getTest = async function(id, test) {
	var db = await connect();
	let result = {};
	try {
		var check = await db.query('select student from result where test = ?', [test])
		if (check[0][0]["student"]!=id) {
			result = {
				status: 404,
				message: "YOU ARE NOT MY USER! GO AWAY AND DO NOT TOUCH OUR INFO. SHIT!"
			}
		} else {
			var info = await db.query('	SELECT id, name, teacher, rate, level, dt  \
										FROM  test \
										WHERE id = ?', [test]);
			var data = await db.query('SELECT body FROM test WHERE test.id = ?', [test]);
			var bodyString = data[0][0]["body"];
			// console.log(bodyString);
			let body = JSON.parse(bodyString);
			// console.log(body);
			body.forEach((question) => {
				question.correct = null;
			})
			info[0][0].body = body;
			if (info[0][0]==null) {
				result = {
					status: 202,
					message: "empty data"
				}
			} else {
				result = {
					status: 200,
					message: "getting test by the id",
					body: info[0][0]
				}
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

exports.getResult = async function (id, test, res) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('SELECT body FROM test WHERE id = ?', [test]);
		var bodyString = info[0][0]["body"];
		let body = JSON.parse(bodyString);
		if (body==null) {
			result = {
				status: 202,
				message: "empty test"
			}
		} else {
			result = {
				status: 200,
				message: "getting tests of the course",
				body: body
			}
		}
	} catch (err) {
		// console.log(err);
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

exports.setResult = async function (id, count, test) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query('UPDATE result SET count = ? WHERE test = ? AND student = ?', [count, test, id]);
		result = {
			status: 200,
			message: "the result has been set",
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