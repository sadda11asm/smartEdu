let SQL = require('../database/query');

exports.getGroupsByDay = async function(today, start) {
	return await SQL('select _group from chart where day = ? and start = ?', [today, start]);
}

exports.getGroupInfoById = async function(id) {
	return await SQL('select * from _group where id = ?',[id]);
}

exports.getStudentsInfoByGroup = async function(group) {
	return await SQL('select * from student where _group = ?', group);
}

exports.insertNotice = async function(id, content, isstudent) {
	await SQL('insert into notice(user, content, isstudent) values(?,?,?)',[id, content, isstudent]);
}

exports.getBotOfCompany = async function(teacher) {
	return await SQL('select bot from company where id in (select company from teacher where id = ?)', teacher);
}

exports.updateStream = async function(_group, value) {
	await SQL('update student set stream = ? where _group = ? and nles > 0', [value, _group]);
}