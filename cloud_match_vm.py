import json
import sys

req = {
    "job_owner":"Shelly", 
    "job_name":"Bio lab results", 
    "sspecs": 0.2,
    "job_security": "DCL1", 
    "job_size": 500, 
    "job_timestamp":"2344123123", 
    "proc_time": 0,
    "source": "1", 
}

with open('status.json') as json_file:

    data = json.load(json_file)

    potent_vms = []

    for domain in data['status']:
        for vm in domain['vms']:

            rspecs = vm["Rspec"]
            interdomain = 0
            layer = "2"

            #if interdomain 
            if (req['source'] != domain["domain"]):
                rspecs /= 2
                interdomain = 1
            
            if (rspecs >= req['sspecs']):
                req_cpu = ( int(req["job_size"] * 10) )/vm['RAM']
                
                #calculate cpu on vm later, replace 0 
                if (req_cpu >= 0):
                    proc_time = int(req["job_size"]) /33

                    #factor in processing time for interdomain 
                    if (interdomain):
                        #which layer 
                        if (req["job_security"] == "DCL1" or req["job_security"] == "DCL2"):
                            layer = "3"

                        link = domain["bandwidth"][domain["domain"]+"-"+req["source"]]
                
                        proc_time += req["job_size"]/link["L"+ layer]

                    if (proc_time > req["proc_time"]):
                        potent_vms.append({"domain": domain["domain"], "vm": vm})

    if (len(potent_vms) > 0):
        for vm in potent_vms:
            if (vm["domain"] == req["source"]):
                print(vm["vm"]["name"])
                sys.exit()

        #if have to choose interdomain:
        print(potent_vms[0]['vm']['name'])
        sys.exit()
    
    print("Could not find a suitable VM")

    