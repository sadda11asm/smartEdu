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
					case "GET":
					let selected = await con.query(`SELECT l.id, l.name, l.rate 
													from smartEdu.level l
													join smartEdu.rate r on l.rate = r.id
													join smartEdu.company c on c.id = r.company
													join smartEdu.teacher t on t.company = c.id
													where t.id = ?`, req.cookies['SAI']);
					if(selected[0].length>0)
					{
						res.status(200).json({body: selected[0]});
					}
					else
					{
						res.status(202).json({message: 'empty'});
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