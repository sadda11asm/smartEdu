function getTestPage(id)
{
	if(!id) { goto('notFoundPage'); return;}
	content.innerHTML = 
	`<div class = 'testBlock'></div>`;

	let test = content.querySelector('.testBlock');
	POST('/test', `method=GET&&test=${id}`, (res)=>
		{
			addTest( res.body, test);
		});
}

function addTest(data, layout)
{
	let title = document.createElement('div');
	title.classList.add('testTitle');
	title.innerHTML = data.name;
	layout.appendChild(title);
	let questions = data.body;
	let div = document.createElement('div');
	div.classList.add('testBody');

	for(let i = 0; i<questions.length; i++)
		addQuestion(questions[i], div, i+1);

	addTestControlPanel(div, data.id);
	layout.appendChild(div);
}

function addQuestion(data, layout, num)
{
	let div = document.createElement('div');
	div.classList.add('test_question');

	div.innerHTML = 
	`
	${num}) <span>${data.question}</span>
	`;

	for(let i=0; i<data.answers.length; i++)
	{
		addAnswer(data.answers[i], div, i+1, num);
	}

	layout.appendChild(div);
}

function addAnswer(data, layout, num, id)
{
	let p = document.createElement('p');
	p.classList.add('test_answer', 'active');

	p.innerHTML = `
		<input type = 'radio' class = 'active' name = '${id}'> ${num}) <span>${data}</span>
	`;
 
	p.addEventListener('click', ()=>{ p.querySelector('input').click(); });

	layout.appendChild(p);
}

function addTestControlPanel(layout, id)
{
	let div = document.createElement('div');
	div.classList.add('test_control');

	div.innerHTML = `
		<button class = 'test_button' id = 'save'>Сохранить</button>
		<button class = 'test_button' id = 'escape'>Отмена</button>
	`;

	div.querySelector('#escape').addEventListener('click', ()=>{top.location.href = '/tests';});
	div.querySelector('#save').addEventListener('click', ()=>
		{
			sendTest(layout, id);
		});

	layout.appendChild(div);
}

function sendTest(layout, id)
{
	if(validateTest(layout))
	{
		let mas = [];
		let questions = layout.children;
		let result = {};
		for(let i=0; i<questions.length -1; i++)
		{
			let answers = questions[i].children;
			for(let j=1; j<answers.length; j++)
			{
				if(answers[j].children[0].checked) result[i] = j-1;
			}
		}

		result = JSON.stringify(result);
		POST('/test', `method=RESULT&&test=${id}&&result=${result}`, (res)=>
			{
				console.log(res);
			});
	}
}

function validateTest(layout)
{
	let questions = layout.children;
	let check = true;

	for(let i = 0; i<questions.length - 1; i++)
	{
		let f = false;
		let answers = questions[i].children;
		questions[i].style.background = 'white';
		for(let j=1; j<answers.length; j++)
		{
			if(answers[j].children[0].checked) f = true;
		}

		if(!f)
		{
			questions[i].style.background = 'linen';
			check = false;
		}
	}

	return check;
};