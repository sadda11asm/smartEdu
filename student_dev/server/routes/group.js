let ctrls = require('../controllers/group')

module.exports = async function(req, res) {
	try {
		console.log(req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'GET':
				console.log('GET STUDENT GROUPS');
				result = await ctrls.getGroup(req)
				res.status(result.status).json(result)		
				break;
			default:
				res.status(404).json({
					message: "NO FOUND METHOD PROVIDED"
				});
				break;			
		}
	} catch (err) {
		console.log("*** error *** ")
		console.log(err)
		res.status(404).json({ "Error: ": err.message})
	}
} 