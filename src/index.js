const restify = require('restify');
const server = restify.createServer()
var route = require('./routes');

route.configRoutes(server);
server.use(
    function crossOrigin(req,res,next){
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        return next();
    }
);
server.listen(process.env.PORT || 1337)