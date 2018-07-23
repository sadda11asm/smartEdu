let connect = require('../modules/connect');
let config = require('../config/config');

module.exports = async function(req,res)
{
	if(!req.body.method)
	{
		res.status(405).json({message: 'no method'});
	}
	else
	{
		if(!req.cookies['SAI'])
		{
			res.status(418).json({message: 'no index'});
		}
		else
		{
			let con = await connect();
			try
			{
				switch(req.body.method)
				{
					case 'GET':
					if(!req.body.day)
					{
						let selected = await con.query('select * from chart where _group in (select id from _group where teacher = ? )',
							[req.cookies['SAI']]);

						if(selected[0].length > 0)
						{
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({message: 'Нет занятий!'});
						}
					}
					else
					{
						let selected = await con.query(`
														select g.type, g.name as group_name, g.id, c.day, c.start, c.finish, l.name as lvl_name
														from smartEdu.chart c
														join smartEdu._group g on c._group = g.id
														join smartEdu.level l on l.id = g.level
														where c.day = ?
														and g.teacher = ?
														group by g.id 
														order by c.start`
														,[req.body.day, req.cookies['SAI']]);
						if(selected[0].length > 0)
						{
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({body: 'Нет занятий!'});
						}
					}
					break;
					case 'GET-FULL':
					if(!req.body.firstday || !req.body.lastday)
					{
						res.status(418).json({message: 'no firstday or lastday'});
					}
					else
					{
						//Красные дни
						let redDays = [];

						let curdate 	= new Date(req.body.firstday);
						let lastday 	= new Date(req.body.lastday);

						let [all_chart] = await con.query('select * from chart where _group in (select id from _group where teacher = ? )'
							,req.cookies['SAI']);
						if(all_chart.length>0)
						{
							let [graph] = await con.query('select * from graph where teacher = ?', req.cookies['SAI']);
							if(graph.length > 0)
							{
								for(;;)
								{
									// Все занятия в этот день
									let lessons = [];
									for(let i=0; i<all_chart.length; i++)
									{
										let chart_day = new Date(all_chart[i].day);
										if(chart_day.getDate() == curdate.getDate()
											&&chart_day.getMonth() == curdate.getMonth()
											&&chart_day.getFullYear() == curdate.getFullYear())
											lessons.push(all_chart[i]);
									}

									if(lessons.length > 0)
									{
										// Время работы в этот день
										let start 	= 0;
										let finish 	= 0;

										for(let i = 0; i<graph.length; i++)
										{
											if(graph[i].nday == curdate.getDay())
											{
												start 	= graph[i].start;
												finish 	= graph[i].finish;
											}
										}

										let isred = true;
										if(start == 0 && finish == 0) isred = false;

										//Осталось проверить красный этот день или нет
										for(let i = start; i<finish; i++)
										{

											let count = 0;

											for(let j=0; j<lessons.length; j++)
											{
												if(i >= lessons[j].start && i+1 <= lessons[j].finish)
													count++;
												
											}

											if(count < config.groups)
											{
												isred = false;
												break;
											}
										}

										if(isred)
										{
											redDays.push(curdate);
										}
										else
										{
										}
									}

									curdate = new Date(curdate.valueOf() + 1000*60*60*24);
									if(	curdate.getDate() == lastday.getDate() 
										&& curdate.getMonth() == lastday.getMonth() 
										&& curdate.getFullYear() == lastday.getFullYear())
										break;
								}

								res.status(200).json({mas: redDays});
							}
							else
							{
								res.status(200).json({mas: []})
							}

						}
						else
						{
							res.status(200).json({mas: []})
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
				con.destroy();
				con.end();
			}
		}
	}
}