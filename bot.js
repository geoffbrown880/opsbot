var HTTPS = require("https");
var cmd   = require("./commands.js");

var botID = process.env.BOT_ID;
var DEBUG = false;

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// could potentially be quite annoying.
var important_people = {
    "13523133": {
        "real_name": "Geoff Brown",
        "response":  "Spake el Presidenté."
    },
    "16729780": {
        "real_name": "Brady Buckles",
        "response":  "The Vice President declared."
    },
    "20851463": {
        "real_name": "Paul Thieme",
        "response":  "Quoth the Lord of Sauce."
    },
    "8653173": {
        "real_name": "Zach Vander Missen",
        "response":  "Thundered the Band Demigod."
    },
    "8705029": {
        "real_name": "Maddy Coulter",
        "response":  "Chided Mom."
    },
    "20667846": {
        "real_Name": "Hannah Zentner",
        "response":  "Squeaked the OPs Gnome."
    },
    "30014495": {
        "real_name": "Dustin Messman",
        "response":  "Eat " + (Math.floor(Math.random() * (10 - 2 + 1)) + 10) + " dicks, Dustin."
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
        
        /*else if(request.user_id in important_people){
            console.log("quoting someone...");
            sendRecvReq(important_people[request.user_id].response);
        }*/

        if(!(request.user_id in important_people)){
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
        "office"  : "OPerations Void™",
        "officer" : "Team member :)",
        "officers": "Team members. It's pretty clear.",
        "0fficer" : "Now listen here, you little shit...",
        "corps"   : "Volunteer Management Team, or VMT for short.",
        "session" : "\"All-American\" Pregame Spectacular. What, did you " +
                    "think I'd have some long, snarky comment about it?",
        "head"    : "Team leader, you ass.",
        "ranks"   : "But ranks aren't real!",
        "geoff"   : "That's \"El Presidenté\", to you.",
        "brady"   : "Please refer the El Presidenté Vicio properly.",
        "staff"   : "Executive Team Leader. Or \"Band Demigod.\"",
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
            else if(sep[word] == "staff" && !(sep[word-2] && sep[word-2] == "chief"))
                continue;
            else if(sep[word] == "session" && !(sep[word-1] && sep[word-1] == "211"))
                continue;
            else if(sep[word] == "office" && !(sep[word-1] && sep[word-1] == "ops"))
                continue;
            else if(sep[word] == "corps" && !(sep[word-1] && sep[word-1] == "officer"))
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
