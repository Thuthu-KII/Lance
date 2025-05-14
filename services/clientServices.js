url = "https://lance-api-ftcehba3hhheg9hu.southafricanorth-01.azurewebsites.net"

async function addClient(details) {
  try {
    const response = await fetch(`${url}/clients`, {
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

