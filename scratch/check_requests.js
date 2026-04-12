async function testApi() {
  try {
    const res = await fetch('http://localhost:3000/api/ambulance/requests');
    const data = await res.json();
    console.log('Current Requests:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

testApi();
