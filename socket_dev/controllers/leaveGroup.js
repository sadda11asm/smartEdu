let model = require('../model/model');
module.exports = async function(id, data, socket) {
	try {

		let userId = id.substr(1);
		let group = data.group;

		// let group = (await model.getGroupByStudent(userId))[0]._group;
		data.teacher = (await model.getTeacherByGroup(group)).id;
		console.log("teacher", data.teacher)
		let studentName = (await model.getStudentInfoById(userId))[0].name; 
		let groupName = (await model.getGroupInfoById(group))[0].name
		await model.leaveGroup(userId, group);
		data.msg = "Студент " +  studentName + " покинул ваши занятия"	;
		let delivered = false;
		socket.clients.forEach((ws) => {
			if(ws.userid == 't' + data.teacher) {
				ws.send(JSON.stringify(data));
				console.log(`SENDED to teacher = ${data.teacher} `, data);
				delivered = true;
			}
		});
		if (!delivered) model.insertNotice(data.teacher, data.msg, 0);

		// socket.clients.forEach((ws) => {
		// 	if(ws.userid == 's' + userid) {
		// 		ws.send(JSON.stringify(data));
		// 		console.log(`SENDED to student = ${data.teacherId} `, data);
		// 	}
		// });
	}
	catch(err) {
		console.log('ERROR::sendMessage::', err);	
	}
}