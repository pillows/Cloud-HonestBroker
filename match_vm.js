var status = require('./status.json')


inc_req = {
    job_owner:"Shelly", 
    job_name:"Bio lab results", 
    sspecs: 0,
    job_security: "DCL1", 
    job_size: 500, 
    job_timestamp:"2344123123", 
    proc_time: 0,
    source: "3", 
}

function VMMatch(req) {
    let potential_vms = []

    for(let domain of status.status){
        for(let vm of domain.vms){
            let rspecs = vm['rspecs']
            let interdomain = 0
            let layer = "2"
            

            //if interdomain
            if(req.source !== domain['domain']){
                rspecs /= 2
                interdomain = 1
            }

            if(rspecs >= req['sspecs']){
                //calculate required cpu usage from job (can alter to fit)
                let calc_cpu = ( req['job_size'] * 10 )/vm['RAM']

                //calculate cpu on vm later, replace 0
                if(calc_cpu >= 0){
                    let proc_time = req['job_size']/33

                    //factor in processing time for interdomain
                    if(interdomain){
                        if(parseInt(req['sspecs'] <= 0.25))
                            layer = "3"
                        
                        let route_between_vms = domain['bandwidth'][domain['domain']+'-'+req['source']]
                        proc_time += req['job_size']/route_between_vms['L'+layer]
                    }

                    if(proc_time > req['proc_time'])
                        potential_vms.push({'domain': domain['domain'], 'vm': vm})
                }
            }
        }

        if(potential_vms.length){
            for(let vm of potential_vms){
                if(vm['domain'] === req['source']){
                    console.log(vm['vm']['name']) 
                    return vm 
                }
            }

            //if have to choose interdomain
            console.log(potential_vms[0]['vm']['name'])
            return potential_vms[0] ? potential_vms[0] : "NONE"
        }

        console.log('Could not find a suitable VM')
    }


}

VMMatch(inc_req)
module.exports = {VMMatch: VMMatch}


