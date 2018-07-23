let sessionParser = require('express-session')(
{
    key     : 'session_name',
    secret  : 'session_secret',
    resave  : true,
    saveUninitialized: true 
});

module.express = sessionParser;