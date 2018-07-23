let ctrls = require('../controllers/student')

module.exports = async function(req, res) {
	try {
		console.log(req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'PROFILE':
				console.log('GET STUDENT INFO');
				result = await ctrls.getProfile(req)
				res.status(result.status).json(result)		
				break;
			case 'STUDENTS':
				console.log('GET STUDENTS LIST');
				result = await ctrls.getStudents(req)
				res.status(result.status).json(result)
				break;
			case 'PATCH':
				console.log('UPDATE STUDENT PROFILE');
				result = await ctrls.updateProfile(req)
				res.status(result.status).json(result)		
				break;
			case 'DELETE':
				console.log('DELETE STUDENT PROFILE')
				result = await ctrls.deleteProfile(req)
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