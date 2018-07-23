//Функция для уведомления преподов и студентов о приближении уроков
let lessonOpen = require('../model/cron')
module.exports = async function (date, today, socket, axios) {
	let start = Number(date.getHours());
	
	let groups = await lessonOpen.getGroupsByDay(today, start);
	
	for(let i = 0; i<groups.length; i++) {
		let group_info = await lessonOpen.getGroupInfoById(groups[i].group_id)
		let students_info = await lessonOpen.getStudentsInfoByGroup(groups[i].group_id);

		//Только если индивидульно 
		let student_id  = students_info[0].id;
		let firstname 	= students_info[0].firstname;
		let lastname 	= students_info[0].lastname;

		let teacher_id 	= group_info[0].teacher_id;
		let group_type 	= group_info[0].group_type;
		let group_id 	= group_info[0].group_id;
		let group_name 	= group_info[0].group_name;

		let bot = (await prevNotice.getBotOfCompany(teacher_id))[0]["bot"];

		body = {
			socket_type : 2,
			msg 		: ''
		} 

		if(group_type) 
			body.msg = 'Началось занятие со студентом <a href="/student?id='+student_id+'">'+lastname +' '+ firstname+'</a>! <a href="/chat"> перейти к чату</a>';
		else body.msg = 'Началось занятие с группой <a href="/group?id='+group_id+'">'+group_name+' </a>! <a href="/chat"> перейти к чату</a>';
		
		let delivered = false;
		socket.clients.forEach( (ws) => {
				if (ws.userid === teacher_id) {
					ws.send(JSON.stringify(body));
					delivered = true;
				}
			});

		if(!delivered) {
			let ins;
			if(group_type) 
				await prevNotice.insertNotice(teacher_id, 'Началось занятие со студентом <a href="/student?id='+student_id+'">'+lastname +' '+ firstname +'</a>!', 0)
			else
				await prevNotice.insertNotice(teacher_id, 'Началось занятие с группой <a href="/group?id='+group_id+'">'+group_name+'</a>!', 0);
		}

		for (let j=0;j<students_info.length;j++) {
			delivered = false;
			socket.clients.forEach( (ws) => {
					if (ws.userid === students_info[j]["id"]) {
						ws.send(JSON.stringify({group_id, notice: 0, text: 'Ваше занятие начнилось!'}));
						delivered = true;
					}
				});

			if(!delivered) {
				let ins;
				if(group_type) 
					await prevNotice.insertNotice(students_info[j]["id"], 'Ваше занятие начилось!' , 1)
				else
					await prevNotice.insertNotice(students_info[j]["id"], 'Ваше занятие начилось!' , 1);
			}
		}

		await lessonOpen.updateStream(group_id, 1);
		axios.post(bot, {group_id, notice: 0, text: 'Ваше занятие начилось!'});
	}
}