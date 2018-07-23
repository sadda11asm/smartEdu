
exports.sendFile = async function(req)
{
  console.log(req.files);

    let fileData = req.files.uploadFile.data;

    let date = new Date();
    let path = date.valueOf() + req.files.uploadFile.name;
    
    let config = require('../config');
    let fs = require('fs');

    if(fs.existsSync("./../../public/files/" + path)) 
    {
    //если загружаемый файл существует удаляем его
        fs.unlinkSync("./../../public/files/" + path);
    }

    await fs.writeFileSync("./../../public/files/" + path, fileData, 'binary');

    return {status: 200, file: path};

}