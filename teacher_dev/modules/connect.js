//CONNECT TO DATABASE
const mysql = require('mysql2/promise');

async function connect()
{
	con = await mysql.createConnection({
		host 	: 'localhost',
		user 	: 'anvar',
		password: 'Anvar2018',
		database: 'smartEdu',
		port 	: 3306
	});
	return con;
}
module.exports = connect;