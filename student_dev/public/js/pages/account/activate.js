let isCode  = false;
let tel     = document.getElementById('tel');
let code    = document.getElementById('code');
let err     = document.getElementById('activate-err');

let telVal  = undefined;
  
checkHref();

function activate(e)
{
  e.preventDefault();    
  if(isCode)
  {
    if(!code.value.length)
    {
      code.style.background = 'linen';
      throwError(err, 'Введите код активации');
      return;
    }
    else
    {
      code.style.background = 'white';
      hideError(err);
    }
    console.log('send');
    POST('/registration', `method=VERIFY&&phone=${telVal}&&code=${code.value}&&active=1`, (res, stat)=>
    {
      if (stat == 200) { top.location.href = '/sign'; }
      if (stat == 400) { throwError(err, 'Неверный код'); }
      if (stat == 401) { throwError(err, 'Данного номера не существует'); }
    });
  }
  else
  {
    tel = document.getElementById('tel');
    if(tel.value.length < 10)
    {
      tel.parentNode.style.background = 'linen';
      throwError(err, 'Некорректные данные');
      return;
    }
    else
    {
      tel.parentNode.style.background = 'white';
      hideError(err);
      telVal = tel.value;
    }

    POST('/registration', `method=SMS&&phone=${telVal}`, (res, stat)=>
    {
      if(stat == 200)
      {
        showCode();
      }
      else if (stat == 403)
      {
        throwError(err, 'Данный номер не зарегестрирован!');
        tel.parentNode.style.background = 'linen';
      }
      else if(stat == 405)
      {
        throwError(err, 'Введенный номер не существует');
      }
    });
  }
}

function checkHref()
{
  let params = top.location.href.split('?')[1].split('&&');
  for(let i = 0; i <  params.length; i++)
  {
    if(params[i].split('=')[0] == 'tel')
    {
      telVal = params[i].split('=')[1];
      tel.value = telVal;
      showCode();
    }
  }
}

function printNumbersTimeout60_1000() 
{
  let i = 10;
  let timerId = setTimeout(function go() 
  {
    if (i==60) 
    {
      document.getElementById('cta').innerHTML = '<span>Отправить код повторно через 60 сек</span>';
    } 
    else 
    {
      if (i<10) 
      {
        document.getElementById('cta').innerHTML = '<span>Отправить код повторно через '+i+' cек</span>';
      } 
      else 
      {
        document.getElementById('cta').innerHTML = '<span>Отправить код повторно через '+i+' cек</span>';
      }
    }
    if (i > 0) 
    {
      setTimeout(go, 1000);
    } 
    else 
    {
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

function repeatSMS(e)
{
  tel.parentNode.style.display = 'flex';
  code.value = '';
  code.style.display = 'none';
  isCode = false;
  document.getElementById('cta').innerHTML = '';
}

function throwError(err, msg)
{
  err.style.display = 'block';
  err.innerHTML = msg;
}

function hideError(err)
{
  err.style.display = 'none';
}

function keyUpTel(e)
{
  if(e.key < 10 && e.key != ' ')
  {
    tel.value = tel.value.substring(0, 9);
  }
}

function showCode()
{
  tel.parentNode.style.display = 'none';
  code.style.display = 'block';
  isCode = true;
  printNumbersTimeout60_1000();
}