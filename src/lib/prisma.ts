// import { PrismaClient } from '@prisma/client';
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL,
// });

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


// import { PrismaClient } from '@/generated/prisma';
// import { PrismaPg } from '@prisma/adapter-pg';
// import pg from 'pg';

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// let prismaClient: PrismaClient;

// if (globalForPrisma.prisma) {
//   prismaClient = globalForPrisma.prisma;
// } else {
//   // 1. Create the pg pool ONLY when this block runs
//   const pool = new pg.Pool({
//     connectionString: process.env.DATABASE_URL,
//   });

//   // 2. Instantiate the adapter with the pg pool
//   const adapter = new PrismaPg(pool);

//   // 3. Instantiate PrismaClient with the driver adapter layer
//   prismaClient = new PrismaClient({ adapter });

//   if (process.env.NODE_ENV !== 'production') {
//     globalForPrisma.prisma = prismaClient;
//   }
// }

// export const prisma = prismaClient;





// 1. Correct import pointing to the generated Prisma client entry file
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

let prismaClient: PrismaClient;

if (globalForPrisma.prisma) {
  prismaClient = globalForPrisma.prisma;
} else {
  // Safe runtime connection string initialization
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  prismaClient = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaClient;
  }
}

export const prisma = prismaClient;