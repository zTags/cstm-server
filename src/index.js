const fs = require("fs");

const { format } = require("util");
const { hash } = require("./lib.js");


const fileUpload = require("express-fileupload");
const express = require('express');
const { application } = require("express");
const app = express();
app.use(fileUpload);

function getPort() {
    let port;
    process.argv.forEach((val, index) => {
        if (val == "--port") {
            port = Number(process.argv[index + 1]);
            if (port != 1337) {
                console.warn("be sure to change the port in the Dockerfile");
            }
        }
    });

    return port;
}

function main() {
    if (process.argv[2] == "serve") {
        const port = getPort();
        app.listen(port, () => {
            console.log("Listening for requests at http://localhost:%i/", port)
        })
    }
}

app.get("/", (req, res) => {
    res.send("soup");
});

app.get("/api/v1/:package/metadata", async (req, res) => {
    fs.readFile(`/packages/${req.params.package}/package.json`, (err, data) => {
        if (err) res.status(404).send(format("you did a dumb u dum<br>404 not found (%s)", req.params.package))
        res.send(JSON.parse(data));
    })
});

app.get("/api/v1/:package/archive", async (req, res) => {
    fs.readFile(`/packages/${req.params.package}/package`, (err, data) => {
        if (err) res.status(404).send(format("you did a dumb u dum<br>404 not found (%s)", req.params.package))
        res.send(data);
    })
});

// fuck you no post request
app.get("/api/v1/account/create", (req, res) => {
    // load in account json
    fs.readFile("/accounts/accounts.json", async (err, data) => {
        if (err) res.status(500).send("are you use `/accounts/accounts.json` exist?");

        let accJSON = JSON.parse(data);
        if (accJSON[req.query.user]) {
            res.status(409).send("user already exists");
        } else {
            accJSON[req.query.user] = {
                username: req.query.user,
                //pass: req.query.pass,
                hash: hash(req.query.pass),
                pkgPerms: false
            };

            fs.writeFile("/accounts/accounts.json", JSON.stringify(accJSON), err => {
                if (err) res.status(500).send("accounts.json file failed to save");
                res.send("successfully created account");
            });
        }
    })
});

app.get("/api/v1/account/:name", (req, res) => {
    // load in account json
    fs.readFile("/accounts/accounts.json", async (err, data) => {
        if (err) res.status(500).send("failed to load account json");
        const accJSON = JSON.parse(data);
        if (accJSON[req.params.name]) {
            res.send("user exists")
        } else {
            res.status(404).send("user didnt exist.")
        }
    }); 
});


/// this isnt rlly working rn so yea dont uncomment it
// app.get("/api/v1/package/new", (req, res) => {
//     // first of all, check if the uses exists and is authenticated corretly
//     let accJSON;
//     let pkgJSON = {};
//     fs.readFile("/accounts/accounts.json", (err, data) => {
//         if (err) res.status(500).send("problem loading account.json")
//         accJSON = JSON.parse(data);
//     });
//     if (accJSON[req.query.user].hash == hash(req.query.pass)) {
//         if (accJSON[req.query.repo]) {
//             pkgJSON.committer = req.query.user;
//             pkgJSON.repo = req.query.repo;
//             pkgJSON.pkg = req.query.link;
//             res.send(pkgJSON);
//         } else {
//             req.status(404).send("pls add git repo");
//         }
//     } else {
//         req.status(403).send("wrong password");
//     }
// });

main();