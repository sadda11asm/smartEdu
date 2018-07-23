let ctrls = require('../controllers/chat')

module.exports = async function(req, res) {
	try {
		console.log(req.body);
		var method = req.body.method;
		if (!method) throw new Error("NOT FOUND METHOD PROVIDED!");
		let result;
		switch (req.body.method.toUpperCase()) {
			case 'GROUPS':
				console.log('GET GROUP CHATS');
				result = await ctrls.getChats(req)
				res.status(result.status).json(result)		
				break;
			case 'MESSAGES':
				console.log('GET MESSAGES OF CHAT');
				result = await ctrls.getMessages(req);
				res.status(result.status).json(result)		
				break;
			case 'READ':
				console.log('READ A CHAT');
				result = await ctrls.readChat(req);
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