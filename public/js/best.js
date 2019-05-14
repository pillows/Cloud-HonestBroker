setInterval(function()
{
    fetch("/network-stats") // Call the fetch function passing the url of the API as a parameter
    .then(
      function(response) {
        if (response.status !== 200) {
          console.log('Looks like there was a problem. Status Code: ' +
            response.status);
          return;
        }

        // Examine the text in the response
        response.json().then(function(data) {
            // Date time code taken from here
            // https://stackabuse.com/how-to-format-dates-in-javascript/
            let now = new Date();

            let options = {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };

            let current_time = now.toLocaleString('en-us', options);
            document.getElementById("current_time").innerHTML = current_time

          updateStats(data);
          populateTable(data.jobs)



        })
        .catch(function(err) {
          console.log('Fetch Error :-S', err);
        });
    })
}, 3000); //10000 milliseconds



// document.addEventListener("DOMContentLoaded", function(){
//
//
//
// });

let busyCheck = (vm, busy) => {
    if(busy){
        if(vm.classList.contains("circle_green")){
            vm.className = "circle_red";
        }
    }
    else{
        if(vm.classList.contains("circle_red")){
            vm.className = "circle_green";
        }
    }
}

let layerUpdate = (domain, layer) => {
    let meters = document.getElementById(domain).getElementsByTagName("meter")
    // console.log(layer)
    for(let i = 0; i < 2; i++){
        meters[i].value = layer[i]
        // console.log(meters[i].value);
        // console.log(layer[i])
    }

}

let populateTable = (jobs) => {
    console.log(jobs)
    let table = document.getElementById("jobs");

    while(table.rows.length > 1) {
        table.deleteRow(1);
    }
    for(let i = 0; i < jobs.length; i++){
        // console.log(jobs[i].job_owner)
        let row = document.createElement("tr")
        // table.appendChild(row)
        //
        let person = document.createElement('td');
        person.innerHTML = jobs[i].job_owner
        let job_name = document.createElement('td');
        job_name.innerHTML = jobs[i].job_name

        let size_of_job =  document.createElement('td');
        size_of_job.innerHTML = jobs[i].job_size
        let sspec = document.createElement('td');
        sspec.innerHTML = jobs[i].job_security
        let processing_time = document.createElement('td');
        processing_time.innerHTML = "0"

        row.appendChild(person)
        row.appendChild(job_name)
        row.appendChild(size_of_job)
        row.appendChild(sspec)
        row.appendChild(processing_time)

        table.appendChild(row)

    }
    return "1"
}

let cpuUpdate = (servers) => {
    for(let i = 0; i < servers.length; i++){
        let cpu = servers[i].cpu;
        let server = document.getElementById(servers[i].name)
        let cpuStat = server.getElementsByTagName("div")
        cpuStat.innerHTML = cpu
    }
}

let updateStats = (data) => {

    // let jobs = data.jobs
    // populateTable(jobs)
    // console.log(data[0])
    for(let i = 0; i < data.status.length; i++){
        let domain = data.status[i].domain
        for(let j = 0; j < data.status[i].vms.length; j++){

            let vm = document.getElementById(data.status[i].vms[j].name)
            let busy = data.status[i].vms[j].busy
            // console.log("busy status ", busy)
            let layers = data.status[i].layers

            // console.log(jobs)

            // console.log(document.getElementById(domain))
            busyCheck(vm, busy);
            layerUpdate(domain, layers)

            // cpuUpdate(cpus)

            // console.log(data[i].layers)
            // console.log(vm.classList)

        }
    }
}
