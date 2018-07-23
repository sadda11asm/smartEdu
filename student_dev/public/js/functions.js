function FOR(mas, funct)
{
	for(let i=0; i<mas.length; i++)
	{
		funct(mas[i], i);
	}
}

// Функция добавляет сообщение в чат
	function addSMS(data, layout) 
	{
		let div = document.createElement('div');

		if(data.is) div.classList.add('right_message');
		else div.classList.add('left_message');

		div.innerHTML = data.content;
		let p = document.createElement('p');
		p.classList.add('student_name');
		p.innerHTML = data.sender_name;
		div.appendChild(p);
		layout.appendChild(div);
	}

// Функция добавляет картинку в чат
	function addPicture(data, layout) 
	{
		let div = document.createElement('div');
		if(data.is) div.classList.add('right_message');
		else div.classList.add('left_message');

		let img = document.createElement('img');
		img.classList.add('chat_picture');
		img.src = '/static/files/' + data.content;

		/*img.addEventListener('click', function() 
		{
			document.querySelector('.popImg').style.display = 'block';
			document.querySelector('#popImg').src = this.src;
		});*/

		if(data.title)
		{
			let p = document.createElement('p');
			p.innerHTML = data.title;
			p.classList.add('fileTitle');
			div.appendChild(p);
		}

		div.appendChild(img);

		if(!data.is)
		{
			let p = document.createElement('p');
			p.classList.add('student_name');
			p.innerHTML = data.sender_name;
			div.appendChild(p);
		}

		layout.appendChild(div);
	}

// Функция добавляет аудио в чат
	function addAudio(data, layout)
	{
		let div = document.createElement('div');
		if(data.is) div.classList.add('right_message');
		else div.classList.add('left_message');

		let table 	= document.createElement('table');
		let tr 		= document.createElement('tr');
		let pict_td = document.createElement('td');
		let line_td = document.createElement('td');
		let time_td = document.createElement('td');
		let line = document.createElement('div');
		line.classList.add('audio_line');

		line.addEventListener('click', (e)=>
			{
				if(!e.target.classList.contains('audio_progress') && progress == current_progress)
				{
					let max = line.offsetWidth;
					let cur = e.offsetX;

					let procent = cur/max;

					let toset = audio.duration * procent;
					audio.currentTime = toset;
				}
			});

		time_td.innerHTML = '00:00';
		time_td.classList.add('audio_time');

		let progress = document.createElement('div');
		progress.classList.add('audio_progress');

		let img = document.createElement('img');
		img.classList.add('play_btn');
		img.src = '/img/play.png'
		img.addEventListener('click', () => 
			{
				let ms = img.src.split('/');

				if(ms[ms.length-1] == 'play.png') 
				{
					let buts = document.getElementsByClassName('play_btn');
					for(let i = 0; i<buts.length; i++)
					{
						buts[i].src = '/img/play.png';
					}
					audio.src = '/static/files/' + data.content;
					audio.play(); 
					img.src = '/img/pause.png';

					current_time_td = time_td;
					current_progress = progress;
					current_img = img;
				}
				else 
				{
					img.src = '/img/play.png'
					audio.pause();
				}
			});

		line.appendChild(progress);
		line_td.appendChild(line);

		pict_td.appendChild(img);

		tr.appendChild(pict_td);
		tr.appendChild(line_td);
		tr.appendChild(time_td);
		table.appendChild(tr);
		if(data.title)
		{
			let p = document.createElement('p');
			p.innerHTML = data.title;
			p.classList.add('fileTitle');
			div.appendChild(p);
		}
		div.appendChild(table);

		if(!data.is)
		{
			let p = document.createElement('p');
			p.classList.add('student_name');
			p.innerHTML = data.sender_name;
			div.appendChild(p);
		}
		
		layout.appendChild(div);
	}

// Функция добавляет файл в чат
	function addFile(data, layout)
	{
		let div = document.createElement('div');
		if(data.is) div.classList.add('right_message');
		else div.classList.add('left_message');

		let file = document.createElement('div');

		let a = document.createElement('a');
		let img = document.createElement('img');
		img.src = '/img/download.ico';
		img.classList.add('download_file');
		a.href = '/static/files/' + data.content;
		a.classList.add('file_href');
		a.target = '_blank';
		a.appendChild(img);

		let filename = document.createElement('span');
		filename.classList.add('filename');
		let file_name = data.content;

		if(file_name.length > 7)
		{
			file_name = file_name.substr(0,10) + '...';
		}
		filename.innerHTML = file_name;
		filename.title = data.content
		a.appendChild(filename);

		file.appendChild(a);
		if(data.title)
		{
			let p = document.createElement('p');
			p.innerHTML = data.title;
			p.classList.add('fileTitle');
			div.appendChild(p);
		}
		div.appendChild(file);

		if(!data.is)
		{
			let p = document.createElement('p');
			p.classList.add('student_name');
			p.innerHTML = data.sender_name;
			div.appendChild(p);
		}

		layout.appendChild(div);
	}

// Функция добавляет видео в чат
	function addVideo(data, layout)
	{
		let div = document.createElement('div');
		if(data.is) div.classList.add('right_message');
		else div.classList.add('left_message');

		let video = document.createElement('video');
		video.classList.add('chat_video');
		video.controls = 'true';
		video.src = '/static/files/' + data.content;
		if(data.title)
		{
			let p = document.createElement('p');
			p.innerHTML = data.title;
			p.classList.add('fileTitle');
			div.appendChild(p);
		}
		div.appendChild(video);

		if(!data.is)
		{
			let p = document.createElement('p');
			p.classList.add('student_name');
			p.innerHTML = data.sender_name;
			div.appendChild(p);
		}

		layout.appendChild(div);
	}



function getCookie(name)
{
  return document.cookie.split(name+'=')[1].split(';')[0];
}

function setCookie(name, value, options) 
{
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) 
  {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) 
  {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) 
  {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) 
    {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name) 
{
  setCookie(name, "", 
  {
    expires: -1
  });
}