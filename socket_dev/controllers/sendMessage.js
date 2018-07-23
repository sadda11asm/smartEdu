let model = require('../model/model');
module.exports = async function(id, data, socket)
{
	try
	{
		if(data._group == undefined) throw new Error('_group is undefined');
		if(data.content == undefined) throw new Error('content is undefined');
		if(data.type == undefined) throw new Error('type is undefined');
		if(data.title == undefined) data.title = '';
		
		let userId = id.substr(1);

		if(id[0] == 's') data.isteacher = 0; 
		else if(id[0] == 't') data.isteacher = 1;
		else throw new Error('undefined id');

		data.sender = userId;

		let students = await model.getStudentsByGroup(data._group);
		let teacher  = await model.getTeacherByGroup(data._group);
		let getters=[];
		if(data.isteacher == 1) {
			data.sender_name = (await model.getTeacherInfoById(userId))[0].name;
			for (let i = 0;i<students.length;i++) {
				let obj = {};
				obj.id = students[i]["student"];
				obj.isteacher = 0;
				getters.push(obj);
			}
		} else {
			data.sender_name = (await model.getStudentInfoById(userId))[0].name;	
			for (let i = 0;i<students.length;i++) {
				if (data.sender!=students[i]["student"]) {
					let obj = {};
					obj.id = students[i]["student"];
					obj.isteacher = 0;
					getters.push(obj);
				}
			}	
			let obj = {};
			obj.id = teacher['id'];
			obj.isteacher = 1;
			getters.push(obj);
		}
		data.getters = getters;
		await model.writeMessage(data);
		for(let i=0; i<students.length; i++) {
			socket.clients.forEach((ws) => {
				if(ws.userid == 's'+students[i].student) {
					ws.send(JSON.stringify(data));
					console.log(`SENDED to student = ${students[i].student}`, data);
				}
			});
		}

		socket.clients.forEach((ws) => {
			if(ws.userid == 't' + teacher.id) {
					ws.send(JSON.stringify(data));
					console.log(`SENDED to teacher = ${teacher.id} `, data);
				}
		});

	}
	catch(err)
	{
		console.log('ERROR::sendMessage::', err);	
	}
}