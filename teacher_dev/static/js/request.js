
/*Добавление студента в группу*/
 document.getElementById('accept_btn').addEventListener('click', function()
	{
		let checkboxes = document.getElementById('groups').getElementsByClassName('chb');
		let group_id;
		for(let i = 0; i< checkboxes.length; i++)
		{
			if(checkboxes[i].checked)
			{
				group_id = checkboxes[i].id.split('=')[1];
			}
		}
		
		if(!group_id)
		{
			notifier('Выберите группу!', 'red');
			return;
		}

		POST('/req', 'method=TAKE-IN&&' + 'group_id=' + group_id + '&&student_id=' + current_student_id , (req) =>
			{
				if(req.status == 200)
				{
					notifier('Заявка успешно обработана!\nСтудент добавлен. Ваше расписание изменилось.', 'green');

					document.querySelector('.back').style.display = 'none';
					document.getElementById('new_group').style.display = 'none';
					document.getElementById('graph').style.display = 'none';

					document.getElementById('reqs').removeChild(document.getElementById('li='+current_student_id));
					ws.send(JSON.stringify({
						notice: 	5,
						student: 	current_student_id,
						rate: 		current_rate
					}));

					let res = JSON.parse(req.response);
					if(res.chartUpdated)
						ws.send(JSON.stringify({
							notice: 7,
							student: current_student_id,
							rate: 		current_rate
						}));
				}
				else
				{
					let res = JSON.parse(req.response);
					notifier(res.message, 'red');
				}
			});
	});

/*Открываем окно добавления группы и переносим график*/
	document.getElementById('new_group_btn').addEventListener('click',function()
	{
		console.log(current_group_type)
		document.getElementById('new_group_name_title').innerHTML = 'Название группы';
		document.getElementById('new_group_name_title').style.display = 'block';
		document.getElementById('new_group_title').innerHTML = 'Новая группа';
		document.getElementById('new_group').style.display = 'block';
		document.getElementById('new_group_name').value = '';
		document.getElementById('new_group_name').disabled = false;

		if(current_group_type == 0)	document.getElementById('firstday').style.display = 'none';
		else document.getElementById('firstday').style.display = 'block';
		
		generateGraph();
	});

/*Доставка нужных групп либо создание индивидуальной*/
	document.getElementById('accept').addEventListener('click', function(e)
	{
		if(current_group_type == 0)
		{
			document.querySelector('.back').style.display = 'block';

			let div = document.getElementById('cont');
			div.innerHTML = '';
			
			POST('/req', 'method=GET-GROUPS&&student_id='+current_student_id +'&&rate=' +current_rate, (requ)=>
				{
					let res = JSON.parse(requ.response);
					let mas = res.mas;
					if(requ.status == 200)
					{
						for(let i = 0; i < mas.length; i++)
						{
							let chb = document.createElement('input');
							let label = document.createElement('label');
							chb.type = 'radio';
							chb.name = 'group';
							chb.id = 'b='+ mas[i].group_id;
							chb.classList.add('chb');
							chb.style.display = 'none';
							label.style.display = 'inline-block'
							label.classList.add('lbl')
							label.innerHTML = '<label for="b='+mas[i].group_id+'">'+mas[i].group_name+' ('+mas[i].kol+')'+'</label>';

							div.appendChild(chb);
							div.appendChild(label);
						}
						if(mas.length == 0)
						{
							notifier('Подходящих групп не найдено!', 'blue');
							div.innerHTML = 'не найдено!';
							document.getElementById('groups').style.display = 'none';
							document.getElementById('new_group_btn').click();
						}
						else
						{
							document.getElementById('groups').style.display = 'block';
						}
					}
				});
		}
		else
		{
			document.getElementById('new_group_title').innerHTML = 'График для студента';
			document.getElementById('new_group_name_title').style.display = 'none';
			document.getElementById('new_group_name').value = current_student_name + '-' + current_student_id;
			document.getElementById('new_group_name').disabled = true;

			document.querySelector('.back').style.display = 'block';
			document.getElementById('new_group').style.display = 'block';
			document.getElementById('firstday').style.display = 'block';
			generateGraph();
		}
		
	});

// Функция генерирует график с выборками времени
	function generateGraph()
	{
		let table = document.getElementById('grafik');
		table.innerHTML = '';

		let chld = document.getElementById('tbl').children;

		for(let i = 0; i<chld.length; i++)
		{
			let tr = document.createElement('tr');
			let td1 = document.createElement('td');
			let td2 = document.createElement('td');
			let td3 = document.createElement('td');
			///////////////////////td 1
			td1.innerHTML = '<span class="day_in_line">'+chld[i].children[0].innerHTML+'</span>';
			
			///////////////////////td2
			let select = document.createElement('select');

			select.setAttribute('nday', chld[i].getAttribute('nday'));
			let option = document.createElement('option');
			option.innerHTML = 'нет';
			select.appendChild(option);
			select.classList.add('jm_select');
			let start = Number(chld[i].children[1].innerHTML.split(':')[0]);
			let finish = Number(chld[i].children[2].innerHTML.split(':')[0]);

			for(let i = start; i < finish; i++)
			{
				let option = document.createElement('option');
				option.value = i;
				option.innerHTML = i + ':00'
				select.appendChild(option); 
			}			
			if(unlim)
			{
				select.value = start;
				select.disabled = true;
			}

			///////////////////////td3
			let sel = document.createElement('select');
			let opt = document.createElement('option');
			opt.innerHTML = 'нет';
			sel.appendChild(opt);
			sel.classList.add('jm_select');

			for(let i = start+1; i <= finish; i++)
			{
				let opt = document.createElement('option');
				opt.value = i;
				opt.innerHTML = i + ':00'
				sel.appendChild(opt); 
			}
			if(unlim)
			{
				sel.value = finish;
				sel.disabled = true;
			}
			if(unlim == 0)
			{
				select.addEventListener('change', function()
				{
					if(select.value != 'нет')
					sel.value = Number(select.value)+1;
					else sel.value = 'нет';
				});
				sel.addEventListener('change', function()
					{
						if(sel.value != 'нет')
						select.value = Number(sel.value)-1;
						else select.value = 'нет';
					});
			}

			td2.appendChild(select);
			td3.appendChild(sel);

			tr.appendChild(td1);
			tr.appendChild(td2);
			tr.appendChild(td3);
			table.appendChild(tr);
		}
	}

// Функция возвращает день недели по номеру
	function getDayName(i)
	{
		switch(i)
		{
			case 0: return 'Воскресенье';
			case 1: return 'Понедельник';
			case 2: return 'Вторник';
			case 3: return 'Среда';
			case 4: return 'Четверг';
			case 5: return 'Пятница';
			case 6: return 'Суббота';
			default: return 'День сурка';
		}
	}

// Функция добавляет заявку в указанный список(нижний или верхний)
	function setReq(ul, body)
	{
		// Элемент списка 
		let li = document.createElement('li');
		li.id = 'li=' + body.student_id;

		// Radiobutton
		let chb = document.createElement('input');
		chb.id = 'chb=' + body.student_id;
		chb.type = 'radio'; 
		chb.name = 'req';
		chb.classList.add('chb');
		chb.style.display = 'none';
		chb.setAttribute('student_name', body.lastname + ' ' + body.firstname);

		// Label внешний
		let lbl = document.createElement('label');
		lbl.classList.add('student_name');
		lbl.setAttribute('type', 'lbl='+ body.student_id);

		// Дата заявки
		let date = new Date(body.req_dt);
		let mounth = date.getMonth() +1;
		let dt = date.getHours() + ":"+date.getMinutes() + ' ' +  date.getDate() + '.'+mounth+'.'+date.getFullYear();
		
		// Имя студента
		let name = body.lastname + ' ' + body.firstname;

		// Записываем ися студента и его уровень во внутренний label.
		lbl.innerHTML = "<label for = 'chb="+ body.student_id+"'><p>"+
		name+ '</p><a>' + body.lvl_name + '</a></label>';

		// Событие при выборе заявки
		chb.addEventListener('change',getStudentReq);

		// Дата заявки
		let a = document.createElement('a');
		a.classList.add('a_date');
		a.innerHTML = dt;

		li.appendChild(chb);
		li.appendChild(lbl);
		li.appendChild(a);
		ul.appendChild(li);
	}

// Функция выводит заявку студента
	function getStudentReq(e) 
	{
		document.getElementById('graph').style.display = 'inline-block';
		let id = e.target.id.split('=')[1];

		document.getElementById('accept').setAttribute('stid', id);
		POST('/req', 'method=GET-GRAPH&&student_id='+id, (req)=>
			{
				if(req.status == 200)
				{
					let res = JSON.parse(req.response);
					let body = res.body;
					lessons = body[0].lessons;
					current_group_type = body[0].group_type;
					current_student_id = id;
					current_rate = body[0].rate_id;
					unlim = body[0].unlim;
					current_student_name = e.target.getAttribute('student_name');
					document.getElementById('rate_name').innerHTML = body[0].rate_name;
					document.getElementById('rate_name').title = body[0].rate_title;

					let table = document.getElementById('tbl');
					table.innerHTML = '';
					for(let i = 0; i < body.length; i++)
					{
						let tr = document.createElement('tr');
						tr.setAttribute('nday', body[i].nday);
						let td1 = document.createElement('td');
						let td2 = document.createElement('td');
						let td3 = document.createElement('td');
						td1.classList.add('td1');
						td1.innerHTML = getDayName(body[i].nday);
						td1.setAttribute('nday', body[i].nday);
						td2.innerHTML = body[i].start + ':00';
						td2.setAttribute('nday', body[i].nday);
						td3.innerHTML = body[i].finish + ':00';
						td3.setAttribute('nday', body[i].nday);
						tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);
						table.appendChild(tr);
					}
					
				}
				else
				{
					console.log(req.response);
				}
			});
	}

// Функция выводит все заявки
	function getReqs()
	{
		POST('/req', 'method=GET', (req) =>
		{
			if(req.status == 200)
			{
				let res = JSON.parse(req.response);
				let body = res.body;

				for(let i = 0; i<body.length; i++)
				{
					if(body[i].lessons > 1)
					{
						setReq(reqs, body[i]);
					}
					else
					{
						setReq(ones, body[i]);
					}
				}
			}
			else
			{
				notifier('Новых заявок нет!', 'green');
			}
		});
	}

// Скрипт
	getReqs();

// Обработчик закрытия окна добавления группы
	document.getElementById('cancel_new').addEventListener('click',function()
		{
			if(!document.getElementById('new_group_name').disabled)
			{
				document.getElementById('new_group').style.display = 'none';
				if(document.getElementById('groups').style.display == 'none')
					document.querySelector('.back').style.display = 'none';
			}
			else
			{
				document.getElementById('new_group').style.display = 'none';
				document.querySelector('.back').style.display = 'none';
			}
		});

// Обработчик закрытия окна
	document.getElementById('cancel').addEventListener('click', function()
		{
			document.querySelector('.back').style.display = 'none';
		});
