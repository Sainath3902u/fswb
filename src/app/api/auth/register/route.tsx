import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust this import path based on your folder setup
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // 1. Simple validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // 3. Hash the plain text password safely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Store the user into your live Supabase database
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === "CANTEEN_ADMIN" ? "CANTEEN_ADMIN" : "STUDENT", // Default safe assignment
        ...(role === "CANTEEN_ADMIN" && {
          canteen: {
            create: {
              name: `${name}'s Kitchen`, // Default title based on owner name
              subtitle: "Welcome to our food stall!", // Default fallback text string
              image: null,
            },
          },
        }),
      },
      include: {
        canteen: true,
      },
    });

    // 5. Return success message (Don't return the password string back!)
    return NextResponse.json(
      { message: "User registered successfully", userId: newUser.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("REGISTRATION_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}