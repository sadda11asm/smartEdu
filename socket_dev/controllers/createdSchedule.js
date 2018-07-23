let model = require('../model/model');
module.exports = async function(id, data, socket) {
	try {

		let userId = id.substr(1);
		data.studentId = data.student;
		// await addToGroup(studentId, userId, data);
		let group = await model.getGroupInfo(data.rate, data.studentId);
		let groupName = group[0]["name"];

		data.msg = "Преподаватель создал расписание в группе " + groupName;
		
		for(let i=0; i<students.length; i++) {
			let delivered = false;
			socket.clients.forEach((ws) => 
			{
				if(ws.userid == 's'+students[i].student) 
					{
						ws.send(JSON.stringify(data));
						console.log(`SENDED to student = ${students[i].student}`, data);
					}
			});
			if (!delivered) {
				await model.insertNotice(data.studentId, data.msg, 1);
			}
		}


		// socket.clients.forEach((ws) => {
		// 	if(ws.userid == id) {
		// 		ws.send(JSON.stringify(data));
		// 		console.log(`SENDED to teacher = ${data.studentId} `, data);
		// 	}
		// });
	}
	catch(err) {
		console.log('ERROR::sendMessage::', err);	
	}
}