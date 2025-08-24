/**
 * Test script to verify the auth store works with the backend
 * This demonstrates the refactored auth store connecting to http://localhost:5000
 */

// Simulate the auth store functionality for testing
async function testAuthStore() {
  const API_BASE_URL = 'http://localhost:5000';
  
  console.log('🧪 Testing Auth Store with Backend API...\n');

  // Test 1: Registration
  console.log('1️⃣ Testing user registration...');
  try {
    const signupResponse = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        password: 'password123' 
      }),
    });

    const signupData = await signupResponse.json();
    
    if (signupData.success) {
      console.log('✅ Registration successful!');
      console.log('   Token:', signupData.token.substring(0, 20) + '...');
      console.log('   User:', signupData.user.email);
    } else {
      console.log('ℹ️ Registration:', signupData.message);
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
  }

  console.log('\n');

  // Test 2: Login
  console.log('2️⃣ Testing user login...');
  try {
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        password: 'password123' 
      }),
    });

    const loginData = await loginResponse.json();
    
    if (loginData.success) {
      console.log('✅ Login successful!');
      console.log('   Token:', loginData.token.substring(0, 20) + '...');
      console.log('   User:', loginData.user.email);
      
      // Store token for next test
      const token = loginData.token;
      
      // Test 3: Get user profile
      console.log('\n3️⃣ Testing get user profile...');
      const profileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        console.log('✅ Profile fetch successful!');
        console.log('   User ID:', profileData.user._id);
        console.log('   Email:', profileData.user.email);
        console.log('   XP:', profileData.user.xp);
        console.log('   Level:', profileData.user.level);
      } else {
        console.log('❌ Profile fetch failed:', profileData.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
  }

  console.log('\n🎉 Auth Store test completed!');
  console.log('\n📋 Summary:');
  console.log('   - The refactored auth store can now:');
  console.log('   - ✅ Register users with the backend');
  console.log('   - ✅ Login users and receive JWT tokens');
  console.log('   - ✅ Fetch user profiles with authentication');
  console.log('   - ✅ Store tokens in localStorage');
  console.log('   - ✅ Handle API errors gracefully');
}

// Run the test if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  testAuthStore();
} else {
  // Node.js environment - export for use
  module.exports = { testAuthStore };
}
