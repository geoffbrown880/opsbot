var HTTPS = require("https");
var cmd   = require("./commands.js");

var botID = process.env.BOT_ID;
var DEBUG = false;


// could potentially be quite annoying.
var important_people = {
    "13523133": {
        "Real Name": "Geoff Brown",
        "Response":  "Spake el Presidenté."
    }
};


function respond(){
    var request = JSON.parse(this.req.chunks[0]);
    var cmd_reg = /^[\/\!].*/;
    var body_text;

    this.res.writeHead(200);

    if(request.text && !DEBUG){
        if(cmd_reg.test(request.text)){
            body_text = processCmd(request);
            console.log("someone did a command!");
        }

        else {//if(!(request.user_id in important_people)){
            if(censor(request.text))
                console.log("someone used a bad word.");
        }
    }

    if(DEBUG){
        console.log(JSON.stringify(request));
    }

    this.res.end();
}

function censor(text){

    // for censoring
    var naughty_words = {
        "office"  : "OPerations Void",
        "officer" : "Team member :)",
        "officers": "Team members. It's pretty clear.",
        "0fficer" : "Now listen here, you little shit...",
        "corps"   : "Volunteer Management Team, or VMT for short.",
        "211"     : "\"All-American\" Pregame Spectacular. What, did you " +
                    "think I'd have some long, snarky comment about it?",
        "head"    : "Team leader, you ass.",
        "ranks"   : "But ranks aren't real!",
        "geoff"   : "That's \"El Presidenté\", to you.",
        "brady"   : "Please refer the El Presidenté Vicio properly.",
        "chief"   : "Executive Team Leader. Or \"Band Demigod.\"",
        "r&r"     : "Student Life Team. What do they do? Who knows?"
    };

    // split, strip, and miniscule
    var sep = text.replace(/[\.\!\?,]/g, '').split(' ');
    for(index in sep){
        sep[index] = sep[index].toLowerCase();
    }

    // check for offenses
    for(word in sep){
        if(sep[word] in naughty_words){
            if(sep[word] == "head" && !(sep[word-1] && sep[word-1] == "office"))
                continue;
            else if(sep[word] == "chief" && !(sep[word+2] && sep[word+2] == "staff"))
                continue;
            else if(sep[word] == "211" && !(sep[word+1] && sep[word+1] == "session"))
                continue;
            else if(sep[word] == "office" && !(sep[word-1] && sep[word-1] == "ops"))
                continue;

            // we've found one!
            sendRecvReq(naughty_words[sep[word]]);
            return true;
        }
    }

    // nothing to censor :(
    return false;
}

function processCmd(request){
    sendRecvReq("Not a valid command: " + request.text);
}

function sendRecvReq(body_text){
    var options = {
        hostname: "api.groupme.com",
        path:     "/v3/bots/post",
        method:   "POST"
    };

    var body = {
        "bot_id": botID,
        "text":   body_text
    }

    var botReq = HTTPS.request(options, function(res){
        if(res.statusCode == 202) {} // all is well
        else{
            console.log("Ignoring a bad status code: "+ res.statusCode);
        }
    });

    if(DEBUG)
        console.log(botReq);

    botReq.on('error', function(err){
        console.log("error: " + JSON.stringify(err));
    });

    botReq.on('timeout', function(err){
        console.log("timeout: " + JSON.stringify(err));
    });

    botReq.end(JSON.stringify(body));
}


exports.respond = respond;
