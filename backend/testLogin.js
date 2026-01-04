const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'john@example.com',
      password: 'password123'
    });
    
    console.log('✅ LOGIN SUCCESS!');
    console.log('User:', response.data.data.user);
    console.log('Token:', response.data.data.token);
  } catch (error) {
    console.log('❌ LOGIN FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Full Error:', error.response?.data);
  }
}

testLogin();