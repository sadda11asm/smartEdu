let model = require('../model/model');
module.exports = async function(id, data, socket) {
	try {

		console.log("HASREAD!!!!!!!!");
		let userId = id.substr(1);

		if(id[0] == 's') data.isteacher = 0; 
		else if(id[0] == 't') data.isteacher = 1;
		else throw new Error('undefined id');

		console.log("ISTEACHER" + data.isteacher);

		data.sender = userId;
			
		await model.hasRead(userId, data.isteacher, data._group);
	}
	catch(err) {
		console.log('ERROR::sendMessage::', err);	
	}
}
		