 let ctrls = require('../controllers/request')

module.exports = async function(req, res) {
	try {
		console.log("body", req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'PERIODS':
				console.log('FREE PERIODS INFO OF STUDENT');
				result = await ctrls.getTeachersList(req)
				res.status(result.status).json(result)		
				break;
			case 'SEND':
				console.log('SEND REQUEST TO A TEACHER');
				result = await ctrls.sendRequest(req)
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