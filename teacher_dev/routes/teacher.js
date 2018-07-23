let connect = require('../modules/connect');

module.exports = async function(req,res)
{
	if(!req.body.method)
	{
		res.status(405).json({message: 'no method'});
	}
	else
	{
		let con = await connect();
		switch(req.body.method)
		{
			case "INFO":
			if(!req.cookies['SAI'])
			{
				res.status(418).json({message: 'no index'});
			}
			else
			{
				let [rows, fields] = await con.query('select firstname, lastname, phone, email, ava FROM teacher where id = ?',
					[req.cookies['SAI']])
				if(rows.length > 0)
				{
					res.status(200).json({body: rows[0]});
				}
				else
				{
					res.status(202).json({message: 'not found'});
				}
			}
			break;
			case 'PATCH':
			if(!req.cookies['SAI'])
			{
				res.status(418).json({message: 'no index'});
			}
			else
			{
				if(!req.body.lastname || !req.body.phone || !req.body.login)
				{
					res.status(418).json({message: 'Заполните все поля!'})
				}
				else
				{
					let updated = await con.query('update teacher set firstname = ? , lastname = ?, phone = ? where id = ?'
						,[req.body.login, req.body.lastname, req.body.phone, req.cookies['SAI']]);
					if(updated[0].affectedRows > 0)
					{
						res.status(200).json({message: 'ok'});
					}
					else
					{
						res.status(202).json({message: 'not found'});
					}
				}
			}
			break;
			case 'PATCH-PASS':
			if(!req.cookies['SAI'])
			{
				res.status(418).json({message: 'no index'});
			}
			else
			{
				if(!req.body.pass || !req.body.oldpass)
				{
					res.status(418).json({message: 'fields error'});
				}
				else
				{
					let [rows, fields] = await con.query('select pass from teacher where id = ?', 
						[req.cookies['SAI']]);
					if(rows.length > 0)
					{
						if(rows[0].pass == req.body.oldpass)
						{
							let updated = await con.query('update teacher set pass = ? where id = ?',
								[req.body.pass, req.cookies['SAI']]
								);
							if(updated[0].affectedRows> 0)
							{
								res.status(200).json({message: 'ok'});
							}
							else
							{
								res.status(202).json({message: 'Не удалось изменить пароль ('})
							}
						}
						else
						{
							res.status(200).json({message: 'Неверный пароль!'});
						}
					}
					else
					{
						res.status(202).json({message: 'not found'});
					}
				}
			}
			break;
			default:
			res.status(405).json({message: 'Invalid method'});
			break;
		}
		con.end();
		con.destroy();
	}
}