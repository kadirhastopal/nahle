require('dotenv').config();
const { sequelize, AdminUser, Category, Tour, ContactMessage } = require('../models');

async function setupDatabase() {
  try {
    console.log('🔄 Veritabanı bağlantısı test ediliyor...');
    await sequelize.authenticate();
    console.log('✅ Veritabanı bağlantısı başarılı!');

    console.log('🔄 Tablolar oluşturuluyor...');
    await sequelize.sync({ force: true });
    console.log('✅ Tablolar başarıyla oluşturuldu!');

    console.log('🔄 Varsayılan admin kullanıcısı oluşturuluyor...');
    await AdminUser.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      full_name: 'Admin User',
      status: 'active'
    });
    console.log('✅ Admin kullanıcısı oluşturuldu!');

    console.log('🔄 Varsayılan kategoriler oluşturuluyor...');
    await Category.bulkCreate([
      {
        name: 'Umre Turları',
        slug: 'umre-turlari',
        description: 'Hac ve Umre turları kategorisi',
        sort_order: 1,
        status: 'active'
      },
      {
        name: 'Hac Turları',
        slug: 'hac-turlari',
        description: 'Hac turları kategorisi',
        sort_order: 2,
        status: 'active'
      }
    ]);
    console.log('✅ Varsayılan kategoriler oluşturuldu!');

    console.log('🎉 Veritabanı kurulumu tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Veritabanı kurulum hatası:', error);
    process.exit(1);
  }
}

setupDatabase();
