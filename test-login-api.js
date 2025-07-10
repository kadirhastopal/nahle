// test-login-api.js - API login test scripti
const fetch = require('node-fetch');

async function testLoginAPI() {
    try {
        console.log('🧪 API Login testi başlatılıyor...');
        
        const baseURL = 'http://localhost:3000';
        
        // 1. Health check
        console.log('\n1️⃣ Health check...');
        const healthResponse = await fetch(`${baseURL}/api/health`);
        const healthData = await healthResponse.json();
        console.log('Health:', healthData);
        
        // 2. Login API test
        console.log('\n2️⃣ Login API testi...');
        const loginResponse = await fetch(`${baseURL}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                login: 'admin',
                password: 'admin123'
            })
        });
        
        console.log('Login Response Status:', loginResponse.status);
        console.log('Login Response Headers:', Object.fromEntries(loginResponse.headers.entries()));
        
        const loginData = await loginResponse.json();
        console.log('Login Response Data:', loginData);
        
        if (loginData.success) {
            console.log('✅ API Login başarılı!');
            
            // 3. Profile test with token
            console.log('\n3️⃣ Profile API testi...');
            const profileResponse = await fetch(`${baseURL}/api/admin/profile`, {
                headers: {
                    'Authorization': `Bearer ${loginData.data.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const profileData = await profileResponse.json();
            console.log('Profile Response:', profileData);
            
        } else {
            console.log('❌ API Login başarısız:', loginData.message);
        }
        
    } catch (error) {
        console.error('❌ Test hatası:', error.message);
    }
}

// Çalıştır
testLoginAPI();