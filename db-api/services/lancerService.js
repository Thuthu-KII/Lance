const url = 'https://lance-api-ftcehba3hhheg9hu.southafricanorth-01.azurewebsites.net';

export async function addLancer(info){
    const res = await fetch(`${url}/lancers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(info)
      });
    
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to create lancer: ${errorText}`);
      }
    
      return await res.json();




}