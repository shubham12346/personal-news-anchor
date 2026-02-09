import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) { 
    const { userId, interests } = await req.json();
    if (!interests) {
        return NextResponse.json({ error: "Interests are required" }, { status: 400 });
    }

   const pref = await prisma.preference.create({
    data: {
      userId,
      interests,
    },
  });
    return NextResponse.json({
        message: "Preference created successfully",
        pref,
    });
    
}

export async function GET(request: NextRequest) { 
    const userId = request.nextUrl.searchParams.get("userId");
    if (userId) {
        const preference = await prisma.preference.findFirst({
            where: { userId },
            orderBy: { updatedAt: "desc" },
        });
        return NextResponse.json(preference);
    }

    const preferences = await prisma.preference.findMany();
    return NextResponse.json(preferences);
}