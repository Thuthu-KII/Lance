const url = "https://lance-api-ftcehba3hhheg9hu.southafricanorth-01.azurewebsites.net"
const details = {
  "lancerId": "l001",
  "personalInfo": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane.doe@example.com",
    "location": "Remote"
  },
  "skills": ["JavaScript", "Node.js", "React"],
  "stats": {
    "projectsCompleted": 12,
    "hoursWorked": 540
  },
  "balance": 2500.75,
  "rating": 4.8,
  "reviews": [
    {
      "client": "ClientA",
      "comment": "Fantastic work!",
      "score": 5
    },
    {
      "client": "ClientB",
      "comment": "Met all expectations.",
      "score": 4.5
    }
  ]
}


async function addLancer(details) {
  try {
    const response = await fetch(`${url}/lancers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(details)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lancer added successfully:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

async function getLancerByGoogleId(id){
      try {
    const response = await fetch(`${url}/lancers/getLancerByGoogleId?googleId=${id}`)

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lancer added successfully:', data);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}
//console.log(viewLancerProfile(id));
console.log(getLancerByGoogleId(`l001`));