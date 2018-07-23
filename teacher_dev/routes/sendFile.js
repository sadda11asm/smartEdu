let fs = require('fs');
let multiparty = require('multiparty');
let config = require('../config/config');
module.exports = async function(req,res)
{
	var form = new multiparty.Form();

    var uploadFile = {path: '', type: '', size: 0};
   
    // при поступление файла
    form.on('part',async function(part) {
        //читаем его размер в байтах
        uploadFile.size = part.byteCount;
        //читаем его тип
        uploadFile.type = part.headers['content-type'];

        let date = new Date();
        path = date.valueOf()+'-' +part.filename
        //путь для сохранения файла
        uploadFile.path = './static/chatFiles/' + path;

        var out = fs.createWriteStream(uploadFile.path);
        part.pipe(out);

        res.send(config.domen + 'static/chatFiles/' + path);
    });

    // парсим форму
    form.parse(req);
}