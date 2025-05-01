const url = 'https://lance-api-ftcehba3hhheg9hu.southafricanorth-01.azurewebsites.net'; //await

export async function createJob(jobData) {
    const res = await fetch(`${url}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create job: ${errorText}`);
    }
  
    return await res.json();
  }
  
  export async function getJobs() {
    const res = await fetch(`${url}/jobs`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return await res.json();
  }



  export async function updateStatus(info){
    const res = await fetch(`${url}/jobs/updateStatus`,{
      method : 'POST',
      headers: {'Content-Type' : 'application/json'},
      body: JSON.stringify(info)

    });
    if(!res.ok){
      const errorText = await res.text();
      throw new Error(`Failed to update job status: ${errorText}`);
    }
    return await res.json();
  }

 let jobs = await getJobs();  //needs await since getJobs is asnync function
 console.log(jobs);
