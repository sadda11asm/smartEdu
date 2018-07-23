let model = require('../model/model');
module.exports = async function(id, data, socket) {
	try {

		let userId = id.substr(1);

		
		data.teacherId = await model.deleteReq(userId);
				
		socket.clients.forEach((ws) => {
			if(ws.userid == 't' + data.teacherId) {
				ws.send(JSON.stringify(data));
				console.log(`SENDED to teacher = ${data.teacherId} `, data);
			}
		});

		socket.clients.forEach((ws) => {
			if(ws.userid == id) {
				ws.send(JSON.stringify(data));
				console.log(`SENDED to student = ${data.teacherId} `, data);
			}
		});
	}
	catch(err) {
		console.log('ERROR::sendMessage::', err);	
	}
}