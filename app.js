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
const request = require('request');
const algo = require('./match_vm.js')
var async = require('async');

const vms = [
    "10.10.2.2", // domain 1 - 1
    "10.10.1.2", // domain 1 - 2
    "10.10.1.1", // domain 1 - 3
    "10.10.12.1", // domain 2 - 4
    "10.10.4.2", // domain 2 - 5
    "10.10.4.1",// domain 2 - 6
    "10.10.11.2",// domain 3 - 7
    "10.10.7.2",  // domain 3 - 8
    "10.10.7.1", // domain 3 - 9
]

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.disable('etag');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.engine('handlebars',exphbs({
  defaultLayout: 'main',
  extname: '.handlebars',
}));
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, 'views/'));

app.get('/', function (req, res) {
    res.render('questions');
});

app.get('/network-admin', function (req, res) {
    res.render('admin');
});

app.get('/cpu-usage', function (req, res) {
    let cpudata = []
    let listOfAsyncFunctions = [];
    for(let i = 0; i < vms.length; i++){
        // console.log("http://"+vms[i]+":3000/cpu")

        (function(n){
        // Construct an array of async functions with the expected
        // function signature (one argument that is the callback).
        listOfAsyncFunctions.push(function(callback){
                // Note: async expects the first argument to callback to be an error

                request("http://"+vms[i]+":3000/cpu", function(err, res, body) {
                    // cpudata.push(body)
                    // return err

                    callback(null,JSON.parse(body));

                });
            })
        })(i);

    }

    async.parallel(listOfAsyncFunctions,function (err,result) {
        // console.log(result); // result will be the same order as listOfAsyncFunctions
        //console.log(result)
        return res.json({"result":result})
    });


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
    //extract domain from request
    let client_req = req.body
    let domain = client_req.source.substring(6, client_req.source.indexOf('-'))
    
    if(domain === "one")
	client_req.source = 1
    else if(domain === "two")
	client_req.source = 2
    else
	client_req.source = 3
    
    let vm = algo.VMMatch(client_req)
    
    console.log(req.body)
    // Do something, like query a database or save data
    
    
    
    res.status(200).send({vm: vm, layer: client_req.sspecs <= .25? 3 : 2});
});

module.exports = app;
