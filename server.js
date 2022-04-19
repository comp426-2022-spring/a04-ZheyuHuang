/*
app.get("/app/echo/", (req, res) => {
  res.status(200).json({ 'message' : req.query.number });
  res.status(200).json({ 'message' : req.body.number });
});

app.use(express.json())
app.use(express.urlencoded({extended : true}))

const logging = (req, res, nect) => {
  res.statusCode = 200
  console.log(req.ip + ' - - ' + Date.now())
  next()
}
// Logging middleware
app.use(logging )

*/


// Require Express.js
const express = require("express");
const app = express();

const logdb = require('./database')
const morgan = require("morgan")
//const errorhandler = request('errorhandler')
const fs = require("fs")

const args = require("minimist")(process.argv.slice(2));
args["port"]
//const port = args.port || 5000;

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

app.getMaxListeners("/app/error/", (req, res) => {
  throw new Error("Error test successful")
})

// Define default endpoint
// Default response for any other request
app.use(function (req, res) {
  const statusCode = 404
  const statusMessage = "Not FOUND"
  res.status(statusCode).end(statusCode + ' ' + statusMessage)
});
