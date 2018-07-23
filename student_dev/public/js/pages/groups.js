function getGroupsPage()
{
	content.innerHTML = 
	`
		<div class="students-list">
			<div class="students-list__header">Список групп</div>
			<div class="students-list__names" id ='groupNames'></div>
		</div>
		<div class="students-list students-list-style_left" id="groupStudents">
			<div class="students-list__header">Список учеников</div>
			<div class="students-list__names" id ='studentNames'></div>
		</div>
		<div class="list list-display_none list-style_left" id="studentData">
			<div class="list__header">Информация</div>
			<div class="list__body">
				<div class="list__avatar">
					<img src="/static/img/avatar.jpg" alt=""  id = 'studentPhoto'>
				</div>
				<div class="list__name" id = 'studentName'></div>
				<div class="list__tel" id = 'studentTel'></div>
				<div class="list__tel" id = 'studentAge'></div>
			</div>
		</div>
	`;

	let groups = content.querySelector('#groupNames');

	POST('/group', 'method=GET', (res,stat) =>
		{
			let data = res.body;
			for(let i = 0; i<data.length; i++)
			{
				addGroup(data[i], groups);
			}
		});
}

function addGroup(data, layout)
{
	let name = data.group_name;
	let rate = data.rate_name;
	let id = data.group_id;

	let input = document.createElement('input');
	input.type = 'radio';
	input.name = 'group';
	input.id = id;
	input.classList.add('chb');

	input.addEventListener('click', ()=> 
		{
			POST('/student', `method=STUDENTS&&group=${id}`, (res,stat)=>
				{
					let data = res.body;
					let block = document.getElementById('studentNames');
					block.innerHTML = '';
					hideBlock(document.getElementById('studentData'));
					for(let i=0; i<data.length; i++) addStudent(data[i], block);
				});
		});
	layout.appendChild(input);

	let label = document.createElement('label');
	label.classList.add('label', 'label_student');
	label.setAttribute('for', id);

	label.addEventListener('dblclick', ()=>
		{
			if(confirm('Вы действительно хотите удалить группу?'))
			{
				ws.send(JSON.stringify({
					notice: 3,
					group: id
				}));
				
				generateContent();
			}
		});

	label.innerHTML = 
	`
	<p>${name}</p>
	<img class="right_widget" src="/img/right.svg" alt="#">
	`;
	layout.appendChild(label);
}

function addStudent(data, layout)
{
	layout.parentNode.style.display = 'block';
	let name = data.firstname + ' ' + data.lastname;
	let id = data.id;

	let input = document.createElement('input');
	input.type = 'radio';
	input.name = 'student';
	input.id = 'st'+id;
	input.classList.add('chb');

	input.addEventListener('click', ()=> 
		{
			POST('/student', `method=PROFILE&&id=${id}`, (res, stat)=>
				{
					showStudent(res.body);
				});
		});
	layout.appendChild(input);

	let label = document.createElement('label');
	label.classList.add('label', 'label_student');
	label.setAttribute('for', 'st'+id);
	label.innerHTML = 
	`
	<p>${name}</p>
	<img class="right_widget" src="/img/right.svg" alt="#">
	`;
	layout.appendChild(label);
}

function showStudent(data)
{
	let block = document.getElementById('studentData');
	showBlock(block);
	console.log(data);

	if(data.ava) block.querySelector('#studentPhoto').src = data.ava;
	else block.querySelector('#studentPhoto').src = '/pictures/avatar.jpg';

	block.querySelector('#studentName').innerHTML = data.firstname + ' ' + data.lastname;
	block.querySelector('#studentTel').innerHTML = data.phone;
	block.querySelector('#studentAge').innerHTML = getAgeName(data.age);

}

function hideBlock(block)
{
	block.style.display = 'none';
}

function showBlock(block)
{
	block.style.display = 'block';
}

function getAgeName(a)
{
	if(a < 21)
	{
		if(a == 1) 			return a + ' год';
		else if(a < 5) 		return a + ' года';
		else 			 	return a + ' лет';
	}
	else
	{
		if 		(a%10 == 1) 			return a + 'год';
		else if (a%10 > 0 && a%10 < 5)  return a + ' года';
		else 							return a + ' лет';
	}
}