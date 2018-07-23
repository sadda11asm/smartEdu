function getChatPage()
{
	content.innerHTML = `
	<div class = 'chat_container'>
		<div id = 'contacts' class="contacts">
		</div>
		<div id = 'chat' class = 'chat'>
			<div id = 'msgs' class = 'msgs'>
			</div>
			<div class = 'box' style='display:none'>
				<div class = 'msg_div'>
					<textarea id = 'text' class = 'text'></textarea>
					<img src="/img/paperclip.png" class  = 'screpka' onclick="document.getElementById('file').click()">
					<input type="file" id = 'file' style="display: none">
					<img src="/img/microfon.png" class="microfon" id='microfon'>
				</div>
				<div id ='files' class= 'files'>
				</div>
				<button id = 'send' class = 'send' onclick = 'sendMes()'>Отправить</button>
			</div>
		</div>
	</div>
	`;

	// Глобальные переменные
	window.contacts = document.getElementById('contacts');
	window.current_group = 0;
	window.msgs = document.getElementById('msgs');
	window.files = document.getElementById('files');
	window.file = document.getElementById('file');
	window.audio = new Audio();
	window.current_time_td;
	window.current_progress;
	window.current_img;
	window.controlBox = content.querySelector('.box');

	listeners();

	POST('/chat', `method=GROUPS`, (res,stat)=>
		{
			if(stat == 200)
			{
				for(let i=0; i<res.body.length; i++)
				{
					addChat(res.body[i], contacts);
				}
			}
		});
}


// Функция для получения списка групп
	function addChat(data, layout)
	{
		console.log(data);
		let contact = document.createElement('div');
		contact.classList.add('contact');
		contact.setAttribute('group_id', data.id);
		contact.innerHTML =`	
			<div class="photo_div">
				<img class="photo" src="${data.type? '/img/individ.png': '/img/chat.png'}">
			</div>
			<div class="info_div">
				<h2 class="name">${data.name}</h2>
				<div class="type">
					<p>тип: </p>
					<strong>${data.type?'Индивидуальный': 'Групповой'}</strong>
				</div>
				${data.unread_count>0? '<p class = "missCount">'+data.unread_count+'</p>': ''}
			</div>`;
		contact.addEventListener('click', ()=>
			{
				msgs.innerHTML = '';
				current_group = data.id;
				controlBox.style.display = 'block';
				paintChat(contact);
				getMessages(data.id);
				deleteMiss(data.id);
				
				ws.send(JSON.stringify({
					notice: 8,
					_group: data.id
				}));
			});
		layout.appendChild(contact);
	}

function getMessages(id)
{
	POST('/chat', 'method=MESSAGES&&group=' + id, (res)=>
	{
		let data = res.body;
		for(let i = 0; i<data.length; i++) appendMsg(data[i], msgs);	
	}); 
}

function paintChat(div)
{
	let divs = contacts.children;
	for(let i = 0; i < divs.length; i++)
	{
		divs[i].classList.remove('current_contact');
	}
	div.classList.add('current_contact');
}

function sendMes()
{
	let fls = files.children;
	let box = document.getElementById('text');
	let text = box.value;
	text = text.trim();

	if(fls.length > 0)
	{
		if(fls.length > 1)
		{
			ws.send(JSON.stringify({
				notice: 1,
				_group: current_group,
				content: text,
				type: 1}));
			text = '';
		}
			
		for(let i = 0; i<fls.length; i++)
		{
			let type = fls[i].getAttribute('type');
			let path = fls[i].getAttribute('path');

			ws.send(JSON.stringify({
				notice: 1,
				_group: current_group,
				content: path,
				type,
				title: text
			}));
			box.value = '';
			sound(1);
		}
		files.innerHTML = '';
	}
	else
	{
		if(text.length > 0)
		{
			ws.send(JSON.stringify({
				notice: 1,
				_group: current_group,
				content: text,
				type: 1
			}));
			box.value = '';
		}
	}
	msgs.scrollTo(0, msgs.scrollHeight);
}


function appendMsg(data, layout)
{
	data.is = data.sender == getCookie('SAI')? 1 : 0;
	switch(Number(data.type))
	{
		case 1: addSMS(data, layout); break;
		case 2: addPicture(data, layout); break;
		case 3: addAudio(data, layout); break;
		case 4: addFile(data, layout); break;
		case 5: addVideo(data, layout); break;
		default: console.log('Invalid Type'); break;
	}
	msgs.scrollTo(0, msgs.scrollHeight);
}

function listeners()
{
// Движение слайдера!
	audio.addEventListener('timeupdate', () =>
		{
			current_time_td.innerHTML = getTime(audio.currentTime);

			let position = audio.currentTime / audio.duration * 100;
			current_progress.style.left = position + '%';

			if(audio.currentTime == audio.duration) 	
			{
				current_img.src = '/img/play.png';
				current_progress.style.left = '0%';
			}
		});

// Обработка нажатия Enter в поле text
	document.getElementById('text').addEventListener('keyup', function(ev) 
	{
		if(ev.ctrlKey && ev.keyCode == 13) 
		{
			let box = document.getElementById('text'); 
			box.value = box.value + '\n';
		}
		else if(!ev.ctrlKey && ev.key == 'Enter') document.getElementById('send').click();
	});

// Обработка нажания на микрофон
	document.getElementById('microfon').addEventListener('click', function()
		{
		
		});

// Обработка нажатия на корзину
	files.addEventListener('click', function(e)
		{
			if(e.target.classList.contains('rem_img'))
			{
				files.removeChild(document.getElementById(e.target.getAttribute('delete')));
			}
		});

// Обработка добавления файла
	file.addEventListener('change', function(e)
	{
		let fl = file.files[0];
		let type = getFileType(fl);

		sendFile('/files', fl, 'SEND', (response) => 
		{
			hangFile( fl.name, type, response.file);
		})
	});
}

// Функция прикрептяет файл к чату
	function hangFile(name, type, path)
	{
		let div = document.createElement('div');
		let img = document.createElement('img');
		let a 	= document.createElement('span');
		let rem = document.createElement('img');

		div.classList.add('file_block');
		img.classList.add('file_img');
		a.classList.add('fname');
		rem.classList.add('rem_img');

		div.id = makeid();
		div.setAttribute('type', type);
		div.setAttribute('path', path)
		rem.setAttribute('delete', div.id);

		img.src = '/img/file.png';
		rem.src = '/img/rem.png';
		
		a.title = name;

		if(name.length > 15)
		{
			name = name.substr(0,15) + '...';
		}

		a.innerHTML = name;
		div.appendChild(img);
		div.appendChild(a);
		div.appendChild(rem);

		files.appendChild(div);
	}

// Функция удаляет количество непрочитанных сообщений
	function deleteMiss(id)
	{
		let children = contacts.children;

		for(let i = 0 ; i < children.length; i++)
		{
			if(children[i].getAttribute('group_id') == id)
			{
				let div = children[i].querySelector('.info_div');
				if(div.querySelector('.missCount'))
				{
					let count = div.querySelector('.missCount');
					div.removeChild(count);
				}
			}
		}
	};
//

function setMiss(id, num)
{
	let children = contacts.children;
	for(let i = 0 ; i < children.length; i++)
	{
		if(children[i].getAttribute('group_id') == id)
		{
			let div = children[i].querySelector('.info_div');
			console.log(div);
			if(div.querySelector('.missCount'))
			{
				let p = div.querySelector('.missCount');
				if(num) p.innerHTML = Number(p.innerHTML) + num;
				else p.innerHTML = Number(p.innerHTML) + 1;
			}
			else
			{
				let p = document.createElement('p');
				p.classList.add('missCount');
				if(num) p.innerHTML = num;
				else p.innerHTML = 1;
				div.appendChild(p);
			}
		}
	}
}