let connect = require('../modules/connect');

module.exports = async function(req,res)
{
	let con = await connect();
	try
	{
		if(!req.body.method)
		{
			res.status(405).json({message: 'no method'});
		}
		else
		{
			switch(req.body.method)
			{
			//Вход
				case 'LOGIN': 
				console.log(req.body);
				if(!req.body.email || !req.body.pass)
				{
					res.status(418).json({message: 'Заполните все поля!'});
				}
				else
				{
					let [rows] = await con.query('select * from teacher where email = ? and pass = ?'
						,[req.body.email, req.body.pass]);

					console.log(rows);
					
					if(rows.length > 0)
					{
						let [rows] = await con.query('select * from teacher where email = ?',[req.body.email]);
						res.cookie('SAT', rows[0].firstname, 1, {maxAge: 900000, httpOnly: true}); 
						res.cookie('SAI', rows[0].id, 2, {maxAge: 900000, httpOnly: true});

						console.log('+ connected ' + req.cookies['SAT'] + ' ( id = ' + req.cookies['SAI']+' )');
						res.status(200).json({message: 'ok'});
					}
					else
					{
						res.status(202).json({message: 'Неверный email или пароль!'});
					}
				}
				break;
			//Выход
				case 'EXIT':
				console.log('- disconnected ' + req.cookies['SAT'] + ' ( id = ' +  req.cookies['SAI']  + ' )');
				res.status(200).json({message: 'ok'});
				break;
			//Регистрация
				case 'REG':
				if(!req.body.login || !req.body.lastname || !req.body.phone || !req.body.pass || !req.body.email)
				{
					res.status(418).json({message: 'Заполните все поля!'});
				}
				else
				{
					let insert = await con.query('insert into teacher(firstname, lastname, phone, pass, email, company) values(?,?,?,?,?, 1)'
						,[req.body.login, req.body.lastname, req.body.phone, req.body.pass, req.body.email]);
					if(insert[0].affectedRows>0)
					{
						let [rows] = await con.query('select * from teacher where email = ?',[req.body.email]);
						res.cookie('SAT', rows[0].firstname, 1, {maxAge: 900000, httpOnly: true}); 
						res.cookie('SAI', rows[0].id, 2, {maxAge: 900000, httpOnly: true});
						
						console.log('+ registred & connected ' + req.cookies['SAT'] + ' ( id = ' + req.cookies['SAI']+' )');
						res.status(200).json({message: 'ok'});
					}
					else
					{
						res.status(202).json({message: 'can\'t insert'});
					}
				}
				break;
			//Проверка при регистрации
				case 'CHECK':
				if(!req.body.email)
				{
					res.status(418).json({message: 'Логин нужен!'});
				}
				else
				{
					let select = await con.query('select * from teacher where email = ?'
						,[req.body.email]);
					if(select[0].length >0 )
					{
						res.status(202).json({message: 'Пользователь с таким Email уже существует!'})
					}
					else
					{
						res.status(200).json({message: 'Хороший email!'});
					}
				}
				break;
			//Ошибка
				default:
				res.status(405).json( {message:'Invalid method'}); 
				break;
			}
		}
	}
	catch(err)
	{
		console.log(err);
	}
	finally
	{
		con.end();
		con.destroy();
	}
}