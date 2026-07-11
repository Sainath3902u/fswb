import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});

async function main() {
  console.log("🚀 Starting database seeding pipeline...");

  // 1. Fetch a valid Canteen ID from your database to link our items to.
  // We grab the first canteen created (e.g., the one built when your owner user registered).
  const targetCanteen = await prismaClient.canteen.findFirst();

  if (!targetCanteen) {
    console.error(
      "❌ Error: No Canteen found in your database table. Please register a Canteen Owner user first so a canteen profile is generated, then re-run this seed script!"
    );
    return;
  }

  console.log(`📦 Found target canteen workspace: "${targetCanteen.name}"`);

  // 2. Clear out any existing data flags to prevent duplicate unique primary key crashes
  // We use deleteMany to clean out legacy mock entries cleanly
  await prismaClient.menuItem.deleteMany({ where: { canteenId: targetCanteen.id } });
  await prismaClient.category.deleteMany({ where: { canteenId: targetCanteen.id } });
  console.log("🧹 Cleaned old menu configurations from database.");

  // 3. Populate Categories & Nested MenuItems atomically
  // South Indian Category
  await prismaClient.category.create({
    data: {
      name: "South Indian",
      icon: "🥞",
      order: 1,
      canteenId: targetCanteen.id,
      menuItems: {
        create: [
          {
            name: "Ghee Masala Dosa",
            description: "Crispy rice crepe filled with spiced potato mash and topped with fresh clarified butter.",
            price: 90,
            originalPrice: 110,
            savings: 20,
            rating: 4.8,
            deliveryTime: "8 mins",
            weight: "250g",
            isAvailable: true,
            canteenId: targetCanteen.id,
          },
          {
            name: "Steamed Idli (2 Pcs)",
            description: "Fluffy, soft rice cakes served alongside traditional tomato chutney and hot sambar.",
            price: 40,
            rating: 4.5,
            deliveryTime: "5 mins",
            weight: "180g",
            isAvailable: true,
            canteenId: targetCanteen.id,
          },
        ],
      },
    },
  });

  // Snacks & Fast Food Category
  await prismaClient.category.create({
    data: {
      name: "Snacks",
      icon: "🍔",
      order: 2,
      canteenId: targetCanteen.id,
      menuItems: {
        create: [
          {
            name: "Crispy Veg Burger",
            description: "Golden fried vegetable patty layered with creamy mayonnaise, fresh lettuce, and toasted buns.",
            price: 120,
            originalPrice: 150,
            savings: 30,
            rating: 4.6,
            deliveryTime: "12 mins",
            weight: "200g",
            isAvailable: true,
            canteenId: targetCanteen.id,
          },
          {
            name: "Peri Peri French Fries",
            description: "Spicy, double-fried potato sticks tossed evenly in premium chili seasoning dust.",
            price: 80,
            rating: 4.4,
            deliveryTime: "10 mins",
            weight: "150g",
            isAvailable: true,
            canteenId: targetCanteen.id,
          },
          {
            name: "Cheese Grilled Sandwich",
            description: "Stuffed with liquid mozzarella, green bell peppers, onion shreds, and local herb spreads.",
            price: 100,
            originalPrice: 120,
            savings: 20,
            rating: 4.7,
            deliveryTime: "10 mins",
            weight: "220g",
            isAvailable: false, // Will display the premium greyed-out "OUT OF STOCK" layout block perfectly!
            canteenId: targetCanteen.id,
          },
        ],
      },
    },
  });

  // Drinks & Beverages Category
  await prismaClient.category.create({
    data: {
      name: "Drinks",
      icon: "🥤",
      order: 3,
      canteenId: targetCanteen.id,
      menuItems: {
        create: [
          {
            name: "Filter Coffee",
            description: "Traditional south indian chicory blend brewed strong with hot frothed milk.",
            price: 25,
            rating: 4.9,
            deliveryTime: "4 mins",
            weight: "150ml",
            isAvailable: true,
            canteenId: targetCanteen.id,
          },
          {
            name: "Mango Thick Shake",
            description: "Chilled blended alphanso mango pulp server with a vanilla ice cream scoop on top.",
            price: 90,
            originalPrice: 100,
            savings: 10,
            rating: 4.5,
            deliveryTime: "7 mins",
            weight: "300ml",
            isAvailable: true,
            canteenId: targetCanteen.id,
          },
        ],
      },
    },
  });

  console.log("✨ Seeding completed successfully! Menu records populated.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding process collapsed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });