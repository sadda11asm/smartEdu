let ctrls = require('../controllers/chart')

module.exports = async function(req, res) {
	try {
		console.log(req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'DAYLY':
				console.log('GET STUDENT CHART FOR A DAY');
				result = await ctrls.getChart(req)
				res.status(result.status).json(result)		
				break;
			case 'DAYS':
				console.log('GET BUSY DAYS');
				result = await ctrls.getDays(req)
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