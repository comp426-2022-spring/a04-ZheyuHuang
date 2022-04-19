// Require Express.js
const express = require("express");
const app = express();

const logdb = require('./database.js')
const morgan = require("morgan")
//const errorhandler = request('errorhandler')
const fs = require("fs")

const args = require("minimist")(process.argv.slice(2));

const port = args.port || 5000
const debug = args.debug || false
const log = args.log || true
const help = args.help

args["port", "debug", "log", "help"]
console.log(args)


const helpmsg = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(helpmsg)
    process.exit(0)
}


// Copy functions from A2
function coinFlip() {
  let rand = Math.floor(Math.random() * 100 + 1);
  if (rand % 2 == 0) {
    return "heads";
  } else {
    return "tails";
  }
}

function coinFlips(flips) {
  if (!flips) {
    flips = 1;
  }
  const results = [];
  for (let i = 0; i < flips; i++) {
    results[i] = coinFlip();
  }
  return results;
}

function countFlips(array) {
  var object = {
    heads: 0,
    tails: 0,
  };

  array.forEach(myFunction);

  function myFunction(value, index, array) {
    if (value == "heads") {
      object["heads"] += 1;
    } else {
      object["tails"] += 1;
    }
  }
  return object;
}

function flipACoin(call1) {
  let call = call1;
  let flip = coinFlip();
  let result = "";
  if (call === flip) {
    result = "win";
  } else {
    result = "lose";
  }

  const object2 = { call, flip, result };
  return object2;
}

//Request Morgan
app.use(morgan('combined'))

// Start an app server
const server = app.listen(port, () => {
  console.log("App listening on port %PORT%".replace("%PORT%", port));
});

// Define check endpoint
app.get("/app/", (req, res) => {
  // Respond with status 200
  res.statusCode = 200;
  // Respond with status message "OK"
  res.statusMessage = "OK";
  res.writeHead(res.statusCode, { "Content-Type": "text/plain" });
  res.end(res.statusCode + " " + res.statusMessage);
});

app.use((req, res, next) => {
  let data = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
  }
  const stmt = logdb.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(data.remoteaddr, data.remoteuser, data.time, data.method, data.url, data.protocol, data.httpversion, data.status, data.referer, data.useragent);
  // res.status(200).json(info);
  next();
});

if (log == true) {
    // Use morgan for logging to files
    // Create a write stream to append (flags: 'a') to a file
    const accessLog = fs.createWriteStream('access.log', { flags: 'a' })
    // Set up the access logging middleware
    app.use(morgan('combined', { stream: accessLog }))
}
// Debug argument
if (debug === true){
  app.get("/app/log/access", (req, res) => {
    try {
        const stmt = logdb.prepare('SELECT * FROM accesslog').all();
        res.status(200).json(stmt)
    } catch (e) {
        console.error(e)
    }
})

  app.get("/app/error/", (req, res) => {
    throw new Error("Error test successful")
  })
}


app.get("/app/flip", (req, res) => {
  var flipVar = coinFlip();
  res.status(200).json({ flip: flipVar });
});

app.get("/app/flips/:number", (req, res) => {
  var flipVar2 = coinFlips(req.params.number);
  var flipVar3 = countFlips(flipVar2);
  res.status(200).json({ raw: flipVar2, summary: flipVar3 });
});

app.get("/app/flip/call/heads", (req, res) => {
  res.status(200).json(flipACoin("heads"));
});

app.get("/app/flip/call/:tails", (req, res) => {
  res.status(200).json(flipACoin("tails"));
});



// Define default endpoint
// Default response for any other request
app.use(function (req, res) {
  const statusCode = 404
  const statusMessage = "Not FOUND"
  res.status(statusCode).end(statusCode + ' ' + statusMessage)
});
