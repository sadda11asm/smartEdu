function getTestsPage()
{
	content.innerHTML = 
	`
	<div class = 'test_block'>
		<div class = 'test_courses hidescroll'></div>
		<div class = 'test_tests hidescroll'></div>
	</div>
	`;

	let courses = content.querySelector('.test_courses');

	POST('/test', `method=COURSES`, (res)=>
		{
			if(res.status == 200) for(let i=0; i<res.body.length; i++) addCourseLine(res.body[i], courses);
		});
}

function addCourseLine(data, layout)
{
	console.log(data);
	let div = document.createElement('div');
	div.classList.add('test_course', 'active');
	div.innerHTML = `
		<p>${data.name}</p>${data.cnt?'<a>'+ data.cnt+'</a>': ""}
	`;

	layout.appendChild(div);

	div.addEventListener('click',()=>
		{
			clearCourses(layout);
			div.classList.add('test_course_current');

			let tests = content.querySelector('.test_tests');
			tests.innerHTML = 
			`
			<div class = 'test_test testTop'>
				<p class = 'testName table'>Название</p>
				<p class = 'testLevel table'>Уровень</p>
				<p class = 'testDate table'>Дата</p>
				<p class = 'testStat table'>Статус</p>
				<p class = 'actions table'>Результат</p>
			</div>
			`;

			POST('/test', `method=TESTS&&rate=${data.id}`, (res)=> 
				{
					if(res.status == 200) for(let i = 0; i<res.body.length; i++) addTestLine(res.body[i], tests)
					else alert('Тестов нет');
				});
		});
}

function addTestLine(data, layout)
{
	console.log(data);
	let div = document.createElement('div');
	div.classList.add('test_test');

	div.innerHTML = `
	<p class = 'testName table'>${data.name}</p>
	<p class = 'testLevel table'>${data.level}</p>
	<p class = 'testDate table'>${getDateName(data.dt)}</p>
	<p class = 'testStat table'>${data.count? 'Выполнено': '<i style = "color:red">Не выполнено</i>'}</p>
	<p class = 'actions table'>${data.count? data.count:'<button class = "active">Выполнить</button>'}</p>
	`;

	if(!data.count) div.querySelector('.active').addEventListener('click', (e)=>
		{
			goto(`test/${data.id}`);
		});

	layout.appendChild(div);
}

function clearCourses(layout)
{
	let c = layout.children;
	for(let i=0; i<c.length; i++)
	{
		c[i].classList.remove('test_course_current');
	}
}












// Функция возвращает время 
	function getDateName(d)
	{
		let now = new Date();
		let date = new Date(d);

		let m = date.getMonth() + 1;
		let string = date.getDate() + "." + m + "." + date.getFullYear();

		if(now.getFullYear() == date.getFullYear() && now.getMonth() == date.getMonth())
		{
			if(now.getDate() == date.getDate())
			{
				if(date.getHours() == now.getHours())
				{
					if(date.getMinutes() == now.getMinutes())
					{
						return 'только что';
					}
					else
					{
						let difference = now.getMinutes() - date.getMinutes();
						if(difference < 2) return 'минуту назад';
						else if(difference > 1 && difference < 5) return  difference + ' минуты назад';
						else if(difference > 4 && difference <21) return difference + ' минут назад';
						else if(difference >20)
						{
							if(difference%10 < 5 && difference%10 != 0)
							{
								if(difference%10 == 1) return  difference + ' минуту назад';
								else return difference + ' минуты назад';
							}
							else
							{
								return difference + ' минут назад';
							}
						}
					}
				}
				else
				{
					let difference = now.getHours() - date.getHours();
					if(difference == 1)
					{
						return 'час назад';
					}
					else if(difference > 1 && difference < 5)
					{
						return difference + ' часа назад';
					}
					else if(difference >= 5 && difference < 21)
					{
						return difference + ' часов назад';
					}
					else if(difference==21)
					{
						return difference + ' час назад';
					}
					else if(difference > 21)
					{
						return difference + ' часа назад';
					}
				}
			}
			else
			{
				let difference = now.getDate() - date.getDate();

				if(difference <= 3) 
				{
					if(difference == 1)
					{
						return 'вчера';
					}
					else
					{
						return difference + ' дня назад';
					}
				}
				else
				{
					return string;
				}

			}
		}
		else
		{
			return string;
		}
	}