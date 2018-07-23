let model = require('../model/model');
module.exports = async function(id, data, socket) {
	try {

		let userId = id.substr(1);
		data.studentId = data.student;
		// await addToGroup(studentId, userId, data);
		let rate = await model.getRateInfo(data.rate);
		let rateName = rate[0]["name"];

		data.msg = "Преподаватель отклонил вашу заявку по курсу " + rateName;
		let delivered = false;

		socket.clients.forEach((ws) => {
			if(ws.userid == 's' + data.studentId) {
				ws.send(JSON.stringify(data));
				console.log(`SENDED to student = ${data.studentId} `, data);
				delivered = true;
			}
		});

		if (!delivered) {
			await model.insertNotice(data.studentId, data.msg, 1);
		}

	}
	catch(err) {
		console.log('ERROR::sendMessage::', err);	
	}
}