function getProfilePage()
{
	content.innerHTML = 
	`
		<div id = 'container' class = 'profile_cont'>
			<img title = 'Изменить' id = 'ava' src = '/pictures/avatar.jpg' class = 'profile_ava'>
			<input id = 'file' type = 'file' style = 'display:none'>
			<div id = 'name' class = 'profile_name'></div>
			<div id = 'age' class = 'profile_age'></div>
			<div id = 'tel' class = 'profile_tel'></div>

			<button id = 'redact' class = 'profile_redact'>Редактировать</button>
		</div>
	`;

	let file = content.querySelector('#file');
	let but = content.querySelector('#redact');
	let ava = content.querySelector('#ava');
	let div = content.querySelector('#container');

	file.addEventListener('change', ()=>
		{
			let f = file.files[0];
			console.log(f);
		});
	ava.addEventListener('click', ()=>
		{
			file.click();
		});

	but.addEventListener('click', ()=>
		{
			if(but.innerHTML == 'Редактировать')
			{
				let name = div.querySelector('#name');
				let age = div.querySelector('#age');
				let tel = div.querySelector('#tel');

				showRedactLayout({ name, tel ,age, div, but });
			}
			else
			{
				let err 		= div.querySelector('#err');
				let firstname 	= div.querySelector('#firstname');
				let lastname 	= div.querySelector('#lastname');
				let age 		= div.querySelector('#age');
				let tel 		= div.querySelector('#tel');

				if(!firstname.value.length) { throwError(err, 'Введите имя!', firstname); return;}
				else { hideError(err, firstname); }
				if(!lastname.value.length) { throwError(err, 'Введите фамилию!', lastname); return;}
				else { hideError(err, lastname); }
				if(!age.value.length) { throwError(err, 'Введите ваш возраст!', age); return;}
				else { hideError(err, age); }
				if(age.value > 150 || age.value < 1) { throwError(err, 'Некорректные данные!', age); return;}
				else { hideError(err, age); }

				POST('/student', 
					`method=PATCH&&id=${getCookie('SAI')}&&firstname=${firstname.value.trim()}&&lastname=${lastname.value.trim()}&&age=${age.value.trim()}`,
					(res,stat)=>
					{
						if(stat == 200)
						{
							getProfilePage();
						}
					});
			}
		});

	getMyProfile()
}

function getMyProfile()
{
	POST('/student', `method=PROFILE&&id=${getCookie('SAI')}`, (res,stat)=>
		{
			if(stat == 200)
			{
				let data = res.body;

				if(data.ava) document.getElementById('ava').src = data.ava;
				 document.getElementById('name').innerHTML = data.firstname + ' ' + data.lastname;
				 document.getElementById('age').innerHTML = getAgeName(data.age);
				 document.getElementById('tel').innerHTML = data.phone;
			}
			else console.log(res);
		});
}

function showRedactLayout(data)
{
	let div = data.div;
	div.removeChild(data.name);
	div.removeChild(data.age);
	div.removeChild(data.tel);

	let err = document.createElement('h3');
	err.id = 'err';
	err.classList.add('profile_err');
	div.insertBefore( err, data.but);

	let firstnameInput = document.createElement('input');
	firstnameInput.id = 'firstname';
	firstnameInput.classList.add('profile_input');
	firstnameInput.value = data.name.innerHTML.split(' ')[0];
	div.insertBefore( firstnameInput, data.but);

	let lastnameInput = document.createElement('input');
	lastnameInput.id = 'lastname';
	lastnameInput.classList.add('profile_input');
	lastnameInput.value = data.name.innerHTML.split(' ')[1];
	div.insertBefore( lastnameInput, data.but);

	let ageInput = document.createElement('input');
	ageInput.type = 'number';
	ageInput.id = 'age';
	ageInput.classList.add('profile_input');
	ageInput.value = data.age.innerHTML.split(' ')[0];
	div.insertBefore( ageInput, data.but);

	data.but.innerHTML = 'Сохранить';
}

function throwError(err, msg, inp)
{
	err.innerHTML = msg;
	err.style.display = 'block';
	inp.style.background = 'linen';
}

function hideError(err, inp)
{
	err.style.display = 'none';
	inp.style.background = 'white';
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