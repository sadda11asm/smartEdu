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
					case "GET":
					if(!req.body.group_id)
					{
						let groups = await con.query(`
									select count(s.id) as quantity, g.id group_id, g.name group_name 
									from _group g 
									join studentGroup sg on sg._group = g.id
									join student s on sg._group = g.id 
									where g.teacher = ? 
									and g.type = 0 
									group by g.id`, [req.cookies['SAI']]);
						if(groups[0].length > 0)
						{
							res.status(200).json({groups: groups[0]});
						}
						else
						{
							res.status(202).json({message: 'not found'});
						}
					}
					else
					{
						let students = await con.query(`
								select firstname, lastname, s.id student_id 
								from student s
								join studentGroup sg on sg.student = s.id
								where sg._group = ?`, 
							[req.body.group_id]);
						if(students[0].length > 0)
						{
							res.status(200).json({students: students[0]});
						}
						else
						{
							res.status(202).json({message: 'not found'});
						}
					}
					break;
					case "POST":
						let group = await con.query('update _group set name = ? where id = ?', [req.body.name, req.body.id]);
						res.status(200).json({message: 'success'});
					break;
					case "DELETE":
						let gr = await con.query('delete from _group where id = ?', [req.body.id]);
					res.status(200).json({message: 'success'});
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
				con.destroy();
				con.end();
			}
		}
	}
}