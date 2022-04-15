// Require Express.js
const express = require("express");
const app = express();

const args = require("minimist")(process.argv.slice(2));
const port = args.port || 5000;

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
  res.status(404).send("404 NOT FOUND");
});
