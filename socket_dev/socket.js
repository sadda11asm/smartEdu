let WebSocket = require('ws');
let socket = new WebSocket.Server({ port: 5155 });
let axios = require('axios');
let cookieParser = require('cookie-parser')({secret: 'secret'});
let cron = require('node-cron');


let model 				= require('./model/model')
let sendMessage 		= require('./controllers/sendMessage');
let newReq 				= require('./controllers/newReq');
let leaveGroup			= require('./controllers/leaveGroup');
let deleteReq			= require('./controllers/deleteReq');
let acceptReq			= require('./controllers/acceptReq');
let rejectReq			= require('./controllers/rejectReq');
let createdSchedule		= require('./controllers/createdSchedule');
let hasRead				= require('./controllers/hasRead');
let prevNotice 			= require('./controllers/prevNotice');
let lessonOpen 			= require('./controllers/lessonOpen');
let lessonClose 		= require('./controllers/lessonClose');
let courseEnd			= require('./controllers/courseEnd');

global.config = require('./config');


socket.on('connection', async function(ws, req) {
	console.log('connection');

	//Подключение
	cookieParser(req, null, async function() {
		console.log(req.cookies);
		//student
		let SAU 	= req.cookies['SAU'];
		//teacher
		let SAT 	= req.cookies['SAT'];

		let SAI 	= req.cookies['SAI'];
		if(SAU) 		ws.userid = 's' + SAI;
		else if(SAT) 	ws.userid = 't' + SAI;
		else {
			console.log('ERROR::onconnection:: undefined cookie <-----------------');
			ws.userid  = 'undefined user';
		}
		
		console.log('CONNECTED USER: ', ws.userid);
	});
	
	ws.on('message', async function(data) {	
		console.log("DATA " + data)
		data = JSON.parse(data);
		let notice = data.notice; 

		console.log('SOCKET-DATA:: ', data);
		switch(notice) {
			case 1: sendMessage(ws.userid, data, socket); 		break;
			case 2: newReq(ws.userid, data, socket); 			break;
			case 3: leaveGroup(ws.userid, data, socket); 		break;
			case 4: deleteReq(ws.userid, data, socket); 		break;
			case 5: acceptReq(ws.userid, data, socket); 		break;
			case 6: rejectReq(ws.userid, data, socket); 		break;
			case 7: createdSchedule(ws.userid, data, socket); 	break;
			case 8: hasRead(ws.userid, data, socket); 			break;
			default: console.log('ERROR::onmessage:: invalid notice <----------------'); break;
		}
	});
});

//NODECRON

cron.schedule('0 * * * *', async function() {
		// console.log('cron has runed');
		let date = new Date();

		console.log('CRON HAS RUNNED AT: ' + date.getHours() + ':' + date.getMinutes());

		let mounth = date.getMonth()+1;
		let today = date.getFullYear() + '-' + mounth + '-' + date.getDate();

	
		//Уведомляем преподов и студентов о приближении урока
		await prevNotice(date, today, socket, axios)
		//Уведомляем преподов и студентов о начале урока и открываем студентам stream
		await lessonOpen(date, today, socket, axios)
		//Уведомляем преподов и студентов об окончании урока, уменьшаем студентам nles и закрываем их stream
		await lessonClose(date, today, socket, axios)
		//Удаляем просроченное расписание
		await model.deleteOverdueCharts(date.getHours(), today);	
		//Удаляем группы у которых больше нету расписания
		await courseEnd();

	});
console.log('socket start');