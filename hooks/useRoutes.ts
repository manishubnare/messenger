import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { HiChat } from "react-icons/hi";
import { HiArrowLeftOnRectangle, HiUsers } from "react-icons/hi2";
import { AiOutlineHome } from "react-icons/ai";

import useConversation from "./useConversation";

const useRoutes = () => {
  const pathName = usePathname();
  const { conversationId } = useConversation();

  const route = useMemo(
    () => [
      {
        label: "Home",
        href: "/home",
        icon: AiOutlineHome,
        active: pathName === "/home",
      },
      {
        label: "Chat",
        href: "/conversations",
        icon: HiChat,
        active: pathName === "/conversations" || !!conversationId,
      },
      {
        label: "Users",
        href: "/users",
        icon: HiUsers,
        active: pathName === "/users",
      },
      {
        label: "Logout",
        onClick: () => signOut(),
        href: "#",
        icon: HiArrowLeftOnRectangle,
      },
    ],
    [pathName, conversationId]
  );
  return route;
};

export default useRoutes;
