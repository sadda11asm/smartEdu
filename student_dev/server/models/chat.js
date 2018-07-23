let mysql = require('mysql2/promise');
let dbconfig = require('../config.json');

async function connect(){
	let conn = await mysql.createConnection(dbconfig.db);
	console.log('DB Connected!');
	return conn;
}


exports.getChats = async function(id) {
	var db = await connect();
	let result = {};
	try {
		let data = await db.query(` select g.id, g.name,
									  (
									    select count(u.id) 
									    from smartEdu.unreadMes u 
									    join smartEdu.chat c on u.message = c.id
									  where u.user = ? and u.isteacher = 0 
									    and c._group = g.id
									    )
									as unread_count
									from smartEdu._group g
									join smartEdu.studentGroup sg on sg._group = g.id
									where sg.student = ?`, [id, id])
		result = {
			status: 200,
			message: "getting chats",
			body: data[0]
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

exports.getMessages = async function(group) {
	var db = await connect();
	let result = {};
	try {
		var info = await db.query(`	SELECT sender, content, title, type, isteacher, IF(isteacher,
									(select concat(firstname, ' ', lastname) from smartEdu.teacher t where t.id = c.sender),
									(select concat(firstname, ' ', lastname) from smartEdu.student s where s.id = c.sender)
									) as fio,
                                    IF(isteacher,
									(select firstname from smartEdu.teacher t where t.id = c.sender),
									(select firstname from smartEdu.student s where s.id = c.sender)
									) as sender_name
									FROM smartEdu.chat as c
									WHERE _group = ?`, [group]);
		result = {
			status: 200,
			message: "getting chat messages",
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

exports.readChat = async function(id, group) {
	var db = await connect();
	let result = {};
	try {
		var data = await db.query(`	DELETE FROM smartEdu.unreadMes
									WHERE user = ? AND message in 
									(SELECT id FROM smartEdu.chat WHERE _group = ? AND isteacher = 0)`, [id, group])
		result = {
			status: 200,
			message: "reading chat messages"
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