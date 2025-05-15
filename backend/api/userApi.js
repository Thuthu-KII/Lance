const url = 'https://lance-api-ftcehba3hhheg9hu.southafricanorth-01.azurewebsites.net';

async function addClient(info) {
    const res = await fetch(`${url}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create client: ${errorText}`);
    }

    return await res.json();
}

async function addLancer(info) {
    const res = await fetch(`${url}/lancers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
        
    });
    //console.log("📌 Lancer Payload Being Sent:", info);

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create lancer: ${errorText}`);
    }

    return await res.json();
}

// when signing in, if the user already exists then it would not try to create a new instance of the user but rather
// check in the database if the user exists and then redirect them 

//====
//Waiting on Jordan to implement the GET functins for the database tables so that this can work.
async function getLancerByGoogleId(id) {
    try {
        const response = await fetch(`${url}/lancers/getLancerByGoogleId?googleId=${id}`);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        //console.log('Fetched Lancer Data:', data);
        return data; // Return the data for further processing
    } catch (error) {
        //console.error('Fetch error:', error);
        return null;
    }
}

async function getClientByGoogleId(googleId) {
    const res = await fetch(`${url}/clients?googleId=${googleId}`);
    if (!res.ok) return null;
    return await res.json();
}

module.exports = { addClient, addLancer, getClientByGoogleId, getLancerByGoogleId };