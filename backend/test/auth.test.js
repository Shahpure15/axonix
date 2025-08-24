/**
 * Authentication API Tests for SocraticWingman
 * Tests MongoDB-based authentication endpoints
 */

const BASE_URL = 'http://localhost:5000';

// Simple HTTP request function (since we're not using external libraries)
async function makeRequest(url, method = 'GET', data = null, headers = {}) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return { status: response.status, data: result };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { status: 0, data: { error: error.message } };
  }
}

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'test123456'
};

async function testHealthCheck() {
  console.log('🔍 Testing health check endpoint...');
  const { status, data } = await makeRequest(`${BASE_URL}/`);
  
  if (status === 200 && data.success) {
    console.log('✅ Health check passed');
    console.log(`   Message: ${data.message}`);
    return true;
  } else {
    console.log('❌ Health check failed');
    console.log(`   Status: ${status}, Data:`, data);
    return false;
  }
}

async function testUserRegistration() {
  console.log('🔍 Testing user registration...');
  const { status, data } = await makeRequest(`${BASE_URL}/auth/register`, 'POST', testUser);
  
  if (status === 201 && data.success) {
    console.log('✅ User registration passed');
    console.log(`   Message: ${data.message}`);
    console.log(`   User ID: ${data.user.id}`);
    return { success: true, token: data.token, user: data.user };
  } else {
    console.log('❌ User registration failed');
    console.log(`   Status: ${status}, Data:`, data);
    return { success: false };
  }
}

async function testUserLogin() {
  console.log('🔍 Testing user login...');
  const { status, data } = await makeRequest(`${BASE_URL}/auth/login`, 'POST', testUser);
  
  if (status === 200 && data.success) {
    console.log('✅ User login passed');
    console.log(`   Message: ${data.message}`);
    console.log(`   User ID: ${data.user.id}`);
    return { success: true, token: data.token, user: data.user };
  } else {
    console.log('❌ User login failed');
    console.log(`   Status: ${status}, Data:`, data);
    return { success: false };
  }
}

async function testGetUserProfile(token) {
  console.log('🔍 Testing get user profile...');
  const { status, data } = await makeRequest(
    `${BASE_URL}/auth/me`, 
    'GET', 
    null, 
    { Authorization: `Bearer ${token}` }
  );
  
  if (status === 200 && data.success) {
    console.log('✅ Get user profile passed');
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Level: ${data.user.level}`);
    console.log(`   XP: ${data.user.xp}`);
    return true;
  } else {
    console.log('❌ Get user profile failed');
    console.log(`   Status: ${status}, Data:`, data);
    return false;
  }
}

async function testDuplicateRegistration() {
  console.log('🔍 Testing duplicate email registration...');
  const { status, data } = await makeRequest(`${BASE_URL}/auth/register`, 'POST', testUser);
  
  if (status === 400 && !data.success && data.message.includes('already exists')) {
    console.log('✅ Duplicate registration handling passed');
    console.log(`   Message: ${data.message}`);
    return true;
  } else {
    console.log('❌ Duplicate registration handling failed');
    console.log(`   Status: ${status}, Data:`, data);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('🔍 Testing invalid login credentials...');
  const invalidUser = { email: testUser.email, password: 'wrongpassword' };
  const { status, data } = await makeRequest(`${BASE_URL}/auth/login`, 'POST', invalidUser);
  
  if (status === 400 && !data.success && data.message.includes('Invalid')) {
    console.log('✅ Invalid login handling passed');
    console.log(`   Message: ${data.message}`);
    return true;
  } else {
    console.log('❌ Invalid login handling failed');
    console.log(`   Status: ${status}, Data:`, data);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 SocraticWingman Authentication API Tests');
  console.log('=' .repeat(50));
  console.log('⚠️  Make sure the server is running on http://localhost:5000');
  console.log('⚠️  Make sure MongoDB is running on localhost:27017');
  console.log('');

  const tests = [];
  let token = null;

  // Test 1: Health Check
  tests.push(await testHealthCheck());

  // Test 2: User Registration
  const registrationResult = await testUserRegistration();
  tests.push(registrationResult.success);
  if (registrationResult.success) {
    token = registrationResult.token;
  }

  // Test 3: User Login
  const loginResult = await testUserLogin();
  tests.push(loginResult.success);
  if (loginResult.success && !token) {
    token = loginResult.token;
  }

  // Test 4: Get User Profile (if we have a token)
  if (token) {
    tests.push(await testGetUserProfile(token));
  } else {
    console.log('⏭️  Skipping profile test (no token available)');
    tests.push(false);
  }

  // Test 5: Duplicate Registration
  tests.push(await testDuplicateRegistration());

  // Test 6: Invalid Login
  tests.push(await testInvalidLogin());

  // Results Summary
  console.log('');
  console.log('📊 Test Results Summary');
  console.log('=' .repeat(50));
  
  const passed = tests.filter(result => result === true).length;
  const total = tests.length;
  
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️  Some tests failed. Check the output above.');
  }

  return passed === total;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
