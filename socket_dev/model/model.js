let SQL = require('../database/query');

exports.getStudentsByGroup = async function(group)
{
	return await SQL('select student from studentGroup where _group = ?', group);
}

exports.writeMessage = async function(data)
{
	let insertId = (await SQL('insert into chat (_group, sender, content, title, type, isteacher) values(?,?,?,?,?,?)', 
		[data._group, data.sender, data.content, data.title, data.type, data.isteacher]))["insertId"];
	for (let i=0;i<data.getters.length;i++) {
		await SQL('insert into unreadMes (user, message, isteacher) VALUES (?,?,?)', [data["getters"][i]["id"], insertId, data["getters"][i]["isteacher"]]);
	}
}

exports.readMessage = async function(id, group)
{
	return await SQL('delete from unreadMes where user = ? and message in (select id from chat where _group = ?)', [id, group]);
}

exports.getTeacherByGroup = async function(group)
{
	let [teacher] = await SQL('select teacher as id from _group where id = ?', group); 
	return teacher;
}

exports.getTeacherInfoById = async function(id)
{
	return await SQL(`select id, concat(firstname, " ", lastname) AS fio, firstname as name, phone, email, ava, company from smartEdu.teacher where id = ?`, id);
}

exports.getGroupInfoById = async function(id)
{
	return await SQL(`select id, name, type from smartEdu._group where id = ?`, id);
}


exports.getStudentInfoById = async function(id)
{
	return await SQL('select id, concat(firstname, " ", lastname) as fio, firstname as name, phone, age, ava from smartEdu.student where id = ?', id);
}

exports.writeRequest = async function(studentId, teacherId, rate, req) {
	return await SQL('INSERT INTO request (student, start, finish, nday, rate, teacher) VALUES (?,?,?,?,?,?)', [studentId, req.start, req.finish, req.nday, rate, teacherId]);
}

exports.getGroupByStudent = async function(studentId) {
	return await SQL('SELECT _group FROM studentGroup WHERE student = ?', [studentId]);
}
exports.leaveGroup = async function(studentId, group) {
	await SQL('DELETE FROM studentGroup WHERE student = ?', [studentId]);
	let students = await this.getStudentsByGroup(group)
	if (!students[0]) {
		await SQL('DELETE FROM _group WHERE id = ?', [group])
	}
}
exports.deleteReq = async function(studentId) {
	let [teacherId] = (await SQL('SELECT teacher FROM request WHERE student = ?', [studentId]))["teacher"];
	await SQL('DELETE FROM request WHERE student = ?', [studentId])
	return teacherId;
}

exports.getStudentIdByRequestId = async function(reqId) {
	let [studentId] =  (await SQL('SELECT student FROM request WHERE id = ?', [reqId]))["student"];
	return studentId;
}

exports.addToGroup = async function(studentId, teacherId, data) {
	if (!data.group) {
		let groupId = (await SQL('INSERT INTO _group (name, type, started, teacher, rate, level) VALUES (?,?,?,?,?,?)', [data.name, data.type, data.started, teacherId, data.rate, data.level]))["insert_id"];
		await SQL('INSERT INTO studentGroup (student, _group) VALUES (?,?)', [studentId, groupId])
	} else {
		await SQL('INSERT INTO studentGroup (student, _group) VALUES (?,?)', [studentId, data.group])
	}
}

exports.getGroupByTeacherId = async function(teacherId) {
	let [_group] = (await SQL('SELECT id FROM _group WHERE teacher = ?', [teacherId]))["_group"];
	return _group;
}

exports.getStudentIdByGroup = async function(_group) {
	let [studentId] = (await SQL('SELECT student FROM studentGroup WHERE _group = ?', [_group])["student"]);
	return studentId;
}

exports.deleteOverdueCharts = async function(hour, day) {
	let data = await SQL('SELECT id FROM chart WHERE day < ? or (day = ? and finish <= ?)', [day, day, hour]);
	for (let i=0;i<data.length;i++) {
		let id = data[0]["id"];
		await SQL('DELETE FROM chart WHERE id = ?', id);
	}
}

exports.hasRead = async function(id, isteacher, _group) {
	await SQL('DELETE FROM unreadMes WHERE user = ? AND isteacher = ? AND message in (SELECT id FROM chat WHERE _group = ?)', [id, isteacher, _group]);
}

exports.getRequestInfo = async function(teacher, student) {
	return await SQL(`select s.id student_id, s.firstname, s.lastname, 
                      l.name lvl_name, r.dt req_dt, r.rate rate_id, rt.lessons 
                      from smartEdu.request r
                      join smartEdu.student s on s.id = r.student 
                      join smartEdu.level l on l.id = r.level
                      join smartEdu.rate rt on rt.id = r.rate
                      where r.teacher = ? and s.id = ?
                      group by s.id 
                      order by rt.lessons DESC`, [teacher, student]);
}

exports.insertNotice = async function(id, content, isstudent) {
	await SQL('insert into notice(user, content, isstudent) values(?,?,?)',[id, content, isstudent]);
}
exports.getGroupInfo = async function(rate, student) {
	return await SQL(`	SELECT g.id, g.name FROM smartEdu._group as g
						JOIN smartEdu.studentGroup as sg on sg._group = g.id
						WHERE g.rate = ? AND sg.student = ?`, [rate, student]);
}

exports.getRateInfo = async function(rate) {
	return await SQL(`	SELECT * from rate where id = ?`, [rate]);
}