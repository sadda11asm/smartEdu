let axios = require('axios');
let config = require('../config/config');

module.exports = function(object)
{
	axios.post(config.bot, object);
	console.log('Отправка боту сообщения!   ' + 'body = ' , object );
}
