//Функция для уведомления преподов и студентов о начале урока и открывающая stream для студентов
module.exports = async function lessonOpen(con, date, today, socket, axios, bot)
{
	let start = date.getHours();
	let [groups, fields2] = await con.query('select group_id from chart where day = ? and start_time = ?', [today, start]);
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

		if(group_type) body.msg = 'Началось занятие со студентом <a href="/student?id='+student_id+'">'+lastname +' '+ firstname+'</a>! <a href="/chat"> перейти к чату</a>';
		else body.msg = 'Началось занятие с группой <a href="/group?id='+group_id+'">'+group_name+' </a>! <a href="/chat"> перейти к чату</a>';

		await con.query('update gr set started = 1 where group_id = ?', group_id);

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
			let ins = await con.query('insert into notice(teacher_id, content) values (?,?)',[teacher_id, body.msg]);
		}

		let update = await con.query('update student set stream = 1 where group_id = ? and nles > 0', group_id);
		axios.post(bot, {group_id, notice: 0, text: 'Ваше занятие началось!'});
	}
}