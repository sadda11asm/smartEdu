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
		try
		{
			switch(req.body.method)
			{
				case "GET":
				if(!req.cookies['SAI'])
				{
					res.status(418).json({message: 'no index'});
				}
				else
				{
					let selected = await con.query('select * from graph where teacher = ? order by nday', [req.cookies['SAI']]);
						if(selected[0].length > 0)
						{
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({message: 'not found'});
						}
				}
				break;
				case 'POST': 
				if(!req.cookies['SAI'])
				{
					res.status(418).json({message: 'no index'});
				}
				else
				{
					if(!req.body.mas)
					{
						res.status(418).json({message: 'no mas'});
					}
					else
					{
						let fl = true;
						let mas = req.body.mas.split(',');
						let [chart] = await con.query('select * from chart where _group in (select id from _group where teacher = ?)', [req.cookies['SAI']]);

						for(let i = 0; i<chart.length; i++)
						{
							let flag = false;
							let date = new Date(chart[i].day);
							for(let j = 0; j< mas.length; j = j +3)
							{
								if(mas[j+2] == date.getDay())
								{
									if(mas[j] <= chart[i].start && mas[j+1] >= chart[i].finish)
									{
										flag = true;
									}
								}
							}
							if(!flag)
							{
								res.status(202).json({message: 'У вас занятие, а вы удаляете!', day: date.getDay(), start: chart[i].start, finish: chart[i].finish});
								fl = false;
								break;
							}
						}
						if(fl)
						{
							let deleted = await con.query('delete from graph where teacher = ?', [req.cookies['SAI']]);

							for(let i = 0; i< mas.length; i = i + 3)
							{
								let inserted = await con.query('insert into graph(teacher, start, finish, nday) values (?,?,?,?)',
								[req.cookies['SAI'], mas[i], mas[i+1], mas[i+2]]
								);
							}
							res.status(200).json({message: 'ok'});
						}
					}
				}
				break;

				default: 
				res.status(405).json({message: 'Invalid method'});
				break;
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
}