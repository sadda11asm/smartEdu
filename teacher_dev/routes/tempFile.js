
module.exports = async function(req, res)
{
	console.log(req.files);

	let fileData = req.files.uploadFile.data;

	let date = new Date();
	let path = date.valueOf() + req.files.uploadFile.name;
	
	let fs = require('fs');

	await fs.writeFileSync("../public/files/" + path, fileData, 'binary');

	res.send(path);
}