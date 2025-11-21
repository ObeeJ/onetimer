#!/usr/bin/env node

const jwt = require('jsonwebtoken');

const JWT_SECRET = 'SsxnOfR25HisjsaHnRnFl0cHo69jxbW+31kpmJ3M3FY=';
const API_BASE = 'http://127.0.0.1:8081/api';

async function getRealUsers() {
  // Use admin token to get real users
  const adminToken = jwt.sign({
    user_id: 'temp-admin-id',
    role: 'admin',
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  }, JWT_SECRET);

  try {
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.users || [];
    }
  } catch (error) {
    console.log('Could not fetch users, using sample IDs');
  }
  
  return [];
}

function generateRealJWT(userID, role) {
  const claims = {
    user_id: userID,
    role: role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };
  
  return jwt.sign(claims, JWT_SECRET);
}

async function createRealTokens() {
  console.log('🔍 Fetching real users from database...');
  
  const users = await getRealUsers();
  const realTokens = {};
  
  if (users.length > 0) {
    console.log(`✅ Found ${users.length} users in database`);
    
    // Find users by role
    const filler = users.find(u => u.role === 'filler');
    const creator = users.find(u => u.role === 'creator');
    const admin = users.find(u => u.role === 'admin');
    
    if (filler) {
      realTokens.filler = generateRealJWT(filler.id, 'filler');
      console.log(`✅ Filler token created for user: ${filler.email} (${filler.id})`);
    }
    
    if (creator) {
      realTokens.creator = generateRealJWT(creator.id, 'creator');
      console.log(`✅ Creator token created for user: ${creator.email} (${creator.id})`);
    }
    
    if (admin) {
      realTokens.admin = generateRealJWT(admin.id, 'admin');
      console.log(`✅ Admin token created for user: ${admin.email} (${admin.id})`);
    }
    
    // Create super admin token with first admin user
    if (admin) {
      realTokens.superAdmin = generateRealJWT(admin.id, 'super_admin');
      console.log(`✅ Super Admin token created for user: ${admin.email} (${admin.id})`);
    }
  }
  
  // Fallback to first available users if specific roles not found
  if (users.length > 0 && Object.keys(realTokens).length === 0) {
    const firstUser = users[0];
    realTokens.filler = generateRealJWT(firstUser.id, 'filler');
    realTokens.creator = generateRealJWT(firstUser.id, 'creator');
    realTokens.admin = generateRealJWT(firstUser.id, 'admin');
    realTokens.superAdmin = generateRealJWT(firstUser.id, 'super_admin');
    
    console.log(`⚠️ Using first user (${firstUser.email}) for all roles`);
  }
  
  return realTokens;
}

if (require.main === module) {
  createRealTokens()
    .then(tokens => {
      console.log('\n🔐 Real JWT Tokens Generated:');
      console.log('============================');
      Object.entries(tokens).forEach(([role, token]) => {
        console.log(`${role.toUpperCase()}: ${token.substring(0, 50)}...`);
      });
      
      // Save to file for use in tests
      require('fs').writeFileSync('./real-jwt-tokens.json', JSON.stringify(tokens, null, 2));
      console.log('\n💾 Tokens saved to real-jwt-tokens.json');
    })
    .catch(error => {
      console.error('❌ Error generating real tokens:', error.message);
    });
}

module.exports = { createRealTokens };
