import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

import { Product } from 'src/modules/products/entities/product.entity';
import { ProductPrice, PriceType } from 'src/modules/products/entities/product-price.entity';
import { InventoryItem } from 'src/modules/inventory/entities/inventory-item.entity';
import { InventoryHistory, InventoryMovementType } from 'src/modules/inventory/entities/inventory-history.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'pos_db',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: true,
});

// 🛒 Product Seed Data
const products = [
  {
    name: 'iPhone 13',
    sku: 'IPH13',
    retailPrice: 1200,
    purchasePrice: 900,
    wholesalePrice: 1100,
    quantity: 10,
    brand: 'Apple',
    category: 'Electronics',
    unit: 'pc',
  },
  {
    name: 'Samsung Galaxy S22',
    sku: 'SGS22',
    retailPrice: 1000,
    purchasePrice: 750,
    wholesalePrice: 920,
    quantity: 15,
    brand: 'Samsung',
    category: 'Electronics',
    unit: 'pc',
  },
  {
    name: 'Sony Headphones',
    sku: 'SONY-HDP',
    retailPrice: 200,
    purchasePrice: 120,
    wholesalePrice: 180,
    quantity: 25,
    brand: 'Sony',
    category: 'Electronics',
    unit: 'pc',
  },
];

async function seed() {
  await AppDataSource.initialize();
  console.log('🌱 Seeding started...');

  const qr = AppDataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    const shopRepo = qr.manager.getRepository('shops');
    const userRepo = qr.manager.getRepository('users');
    const brandRepo = qr.manager.getRepository('brands');
    const categoryRepo = qr.manager.getRepository('categories');
    const unitRepo = qr.manager.getRepository('units');

    // 1. 🏪 Shop
    let shop = await shopRepo.findOne({ where: { slug: 'main-shop' } });
    if (!shop) {
      shop = await shopRepo.save({
        name: 'Main Shop',
        slug: 'main-shop',
        currency: 'USD',
        currencySymbol: '$',
        status: 'active',
      });
      console.log('✅ Shop created');
    }

    // 2. 👤 Users
    const adminExists = await userRepo.findOne({ where: { email: 'admin@pos.com' } });
    if (!adminExists) {
      await userRepo.save({
        firstName: 'Super',
        lastName: 'Admin',
        email: 'admin@pos.com',
        password: await bcrypt.hash('Admin@1234', 12),
        role: 'super_admin',
        status: 'active',
        shopId: shop.id,
      });
      console.log('✅ Admin created');
    }

    const cashierExists = await userRepo.findOne({ where: { email: 'cashier@pos.com' } });
    if (!cashierExists) {
      await userRepo.save({
        firstName: 'Cashier',
        lastName: 'User',
        email: 'cashier@pos.com',
        password: await bcrypt.hash('Cashier@1234', 12),
        role: 'cashier',
        status: 'active',
        shopId: shop.id,
      });
      console.log('✅ Cashier created');
    }

    // 3. 🏷️ Brands
    const brandNames = ['Apple', 'Samsung', 'Sony'];
    for (const name of brandNames) {
      const exists = await brandRepo.findOne({ where: { name, shopId: shop.id } });
      if (!exists) {
        await brandRepo.save({ name, shopId: shop.id, isActive: true });
      }
    }

    // 4. 📂 Categories
    const categoryNames = ['Electronics'];
    for (const name of categoryNames) {
      const exists = await categoryRepo.findOne({ where: { name, shopId: shop.id } });
      if (!exists) {
        await categoryRepo.save({ name, shopId: shop.id, isActive: true });
      }
    }

    // 5. 📏 Units
    const units = [{ name: 'Piece', symbol: 'pc' }];
    for (const u of units) {
      const exists = await unitRepo.findOne({ where: { symbol: u.symbol, shopId: shop.id } });
      if (!exists) {
        await unitRepo.save({ ...u, shopId: shop.id, isActive: true });
      }
    }

    console.log('✅ Master data seeded');

    // 🔥 Fetch real DB records (IMPORTANT)
    const brandMap = Object.fromEntries((await brandRepo.find({ where: { shopId: shop.id } })).map((b) => [b.name, b]));
    const categoryMap = Object.fromEntries((await categoryRepo.find({ where: { shopId: shop.id } })).map((c) => [c.name, c]));
    const unitMap = Object.fromEntries((await unitRepo.find({ where: { shopId: shop.id } })).map((u) => [u.symbol, u]));

    // 6. 🛒 Products + 💰 Prices + 📦 Inventory + 🧾 History
    for (const item of products) {
      let existing = await qr.manager.findOne(Product, {
        where: { sku: item.sku, shopId: shop.id },
      });

      if (existing) continue;

      const product = qr.manager.create(Product, {
        name: item.name,
        sku: item.sku,
        shopId: shop.id,
        brandId: brandMap[item.brand]?.id,
        categoryId: categoryMap[item.category]?.id,
        unitId: unitMap[item.unit]?.id,
      });

      const saved = await qr.manager.save(product);

      // 💰 Prices
      const prices = [
        {
          productId: saved.id,
          priceType: PriceType.RETAIL,
          price: item.retailPrice,
          costPrice: item.purchasePrice,
          isCurrent: true,
          shopId: shop.id,
        },
        {
          productId: saved.id,
          priceType: PriceType.PURCHASE,
          price: item.purchasePrice,
          isCurrent: true,
          shopId: shop.id,
        },
      ];

      if (item.wholesalePrice) {
        prices.push({
          productId: saved.id,
          priceType: PriceType.WHOLESALE,
          price: item.wholesalePrice,
          isCurrent: true,
          shopId: shop.id,
        } as any);
      }

      await qr.manager.save(ProductPrice, prices);

      // 📦 Inventory
      const qty = item.quantity;

      const inventory = await qr.manager.save(InventoryItem, {
        shopId: shop.id,
        productId: saved.id,
        quantityOnHand: qty,
        quantityAvailable: qty,
        quantityReserved: 0,
        averageCost: item.purchasePrice,
        lastRestockedAt: new Date(),
      });

      // 🧾 History
      await qr.manager.save(InventoryHistory, {
        shopId: shop.id,
        inventoryItemId: inventory.id,
        productId: saved.id,
        movementType: InventoryMovementType.OPENING_STOCK,
        quantity: qty,
        quantityBefore: 0,
        quantityAfter: qty,
        unitCost: item.purchasePrice,
        referenceType: 'seed',
        notes: 'Opening stock',
      });

      console.log(`✅ Product seeded: ${item.name}`);
    }

    await qr.commitTransaction();
    console.log('🎉 ALL DATA SEEDED SUCCESSFULLY');
  } catch (err) {
    await qr.rollbackTransaction();
    console.error('❌ Seed failed:', err);
  } finally {
    await qr.release();
    await AppDataSource.destroy();
  }
}

seed();
