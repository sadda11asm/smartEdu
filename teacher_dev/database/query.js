let mysql = require('mysql2/promise');

module.exports = async function(query, data, flag)
{
	let con = await mysql.createConnection(config.server);
	try
	{
		if(data)
		{
			if(flag)
			{
				let result = await con.query(query, data);
				return result;
			}
			else
			{
				let [result] = await con.query(query, data);
				return result;
			}
		}
		else
		{
			if(flag)
			{
				let result = await con.query(query);
				return result;
			}
			else
			{
				let [result] = await con.query(query);
				return result;
			}
		}
	}
	catch(err)
	{
		console.log('Error ', err);
	}
	finally
	{
		con.end();
	}
}