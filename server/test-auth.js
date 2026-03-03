const axios = require('axios');

// Test registration
async function testRegistration() {
  try {
    console.log('Testing registration endpoint...');
    
    const response = await axios.post('http://localhost:8000/api/employer/register', {
      company_name: 'Tech Innovations Inc',
      email: 'admin@techinnovations.com',
      password: 'securepassword123'
    });
    
    console.log('Registration successful:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

// Test login
async function testLogin() {
  try {
    console.log('\nTesting login endpoint...');
    
    const response = await axios.post('http://localhost:8000/api/employer/login', {
      email: 'admin@techinnovations.com',
      password: 'securepassword123'
    });
    
    console.log('Login successful:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Login failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  await testRegistration();
  await testLogin();
  process.exit(0);
}

runTests();