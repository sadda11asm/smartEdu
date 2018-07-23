let express = require('express'),
bodyParser 	= require('body-parser'),
WebSocket 	= require('ws'),
axios 		= require('axios'),
bcrypt 		= require('bcryptjs'),
cookieParser = require('cookie-parser'),
busboyBodyParser = require('busboy-body-parser');

let registration = require('./routes/registration');
let student = require('./routes/student');
let chart = require('./routes/chart');
let group = require('./routes/group');
let course = require('./routes/course');
let test = require('./routes/test')
let chat = require('./routes/chat')
let files = require('./routes/files') 
let request = require('./routes/request');
let homework = require('./routes/homework');
let cookieModel = require('./models/cookies');


global.config = require('./config.json');
global.socket = new WebSocket.Server({ port: config.wsport });

let app = express();
let http = require('http').Server(app);

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:false}));
app.use(busboyBodyParser());

app.use('/', express.static('../public'));
app.use('/static', express.static('./../../public'));

app.set('view engine', 'ejs');

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next();
});

app.use(async (req, res, next) =>{
    // console.log('****')
    // console.log(req.cookies);
    try {
      if (!req.cookies['SAU']|| !req.cookies['SAP']) throw new Error('No cookies');
      var result = await cookieModel.checkCookies(req.cookies['SAU'], req.cookies['SAP']);      
      if (!result) {
        req.cookies['SAU'] = null;
        req.cookies['SAP'] = null;
        console.log('not correct cookies');
      }
      next()
    } catch(err){
      console.log('middleware msg:', "no cookies")
      next()
      // return res.redirect('/sign')
    }
  })

app.get('/sign', (req,res) => {
    if (req.cookies['SAU'] && req.cookies['SAP']) {
      return res.redirect('/');
    }
    res.render('./../../views/account/sign', {});
  });

app.get('/activate', (req,res) => {
    res.render('./../../views/account/activate', {});
  });

app.get('/restore', (req,res) => {
    res.render('./../../views/account/restore', {});
  });

app.get('*', (req,res) => {
    if (req.cookies['SAP']) {
      res.render('./../../views/index', {});
    } else {
      res.render('./../../views/account/sign', {});
    }
  });


// app.get('/', (err, res) {

// })
app.post('/registration', registration);
app.post('/student', student);
app.post('/chart', chart);
app.post('/group', group);
app.post('/course', course);
app.post('/test', test);
app.post('/chat', chat);
app.post('/files', files);
app.post('/request', request);
app.post('/homework', homework);

http.listen(config.port, ()=>
	{ console.log('student_dev on port: ' + config.port); });