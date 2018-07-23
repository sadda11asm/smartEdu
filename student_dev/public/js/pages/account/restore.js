let tel     		= document.getElementById('restoring-tel');
let code    		= document.getElementById('confirm-code');
let firstPass    	= document.getElementById('first-pass');
let secondPass 		= document.getElementById('second-pass');

let errTel 		    = document.getElementById('send_data-err');
let errCode 		= document.getElementById('confirm-err');
let errPass  		= document.getElementById('rebuilding-err');

function sendUserTel(e) 
{
	e.preventDefault();

	if(tel.value.length < 10) { throwError(errTel, 'Неккоректные данные'); tel.parentNode.style.background = 'linen'; return;}
	else { hideError(errTel); tel.parentNode.style.background = 'white'; }

	POST('/registration', `method=SMS&&phone=${tel.value}`, (res, stat)=>
		{
			switch (stat) 
			{
				case 200: showFormContainmentCode(); break;
				case 403: throwError(errTel, 'Данный номер не зарегестрирован!');  break;
				case 405: throwError(errTel, 'Введенный номер не существует'); break;
				default: console.log('Error: ', res); break;
			}
		}); 
}

function sendConfirmCode(e) 
{
	e.preventDefault();

	if(!code.value.length) { throwError(errCode, 'Введите код активации'); code.style.background = 'linen'; return;}
	else { hideError(errCode); code.style.background = 'white'; }

	POST('/registration', `method=VERIFY&&code=${code.value}&&phone=${tel.value}`, (res, stat)=>
    {
    	switch(stat)
    	{
    		case 200: showFormNewPass(); break;
    		case 400: throwError(errCode, 'Неверный код'); break;
    		case 401: throwError(errCode, 'Данного номера не существует'); break;
    		default: console.log('error', res); break;
    	}
    });
}

function sendNewPass(e) 
{
	e.preventDefault();

	if(firstPass.value.length < 5) { throwError(errPass, 'Слишком короткий пароль!'); firstPass.style.background = 'linen'; return; }
	else { hideError(errPass);  firstPass.style.background = 'white'; }

	if(!secondPass.value.length) { throwError(errPass, 'Повторите пароль!'); secondPass.style.background = 'linen'; return; }
	else { hideError(errPass);  secondPass.style.background = 'white'; }

	if(secondPass.value != firstPass.value) { throwError(errPass, 'Пароли не совпадают!'); secondPass.style.background = 'linen'; return; }
	else { hideError(errPass);  secondPass.style.background = 'white'; }

	POST('/registration', `method=PASSWORD&&code=${code.value}&&phone=${tel.value}&&password=${firstPass.value}`, (res, stat)=>
		{
			if(stat == 200) throwError(errPass, 'Пароль успешно обновлен! <a href = "/sign">войти</a>','green'); 
			else console.log(res);
		});
}	





//***************layouts*****************//
function repeatSMS(e)
{
	document.getElementById('send_data').classList.add('show-form');
	document.getElementById('confirm').classList.remove('show-form');
	document.querySelector('#cta').classList.toggle('cta-hidden');
}


function showFormContainmentCode() 
{
	document.getElementById('send_data').classList.remove('show-form');
	document.getElementById('confirm').classList.add('show-form');
	document.querySelector('#cta').classList.toggle('cta-hidden');
	printNumbersTimeout60_1000();
}

function showFormNewPass() 
{
	document.getElementById('confirm').classList.remove('show-form');
	document.getElementById('rebuilding').classList.add('show-form');
	document.querySelector('#cta').classList.toggle('cta-hidden');
}




///************functions************///
function throwError(err, msg, color)
{
  err.style.display = 'block';
  err.innerHTML = msg;
  if(color) err.style.color = color;
  else err.style.color = 'red';
}

function hideError(err)
{
  err.style.display = 'none';
}

function printNumbersTimeout60_1000() {
	let i = 10;
	let timerId = setTimeout(function go() {
		if (i==60) {
			document.getElementById('cta').innerHTML = '<span>Отправить код повторно через 60 сек</span>';
		} else {
			if (i<10) {
				document.getElementById('cta').innerHTML = '<span>Отправить код повторно через '+i+' cек</span>';
			} else {
				document.getElementById('cta').innerHTML = '<span>Отправить код повторно через '+i+' cек</span>';
			}
		}
		if (i > 0) {
			setTimeout(go, 1000);
		} else {
	      let a = document.createElement('a');
	      a.innerHTML = 'Отправить код повторно';
	      a.classList.add('active');
	      a.style.cursor = 'pointer';
	      a.addEventListener('click', repeatSMS)
	      document.getElementById('cta').innerHTML = '';
	      document.getElementById('cta').appendChild(a);
		}
		i--;
	}, 0);
}

function keyUpTel(e)
{
	if(e.key < 10 && e.key != ' ')
	{
		tel.value = tel.value.substring(0, 9);
	}
}