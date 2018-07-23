function getCoursesPage()
{
	content.innerHTML = 
	`<div class="CourseState">
	</div>

	`;

	window.courses = content.querySelector('.CourseState');

	POST('/course', 'method=GETALL', (res, stat)=>
		{
			let data = res.body;
			for(let i = 0; i<data.length; i++)
			{
				let rates = data[i].rates;

				for(let j=0; j<rates.length; j++)
				{
					addCourse({
						cName: 		data[i].name,
						bot: 		data[i].bot,
						email: 		data[i].email,
						rName: 		rates[j].name,
						content: 	rates[j].content,
						title: 		rates[j].title,
						type: 		rates[j].type,
						unlim: 		rates[j].unlim,
						lessons: 	rates[j].lessons,
						rId: 		rates[j].id,
						cost: 		rates[j].cost
					}, courses);
				}
			}

		});
}


function addCourse(data, layout)
{
	let div = document.createElement('div');
	div.classList.add('CourseBlock');
	div.title = data.content;
	div.style.background = coloring(data.cId);
				// <div class="EmailCourseCompany">${data.email}</div>
	div.innerHTML =
	`
		<div class="CourseHead" id="CourseHeadRandColor">
			<div class="NameCourseCompany">${data.cName}</div>
		</div>

		<div class="CourseBody">
			<div class = 'owerflow'>
				<div class="NameCourse">${data.rName}</div>
				<div class="TitleCourse">${data.title}</div>
				<div class="LessonCourse">${getHours(data.lessons, data.unlim)}</div>
				<div class="TypeCouse">${getType(data.type)}</div>
				<div class="UnlimCourse">${getUnlim(data.unlim)}</div>
				<div class="CostCourse">${data.cost}$</div>
			</div>
			<button id = 'but' class="PerehodCourse" title = 'Подробная информация'>ИНФО</button>
			<a href = '${data.bot}'><button class="PerehodCourse" title = 'Перейти в телеграм-бот'>БОТ</button></a>
		</div>
	`;

	div.querySelector('#but').addEventListener('click',()=>
		{
			goto('request/' + data.rId);
		});

	layout.appendChild(div);
}

function getHours(les, u)
{
	if(u) return '';

	let h = les % 10;

	if(h == 0) return les + ' часов';
	else if(h == 1) return les + ' час';
	else if(h < 5) return les + ' часа';
	else return les + ' часов';
}

function getType(type)
{
	return type ? 'Индувидуально' : 'Групповые занятия';
}
function getUnlim(u)
{
	return u? 'Безлимит': '';
}


function coloring(i)
{
	// i = Math.floor(Math.random() * 11)
	let col = i % 10;

	switch (col) 
	{
	 	case 0: return 'green';
	 	case 1: return 'skyblue';
	 	case 2: return 'blue';
	 	case 3: return '#FFA500	';
	 	case 4: return 'linen';
	 	case 5: return '#00FF00	';
	 	case 6: return '#F0E68C	';
	 	case 7: return '#FFE4B5';
	 	case 8: return '#4169E1';
	 	default: return '#FFEFD5';
	 } 
}
