//Функция для уведомления преподов и студентов об окончании урока, закрывающая stream и уменьшающая nles
module.exports = async function lessonClose(con, date, today, socket, axios, bot)
{
	let finish = date.getHours();
	let [groups, fields2] = await con.query('select group_id from chart where day = ? and finish_time = ?', [today, finish]);
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
			msg 		: '',
			group_id 	: group_id,
			group_name 	: group_name
		} 

		if(group_type) body.msg = 'Закончилось занятие со студентом <a href="/student?id='+student_id+'">'+lastname +' '+ firstname +'</a>!';
		else body.msg = 'Закончилось занятие с группой <a href="/group?id='+group_id+'">'+group_name+'</a>!';

		await con.query('delete from usedtemplate where group_id = ?', group_id);
		await con.query('update teacher set les_count = les_count + 1  where teacher_id = ?', teacher_id);

		socket.clients.forEach( (ws) => 
			{
				if (ws.userid === teacher_id)
				{ 
					ws.send(JSON.stringify(body));
				}
			});
		let update = await con.query('update student set stream = 0, nles = nles-1 where group_id = ?', group_id);
		axios.post(bot, {group_id, notice: 0, text: 'Ваше занятие закончилось!'});
	}
}