const axios = require('axios');

async function testRenew() {
    try {
        // Login as arun first
        const loginRes = await axios.post('http://localhost:5001/api/users/login', {
            email: 'arun@gmail.com',
            password: 'password123'
        });
        
        const token = loginRes.data.token;
        console.log('Logged in, got token');
        
        // Renew subscription
        const renewRes = await axios.post('http://localhost:5001/api/users/renew-subscription', {}, {
            headers: { 'x-auth-token': token }
        });
        
        console.log(renewRes.data);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

testRenew();
