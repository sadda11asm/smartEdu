let model = require('../model/model');
module.exports = async function(id, data, socket) {
	try {
		if(data.teacher == undefined) throw new Error('teacher is undefined');
		if(data.rate == undefined) throw new Error('rate is undefined');
		// if (data.periods == undefined) throw new Error('periods is undefined')
		
		let userId = id.substr(1);

		// for (let i =0; i<data.periods.length;i++) {
		// 	await model.writeRequest(userId, data.teacherId, data.rate, data.periods[i]);
		// }

			

		data.student = (await model.getStudentInfoById(userId))[0].name;
		data.info = (await model.getRequestInfo(data.teacher, userId))[0]
		data.msg = "Новая заявка от студента " + data.student;
		let delivered = false;
		socket.clients.forEach((ws) => {
			if(ws.userid == 't' + data.teacher) {
				ws.send(JSON.stringify(data));
				console.log(`SENDED to teacher = ${data.teacherId} `, data);
				delivered = true;
			}
		});
		if (!delivered) {
			await model.insertNotice(data.teacher, data.msg, 0);
		}
		// delivered = false;
		// socket.clients.forEach((ws) => {
		// 	if(ws.userid == 's' + userId) {
		// 		ws.send(JSON.stringify({msg: 'request has been sent', data: data}));
		// 		console.log(`SENDED to student = ${data.teacher} `, data);
		// 	}
		// 	await model.
		// });		
	}
	catch(err) {
		console.log('ERROR::sendMessage::', err);	
	}
}