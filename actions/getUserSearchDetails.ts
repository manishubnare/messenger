import prisma from "@/libs/prismadb";
import getSession from "./getSession";
import getCurrentUser from "./getCurrentUser";
import { UserDetail } from "@prisma/client";

const getUserSearchDetail = async () => {
  const currentUser = await getCurrentUser();
  try {
    const userDetail = await prisma.userDetail.findUnique({
      where: { userId: currentUser?.id },
    });

    return userDetail as UserDetail;
  } catch (error: any) {
    return null;
  }
};

export default getUserSearchDetail;
