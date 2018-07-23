let SQL = require('../database/query.js');

exports.checkPass = async function(email, pass)
{
	let res = await SQL('select * from teacher where email = ? and pass = ?', [email, pass]);
	if(res.length > 0) return true;
	else return false;
}

exports.getInfoByEmail = async function(email)
{
	return await SQL('select * from teacher where email = ?', email);
}

