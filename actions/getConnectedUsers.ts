import prisma from "@/libs/prismadb";
import getCurrentUser from "./getCurrentUser";

const getConnectedUsers = async () => {
  const currentUser = await getCurrentUser();

  try {
    const connnectedUsers = await prisma.connectedUsers.findUnique({
      where: {
        userId: currentUser?.id,
      },
      include: {
        connectedUsers: true,
      },
    });

    if (!connnectedUsers) {
      return null;
    }

    return connnectedUsers;
  } catch (error: any) {
    return null;
  }
};

export default getConnectedUsers;
