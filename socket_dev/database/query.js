const mysql = require('mysql2/promise');

module.exports = async function(query, data)
{
	// console.log('QUERY:: ', query);
	// console.log('DATA:: ', data);
	let con = await mysql.createConnection(config.server);
	let result;
	try
	{
		if(data) [result] = await con.query(query, data);
		else 	 [result] = await con.query(query);
	}
	catch(err)
	{
		console.log("sql error", err);
	}
	finally
	{
		// console.log('RESULT:: ', result )
		con.end();
		return result;

	}
};