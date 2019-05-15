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

const domainvm =
[
    {
        "domain":"1",
        "vm":[
            {"vm1":"10.10.2.2"},
            {"vm2":"10.10.1.2"},
            {"vm3":"10.10.1.1"}
        ]
    },
    {
        "domain":"2",
        "vm":[
            {"vm4":"10.10.12.1"},
            {"vm5":"10.10.4.2"},
            {"vm6":"10.10.4.1"}
        ]
    },
    {
        "domain":"3",
        "vm":[
            {"vm7":"10.10.11.2"},
            {"vm8":"10.10.7.2"},
            {"vm9":"10.10.7.1"}
        ]
    }

]

let cpushelly = []

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
        let rawdata = fs.readFileSync('status.json');
        let status = JSON.parse(rawdata);
        let counter = 0;
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                status.status[i].vms[j].CPU = result[counter].cpu;
                counter++;
            }
        }

        let savedjson = fs.writeFileSync('status.json', JSON.stringify(status));
        // console.log(status.status[0].vms[0].CPU)

        // console.log(result)
        cpushelly = result;

        return res.json({"result":result})
    });


});

app.get('/network-stats', function (req, res) {

    let rawdata = fs.readFileSync('status.json');
    let status = JSON.parse(rawdata);

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
