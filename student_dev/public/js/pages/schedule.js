function getSchedulePage()
{
	content.innerHTML = `
	<div class="calendar_div container">
			<img id = 'refresh' src="/img/fresh.png">
			<h2 class='navi'>
	            <a id = 'goleft' class="change_month" style='margin-right: 4vh;'>
	            	<img src='/img/left.svg'>
	            </a>
	            <div class = 'top_title'>
		           <span id ='current_month_name'></span>
		           <span> </span>
		           <span id = 'current_year'></span>
		       </div>
	            <a id = 'goright' class="change_month" style='margin-left: 4vh;'>
	            	<img src='/img/right.svg'>
	            </a>
	        </h2>
			<table class="calendar_top">
			    <tr>
			        <td class='datehead'>Пн</td>
			        <td class='datehead'>Вт</td>
			        <td class='datehead'>Ср</td>
			        <td class='datehead'>Чт</td>
			        <td class='datehead'>Пт</td>
			        <td class='datehead'>Сб</td>
			        <td class='datehead'>Вс</td>
			    </tr>
			</table>
			<table id = 'calendar' class="calendar_mob">
			   
			</table>
		</div>
		<div class="day_div container" id = 'day_chart'>
		</div>
	`;

	//Глобальные переменные
	window.calendar = document.getElementById('calendar');	
	window.global_date = new Date();

	createCalendar(getFirstDate(global_date));
	addListeners();

}

function addListeners()
{
//Стрелка влево
	document.getElementById('goleft').addEventListener('click', function()
		{
			global_date = changeMounth(global_date, -1);
			createCalendar(global_date);
		}); 
//Стрелка вправо
	document.getElementById('goright').addEventListener('click', function()
		{
			global_date = changeMounth(global_date, 1);
			createCalendar(global_date);
		}); 
//Прячем график дня при нажатии черной или зеленой ячейки. И красим выбранную ячейку
	document.getElementById('calendar').addEventListener('mouseup', function(ev)
		{
			if(ev.target.style.color != 'red' && ev.target.innerHTML != '')
				document.getElementById('day_chart').style.display = 'none';
			
			if(ev.target.innerHTML != '')
				curDate(ev.target)
		});
//Обновляем календарь
	document.getElementById('refresh').addEventListener('click',function()
		{
			window.global_date = new Date();
			createCalendar(getFirstDate(global_date));
		});
}

//Функция проверяет вхождения элемента в массив
	function includes(el, mas)
	{
		for(let i = 0; i<mas.length; i++)
		{
			if(mas[i] == el) return true;
		}
		return false;
	}
//Функция выводит дату в консоль в формате дд-мм-гг
	function log(date)
	{
		let month = date.getMonth() + 1;
		console.log(date.getDate() + '.' + month + '.' + date.getFullYear());
	}
//Функция возвращает первый день месяца
	function getFirstDate(date)
	{
		let current_month = date.getMonth();
		while(date.getMonth() == current_month)
		date = new Date(date.valueOf()- 1000*60*60*24); 
		date = new Date(date.valueOf() + 1000*60*60*24);
		return date;
	}
//Функция возвращает название месяца
	function getMounthName(i)
	{
		switch(i)
		{
			case 0: return 'Январь';
			case 1: return 'Февраль';
			case 2: return 'Март';
			case 3: return 'Апрель';
			case 4: return 'Май';
			case 5: return 'Июнь';
			case 6: return 'Июль';
			case 7: return 'Август';
			case 8: return 'Сентябрь';
			case 9: return 'Октябрь';
			case 10: return 'Ноябрь';
			case 11: return 'Декабрь';
			default: return 'Бухабрь';
		}
	}
//Функция возвращает название месяца в родительном падеже
	function getMounthLow(i)
	{
		switch(i)
		{
			case 0: return 'января';
			case 1: return 'февраля';
			case 2: return 'марта';
			case 3: return 'апреля';
			case 4: return 'мая';
			case 5: return 'июня';
			case 6: return 'июля';
			case 7: return 'августа';
			case 8: return 'сентября';
			case 9: return 'октября';
			case 10: return 'ноября';
			case 11: return 'декабря';
			default: return 'бухабря';
		}
	}
//Функция возврациет название дня недели
	function getDayName(i)
	{
		switch(i)
		{
			case 0 : return 'Воскресенье';
			case 1 : return 'Понедельник';
			case 2 : return 'Вторник';
			case 3 : return 'Среда';
			case 4 : return 'Четверг';
			case 5 : return 'Пятница';
			case 6 : return 'Суббота';
			default: return 'Ошибка';
		}
	}
//Функция удаляет - в конце названия группы
	function deleteSlash(name)
	{
		let mas = name.split('-');
		let ans = '';
		for(let i = 0; i<mas.length-1; i++)
		{
			ans+= mas[i];
		}

		if(ans.length > 0) return ans;
		else return name;
	}
//Функция устанавливает заголовок календаря (месяц, год)
	function setCalendarHead(mounth, year)
	{
		document.getElementById('current_month_name').innerHTML = getMounthName(mounth);
		document.getElementById('current_year').innerHTML = year;
	}
//Функция возвращает первый день месяца отстоящего на n от текущего
	function changeMounth(date, n)
	{
		let current_month = date.getMonth();
		let step = current_month + n;

		if( n < 0) {step = step - 1;}

		if(step > 11) step = step - 12;
		else if(step < 0) step = step + 12;

		if(n > 0)
		{
			for(;;)
			{
				date = new Date(date.valueOf() + 1000*60*60*24);
				if(date.getMonth() == step) break;
			} 
		}
		else if(n < 0)
		{
			for(;;)
			{
				date = new Date(date.valueOf() - 1000*60*60*24);
				if(date.getMonth() == step) break;
			}
			date = new Date(date.valueOf() + 1000*60*60*24);
		}
		return date;
	}

//Функция вешает обработчик клика на день (РАБОЧИЕ)
	function setWorkDays()
	{
		POST('/chart', `method=DAYS&&day=${getFirstDate(global_date)}`, (res, stat) =>
			{
				if(stat == 200)
				{
					let mas = res.days;
					let trs = calendar.children;
					for(let i = 0; i < trs.length; i++)
					{
						let tds = trs[i].children;
						for(let j = 0; j < tds.length; j++)
						{
							if(tds[j].innerHTML != '')
							{
								if(includes(tds[j].innerHTML, mas))
								{
									tds[j].style.color = '#0277bd';
									tds[j].addEventListener('click', (e)=> {showWorkDay(e.target)});
								}	
							}
						}
					}
				}
			});
	}

//Функция подкрашивает выбранную дату
	function curDate(target)
	{
		let trs 	= calendar.children;
		for(let i = 0; i < trs.length; i++)
		{
			let tds = trs[i].children;
			for(let j = 0; j < tds.length; j++)
			{
				tds[j].classList.remove('current_date');
			}
		}
		target.classList.add('current_date');
	}
// //Функция вывода рабочего дня
	function showWorkDay(target)
	{
		let day 	= target.innerHTML;
		let mounth 	= global_date.getMonth() + 1;
		let year 	= global_date.getFullYear();

		let dt 		= new Date(year + '.' + mounth + '.' + day);
		let date = year+'.'+mounth+'.'+day;

		POST('/chart', 'method=DAYLY&&day='+date, (res, stat)=>
			{				
				let div = document.getElementById('day_chart');
				div.innerHTML = '';

				if(stat == 200)
				{
					div.style.display = 'inline-block';
					let body = res.body;

					//Заголовок
					let day_title = document.createElement('h3');
					day_title.innerHTML = day + " " + getMounthLow(mounth-1);
					day_title.classList.add('day_title');
					div.appendChild(day_title);

					//День недели
					let day_name = document.createElement('h3');
					day_name.classList.add('day_name');
					day_name.innerHTML = getDayName(dt.getDay());
					div.appendChild(day_name);

					//Индивидуальные занятия заголовок
					let individ_count = 0;
					for(let i = 0; i<body.length; i++)
						if(body[i].group_type == 1) individ_count++;
					let individ_title = document.createElement('h4');
					individ_title.innerHTML = individ_count > 0 ? 'Индивидуальных занятий: <strong>' +  individ_count+'</strong>': 'Индивидуальных занятий: <strong>НЕТ</strong>';
					individ_title.classList.add('table_title');
					div.appendChild(individ_title);

					//Индивидуальные занятия таблица
					let individ_block = document.createElement('div');
					individ_block.classList.add('table_block');
					if(individ_count == 0) individ_block.style.display = 'none';
					let individ_table = document.createElement('table');
					individ_table.classList.add('chart_table');
					for(let i = 0; i<body.length; i++)
					{
						if(body[i].group_type == 1)
						{
							let tr = document.createElement('tr');
							tr.classList.add('table_line');

							//Название группы (Имя студента)
							let group_name = document.createElement('td');
							group_name.classList.add('group_name');
							group_name.innerHTML = deleteSlash(body[i].rate_name); 
							
							tr.appendChild(group_name);

							//Начало занятия
							let start = document.createElement('td');
							start.classList.add('start');
							start.innerHTML = body[i].start + ':00';
							tr.appendChild(start);

							//Конец занятия
							let finish = document.createElement('td');
							finish.classList.add('finish');
							finish.innerHTML = body[i].finish + ':00';
							tr.appendChild(finish);
							//Добавление строки в таблицу
							individ_table.appendChild(tr);
						}
					}
					individ_block.appendChild(individ_table);
					div.appendChild(individ_block);

					//Групповые занятия заголовок
					let group_count = 0;
					for(let i = 0; i<body.length; i++)
						if(body[i].group_type != 1) group_count++;
					let group_title = document.createElement('h4');
					group_title.innerHTML = group_count > 0 ? 'Групповых занятий: <strong>' +  group_count+'</strong>': 'Групповых занятий: <strong>НЕТ</strong>';
					group_title.classList.add('table_title');
					div.appendChild(group_title);

					//Групповые занятия таблица
					let group_block = document.createElement('div');
					group_block.classList.add('table_block');
					if(group_count == 0) group_block.style.display = 'none';
					let group_table = document.createElement('table');
					group_table.classList.add('chart_table');
					for(let i = 0; i<body.length; i++)
					{
						if(body[i].group_type != 1)
						{
							let tr = document.createElement('tr');
							tr.classList.add('table_line');

							//Название группы (Имя студента)
							let group_name = document.createElement('td');
							group_name.classList.add('group_name');
							let a = document.createElement('a');
							a.href = 'groups/' + body[i].group_id;
							a.innerHTML = body[i].rate_name;
							group_name.appendChild(a); 
							tr.appendChild(group_name);

							//Начало занятия
							let start = document.createElement('td');
							start.classList.add('start');
							start.innerHTML = body[i].start + ':00';
							tr.appendChild(start);

							//Конец занятия
							let finish = document.createElement('td');
							finish.classList.add('finish');
							finish.innerHTML = body[i].finish + ':00';
							tr.appendChild(finish);
							//Добавление строки в таблицу
							group_table.appendChild(tr);
						}
					}
					group_block.appendChild(group_table);
					div.appendChild(group_block);
				}
				else
				{
					console.log(res);
					alert('Занятий нет');
				}
			});
	}
//Функция создает календарь
	function createCalendar(date)
	{	
		let now = new Date();

		let  current_month = date.getMonth();
		var current_year  = date.getFullYear();
		setCalendarHead(current_month, current_year);
		
		let counter = 0;
		let started = false;
		calendar.innerHTML = '';
		let tr = document.createElement('tr');
		let fl = true;

		for(;;)
		{
			//Если день недели совпал начинаем добавление дня в ячейки
			if(counter + 1 == date.getDay() && fl) 
				{
					started = true; 
					fl = false;
				} 
			if(date.getDay() == 0 && fl && counter == 6)
				{
					started = true; 
					fl = false;
				}

			let td = document.createElement('td');

			//Добавляем день и шагаем вперед на 1 день
			if(started && date.getMonth() == current_month)
			{
				td.innerHTML = date.getDate();
				if(current_month == now.getMonth() && current_year == now.getFullYear() && date.getDate() == now.getDate())
				{
					td.style.background = 'rgba(146, 167, 208,0.25)';
					showWorkDay(td);
				}
				date = new Date(date.valueOf() + 1000*60*60*24);
			}

			tr.appendChild(td);
			//Увеличиваем счетчик
			counter ++;

			if(counter == 7) 
			{ 
				calendar.appendChild(tr); 
				tr = document.createElement('tr');  
				counter = 0; 
				if(date.getMonth() != current_month) break;
			}
		}

		let firstday 	= getFirstDate(global_date);
		let lastday 	= changeMounth(global_date, 1);
		let month_1		= firstday.getMonth() + 1;
		let month_2 	= lastday.getMonth() + 1;

		firstday 	= firstday.getFullYear() + '-' + month_1 + '-' + firstday.getDate();
		lastday 	= lastday.getFullYear() + '-' + month_2 + '-' + lastday.getDate();
		
		setWorkDays();
	}