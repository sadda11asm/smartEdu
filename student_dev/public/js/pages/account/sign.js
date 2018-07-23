function login(e)
{
	e.preventDefault();
	let tel 	= document.getElementById('signin-tel').value;
	let pass 	= document.getElementById('signin-pass').value; 
	let err 	= document.getElementById('signin-err');

	if(validateIn())
	{
		POST('/registration', `method=LOGIN&&phone=${tel}&&password=${pass}`, (res, stat) => 
			{
				console.log(stat)
				switch(stat)
				{
					case 200:
						top.location.href = '/';
					break;
					case 401:
						showErr(err, '<a href = "/activate">Активируйте ваш аккаунт!</a>');
					break;
					case 402:
						showErr(err, 'Неверный пароль!');
					break;
					case 403:
						 showErr(err, 'Данного пользователя не существует!');
					break;
					default: 
						console.log(res);
					break;
				}
			});
	}
}

function registrate(e)
{
	e.preventDefault();
	if(validateUp())
	{
		let tel 	= document.getElementById('tel').value;
		let pass  	= document.getElementById('pass').value;
		let repass 	= document.getElementById('repass').value;
		let name 	= document.getElementById('name').value;
		let lastname = document.getElementById('lastname').value;
		let age 	= document.getElementById('age').value;
		let err 	= document.getElementById('signup-err');
		POST('/registration',
			`method=REGISTRATION&&firstname=${name}&&lastname=${lastname}&&password=${pass}&&phone=${tel}&&age=${age}`, 
			(res, stat)=>
			{
				if(stat == 200)
				{
					POST('/registration', `method=SMS&&phone=${tel}`, (res, stat)=>
						{
							if(stat == 200) top.location.href = '/activate?tel=' + tel;
							else console.log('Error: ', res);
						});
				}
				else if(stat == 400)
				{
					showErr(err, 'Данный пользователь существует!');
				}
				else
				{
					console.log(res);
				}
			});
	}
}

function validateUp()
{
	let tel 	= document.getElementById('tel');
	let pass  	= document.getElementById('pass');
	let repass 	= document.getElementById('repass');
	let name 	= document.getElementById('name');
	let lastname = document.getElementById('lastname');
	let age 	= document.getElementById('age');

	let err 	= document.getElementById('signup-err');

	if (!checkInput(tel, 10 ,'Некорректные данные', err, 1)) 	return false;
	if (!checkInput(name, 1, 'Введите ваше имя', err)) 			return false;
	if (!checkInput(lastname, 1, 'Введите вашу фамилию', err)) 	return false;
	if (!checkInput(age, 1, 'Введите ваш возраст', err))		return false;
	if (!checkInput(pass, 5 ,'Слишком короткий пароль', err))	return false;

	if(pass.value != repass.value)
	{
		checkInput(repass, 1000, 'Пароли не совпадают', err);
		return false;
	}
	console.log('sdfs');
	return true;
}

function validateIn()
{
	let tel 	= document.getElementById('signin-tel');
	let pass 	= document.getElementById('signin-pass');
	let err 	= document.getElementById('signin-err');
	
	if(!checkInput(tel, 10, 'Некорректные данные', err, 1)) 	return false;
	if(!checkInput(pass, 1, 'Введите пароль', err)) 		return false;

	return true;
}


function showErr(err, msg)
{
	err.style.display = 'block';
	err.innerHTML = msg;
}


function hideErr(err)
{
	err.style.display = 'none';
}

function keyUpTel(e)
{
	if(e.key < 10 && e.key != ' ')
	{
		let val 	= document.getElementById('signin-tel');
		let val2 	= document.getElementById('tel');

		val.value = val.value.substring(0, 9);
		val2.value = val2.value.substring(0, 9);
	}
}

function checkInput(inp, leng ,msg, err, parent)
{
	if(inp.value.length < leng)
	{
		if(parent)
		{
			showErr(err, msg);
			inp.parentNode.style.background = 'linen';
			console.log(inp.parentNode)
			return false;
		}
		else
		{
			showErr(err, msg);
			inp.style.background = 'linen';
			return false;
		}
	}
	else
	{
		if(parent)
		{
			hideErr(err);
			inp.parentNode.style.background = 'white';
			return true;
		}
		else
		{
			hideErr(err);
			inp.style.background = 'white';
			return true;
		}
	}
}

document.querySelector('.toggle').addEventListener('click', function(e) 
{
	this.children[0].classList.toggle("fa-pencil");
	this.children[0].classList.toggle("fa-sign-in");
	if (document.querySelector('#tooltip').innerHTML == 'Вход') 
	{
		document.querySelector('#tooltip').innerHTML = 'Регистрация';
	} 
	else 
	{
		document.querySelector('#tooltip').innerHTML = 'Вход';
	}
	document.querySelector('#login').classList.toggle('show-form');
	document.querySelector('#reg').classList.toggle('show-form');
	document.querySelector('#cta').classList.toggle('cta-hidden');
});