// check-admin.js - Admin kullanıcı kontrol ve oluşturma scripti
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, AdminUser } = require('./models');

async function checkAndCreateAdmin() {
    try {
        console.log('🔍 Admin kullanıcı kontrol ediliyor...');
        
        // Database bağlantısını test et
        await sequelize.authenticate();
        console.log('✅ Database bağlantısı başarılı');
        
        // Var olan admin kullanıcıları kontrol et
        const existingAdmins = await AdminUser.findAll();
        console.log(`📊 Mevcut admin kullanıcı sayısı: ${existingAdmins.length}`);
        
        if (existingAdmins.length > 0) {
            console.log('\n👤 Mevcut admin kullanıcılar:');
            existingAdmins.forEach(admin => {
                console.log(`   - ID: ${admin.id}, Username: ${admin.username}, Email: ${admin.email}, Status: ${admin.status}`);
            });
        }
        
        // Şifre test et
        const testPassword = 'admin123';
        let adminUser = await AdminUser.findOne({ where: { username: 'admin' } });
        
        if (!adminUser) {
            console.log('\n❌ Admin kullanıcısı bulunamadı, yeni admin oluşturuluyor...');
            
            // Yeni admin kullanıcı oluştur
            adminUser = await AdminUser.create({
                username: 'admin',
                email: 'admin@nahletur.com',
                password_hash: testPassword, // Hook ile hash'lenecek
                full_name: 'Sistem Yöneticisi',
                role: 'super_admin',
                status: 'active'
            });
            
            console.log('✅ Yeni admin kullanıcısı oluşturuldu!');
        }
        
        // Şifre kontrolü
        console.log('\n🔐 Şifre kontrolü yapılıyor...');
        const isPasswordValid = await adminUser.comparePassword(testPassword);
        
        if (isPasswordValid) {
            console.log('✅ Şifre doğru: admin123');
        } else {
            console.log('❌ Şifre yanlış, yeniden hash\'leniyor...');
            
            // Şifreyi manuel olarak hash'le ve güncelle
            const hashedPassword = await bcrypt.hash(testPassword, 12);
            await adminUser.update({ password_hash: hashedPassword });
            
            console.log('✅ Şifre güncellendi');
        }
        
        // Test login
        console.log('\n🧪 Login testi yapılıyor...');
        const testUser = await AdminUser.authenticate('admin', testPassword);
        
        if (testUser) {
            console.log('✅ Login testi başarılı!');
        } else {
            console.log('❌ Login testi başarısız!');
        }
        
        console.log('\n🎯 GİRİŞ BİLGİLERİ:');
        console.log('   Kullanıcı adı: admin');
        console.log('   Şifre: admin123');
        console.log('   URL: http://localhost:3000/admin');
        
    } catch (error) {
        console.error('❌ Hata:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

// Eğer bu dosya direkt çalıştırılıyorsa
if (require.main === module) {
    checkAndCreateAdmin();
}

module.exports = { checkAndCreateAdmin };