var content = document.getElementById('content');
var popup = document.getElementById('popup');
var domen = 'http://' + top.location.href.split('/')[2] + '/';
var ws = new WebSocket('ws://aida.market:5155/');

var ws = new WebSocket(
    'ws://aida.market:5155/'
);

ws.onmessage = async function(event)
{
  let data = JSON.parse(event.data);
  switch(data.notice)
  {
    case 1:
      if(window.location.pathname == '/chat')
      {
          if(current_group == data._group) 
            {
              appendMsg(data, msgs);
              ws.send(JSON.stringify({
                notice: 8,
                _group: data._group
              }));
            }
          else setMiss(data._group);
      }
      else alert('новое сообщение'); 
    break;
    default: 
    console.log(data);
    alert(data.msg);
    break;
  }
};

function navClick(e)
{
	let target = e.target;
	let href = target.getAttribute('link');
	if(!href) href = target.parentNode.getAttribute('link');
	if(!href) href = target.parentNode.parentNode.getAttribute('link');
	if(href) goto(href)
}

function goto(href)
{
  let domen = 'http://' + top.location.href.split('/')[2] + '/'; 
  window.history.pushState({page_id: 0, page: 'page'}, '', domen + href);
  generateContent();
}

function paintMenu(hr)
{
  let menu = document.getElementById('nav_menu');

  let children = menu.children;

  for(let i = 0; i< children.length; i++)
  {
    children[i].children[0].classList.remove('current_nav');
    if(children[i].getAttribute('link') == hr)
    {
      children[i].children[0].classList.add('current_nav');
    }
  }
}

function getNotFoundPage()
{
	content.innerHTML = 'уходи отсюда';
}

function exitSystem()
{
	deleteCookie('SAU');
	deleteCookie('SAP');
  deleteCookie('SAI');
  top.location.href = '/sign';
}


function POST(route, params, funct)
{
  let api = 'http://aida.market:5150'
  let req = new XMLHttpRequest();
  req.onreadystatechange = function()
  {
    if(req.readyState == 4) 
    {
      let res = JSON.parse(req.response);
      funct(res, req.status);
    }
  }
  req.open("POST", api + route);
  req.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
  req.send(params);
}

//Загрузка файла
function sendFile(route ,file, method, funct)
{
    //Создаем объек FormData
    var data = new FormData();
        //Добавлем туда файл
        data.append('uploadFile', file);
        data.append('method', method);
        if(name) data.append('name', name);
        $.ajax({
          url: route,
          data: data,
          cache: false,
          contentType: false,
          processData: false,
          type: 'POST',
          success: function(response) {
            funct(response);
          }
        });
      }


// Функция генегирует произвольную строку
function makeid() 
{
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


  // Функция возвращает время по секундам
  function getTime(sec)
  {
    let time = '';
    let min   = Math.round(sec / 60); 
    let hour  = Math.round(min / 60); 

    while(min >= 60)
    {
      min -= 60; 
    }

    sec = Math.round(sec);
    while(sec >= 60)
    {
      sec -= 60;
    }

    if(hour > 0) time = time + hour + ':';

    if(min > 9) time = time + min + ':';
    else time = time + '0' + min + ':';

    if(sec > 9) time += sec;
    else time += '0'+ sec;

    return time;
  }

  //Звуковой генератор
  function sound(i)
  {
    let audio = new Audio();
    switch(i)
    {
      case 1: 
      audio.src = '/aud/pop.mp3';
      break;
      case 2:
      audio.src = '/aud/notif.wav';
      break;
    }
    audio.play();
  }

// Функция определяющая тип файла
function getFileType(file)
{
  let type = file.type.split('/')[0];
  switch(type)
  {
    case 'image':   return 2;
    case 'audio':   return 3;
    case 'video':   return 5;
    default:    return 4;
  }
}