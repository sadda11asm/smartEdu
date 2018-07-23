let config = require('./config/config');
let express = require('express');
let bodyParser = require('body-parser');
let cron = require('node-cron');
let axios = require('axios');
let busboyBodyParser = require('busboy-body-parser');
let cookieParser 	= require('cookie-parser');
let app = express();
let http = require('http').Server(app);

//APP>USE
	app.use(cookieParser());
	app.use(busboyBodyParser());
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended:false}));
	app.use('/static', express.static('./static'));
	app.use('/common', express.static('../public'));
	app.set('view engine', 'ejs');

//REQUIRES
	let connect 		= require('./modules/connect');
	let prevNotice 		= require('./modules/prevNotice');
	let lessonOpen 		= require('./modules/lessonOpen');
	let lessonClose 	= require('./modules/lessonClose');
	let account 		= require('./routes/account');
	let teacher 		= require('./routes/teacher');
	let graph 			= require('./routes/graph');
	let schedule 		= require('./routes/schedule');
	let requests	 	= require('./routes/req');
	let group 			= require('./routes/group');
	let student 		= require('./routes/student');
	let chat 			= require('./routes/chat');
	let notice 			= require('./routes/notice');
	let uploadPicture 	= require('./routes/uploadPicture');
	let sendFile 		= require('./routes/sendFile');
	let test 			= require('./routes/test');
	let level 			= require('./routes/level');
	let result 			= require('./routes/result');
	let template 		= require('./routes/template');
	let tempFile 		= require('./routes/tempFile');


//Связь с ботом
	// app.post('/message', async function (req,res)
	// {
	// 	console.log(req.body)
	// 	if(req.body.notice == null)
	// 	{
	// 		res.status(405).json({message: 'no notice'});
	// 	}
	// 	else
	// 	{
	// 		let con = await connect();
	// 		switch(Number(req.body.notice))
	// 		{
	// 			//Сокет на сообщение
	// 			case 0:
	// 			if(!req.body.student_id || !req.body.group_id || req.body.type == null || req.body.content == null)
	// 			{
	// 				res.status(418).json({message: 'no student_id , group_id, type or content'});
	// 			}
	// 			else
	// 			{
	// 				let teacher_info = await con.query('select teacher_id from gr where group_id = ?', [req.body.group_id]);
	// 				let student_info = await con.query('select * from student where student_id = ?', [req.body.student_id]);
					
	// 				if(teacher_info[0].length > 0 && student_info[0].length > 0)
	// 				{
	// 					let teacher_id 	= teacher_info[0][0].teacher_id;
	// 					let firstname 	= student_info[0][0].firstname;
	// 					let lastname 	= student_info[0][0].lastname;

	// 					let body = 
	// 					{
	// 						socket_type 	: 1,
	// 						student_id 		: req.body.student_id,
	// 						firstname 	 	: firstname,
	// 						lastname 		: lastname,
	// 						group_id 		: req.body.group_id,
	// 						content 		: req.body.content,
	// 						type 			: req.body.type,
	// 						title 			: req.body.title
	// 					}

	// 					socket.clients.forEach( (ws) => 
	// 					{
	// 						if (ws.userid === teacher_id)
	// 						{
	// 							ws.send(JSON.stringify(body));
	// 						}
	// 					});
	// 					res.status(200).json({message: 'Successfuly delievered'});
	// 				}
	// 				else
	// 				{
	// 					if(teacher_info[0].length < 1)
	// 					{
	// 						res.status(202).json({message: 'Чья это группа?'});
	// 					}
	// 					else
	// 					{
	// 						res.status(202).json({message: 'Я не знаю такого студента'});
	// 					}
	// 				}
	// 			}
	// 			break;
	// 			//Сокет на новую заявку
	// 			case 1:
	// 			if(!req.body.student_id)
	// 			{
	// 				res.status(418).json({message: 'no student_id'})
	// 			}
	// 			else
	// 			{
	// 				let re 	= await con.query('select student.student_id, firstname, lastname, lvl, lvl_name, req_dt, req.rate_id, lessons '+
	// 					'from smartchat.student, smartchat.lvl, smartchat.req, smartchat.rate '+
	// 					'where student.lvl = lvl.lvl_id '+
	// 					'and student.student_id = req.student_id '+
	// 					'and req.student_id  = ? '+
	// 					'and req.rate_id = rate.rate_id ', 
	// 					[req.body.student_id]);

	// 				let teacher_id = await con.query('select teacher_id from req where student_id = ?', req.body.student_id);
	// 				teacher_id = teacher_id[0][0].teacher_id;

	// 				console.log('Заявка для учителя с id = ' + teacher_id);
	// 				let body =
	// 				{
	// 					socket_type : 3,
	// 					msg 		: 'Новая <a href="/requests">заявка</a>',
	// 					data 		: re[0][0]
	// 				}

	// 				res.status(200).json({message: 'ok'});
					
	// 				socket.clients.forEach( (ws) => 
	// 					{
	// 						console.log('Проверяем учителя с id = ' + ws.userid);
	// 						if(ws.userid == teacher_id)
	// 						{
	// 							ws.send(JSON.stringify(body));	
	// 							console.log('Отправляем сообщение учителю с id = ' + ws.userid);
	// 						}		
	// 					});
	// 			}
	// 			break;
	// 			//Сокет на удаление студента из группы
	// 			case 2:
	// 			if(!req.body.student_id || !req.body.group_id || !req.body.group_name || !req.body.teacher_id || req.body.deleted == null)
	// 			{
	// 				res.status(418).json({message: 'no student_id, teacher_id, delete status, group_id or group_name'});
	// 			}
	// 			else
	// 			{
	// 				let student_info = await con.query('select * from student where student_id = ?', [req.body.student_id]);

	// 				let firstname = student_info[0][0].firstname;
	// 				let lastname = student_info[0][0].lastname;

	// 				let body =
	// 				{
	// 					socket_type : 2,
	// 					msg 		: ''
	// 				}
	// 				if(req.body.deleted)
	// 				{
	// 					body.msg = '<a href="/student?id='+req.body.student_id+'">' + firstname + ' ' + lastname + '</a>'
	// 					+ ' покинул группу ' + req.body.group_name + '. Группа удалена!'
	// 				}
	// 				else
	// 				{
	// 					body.msg = '<a href="/student?id='+req.body.student_id+'">' + firstname + ' ' + lastname + '</a>'
	// 					+ ' покинул группу <a href="/group?id='+req.body.group_id+'">' + req.body.group_name + '</a>!';
	// 				}
	// 				let delivered = false;

	// 				socket.clients.forEach( (ws) => 
	// 				{
	// 					if (ws.userid == req.body.teacher_id)
	// 					{
	// 						ws.send(JSON.stringify(body));
	// 						delivered = true;
	// 					}
	// 				});
	// 				if(!delivered)
	// 				{
	// 					let insert = await con.query('insert into notice(teacher_id, content) values (?,?)', 
	// 						[req.body.teacher_id, body.msg]);
	// 				}
	// 				res.status(200).json({message: 'ok'});
	// 			}
	// 			break;
	// 			//Сокет на удаление заявки
	// 			case 3:
	// 			if(!req.body.student_id || !req.body.teacher_id)
	// 			{
	// 				res.status(418).json({message: 'no student_id or teacher_id'})
	// 			}
	// 			else
	// 			{
	// 				let student_info = await con.query('select * from student where student_id = ?', req.body.student_id);
	// 				let student_name = student_info[0][0].firstname + ' ' + student_info[0][0].lastname;

	// 				let body = 
	// 				{
	// 					socket_type :  4,
	// 					msg 		: 'Студент ' + student_name + ' удалил свою заявку!',
	// 					student_id 	: req.body.student_id
	// 				}
	// 				let delivered = false;
	// 				socket.clients.forEach((ws) => 
	// 				{
	// 					if (ws.userid == req.body.teacher_id)
	// 					{
	// 						ws.send(JSON.stringify(body));
	// 						delivered = true;
	// 					}
	// 				});
	// 				if(!delivered)
	// 				{
	// 					let insert = await con.query('insert into notice(teacher_id, content) values (?,?)', 
	// 						[req.body.teacher_id, body.msg]);
	// 				}
	// 			}
	// 			res.status(200).json({message: 'готово'});
	// 			break;
	// 			default:
	// 			res.status(405).json({message: 'i don\'t know this notice'});
	// 			break;
	// 		}
	// 		con.end();
	// 	}
	// });

//APP.POST
	app.post('/account', account);
	app.post('/teacher', teacher);
	app.post('/graph', graph);
	app.post('/chart', schedule);
	app.post('/req', requests);
	app.post('/group', group);
	app.post('/student', student);
	app.post('/chat', chat);
	app.post('/notice', notice);
	app.post('/uploadPicture', uploadPicture);
	app.post('/sendFile', sendFile);
	app.post('/test', test);
	app.post('/level', level);
	app.post('/result', result);
	app.post('/template', template);
	app.post('/tempFile', tempFile);
//APP.GET
	//account
		app.get('/', function(req,res)
			{       
				if(!req.cookies['SAT']) res.render('account/login',{});
				else res.render('cabinet/profile',{})
			});

		app.get('/login', function(req,res)
			{
				res.render('account/login',{});
			});

		app.get('/registration', function(req,res)
			{
				res.render('account/registration',{});
			});

	//cabinet
		app.get('/graph', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else 
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "GRAPH"');
					res.render('cabinet/graph',{})
				}
			});

		app.get('/profile', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else 
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "PROFILE"');
					res.render('cabinet/profile',{})
				}
			});

		app.get('/template', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else 
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "TEMPLATE"');
					res.render('cabinet/template',{})
				}
			});

		app.get('/schedule', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else 
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "SCHEDULE"');
					res.render('cabinet/schedule',{})
				}
			});

		app.get('/redact', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else 
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "REDACT"');
					res.render('cabinet/redact',{})
				}
			});

	//students
		app.get('/requests', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else
				{ 
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "REQUESTS"');
					res.render('students/requests',{});
				}
			});
		app.get('/chat', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else 
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "CHAT"');
					res.render('students/chat',{})
				}
			});
		app.get('/student', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "STUDENTS"');
					res.render('students/students',{});
				}
			});

		app.get('/group', function(req,res)
			{
				if(!req.cookies['SAT']) res.render('account/login',{});
				else
				{
					console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "GROUP"');
					res.render('students/group',{});
				}
			});

	//tests
		app.get('/test', (req,res)=> 
		{
			if(!req.cookies['SAT']) res.render('account/login',{});
			else 
			{
				console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "TEST"');
				res.render('test/test',{});
			}
		});
		app.get('/result', (req,res)=> 
		{
			if(!req.cookies['SAT']) res.render('account/login',{});
			else 
			{
				console.log(req.cookies['SAI'] + ':' + req.cookies['SAT'] + '  on page "RESULT"');
				res.render('test/result',{});
			}
		});
		
http.listen(config.port, function()
{
    console.log('Сервер прослушивает порт: ' + config.port);
});
