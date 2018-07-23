let connect = require('../modules/connect');

module.exports = async function(req,res) {
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
					let result = await con.query(`
						select s.firstname, s.lastname, t.name test_name, t.id test_id, l.name lvl_name, 
						r.count, r.dt, r.id result_id, t.body 
						from student s, test t, level l, result r 
						where s.id = r.student 
						and t.id = r.test 
						and l.id = t.level 
						and t.teacher = ?`, 
						[req.cookies['SAI']]);
					if(result[0].length > 0)
					{
						res.status(200).json({result: result[0]});
						for (var i = 0; i < result[0].length; i++) {
							let isread = await con.query('update result set isread = 1 where id=?', [result[0][i].result_id]);
						}
					}
					else
					{
						res.status(202).json({message: 'not found'});
					}

					break;
					case 'POST':
					if(!req.body.student || !req.body.test)
					{
						console.log('result::POST::ERORR::data not enought')
						res.sendStatus(418);
					}
					else
					{
						await con.query(`insert into result(student, test) values (?, ?)`, [req.body.student, req.body.test]);
						res.status(200).json({message: 'ok'});
					}
					break;
					case 'HOMEWORK':
					if(!req.body.student || !req.body.template)
					{
						console.log('result::HOMEWORK::ERORR::data not enought')
						res.sendStatus(418);
					}
					else
					{
						await con.query(`insert into homework(student, template) values (?, ?)`, [req.body.student, req.body.template]);
						res.status(200).json({message: 'ok'});
					}
					break;
					default:
					res.status(405).json({message: 'Invalid method'});
					break;
				}
			}
			catch(err)
			{
				console.log(err)
			}
			finally
			{
				con.end();
				con.destroy();
			}
		}
	}
};