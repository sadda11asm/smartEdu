//Функция для уведомления преподов и студентов о приближении уроков
module.exports = async function prevNotice(con, date, today, socket, axios, bot)
{
	let start = Number(date.getHours()) + 1;
	let [groups, fields1] = await con.query('select group_id from chart where day = ? and start_time = ?', [today, start]);
	for(let i = 0; i<groups.length; i++)
	{
		let group_info = await con.query('select * from gr where group_id = ?', groups[i].group_id);
		let students_info = await con.query('select * from student where group_id = ?', groups[i].group_id);

		let student_id  = students_info[0][0].student_id;
		let firstname 	= students_info[0][0].firstname;
		let lastname 	= students_info[0][0].lastname;
		let teacher_id 	= group_info[0][0].teacher_id;
		let group_type 	= group_info[0][0].group_type;
		let group_id 	= group_info[0][0].group_id;
		let group_name 	= group_info[0][0].group_name;

		body = 
		{
			socket_type : 2,
			msg 		: ''
		} 

		if(group_type) 
			body.msg = 'Через час в '+start+':00 у вас занятие со студентом <a href="/student?id='+student_id+'">'+lastname +' '+ firstname +'</a>!';
		else 
			body.msg = 'Через час в '+start+':00 у вас занятие с группой <a href="/group?id='+group_id+'">'+group_name+'</a>!';
		
		let delievered = false;
		socket.clients.forEach( (ws) => 
			{
				if (ws.userid === teacher_id)
				{
					ws.send(JSON.stringify(body));
					delievered = true;
				}
			});

		if(!delievered)
		{
			let ins;
			if(group_type) 
				ins = await con.query('insert into notice(teacher_id, content) values(?,?)'
				,[teacher_id, 'В '+ start+':00 у вас начнется занятие со студентом <a href="/student?id='+student_id+'">'+lastname +' '+ firstname +'</a>!']);
			else
				ins = await con.query('insert into notice(teacher_id, content) values(?,?)'
				,[teacher_id, 'В '+ start+':00 у вас начнется занятие с группой <a href="/group?id='+group_id+'">'+group_name+'</a>!']);
		}

		axios.post(bot, {group_id, notice: 0, text: 'Ваше занятие начнется через один час!'});
	}
}