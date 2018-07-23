let connect = require('../modules/connect');

module.exports = async function(req,res) 
{
	if(!req.cookies['SAI'])
	{
		res.status(418).json({message: 'no index'});
	}		
	else
	{
		if(!req.body.method)
		{
			res.status(405).json({message: 'no method'});
		}
		else
		{
			let con = await connect();
			try
			{
				switch(req.body.method)
				{
					case 'GET':
					if(!req.body.student_id)
					{
						let students = await con.query(`
													select firstname, lastname, ava, s.id as student_id 
													from student s
													join studentGroup sg on sg.student = s.id
													join _group g on g.id = sg._group 
													where g.teacher = ?`
							, [req.cookies['SAI']]);
						if(students[0].length > 0)
						{
							res.status(200).json({students: students[0]});
						}
						else
						{
							res.status(202).json({message: 'not found'});
						}
					}
					else
					{
						let student = await con.query(
							`select 
								s.firstname, s.lastname, s.phone, s.ava, s.id as student_id, 
								g.id as group_id, g.name as group_name, g.type as group_type, 
								l.name lvl_name, r.name rate_name, r.lessons 
							 from smartEdu._group g
							 join smartEdu.level l on l.id = g.level
							 join smartEdu.studentGroup sg on sg._group = g.id
							 join smartEdu.student s on s.id = sg.student
							 join smartEdu.rate r on r.id = g.rate
							 where s.id = ?`, [req.body.student_id]);
						
						let dat = await con.query(`
							select min('day') as 'day'
							from smartEdu.chart c
							join smartEdu._group g on c._group = g.id
							join smartEdu.studentGroup sg on sg._group = g.id
							join smartEdu.student s on s.id = sg.student
							where s.id = 1
							group by c._group`, req.body.student_id);
							
	        			if(dat[0].length > 0)
	        			{
	        				let date1 = new Date(dat[0][0].day);
							let value = date1.valueOf() + 60*60*24*8*1000;
							let date2 = new Date(value);

							let m1 = date1.getMonth()+1;
							let m2 = date2.getMonth()+1;

							let dateone = date1.getFullYear() + '-' + m1 + '-' + date1.getDate();
							let datetwo = date2.getFullYear() + '-' + m2 + '-' + date2.getDate();

							let chart = await con.query(`
										select c.day, c.start start_time, c.finish finish_time 
										from smartEdu.chart c
										join smartEdu.studentGroup sg on c._group = sg._group
										where sg.id = ? 
										and day > ? 
										and day < ?`
								, [req.body.student_id, dateone, datetwo]);
		        			if(student[0].length > 0)
							{
								if (chart[0].length > 0) 
								{
									res.status(200).json({student: student[0], chart: chart[0]});
								} 
								else 
								{
									res.status(200).json({student: student[0], chart: null});
								}
							}
							else
							{
								res.status(202).json({message: 'not found'});
							}
	        			}
	        			else
	        			{
	        				res.status(200).json({student: student[0], chart: null});
	        			}
					}
					break;
					default:
						res.status(405).json({message: 'Invalid method'});
					break;
				}
			}
			catch(err)
			{
				console.log(err);
			}
			finally
			{
				con.end();
				con.destroy();
			}
		}
	}
}