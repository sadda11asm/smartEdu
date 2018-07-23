let connect = require('../modules/connect');

module.exports = async function(req,res)
{
	if(!req.body.method)
	{
		res.status(405).json({message: 'no method'});
	}
	else 
	{
		if(!req.cookies['SAI'])
		{
			res.status(418).json({message: 'no index'});
		}
		else
		{
			let con = await connect();
			try
			{
				switch(req.body.method)
				{
					case 'GET':
					if(!req.body.test_id)
					{
						let selected = await con.query(`
									select t.id test_id, t.dt, t.name test_name, l.name lvl_name 
									from test t
									join level l on l.id = t.level 
									where t.teacher = ? 
									order by t.dt desc`, 
							req.cookies['SAI']);
						if(selected[0].length > 0)
						{
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({message: 'empty'});
						}
					}
					else
					{
						let selected = await con.query(`
							select t.id test_id, t.name test_name, t.body, 
							l.name lvl_name, l.id lvl_id 
							from test t 
							join level l on t.level = l.id 
							where t.id = ? 
							order by t.dt`, 
							req.body.test_id);

						if(selected[0].length > 0)
						{
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({message: 'empty'});
						}
					}
					break;
					case 'POST':
					if(!req.body.name || !req.body.lvl || !req.body.body || req.body.test_id == null)
					{
						res.status(418).json({message: 'no name, lvl or body'});
					}
					else
					{
						if(req.body.test_id == 0)
						{
							await con.query('insert into test(name, teacher, level, body) values (?,?,?,?)',
								[req.body.name, req.cookies['SAI'] ,req.body.lvl, req.body]);
						}
						else
						{
							await con.query('update test set name = ?, level = ?, body = ? where id = ?' ,
								[ req.body.name, req.body.lvl, req.body.body, req.body.test_id ]);
							res.status(200).json({message: 'ok'});
						}
					}
					break;
					case 'DELETE':
					if(!req.body.test_id)
					{
						res.status(418).json({message: 'no test_id'});
					}
					else
					{
						let deleted = await con.query('delete from test where id = ?', req.body.test_id);
						if(deleted[0].affectedRows > 0)
						{
							res.status(200).json({message: 'ok'});
						}
						else
						{
							res.status(202).json({message: 'not found'});
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
}