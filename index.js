/* Index page
 *
 * Contains a router (for default addr only)
 * which responds to POST and GET request.
 * Responses are created by bot.js and supporting files.
 *
 */

var http     = require('http');
var director = require('director');
var bot      = require('./bot.js');

// router: directs POSTs to bot.respond,
// GETs to this.ping
router = new director.http.Router({
    '/' : {
        post: bot.respond,
        get:  ping
    }
});


server = http.createServer(function(req, res) {
    req.chunks = [];
    req.on('data', function (chunk) {
        req.chunks.push(chunk.toString());
    });

    router.dispatch(req, res, function(err){
        res.writeHead(err.status, {"Content-Type": "test/plain"});
        res.end(err.message);
    });
});

port = Number(process.env.PORT || 5000);
server.listen(port);

function ping(){
    var link = '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ba3bkOYkF60?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe>';
    var intro = '<h1 style="font-family: Courier New">OPsBot, at your (dis)service!</h1>';
    this.res.writeHead(200, {
        "Content-Type": 'text/html',
        "Content-Length": Buffer.byteLength(link) + Buffer.byteLength(intro)
    });
    this.res.write(intro);
    this.res.write(link);
    this.res.end("OPsBot, at your (dis)service!");
}
