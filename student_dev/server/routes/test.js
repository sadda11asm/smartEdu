 let ctrls = require('../controllers/test')

module.exports = async function(req, res) {
	try {
		console.log(req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'COURSES':
				console.log('GET MY COURSES INFO');
				result = await ctrls.getCourseList(req)
				res.status(result.status).json(result)		
				break;
			case 'TESTS':
				console.log('GET TESTS INFO');
				result = await ctrls.getTests(req)
				res.status(result.status).json(result)		
				break;
			case 'GET':
				console.log('GET TEST INFO');
				result = await ctrls.getTest(req)
				res.status(result.status).json(result)		
				break;
			case 'RESULT':
				console.log('CHECK RESULTS');
				result = await ctrls.checkResult(req)
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