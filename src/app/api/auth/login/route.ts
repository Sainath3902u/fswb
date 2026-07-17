// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import bcrypt from 'bcryptjs';
// import jwt from 'jsonwebtoken';

// export async function POST(request: Request) {
//   try {
//     // 1. Parse payload fields from request body
//     const body = await request.json();
//     const { email, password } = body;

//     // 2. Validate user constraints match criteria
//     if (!email || !password) {
//       return NextResponse.json(
//         { error: 'Email and password are required fields.' },
//         { status: 400 }
//       );
//     }

//     // 3. Look up the specific user record via your verified custom prisma client
//     const user = await prisma.user.findUnique({
//       where: { email: email.toLowerCase().trim() },
//       include: {
//         canteen: true // ✨ CRITICAL: Fetch the nested canteen data row profile
//       }
//     });

//     if (!user) {
//       return NextResponse.json(
//         { error: 'Invalid email or password credentials.' },
//         { status: 401 }
//       );
//     }

//     // 4. Compare incoming payload password with database hash string safely
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return NextResponse.json(
//         { error: 'Invalid email or password credentials.' },
//         { status: 401 }
//       );
//     }

//     // 5. Generate secure JWT token containing core profile identity & relational metadata
//     const tokenSecret = process.env.JWT_SECRET || 'fallback_development_secret_key';
//     const token = jwt.sign(
//       { 
//         userId: user.id, 
//         email: user.email, 
//         role: user.role // Passing role here enables seamless Role-Based Access Checks (RBAC) later!
//       },
//       tokenSecret,
//       { expiresIn: '1d' } // Session remains active for 24 hours
//     );

//     // 6. Return profile object data alongside signed auth token string
//     return NextResponse.json(
//       {
//         message: 'Authentication successful!',
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//         },
//         token,
//       },
//       { status: 200 }
//     );

//   } catch (error: any) {
//     console.error('CRITICAL LOGIN_ROUTE_FAILURE:', error);
//     return NextResponse.json(
//       { error: 'An unexpected authentication engine error occurred.' },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // 1. Parse payload fields from request body
    const body = await request.json();
    const { email, password } = body;

    // 2. Validate user constraints match criteria
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required fields.' },
        { status: 400 }
      );
    }

    // 3. Look up the specific user record via your verified custom prisma client
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        canteen: true // ✨ Fetches the nested canteen data row profile successfully
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password credentials.' },
        { status: 401 }
      );
    }

    // 4. Compare incoming payload password with database hash string safely
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password credentials.' },
        { status: 401 }
      );
    }

    // 5. Generate secure JWT token containing core profile identity & relational metadata
    const tokenSecret = process.env.JWT_SECRET || 'fallback_development_secret_key';
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role, // Passing role enables seamless Role-Based Access Checks (RBAC)
        canteenId: user.canteen?.id || null // ✨ FIX: Add canteenId to token claims so middleware can inspect it
      },
      tokenSecret,
      { expiresIn: '1d' } // Session remains active for 24 hours
    );

    // 6. Return profile object data alongside signed auth token string
    return NextResponse.json(
      {
        message: 'Authentication successful!',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          canteenId: user.canteen?.id || "" // ✨ FIX: Injecting the nested relation ID here maps it straight into local browser states!
        },
        token,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('CRITICAL LOGIN_ROUTE_FAILURE:', error);
    return NextResponse.json(
      { error: 'An unexpected authentication engine error occurred.' },
      { status: 500 }
    );
  }
}