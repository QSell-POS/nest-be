import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'pos_db',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Connected. Starting seed...');

  const shopRepo = AppDataSource.getRepository('shops');
  const userRepo = AppDataSource.getRepository('users');
  const brandRepo = AppDataSource.getRepository('brands');
  const categoryRepo = AppDataSource.getRepository('categories');
  const unitRepo = AppDataSource.getRepository('units');

  // 1. Shop
  let shop = await shopRepo.findOne({ where: { slug: 'main-shop' } });
  if (!shop) {
    shop = await shopRepo.save({
      name: 'Main Shop',
      slug: 'main-shop',
      address: '123 Market Street',
      phone: '+1-555-0100',
      email: 'shop@example.com',
      currency: 'USD',
      currencySymbol: '$',
      status: 'active',
    });
    console.log('✅ Shop created:', shop.id);
  }

  // 2. Super Admin user
  const existing = await userRepo.findOne({ where: { email: 'admin@pos.com' } });
  if (!existing) {
    const hashed = await bcrypt.hash('Admin@1234', 12);
    await userRepo.save({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@pos.com',
      password: hashed,
      role: 'super_admin',
      status: 'active',
      shopId: shop.id,
    });
    console.log('✅ Super admin created: admin@pos.com / Admin@1234');
  }

  // 3. Cashier user
  const cashier = await userRepo.findOne({ where: { email: 'cashier@pos.com' } });
  if (!cashier) {
    const hashed = await bcrypt.hash('Cashier@1234', 12);
    await userRepo.save({
      firstName: 'John',
      lastName: 'Cashier',
      email: 'cashier@pos.com',
      password: hashed,
      role: 'cashier',
      status: 'active',
      shopId: shop.id,
    });
    console.log('✅ Cashier created: cashier@pos.com / Cashier@1234');
  }

  // 4. Brands
  const brands = ['Apple', 'Samsung', 'Sony', 'Generic'];
  for (const name of brands) {
    const exists = await brandRepo.findOne({ where: { name, shopId: shop.id } });
    if (!exists) {
      await brandRepo.save({ name, shopId: shop.id, isActive: true });
    }
  }
  console.log('✅ Brands seeded');

  // 5. Categories
  const categories = [
    { name: 'Electronics' },
    { name: 'Clothing' },
    { name: 'Food & Beverage' },
    { name: 'Health & Beauty' },
    { name: 'Home & Garden' },
  ];
  for (const cat of categories) {
    const exists = await categoryRepo.findOne({ where: { name: cat.name, shopId: shop.id } });
    if (!exists) {
      await categoryRepo.save({ ...cat, shopId: shop.id, isActive: true });
    }
  }
  console.log('✅ Categories seeded');

  // 6. Units
  const units = [
    { name: 'Piece', symbol: 'pc' },
    { name: 'Kilogram', symbol: 'kg' },
    { name: 'Gram', symbol: 'g' },
    { name: 'Litre', symbol: 'L' },
    { name: 'Millilitre', symbol: 'mL' },
    { name: 'Box', symbol: 'box' },
    { name: 'Dozen', symbol: 'dz' },
    { name: 'Metre', symbol: 'm' },
  ];
  for (const unit of units) {
    const exists = await unitRepo.findOne({ where: { symbol: unit.symbol, shopId: shop.id } });
    if (!exists) {
      await unitRepo.save({ ...unit, shopId: shop.id, isActive: true });
    }
  }
  console.log('✅ Units seeded');

  await AppDataSource.destroy();
  console.log('\n🎉 Seed complete!\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
