require('dotenv').config()

var restify = require('restify');
var Linkedin = require('node-linkedin')(process.env.LINKEDIN_CLIENT_ID, process.env.LINKEDIN_CLIENT_SECRET, process.env.LINKEDIN_CALLBACK_URL);

function authorize(req, res, next) {
    let scope = []; // Acho que isso são as authorizations que queremos. 
    var auth_url = Linkedin.auth.authorize(scope);
    res.send(auth_url);
    next();
}

var server = restify.createServer();
server.get('/api/auth', authorize);
server.get('/api/app', (req, res, next) => res.send('OK'))
server.listen(process.env.PORT, function() {
  console.log('%s listening at %s', server.name, server.url);
});