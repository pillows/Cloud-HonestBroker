'use strict';

//
// app.js
//

const express = require('express');
const app = express();
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const server = ["10.10.10.1 ", // domain1-1 172.17.12.3
"172.17.12.4", // domain 1-2
"172.17.12.5" // domain 1-3,
"172.17.12.6", // domain 3-7
"172.17.12.7", // domain 3-8,
"172.17.11.4", // domain 2-4
"172.17.11.5", // domain 2-5,
"172.17.11.6" // domain 2-6]

app.use(bodyParser.json());
app.disable('etag');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, 'views/'));

app.get('/', function (req, res) {
    res.render('questions');
});

app.get('/network-admin', function (req, res) {
    res.render('admin');
});

app.get('/network-stats', function (req, res) {

    let rawdata = fs.readFileSync('status.json');
    let status = JSON.parse(rawdata);


    // let status =
    //     [
    //         [{
    //             "domain":"domain1",
    //             "vms":[
    //                 {"name":"vm1", "busy":true},
    //                 {"name":"vm2", "busy":true},
    //                 {"name":"vm3", "busy":false}
    //             ],
    //             "layers":[0.25, 0.1]
    //         },
    //         {
    //             "domain":"domain2",
    //             "vms":[
    //                 {"name":"vm4", "busy":true},
    //                 {"name":"vm5", "busy":true},
    //                 {"name":"vm6", "busy":false}
    //             ],
    //             "layers":[0.25, 0.1]
    //         },
    //         {
    //             "domain":"domain3",
    //             "vms":[
    //                 {"name":"vm7", "busy":true},
    //                 {"name":"vm8", "busy":true},
    //                 {"name":"vm9", "busy":false}
    //             ],
    //             "layers":[0.25, 0.1]
    //         }
    //     ],
    //     [
    //         {"job_owner":"Shelly", "job_name":"Bio lab results", "job_size":"500MB", "job_timestamp":"2344123123"}
    //     ]
    //
    //
    //     ]

    res.status(200).json(status)
});

app.post('/', function(req, res) {
    let data = {
        response: 'You sent: ' + req.body.message
    };

    // Do something, like query a database or save data

    res.status(200).send(data);
});

module.exports = app;
