let model = require('../model/courseEnd');
module.exports = async function(id, data, socket) {
	try {
		let groups = await model.getEndedGroups();

		for(let i = 0; i<groups.length; i++) {
			let chats = await courseEnd.getStudents(groups[i].id)
			let teacher = (await courseEnd.getTeacher(groups[i].id))[0].id;

			let bot = (await courseEnd.getBotOfCompany(teacher_id))[0]["bot"];

			axios.post(bot, {notice: 4, chats: chats[0], teacher_id: teacher[0].id});

			await courseEnd.deleteGroup(groups[i].id);

			for(let j=0; j<bad_students[0].length; j++) {
				socket.clients.forEach((ws)=> {
					if (ws.userid == 's'+ chats[j]["id"]) {
						ws.send(JSON.stringify(data));
					}
				})
				await courseEnd.updateGroup(chats[j]["id"]);
			}
		}


	}
	catch(err) {
		console.log('ERROR::sendMessage::', err);	
	}
}