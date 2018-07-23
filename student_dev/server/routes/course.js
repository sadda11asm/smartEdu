let ctrls = require('../controllers/course')

module.exports = async function(req, res) {
	try {
		console.log(req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'GETALL':
				console.log('GET COURSES INFO');
				result = await ctrls.getCourses(req)
				res.status(result.status).json(result)		
				break;
			case 'GET':
				console.log('GET COURSE INFO');
				result = await ctrls.getCourse(req);
				res.status(result.status).json(result)		
				break;
			default:
				res.status(404).json({
					message: "NO SUCH METHOD!"
				});
				break;		
		}
	} catch (err) {
		console.log("*** error *** ")
		console.log(err)
		res.status(404).json({ "Error: ": err.message})
	}
} 