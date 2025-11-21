#!/usr/bin/env node

const API_BASE = 'http://127.0.0.1:8081/api';

class TestUserCreator {
  async log(message, status = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${status}: ${message}`);
  }

  async apiCall(method, endpoint, data = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(data && { body: JSON.stringify(data) })
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json().catch(() => ({}));
      return { status: response.status, data: result, ok: response.ok };
    } catch (error) {
      return { status: 0, data: {}, ok: false, error: error.message };
    }
  }

  async createTestUsers() {
    await this.log('=== CREATING TEST USERS FOR JWT TESTING ===');
    
    const testUsers = [
      {
        email: 'testfiller@example.com',
        password: 'TestPass123!',
        role: 'filler',
        first_name: 'Test',
        last_name: 'Filler',
        phone: '+1234567890'
      },
      {
        email: 'testcreator@example.com',
        password: 'TestPass123!',
        role: 'creator',
        first_name: 'Test',
        last_name: 'Creator',
        phone: '+1234567891'
      },
      {
        email: 'testadmin@example.com',
        password: 'TestPass123!',
        role: 'admin',
        first_name: 'Test',
        last_name: 'Admin',
        phone: '+1234567892'
      }
    ];

    const createdUsers = [];

    for (const user of testUsers) {
      await this.log(`Creating ${user.role} user: ${user.email}`);
      
      const result = await this.apiCall('POST', '/user/register', user);
      
      if (result.ok) {
        await this.log(`✅ ${user.role} user created successfully`, 'PASS');
        createdUsers.push({ ...user, id: result.data.id });
      } else {
        await this.log(`⚠️ ${user.role} user creation failed: ${result.data.error}`, 'WARN');
        
        // Try to login to get existing user ID
        const login = await this.apiCall('POST', '/auth/login', {
          email: user.email,
          password: user.password
        });
        
        if (login.ok) {
          await this.log(`✅ ${user.role} user exists, login successful`, 'PASS');
          createdUsers.push({ ...user, token: login.data.token });
        }
      }
    }

    return createdUsers;
  }

  async runUserCreation() {
    await this.log('🔧 CREATING TEST USERS FOR DATABASE');
    
    try {
      const users = await this.createTestUsers();
      
      await this.log('=== TEST USER CREATION SUMMARY ===');
      await this.log(`📊 Users processed: ${users.length}`);
      
      for (const user of users) {
        await this.log(`${user.role.toUpperCase()}: ${user.email} ${user.token ? '(has token)' : '(created)'}`);
      }
      
      return users;
      
    } catch (error) {
      await this.log(`💥 ERROR: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

if (require.main === module) {
  const creator = new TestUserCreator();
  creator.runUserCreation()
    .then(users => {
      console.log('\n🎉 Test User Creation Completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Test User Creation Failed:', error.message);
      process.exit(1);
    });
}

module.exports = TestUserCreator;
