//const url = process.env.URL;
url = "https://lance-api-ftcehba3hhheg9hu.southafricanorth-01.azurewebsites.net"

const requestBody = {
  jobID: 1,               // Replace with actual job ID
  status: 'completed'      // Replace with the desired status
};


async function appCount(id){ //takes in an integer
await fetch(`${url}/jobs/countApp?applicationID=${id}`, {
  method: 'GET', 
  headers: {
    'Content-Type': 'application/json',
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json(); // or response.text(), response.blob(), etc.
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Fetch error:', error);
});


}

async function showAllJobs(){ //shows all jobs, for admin
await fetch(`${url}/jobs`, {
  method: 'GET', // or 'POST', 'PUT', 'DELETE'
  headers: {
    'Content-Type': 'application/json',
 //   'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Optional
    // Add other custom headers as needed
  }
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json(); // or response.text(), response.blob(), etc.
})
.then(data => {
  console.log('Response data:', data);
})
.catch(error => {
  console.error('Fetch error:', error);
});


}



async function updateJobStatus(details){ //takes in a json object

 await fetch(`${url}/jobs/updateStatus`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(requestBody)
})
.then(response => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
})
.then(data => {
  console.log('Update response:', data);
})
.catch(error => {
  console.error('Fetch error:', error);
});


}



//console.log(showAllJobs());
console.log(updateJobStatus(requestBody));


