function getHomeWorkPage(id)
{
	if(id)
	{
		homeWorkBlock(id);
	}
	else
	{
		homeWorkListBlock();
	}
}


function homeWorkListBlock() {
	content.innerHTML = 
	`<div class="hw-list">
		<div class="hw-header">
			<div class="hw-header__text">Курс</div>
			<div class="hw-header__text">Уровень</div>
			<div class="hw-header__text">Дата</div>
			<div class="hw-header__text">Статус</div>
			<div class="hw-header__text">Действия</div>
		</div>
		<div class="hw-body" id=hw_list></div>
	</div>`;

	POST('/homework', 'method=ALL', function(req) {
		console.log(req);
		if (req.status == 200) 
		{
			let hw_list = document.getElementById('hw_list');
			for (var i = 0; i < req.body.length; i++) 
			{
				createHomeWorkListBlockRow(req.body[i], hw_list);
			}
		} 
		else 
		{
			console.log(req.message)
		}
	})
}

function createHomeWorkListBlockRow(body, layout) {
	let div = document.createElement('div');
	div.classList.add('hw-body__row');
	div.innerHTML =
	`<div class="hw-body__text">${body.name}</div>
	 <div class="hw-body__text">${body.level_name}</div>
	 <div class="hw-body__text">${getDateFormatDMY(body.dt)}</div>
	 <div class="hw-body__text">${body.filepath != null ? 'Выполнено' : 'Не выполнено'}</div>
	 <div class="hw-body__text">
		 <div class="hw-body__button" id="hw_${body.id}">Просмотр</div>
	 </div>`;

	layout.appendChild(div);

	layout.querySelector('#hw_'+body.id).addEventListener('click', (e)=>
	{
		goto('homework/'+body.id);
	});
}

function getDateFormatDMY(d) {
	let date = new Date(d);
	let dd = date.getDate();
	let mm = date.getMonth()+1;
	let yyyy = date.getFullYear();

	if(dd<10){
	    dd='0'+dd;
	} 
	if(mm<10){
	    mm='0'+mm;
	} 

	date = dd+'.'+mm+'.'+yyyy;
	return date;
}

function homeWorkBlock(homework_id) {
	content.innerHTML = 
	`<div class="home-work">
		<div class="home-work__header">
			<div>Курс: English</div>
		</div>
		<div class="home-work__body">
			<input type="file" id="file_input" style="display: none;">
			<div class="home-work__task">
				<div class="home-work__text" id="task"></div>
			</div>
			<div class="home-work__template" id="template"></div>
			<div class="home-work__footer" id="footer"></div>
		</div>
	</div>`;

	homeWorkBlockTemplate(homework_id);
}

function homeWorkBlockTemplate(homework_id) {

	console.log(homework_id)

	POST('/homework', 'method=TEMPLATE&homework='+homework_id, function(req) {

		if (req.status == 200) {
			console.log(req);
			let template = document.getElementById('template');
			let imgFlag = true;
			let videoFlag = true;
			let audioFlag = true;
			let fileFlag = true;

			for (var i = 0; i < req.body.length; i++) {

				switch (req.body[i].type)
				{
					case 1:
						createTextContent(req.body[i].content);
					break;
					case 2:
						if (imgFlag) 
						{
							let imgTemp = document.createElement('div');
							imgTemp.classList.add('temp');
							imgTemp.id = 'img_content';
							template.appendChild(imgTemp);
							imgFlag = false;
						}
						createImgContent(req.body[i].content)
					break;
					case 5:
						if (videoFlag) 
						{
							let videoTemp = document.createElement('div');
							videoTemp.classList.add('temp');
							videoTemp.id = 'video_content';
							template.appendChild(videoTemp);
							videoFlag = false;
						}
						createVideoContent(req.body[i].content)
					break;
					case 3:
						if (audioFlag) 
						{
							let audioTemp = document.createElement('div');
							audioTemp.classList.add('temp');
							audioTemp.id = 'audio_content';
							template.appendChild(audioTemp);
							audioFlag = false;
						}
						createAudioContent(req.body[i].content)
					break;
					case 4:
						if (fileFlag) 
						{
							let fileTemp = document.createElement('div');
							fileTemp.classList.add('temp');
							fileTemp.id = 'file_content';
							template.appendChild(fileTemp);
							fileFlag = false;
						}
						createFileContent(req.body[i].content)
					break;
				}
			}

			let footer = document.getElementById('footer');
			sendButton = document.createElement('div');
			sendButton.classList.add('home-work__button');
			sendButton.innerHTML = 'Отправить файл с ответами';
			sendButton.addEventListener('click', (e)=>{
				sendSolvingHomework(homework_id);
			})
			footer.appendChild(sendButton);

		} else {
			console.log(req)
		}
	})
}

function sendSolvingHomework(homework_id) {
	document.getElementById('file_input').click();
	document.getElementById('file_input').addEventListener('change', function() {
		let files = this.files[0];
		
		sendFile('/files', files, 'SEND', function(req){
			sendIdAndFileName(homework_id, req.file);
		});
		this.value = '';
	})
}

function sendIdAndFileName(id, name) {
	POST('/homework', 'method=UPLOAD&homework='+id+'&filepath='+name, function(req) {
		console.log(req)
	})
}


// function uploadF()
// {
// 	let file = document.getElementById('file_input').files[0];
// 	document.getElementById('file_input').value = '';
// 	return file;
// }

// function sendSolvingHomeworkFile(route ,file, method, funct)
// {
//     //Создаем объек FormData
//     var data = new FormData();
//         //Добавлем туда файл
//         data.append('uploadFile', file);
//         data.append('method', method);
//         data.append('template', template;);
//         $.ajax({
//           url: route,
//           data: data,
//           cache: false,
//           contentType: false,
//           processData: false,
//           type: 'POST',
//           success: function(response) {
//             funct(response);
//           }
//         });
//       }


function createTextContent(content) {
	document.getElementById('task').innerHTML = content;
}

function createImgContent(content) {

	let div = document.getElementById('img_content');

	let temp = document.createElement('div');
	temp.classList.add('temp');

	let imgContainer = document.createElement('div');
	imgContainer.classList.add('temp__img');

	let img = document.createElement('img');
	img.src = '/static/files/'+content;

	imgContainer.appendChild(img);
	temp.appendChild(imgContainer);
	div.appendChild(temp);

}

function createVideoContent(content) {

	let div = document.getElementById('video_content');

	let temp = document.createElement('div');
	temp.classList.add('temp');

	let videoContainer = document.createElement('div');
	videoContainer.classList.add('temp__video');

	let video = document.createElement('video');
	video.src = '/static/files/'+content;
	video.controls = 'controls';

	videoContainer.appendChild(video);
	temp.appendChild(videoContainer);
	div.appendChild(temp);

}

function createAudioContent(content) {

	let div = document.getElementById('audio_content');

	let temp = document.createElement('div');
	temp.classList.add('temp');

	let audioContainer = document.createElement('div');
	audioContainer.classList.add('temp__audio');

	let audio = document.createElement('audio');
	audio.src = '/static/files/'+content;
	audio.controls = 'controls';

	audioContainer.appendChild(audio);
	temp.appendChild(audioContainer);
	div.appendChild(temp);

}

function createFileContent(content) {

	let div = document.getElementById('file_content');

	let temp = document.createElement('div');
	temp.classList.add('temp');

	let fileContainer = document.createElement('div');
	fileContainer.classList.add('temp__file');

	let file = document.createElement('div');
	file.classList.add('tempfile');

	let fileImgContainer = document.createElement('div');
	fileImgContainer.classList.add('tempfile__img');

	let img = document.createElement('img');
	img.src = '/img/file.svg';

	let fileNameContainer = document.createElement('div');
	fileNameContainer.classList.add('tempfile__name');

	let fileName = document.createElement('a');
	fileName.href = '/static/files/'+content;
	fileName.download = '';
	fileName.innerHTML = content

	fileImgContainer.appendChild(img);
	file.appendChild(fileImgContainer);

	fileNameContainer.appendChild(fileName);
	file.appendChild(fileNameContainer);
	
	fileContainer.appendChild(file);
	temp.appendChild(fileContainer);
	div.appendChild(temp);

}


