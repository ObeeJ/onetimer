#!/usr/bin/env node

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// JWT Secret from backend .env
const JWT_SECRET = 'SsxnOfR25HisjsaHnRnFl0cHo69jxbW+31kpmJ3M3FY=';

function generateTestJWT(userID, role = 'filler') {
  const claims = {
    user_id: userID,
    role: role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  return jwt.sign(claims, JWT_SECRET);
}

// Generate test tokens for different roles
const testTokens = {
  filler: generateTestJWT(crypto.randomUUID(), 'filler'),
  creator: generateTestJWT(crypto.randomUUID(), 'creator'),
  admin: generateTestJWT(crypto.randomUUID(), 'admin'),
  superAdmin: generateTestJWT(crypto.randomUUID(), 'super_admin')
};

if (require.main === module) {
  console.log('Generated Test JWT Tokens:');
  console.log('========================');
  Object.entries(testTokens).forEach(([role, token]) => {
    console.log(`${role.toUpperCase()}: ${token}`);
    console.log('');
  });
}

module.exports = { generateTestJWT, testTokens };
