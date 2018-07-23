let fs = require('fs');
let multiparty = require('multiparty');
let connect = require('../modules/connect');
module.exports = async function(req,res)
{
	if(req.cookies['SAI'])
	{
		var form = new multiparty.Form();

	    var uploadFile = {path: '', type: '', size: 0};
	   
	    form.on('error', function(err){
	        if(fs.existsSync(uploadFile.path)) {
	            //если загружаемый файл существует удаляем его
	            fs.unlinkSync(uploadFile.path);
	            console.log('error');
	        }
	    });

	    // при поступление файла
	    form.on('part',async function(part) {
	        //читаем его размер в байтах
	        uploadFile.size = part.byteCount;
	        //читаем его тип
	        uploadFile.type = part.headers['content-type'];
	        //путь для сохранения файла
	        uploadFile.path = './static/profilePictures/' + req.cookies['SAT'] + '.png';

	        var out = fs.createWriteStream(uploadFile.path);
	        part.pipe(out);
	        let con = await connect();
	        let updated = await con.query('update teacher set ava = ? where teacher_id = ?', [uploadFile.path, req.cookies['SAI']]);
	        con.end();
	        con.destroy();
	        res.send('/static/profilePictures/' + req.cookies['SAT'] + '.png');
	    });

	    // парсим форму
	    form.parse(req);
		
	}
	else
	{
		res.status(418).json({message: 'no index'});
	}
}