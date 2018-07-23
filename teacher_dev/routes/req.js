let connect = require('../modules/connect');
let config = require('../config/config');

function cross(s1, f1, s2, f2)
{
	if(s1 >= f2 || s2 >= f1 ) return false;
	else return true;
}

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
				//Отклоняем заявку
					case 'REJECT':
					if(!req.cookies['SAI'] || !req.body.student_id)
					{
						res.status(418).json({message: 'no index or student_id'});
					}
					else
					{
						let deleted = await con.query('delete from request where student = ? and teacher = ?', 
							[req.body.student_id, req.cookies['SAI']]);

						if(deleted[0].affectedRows > 0)
						{
							res.status(200).json({message: 'success'});

							let chat = await con.query('select chat_id from student where id = ?', req.body.student_id);
							let chat_id = chat[0][0].chat_id;

							// sendMessage({notice: 3, chat_id, text: 'Преподаватель ' + req.cookies['SAT'] + ' отклонил вашу заявку! Подайте новую заявку /request другому преподавателю.'});
						}
						else
						{
							res.status(202).json({message: 'not found'});
						}
					}
					break;
				//Создаем группу и записываем туда студента
					case 'TAKE-ON':
					if(!req.body.group_name || !req.body.mas || !req.body.group_type || !req.body.student_id || !req.body.rate)
					{
						res.status(418).json({message: 'no group_name or group_type or student_id or mas'});
					}
					else
					{
						if(req.body.group_type == 1 && !req.body.day)
						{
							res.status(418).json({message: 'no firstday'});
						}
						else
						{
							let mas 		= req.body.mas.split(',');
							let group_name 	= req.body.group_name;
							let group_type 	= req.body.group_type;
							let student_id 	= req.body.student_id; 
							let day 		= req.body.day;
							let rate_id     = req.body.rate;
							let lessons 	= 0;
							let date;
							//Будем искать логическую ошибку и пытаться испортить этот флаг fl
							let fl = true;
							//Сначала проверяем наш график работы
							let [graph] = await con.query('select * from graph where teacher = ?', [req.cookies['SAI']]);

							//Каждую присланную дату будем проверять на совпадение с нашим графиком
							for(let j = 0; j < mas.length; j = j+3)
							{
								//зануляем флаг
								let flag = false;
								//Пробегаем по нашему графику
								for(let i = 0; i < graph.length; i++)
								{	
									//Когда нашли подходящую запись, которая удовлетворяет присланной дате
									if(graph[i].nday == mas[j] && mas[j+1] >= graph[i].start && mas[j+2] <= graph[i].finish)
									{
										//Флаг становится хорошим
										flag = true;
									} 
								}

								//Если не нашлась подходящая запись (мы явно не работаем в это время)
								if(!flag)
								{
									//Флаг, который все время ждет ошибку становится плохим
									fl = false;
									//возвращаем день недели в которой произошла накладка
									res.status(202).json({ code: 1,day:  mas[j], start: mas[j+1], finish: mas[j+2]});
									//ну и цикл тормозим, ошибку нашли дальше делать нечего
									break;
								}
							}

							//Если флаг еще нормальный/ Ошибку еще не встретили
							if(fl)
							{
								let [rate_info] = await con.query('select * from rate where id = ?'
									, rate_id);
								lessons = rate_info[0].lessons;

								let dayIsOk = false;

								if(group_type == 1)
								{
									date = new Date(day);

									for(let i=0; i<mas.length; i=i+3)
									{
										if(date.getDay() == mas[i])
										{
											dayIsOk = true;
										}
									}

									let now = new Date();

									if(date < now)
									{
										dayIsOk = false;
									}
								}
								else
								{
									dayIsOk = true;
								}

								if(!dayIsOk)
								{
									fl = false;
									res.status(202).json({code: 5,message: 'Неправильная дата первого занятия!'});
								}
								else
								{
									if(group_type == 1)
									{
										let allcheked = false;
										let count = 0;
										while(!allcheked)
										{
											let m = date.getMonth()+1;
											let today = date.getFullYear() + '-' + m + '-' + date.getDate();

											let [dailychart] = await con.query(`
													select * from chart where day = ? and _group in
													(select id from _group where teacher = ?)`, 
													[today, req.cookies['SAI']]);
											let ms = [];

											for(let i = 0; i<mas.length; i=i+3)
											{
												if(date.getDay() == mas[i])
												{
													ms.push(mas[i+1]);
													ms.push(mas[i+2]);
												}
											}
											for(let j = 0; j<ms.length; j= j+2)
											{
												let kol = 0;
												for(let i = 0; i<dailychart.length; i++)
												{
													if(cross(ms[j], ms[j+1], dailychart[i].start, dailychart[i].finish))
													{
														kol++;
													}
												}

												if(kol >= config.groups)
												{
													fl = false;
													res.status(202).json({code: 2, today});
													break;
												}
												else
												{
													count ++;
												}
											}

											if(!fl) break;
											if(count == lessons) break;
											date = new Date(date.valueOf() + 1000*60*60*24);
										} 
									}
								}
							}

							//Если до этого момента флаг остался хорошим, то данные прошли почти все проверки и можно записывать студента в группу и тд.
							if(fl)
							{	
								//Проверим есть ли такая группа, чтобы их названия не повторялись, иначе запутаемся
								let select = await con.query('select * from _group where name = ? and teacher = ?', [group_name, req.cookies['SAI']]);
								if(select[0].length > 0)
								{
									//Повторили название группы, тогда отправим ошибку с кодом 3, чтобы исправляли
									res.status(202).json({code: 3,message: 'Не повторяйте названия групп! У вас уже такая есть!'});
								}
								else
								{
									let level = (await con.query('select level from request where student = ? and rate = ?', [student_id, rate_id]))[0][0];
									let ins = await con.query('insert into _group(name, teacher, type, rate, level) values (?,?,?,?,?)'
										,[group_name, req.cookies['SAI'], group_type, rate_id, level.level]);

									//Если получилось, то все ок
									if(ins[0].affectedRows > 0)
									{
										let group_id = ins[0].insertId;

										//Даем студенту эту группу
										await con.query('insert into studentGroup(_group, student) values (?,?)',[group_id, student_id]);

										if(group_type == 1)
										{
											//Теперь составим расписание для этой группы
											let enough = false;
											let today = new Date(req.body.day);
											let count = 0;

											while(!enough)
											{
												let m = today.getMonth() + 1;
												let day = today.getFullYear() + '-' + m + '-' + today.getDate(); 

												let ms = [];

												for(let i = 0; i<mas.length; i=i+3)
												{
													if(today.getDay() == mas[i])
													{
														ms.push(mas[i]);
														ms.push(mas[i+1]);
														ms.push(mas[i+2]);
													}
												}

												for(let i = 0; i<ms.length; i=i+3)
												{
													let insert = await con.query('insert into chart(_group, day, start, finish, lesson) ' + 
													' values(?,?,?,?,?)', [group_id, day, ms[i+1], ms[i+2], count+1]);
													
													count ++;
													if(count == lessons) 
													{
														enough = true;
														break;
													}
												}
												if(enough) break;
												today = new Date(today.valueOf() + 1000*60*60*24);
											}
										}
										else
										{
											for(let i = 0; i<mas.length; i=i+3)
											{
												await con.query('insert into groupRequest(_group, start, finish, nday, teacher) values (?,?,?,?,?)',
													[group_id, mas[i+1], mas[i+2], mas[i], req.cookies['SAI']]);
											}
										} 
						
										let deleted = await con.query('delete from request where student = ?', student_id);
										res.status(200).json({message: 'Успешно обработана заявка'});
										let chat_id = await con.query('select chat_id from student where id = ?', student_id);
										chat_id = chat_id[0][0].chat_id;

										if(group_type == 1)
										{
											// sendMessage({notice: 2, chat_id, group_id, text: 'Преподаватель '+ req.cookies['SAT'] +' добавил вас!'});
										}
										else
										{
											// sendMessage({notice: 2, chat_id, group_id, text: 'Преподаватель '+ req.cookies['SAT'] +' добавил вас в группу "'+ group_name +'"! Совсем скоро мы составим ваше расписание!'});
										}

										if(group_type == 1)
										{
											// sendMessage({notice: 6, group_id });
										}
									}
									else
									{
										//Сюда код может привести только в самых крайних случаях
										console.log('Непредвиденные проблемы с записью новой группы в методе TAKE-ON роут /req! Записывает '+ req.cookies['SAT'] + ' с id '+ req.cookies['SAI']);
										//Отправим ошибку с кодом 4 / это уже тревожно
										res.status(202).json({ code: 4,message: 'Непредвиденные проблемы с записью! Если вы читаете это сообщение, обязательно сообщите нам! Это наша ошибка!'});
									} 
								}
							}
						}
					}
					break;
				//Записываем студента в группу
					case "TAKE-IN":
					if(!req.body.group_id || !req.body.student_id)
					{
						res.status(418).json({message: 'no group_id or student_id'});
					}
					else
					{
						//В первую очередь даем студенту группу
						let updated = await con.query('insert into studentGroup(_group, student) values (?,?)', [req.body.group_id, req.body.student_id]);
						if(updated[0].affectedRows > 0)
						{
							//Если все ок, удаляем его запрос, т.к. мы его удовлетворили
							let deleted = await con.query('delete from request where student = ?', [req.body.student_id]);
							if(deleted[0].affectedRows > 0)
							{
								let chartUpdated = false;
								//когда обработали запрос, нужно сообщить об этом студенту
								//берем его chat_id
								let [chat, fl] = await con.query('select chat_id from student where id = ?', req.body.student_id);
								let chat_id = chat[0].chat_id;
								
								//берем название группы, в которую его записали
								let group_name = await con.query('select name group_name from _group where id = ?', req.body.group_id);
								group_name = group_name[0][0].group_name;

								//Сообщаем ему новость
								// sendMessage({notice: 2, chat_id: chat_id, group_id: req.body.group_id, text: 'Преподаватель '+ req.cookies['SAT'] +' добавил вас в группу "'+ group_name +'"! Совсем скоро мы составим ваше расписание!'});

								let check_sh = await con.query('select * from chart where _group = ?', req.body.group_id);
								//Расписания нет
								if(check_sh[0].length == 0)
								{
									let check_amount = await con.query('select count(*) as count from studentGroup group by _group having _group = ?', req.body.group_id);
									//Количество студентов удовлетворительное
									if(check_amount[0][0].count >= config.min_students)
									{

										//Теперь составим расписание для этой группы
										let group_id = req.body.group_id;
										let enough = false;
										let today = new Date();
										let count = 0;
										let lessons = await con.query('select lessons from rate where id in (select rate from _group where id = ?)'
											, group_id);
										lessons = lessons[0][0].lessons;

										console.log('Нужно уроков: ' + lessons )

										let Greq = await con.query('select * from groupRequest where _group = ?', group_id);
										Greq = Greq[0];

										while(!enough)
										{
											let m = today.getMonth() + 1;
											let day = today.getFullYear() + '-' + m + '-' + today.getDate(); 

											console.log('Проверяем день: ' + today);

											let ms = [];

											for(let i = 0; i<Greq.length; i++)
											{
												if(today.getDay() == Greq[i].nday)
												{
													let dailychart = await con.query('select * from chart where _group in (select id from _group where teacher = ?) and day = ?',
														[req.cookies['SAI'], day]);

													let kol = 0;

													for(let d = 0; d < dailychart[0].length; d++)
													{
														if(cross(Greq[i].start, Greq[i].finish
															, dailychart[0][i].start, dailychart[0][i].finish))
														{
															kol++;
														}
													}

													if(kol < config.groups)
													{
														console.log('Подходит день!');
														ms.push(Greq[i].start);
														ms.push(Greq[i].finish);
													}
												}
											}

											for(let i = 0; i<ms.length; i=i+2)
											{

												console.log('Создаем урок');
												let insert = await con.query('insert into chart(_group, day, start, finish, lesson) ' + 
												' values(?,?,?,?,?)', [group_id, day, ms[i], ms[i+1], count+1]);
												
												count ++;
												if(count == lessons) 
												{
													enough = true;
													break;
												}
											}
											if(enough) break;
											today = new Date(today.valueOf() + 1000*60*60*24);
										}
										chartUpdated = true;
										await con.query('delete from groupRequest where _group = ?', req.body.group_id);

										// sendMessage({notice: 6, group_id: req.body.group_id });

									}
								}


								res.status(200).json({message: 'запрос обработан', chartUpdated});
							}
							else
							{
								//Если запрос не удален, то придется его еще раз обрабатывать
								res.status(202).json({message: 'запрос не удален'});
							}
						}
						else
						{
							//Если у студента уже есть эта группа, то....
							//Это нереально 
							res.status(202).json({message: 'запрос не обработан'});
						}
					}
					break;
				//Выдает подходящие группы
					case 'GET-GROUPS':
					if(!req.body.student_id || !req.body.rate)
					{
						res.status(418).json({message: 'no student_id or rate'});
					}
					else
					{
						let mas = [];
						let reqs = await con.query('select * from request where student = ? and rate =?', [req.body.student_id, req.body.rate]);

						let groups = await con.query(`
									select g.name group_name, g.id group_id, count(s.id) kol 
									from smartEdu._group g 
									join smartEdu.studentGroup sg on sg._group = g.id
									join smartEdu.student s on s.id = sg.student
									where g.level = ?
									and g.teacher = ? 
									and g.rate = ?
									group by g.id 
									having count(s.id) <= ${config.students}`, 
									[reqs[0][0].level,req.cookies['SAI'], reqs[0][0].rate]);

						console.log('Всего групп');
						console.log(groups[0])

						if(groups[0].length > 0)
						{
							for(let i = 0; i<groups[0].length; i++ )
							{
								let group = groups[0][i];

								console.log('Проверяем группу:')
								console.log(group)

								let gr_req = await con.query('select * from groupRequest where _group = ?', group.group_id);
								gr_req = gr_req[0]
							
								let ok = true;

								for(let j = 0; j < gr_req.length; j++)
								{
									let notOk = true; 
									let gr = gr_req[j];
									console.log('Сравниваем: ')
									console.log(gr)
									console.log('с')
									for(let c = 0; c < reqs[0].length; c++)
									{
										let req = reqs[0][c];
										console.log(req);
										if(gr.start >= req.start && gr.finish<= req.finish && gr.nday == req.nday)
										{
											console.log('Есть совпадение!')
											notOk = false;
										}
									}

									if(notOk)
									{
										console.log('Ни одного совпадения')
										ok = false;
										break;
									}
								}

								if(ok)
								{
									console.log('Добавили группу')
									mas.push(group);
								}
							}

							res.status(200).json({mas});
						}
						else
						{
							res.status(200).json({mas: []});
						}
					}
					break;
				//Выдает все заявки
					case "GET":
					let re 	= await con.query(`
											select s.id student_id, s.firstname, s.lastname, 
											l.name lvl_name, r.dt req_dt, r.rate rate_id, rt.lessons 
											from smartEdu.request r
											join smartEdu.student s on s.id = r.student 
											join smartEdu.level l on l.id = r.level
											join smartEdu.rate rt on rt.id = r.rate
											where r.teacher = ?
											group by s.id 
											order by rt.lessons DESC`, 
											[req.cookies['SAI']]);

					if(re[0].length >0)
					{
						res.status(200).json({body: re[0]});
					}
					else
					{
						res.status(202).json({message: 'not found'});
					}
					break;
				//Выдает график заявки студента
					case "GET-GRAPH":
					if(!req.body.student_id)
					{
						res.status(418).json({message: 'no student_id'});
					}
					else
					{
						let select = await con.query(`
										select start, finish, nday, r.dt, rt.id rate_id, rt.name rate_name, rt.title rate_title, 
										rt.cost rate_cost, rt.lessons, rt.unlim, rt.type group_type 
										from request r, rate rt 
										where r.student = ? 
										and r.rate = rt.id 
										order by nday`, 
										[req.body.student_id]);
						if(select[0].length > 0)
						{
							res.status(200).json({body: select[0]});
						}
						else
						{
							res.status(202).json({message: 'not found'});
						}
					}
					break;
				//Ошибка
					default:
					res.status(405).json({message: 'Invalid method'});
					break;
				}
			}
			catch(err)
			{
				console.log('ERROR: ',err);
			}
			finally
			{
				con.destroy();
				con.end();
			}
		}
	}
}