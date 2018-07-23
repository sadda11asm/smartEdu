function getRequestPage(id)
{
	content.innerHTML = `<div class = 'MainContent'></div>`;

	let main = content.querySelector('.MainContent');

	POST('/course', 'method=GET&&rate='+id, (res)=>
		{
			dataForSend = res.body[0].lessons;
			let data = res.body[0];

			CourseContent({
						cName: 		data.company_name,
						bot: 		data.bot,
						email: 		data.company_email,
						rName: 		data.name,
						content: 	data.content,
						title: 		data.title,
						type: 		data.type,
						unlim: 		data.unlim,
						lessons: 	data.lessons,
						rId: 		data.id,
						cost: 		data.cost
					}, main);
		});

	window.rate 	= id;
	window.min 		= null;
	window.request 	= null;
}
function CourseContent(data, layout)
{
	let head = document.createElement('div');
	head.classList.add('MainCourseHead');
	head.innerHTML = `
		<div class="MainCompanyName">${data.cName}</div>
		<div class="MainCourseName">Курс: ${data.rName}</div>
		`;

	layout.appendChild(head);

	let div = document.createElement('div');
	div.classList.add('MainCourseBody', 'hidden_scroll');
	div.innerHTML =`
		<div class="MainCourseContent">${data.content}</div>
		<div class="MainCourseInfo">
			<div class="MainCourseType">${getType(data.type)}</div>
			<div class="MainCourseLesson">${getHours(data.lessons, data.unlim)}</div>
			<div class='MainCourseUnlim'>${getUnlim(data.unlim)}</div>
			<div class="MainCourseCost">${data.cost}$</div>
			<a href = '${data.bot}'><button class="MainButton" title = 'Перейти в телеграм-бот'>ТЕЛЕГРАМ</button></a>
			<button id='accept' class="MainButton" title = 'Записаться на курс'>ЗАПИСАТЬСЯ</button>
		</div>
		`;

	div.querySelector('#accept').addEventListener('click', ()=>
	{
		if(!document.getElementById('request')) getRequest(div);

		SCROLL(div, div.scrollHeight);
	});

	layout.appendChild(div);

	min = data.lessons/4;
}

function SCROLL(block, height)
{
	let z = 1;
	let interval = setInterval(()=>
		{
			block.scrollTo(0, z);
			z+= 3;
			if(z > height/2 +100) clearInterval(interval);
		},1)
}

function getRequest(layout)
{
	let div = document.createElement('div');
	div.id = 'request';
	div.classList.add('requestBlock');

	div.innerHTML = `
	<h3 class = 'requestTitle'>Выберите время для занятий:</h3>
	<div class = 'requestDays'>
		<hr>
		<div class = 'requestDayName'>Понедельник</div> <img src = '/img/plus.png' id = 'img1' onclick = 'addSelector(1)'>
		${addDay(1)}
		<hr>
		<div class = 'requestDayName'>Вторник</div> <img src = '/img/plus.png' id = 'img2' onclick = 'addSelector(2)'>
		${addDay(2)}

		<hr>
		<div class = 'requestDayName'>Среда</div> <img src = '/img/plus.png' id = 'img3' onclick = 'addSelector(3)'>
		${addDay(3)}

		<hr>
		<div class = 'requestDayName'>Четверг</div> <img src = '/img/plus.png' id = 'img4' onclick = 'addSelector(4)'>
		${addDay(4)}

		<hr>
		<div class = 'requestDayName'>Пятница</div> <img src = '/img/plus.png' id = 'img5' onclick = 'addSelector(5)'>
		${addDay(5)}

		<hr>
		<div class = 'requestDayName'>Суббота</div> <img src = '/img/plus.png' id = 'img6' onclick = 'addSelector(6)'>
		${addDay(6)}

		<hr>
		<div class = 'requestDayName'>Воскресенье</div> <img src = '/img/plus.png' id = 'img0' onclick = 'addSelector(0)'>
		${addDay(0)}
		<hr>
	</div>
	<div class='requestControl'>
		<button class = 'MainButton requestAccept'>Отправить</button>
	</div>`;

	div.querySelector('.requestAccept').addEventListener('click', ()=>
		{
			let requests = div.querySelector('.requestDays');
			sendRequest(requests);
		});

	layout.appendChild(div);
}

function addSelector(id)
{
	let block = document.getElementById(`day=${id}`);
	if(block.children.length < 9)
	{
		let start = document.createElement('select');
		start.classList.add('requestSelector');
		start.setAttribute('day', id);
		start.setAttribute('time', 0);
		start.innerHTML = addDay(id, 1);

		let i = document.createElement('i');
		i.innerHTML = '-';

		let finish = document.createElement('select');
		finish.classList.add('requestSelector');
		finish.setAttribute('day', id);
		finish.setAttribute('time', 0);
		finish.innerHTML = addDay(id, 1);

		block.appendChild(start);
		block.appendChild(i);
		block.appendChild(finish);
		if(block.children.length > 7) document.getElementById(`img${id}`).style.display = 'none';
	}
}

function addDay(id, flag)
{
	let result = document.createElement('div');
	result.innerHTML = `
	<div class='dayBlock' id='day=${id}'>${addInterval(id, 0)}<i>-</i>${addInterval(id, 1)}</div>`; 
	
	return flag == 1? result.querySelector('div').innerHTML: result.innerHTML;
}

function addInterval(day, time)
{
	return `
	<select class='requestSelector' day='${day}' time='${time}'>
		<option>нет</option>
		<option value = '0'>0:00</option>
		<option value = '1'>1:00</option>
		<option value = '2'>2:00</option>
		<option value = '3'>3:00</option>
		<option value = '4'>4:00</option>
		<option value = '5'>5:00</option>
		<option value = '6'>6:00</option>
		<option value = '7'>7:00</option>
		<option value = '8'>8:00</option>
		<option value = '9'>9:00</option>
		<option value = '10'>10:00</option>
		<option value = '11'>11:00</option>
		<option value = '12'>12:00</option>
		<option value = '13'>13:00</option>
		<option value = '14'>14:00</option>
		<option value = '15'>15:00</option>
		<option value = '16'>16:00</option>
		<option value = '17'>17:00</option>
		<option value = '18'>18:00</option>
		<option value = '19'>19:00</option>
		<option value = '20'>20:00</option>
		<option value = '21'>21:00</option>
		<option value = '22'>22:00</option>
		<option value = '23'>23:00</option>
		<option value = '24'>24:00</option>
	</select>
	`;
}

function sendRequest(layout)
{
	let res = ValidateRequest(layout);
	if(res.status == 200)
	{
		let req = {
			request: res.requests
		};
		request = JSON.stringify(req);
		POST('/request', `method=PERIODS&&rate=${rate}&&request=${request}`, (res)=>
			{
				if(res.status == 200)
				{
					let script = getTeachersScript(res.body);
					showPopup(script);
				}
				else
				{
					alert('В это время с вами никто не может вести занятия');
				}	
			});
	}
}

function getTeachersScript(data)
{
	let res = '<div class="requestTeachers"><h2>По вашему запросу найдены преподаватели:</h2>';
	FOR(data, (el, i)=>
		{
			res += `<div><p>${i+1}. ${el.firstname}</p> <p>${el.lastname}</p><button onclick='sendTeacher(${el.id})'>Выбрать</button></div>`;
		});
	res += '</div>';

	return res;
}

function sendTeacher(id)
{
	POST('/request', `method=SEND&&teacher=${id}&&rate=${rate}&&request=${request}`, (res)=>
		{
			alert('Ваша заявка принята!');
			closePopup();
			goto('courses');
			ws.send(JSON.stringify({
				notice: 2,
				teacher: id,
				rate
			}));
		});
}

//Очень сложная валидация СЕЛЕКТОВ как и их структура
function ValidateRequest(layout)
{
	let days = layout.getElementsByClassName('dayBlock');
		
	let requests = [];

	for(let i=0; i<days.length; i++)
	{
		let selects = days[i].children;
		let periods = [];
		for(let j = 0; j<selects.length; j = j + 3)
		{
			let start = selects[j];
			let finish = selects[j+2];

			start.style.background = 'buttonface';
			finish.style.background = 'buttonface';

			if(start.value != 'нет'  && finish.value != 'нет')
			{
				if(Number(start.value) >= Number(finish.value))
				{
					start.style.background = 'linen';
					finish.style.background = 'linen';
					alert('Некооректное время');
					return {status: 418};
				}
				else
				{
					let time = 
					{
						start: 	start.value,
						finish: finish.value
					};
					periods.push(time);
				}
			}
			else if(start.value == 'нет' && finish.value == 'нет'){}
			else 
			{
				start.style.background = 'linen';
				finish.style.background = 'linen';
				alert('Некорректное время!');
				return {status: 418};
			}
		}
		let day = 
		{
			day: days[i].id.split('=')[1],
			periods
		};
		requests.push(day);
	}
	let newmas = [];
	for(let i = 0; i<requests.length; i++)
	{
		if(requests[i].periods.length != 0)
		{
			newmas.push(requests[i]);
		}
	}

	let sum = 0;

	for(let i=0; i<newmas.length; i++)
		for(let j=0; j<newmas[i].periods.length; j++)
			sum ++;
	

	if(sum < min)
		{
			alert('Не достаточно промежутков выбрано!');
			return {status: 418};
		}

	return {status: 200, requests: newmas};
}