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
					let selected = await con.query('select * from notice where user = ? and isstudent = 0', req.cookies['SAI']);
					let select_req = await con.query('select * from request group by student having teacher = ?', req.cookies['SAI']);
					let select_sms = await con.query(`
							select * from smartEdu.unreadMes u
							join smartEdu.chat c on c.id = u.message
							where u.user = ? 
							and c.isteacher = 0`
						, req.cookies['SAI']);

					let select_tests = await con.query(`select id as result_id from result where test in 
						(select id from test where teacher = ?) and isread = 0`, req.cookies['SAI']);

					await con.query('delete from notice where user = ?', req.cookies['SAI']);
					let select_graph = await con.query('select * from graph where teacher = ? ', req.cookies['SAI']);

					// res.status(200).json({notice: selected[0], sms_count: select_sms[0].length, tests: select_tests[0].length});
					res.status(200).json({notice: selected[0], req_count: select_req[0].length, sms_count: select_sms[0].length, tests: select_tests[0].length, graph: select_graph[0].length});
					
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