create table smartEdu.company
	(
		id 				int auto_increment primary key,
		name 			nvarchar(150) not null,
		max_students	int,
		min_students 	int,
		max_groups		int,
		bot 			nvarchar(200),
		email 			nvarchar(200) not null,
		password 		nvarchar(200) not null,
		access_key 		nvarchar(200) not null,
		activated		bool default false
	);

create table smartEdu.rate
	(
		id 			int auto_increment primary key,
		name 		nvarchar(500) not null,
		title 		nvarchar(1000) not null,
		content 	nvarchar(1000),
		cost 		int not null,
		lessons		int not null,
		unlim 		bool default false,
		type 		bool default false,
		company 	int not null,
		foreign key (company) references smartEdu.company(id)
			on update cascade on delete cascade
	);
	
create table smartEdu.level
	(
		id 		int auto_increment primary key,
		name 	nvarchar(100) not null,
		rate 	int not null,
		foreign key (rate) references smartEdu.rate(id) 
			on update cascade on delete cascade
	);

create table smartEdu.teacher
	(
		id 			int auto_increment primary key,
		firstname 	nvarchar(100) not null,
		lastname 	nvarchar(100) not null,
		phone 		nvarchar(100) not null,
		email 		nvarchar(100) not null unique,
		ava 		nvarchar(100) default 'avatar.jpg',
		pass 		nvarchar(100) not null,
		lessons 	int default 0,
		company 	int not null,
		foreign key (company) references smartEdu.company(id)
			on update cascade on delete cascade
	);

create table smartEdu.graph
	(
		id 			int auto_increment primary key,
		teacher 	int not null,
		nday 		int not null,
		start 		int not null,
		finish 		int not null,
		foreign key (teacher) references smartEdu.teacher(id)
			on update cascade on delete cascade
	);

create table smartEdu._group
	(
		id			int auto_increment primary key,
		name 		nvarchar(200) not null,
		type 		bool default false,
		started 	bool default false,
		teacher 	int not null,
		rate 		int not null,
		level 		int not null,
		foreign key (level) references smartEdu.level(id) 
			on update cascade,
		foreign key (rate) references smartEdu.rate(id) 
			on update cascade,
		foreign key (teacher) references smartEdu.teacher(id) 
			on update cascade on delete cascade
	);

create table smartEdu.chart
	(
		id 			int auto_increment primary key,
		day 		datetime not null,
		start 		int not null,
		finish 		int not null,
		lesson 		int not null,
		_group		int not null,
		foreign key (_group) references smartEdu._group(id)
			on update cascade on delete cascade
	);

create table smartEdu.student
	(
		id 			int auto_increment primary key,
		firstname 	nvarchar(100),
		lastname 	nvarchar(100),
		phone		nvarchar(25) unique,
		password 	nvarchar(100),
		chat_id		nvarchar(100) unique,
		ava 		nvarchar(100),
		age 		int,
		is_active  	boolean default false, 
		auth_id 	int
	);

create table smartEdu.studentGroup
	(
		id 		int auto_increment primary key,
		student int not null,
		_group 	int not null,
		nles 	int default 0,
		stream 	bool default false,
		foreign key (_group) references smartEdu._group(id)
	);

create table smartEdu.test
	(
		id 		int auto_increment primary key,
		name 	nvarchar(200) not null,
		teacher int not null,
		rate 	int not null,
		level 	int not null,
		dt 		datetime default NOW(),
		body	nvarchar(4000),
		foreign key (rate) references rate(id)
			on update cascade on delete cascade,
		foreign key (teacher) references teacher(id)
	);

create table smartEdu.request
	(
		id 		int auto_increment primary key,
		student int not null,
		start 	int not null,
		finish	int not null,
		nday 	int not null,
		dt 		datetime default NOW(),
		rate 	int not null,
		teacher int not null,
		level 	int not null,
		foreign key (level) references smartEdu.level(id) 
			on update cascade on delete cascade,
		foreign key (rate) references smartEdu.rate(id) 
			on update cascade on delete cascade,
		foreign key (student) references smartEdu.student(id) 
			on update cascade on delete cascade,
		foreign key (teacher) references smartEdu.teacher(id) 
			on update cascade on delete cascade
	);

create table smartEdu.result 
	(
		id 		int auto_increment primary key,
		student int not null,
		test 	int not null,
		count 	int,
		isread 	bool default false,
		dt 		datetime default NOW(),
		foreign key (test) references smartEdu.test (id) 
			on update cascade on delete cascade,
		foreign key (student) references smartEdu.student(id) 
			on update cascade on delete cascade
	);

create table smartEdu.chat
	(
		id 			int auto_increment primary key,
		_group 		int not null,
		sender		int not null,
		dt 			datetime default NOW(),
		content 	nvarchar(800) not null,
		title 		nvarchar(400),
		type 		int not null,
		isteacher	bool default false,
		foreign key(_group) references smartEdu._group(id) 
			on update cascade
	);

create table smartEdu.unreadMes
	(
		id 			int auto_increment primary key,
		user 		int not null,
		message 	int not null,
		isteacher 	bool default false,
		foreign key (message) references smartEdu.chat(id)
			on update cascade on delete cascade 
	);
create table smartEdu.notice
	(
		id 			int auto_increment primary key,
		user 		int not null,
		content 	nvarchar(400),
		dt 			datetime default NOW(),
		isstudent 	bool default false
	);

create table smartEdu.trial
	(
		id 			int auto_increment primary key,
		teacher 	int not null,
		student 	int not null,
		foreign key(teacher) references smartEdu.teacher(id)
			on update cascade on delete cascade,
		foreign key(student) references smartEdu.student(id)
			on update cascade on delete cascade
	);

create table smartEdu.free
	(
		id 			int auto_increment primary key,
		student 	int not null,
		teacher 	int not null,
		foreign key(student) references smartEdu.student(id)
			on update cascade on delete cascade,
		foreign key(teacher) references smartEdu.teacher(id)
			on update cascade on delete cascade
	);

create table smartEdu.rating 
	(
		id 		int auto_increment primary key,
		teacher int not null,
		student int not null
		-- blabla
	);

create table smartEdu.template
	(
		id 		int auto_increment primary key,
		teacher int not null,
		rate 	int not null,
		lesson 	int not null,
		level 	int not null,
		ord 	int not null default 0,
		dz 		bool default false
	);

create table smartEdu.content
	(
		id 			int auto_increment primary key,
		template 	int not null,
		type 		int not null,
		content 	nvarchar(2000) not null,
		foreign key (template) references smartEdu.template(id)
			on update cascade on delete cascade
	);

create table smartEdu.groupRequest
	(
		id 		int auto_increment primary key,
		_group 	int not null,
		start 	int not null,
		finish 	int not null,
		nday 	int not null,
		teacher int not null,
		level 	int not null,
		foreign key (level) references smartEdu.level(id)
			on update cascade on delete cascade,
		foreign key (teacher) references smartEdu.teacher(id)
			on update cascade on delete cascade,
		foreign key (_group) references smartEdu._group (id)
			on update cascade on delete cascade
	);

create table smartEdu.usedTemplate
	(
		id 			int auto_increment primary key,
		_group 		int not null,
		teacher 	int not null,
		template 	int not null,
		foreign key (_group) references smartEdu._group(id)
			on update cascade on delete cascade,
		foreign key (teacher) references smartEdu.teacher(id)
			on update cascade on delete cascade,
		foreign key (template) references smartEdu.template(id)
			on update cascade on delete cascade
	);

create table smartEdu.config
	(
		id 			int auto_increment primary key,
		_key 		nvarchar(200) not null,
		_value 		nvarchar(200) not null
	);

create table smartEdu.homework 
	(
		id 			int auto_increment primary key,
		student 	int not null,
		template 	int not null,
		checked 	boolean default false,
		score 		int,
		filePath 	nvarchar(2000),
		dt 			datetime default now(),
		foreign key (student) references smartEdu.student (id) 
			on update cascade on delete cascade,
		foreign key (template) references smartEdu.template (id) 
			on update cascade on delete cascade
	);


insert into smartEdu.company(name,max_students, min_students, 
max_groups, bot, email, password, access_key, activated)
values('Название компании', 5,1,1,'ссылка на бот', 'email компании',
'123456', 'access', 1);

insert into smartEdu.rate (name, title, content, cost, lessons, unlim, type,
company)
values ('The best', 'this is title', 'this is content', 1000, 1, 0, 0, 1);

insert into smartEdu.level(name, rate) 
values ('Начальный', 1);

insert into smartEdu.teacher(firstname, lastname, phone, email, 
ava, pass, company)
values ('An', 'Sher', '8787878787', 'afdsf@dsf.dsf', null, '123456', 1);

insert into smartEdu._group(name, type, teacher, rate, level) 
values('группа', 0,1,1,1);

insert into smartEdu.studentGroup(student, _group) 
values (1,1), (2,1),(3,1);

