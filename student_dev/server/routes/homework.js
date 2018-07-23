 let ctrls = require('../controllers/homework')

module.exports = async function(req, res) {
	console.log(req.body);
	try {
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'ALL':
				console.log('GET MY HOMEWORKS INFO');
				result = await ctrls.getHomeworksList(req)
				res.status(result.status).json(result)		
				break;
			case 'TEMPLATE':
				console.log('GET TESTS INFO');
				result = await ctrls.getTemplate(req)
				res.status(result.status).json(result)		
				break;
			case 'UPLOAD':
				console.log('GET TESTS INFO');
				result = await ctrls.uploadFile(req);
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