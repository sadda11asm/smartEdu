let SQL = require('../database/query');

exports.getEndedGroups = async function() {
	return await SQL('select id from _group where id not in (select _group from chart) and started = 1');
}

exports.getStudents = async function(_group) {
	return await SQL('select chat_id, id from student where _group = ?', _group);
}


exports.getTeacher = async function(_group) {
	return await SQL('select teacher from gr where group_id = ?', _group);
}

exports.getBotOfCompany = async function(teacher) {
	return await SQL('select bot from company where id in (select company from teacher where id = ?)', teacher);
}

exports.deleteGroup = async function(id) {
	await SQL('DELETE FROM _group WHERE id=?', id)
}

exports.updateGroup = async function(id) {
	await SQL('update student set _group = 0 where id = ?', id);
}