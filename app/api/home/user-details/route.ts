import getCurrentUser from "@/actions/getCurrentUser";
import getMistralApiClient from "@/actions/getMistralApiClient";
import prisma from "@/libs/prismadb";
import { da } from "date-fns/locale";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { detail1, detail2 } = body;

    if (!detail1 || !detail2) {
      return new NextResponse("Missing info", { status: 400 });
    }

    const updatedDetails = await prisma.userDetail.upsert({
      where: { userId: currentUser?.id },
      create: {
        detail1,
        detail2,
        user: {
          connect: {
            id: currentUser?.id,
          },
        },
      },
      update: {
        detail1,
        detail2,
        user: {
          connect: {
            id: currentUser?.id,
          },
        },
      },
    });

    return NextResponse.json(updatedDetails);
  } catch (error: any) {
    return new NextResponse("internal error", { status: 500 });
  }
}
