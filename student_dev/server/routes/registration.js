let ctrls = require('../controllers/registration')

module.exports = async function(req, res) {
	try {
		console.log(req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'REGISTRATION':
				console.log('REGISTRATION OF STUDENT');
				result = await ctrls.addStudent(req)
				res.status(result.status).json(result)		
				break;
			case 'VERIFY':
				console.log('VERIFY OF STUDENT');
				result = await ctrls.verifyStudent(req)
				res.status(result.status).json(result)		
				break;
			case "LOGIN":
				console.log('LOGIN OF STUDENT');
				result = await ctrls.loginStudent(req)
				if (result.status==200) {
					res.cookie('SAU', result.phone, 1, { maxAge: 900000, httpOnly: true });
					res.cookie('SAP', result.password, 2, { maxAge: 900000, httpOnly: true });
					res.cookie('SAI', result.id, 3, { maxAge: 900000, httpOnly: true })
				}
				res.status(result.status).json(result)		
				break;
			case 'SMS':
				console.log('GENERATE SMS');
				result = await ctrls.sendSMS(req)
				res.status(result.status).json(result)
				break;
			case 'PASSWORD':
				console.log('RENEW PASSWORD');
				result = await ctrls.updatePassword(req)
				res.status(result.status).json(result);
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