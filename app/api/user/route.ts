import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) { 
    const { email } = await req.json();
    if (!email) {
        return new Response("Email is required", { status: 400 });
    }
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (user) {
        return new Response(JSON.stringify(user), { status: 200 });
    }
    const newUser = await prisma.user.create({
        data: { email },
    });
    return new Response(JSON.stringify(newUser), { status: 200 });
}