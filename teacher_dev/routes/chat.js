let connect = require('../modules/connect');

module.exports = async function(req,res)
{
	if(!req.cookies['SAI'])
	{
		res.status(418).json({message: 'no index'});
	}
	else
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
					case 'GET':
					if(!req.body.group_id)
					{
						let selected = await con.query('select * from chat where _group in (select id from _group where teacher = ?) ', [req.cookies['SAI']]);
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
						let selected  = await con.query(`
									select chat._group  group_id, sender sender_id, dt, content, title, type, isteacher, firstname, 
									if(isteacher = 0, (select firstname from student where id = sender), null) as sender_name
									from chat 
									left join student on sender = student.id 
									where chat._group = ? 
									and chat._group in 
										(select id from _group where teacher = ?) 
									order by dt`
							, [req.body.group_id, req.cookies['SAI']]);
						if(selected[0].length > 0)
						{
							await con.query(`
								delete from unreadMes 
								where message in 
									(select id from chat where _group = ? and isteacher = 0)`, 
								req.body.group_id);
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({message: 'empty'});
						}
					}
					break;
					case "GET-CHAT":
					if(!req.body.group_id)
					{
						let selected = await con.query(`
								select * from _group 
								where teacher = ? and id in (select _group from studentGroup)`,
						[req.cookies['SAI']]);
						if(selected[0].length>0)
						{
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({message: 'not found!'});
						}
					}
					else
					{
						let selected = await con.query('select * from _group where teacher = ? and id = ?', [req.cookies['SAI'], req.body.group_id]);
						if(selected[0].length>0)
						{
							res.status(200).json({body: selected[0]});
						}
						else
						{
							res.status(202).json({message: 'not found!'});
						}
					}
					break;
					case 'GET-MISS':
					let selected = await con.query(`
							select g.id group_id, count(c.id) as count 
							from _group g
							join chat c on g.id = c._group 
							where isteacher = 0 
							and c.id in
								(select message from unreadMes where user = ?)`, 
							[req.cookies['SAI']]);
					if(selected[0].length > 0)
					{
						res.status(200).json({body: selected[0]});
					}
					else
					{
						res.status(202).json({message: 'no missings'});
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