"use client";

import { User } from "@prisma/client";
import UserBox from "./UserBox";
import { useCallback } from "react";

type Props = {
  items: User[] | undefined;
};

function UserList({ items }: Props) {
  const getUserBoxJSX = useCallback(() => {
    return items?.map((item) => <UserBox key={item.id} data={item} />);
  }, [items]);

  return (
    <aside className="fixed inset-y-0 pb-20 lg:pb-0 lg:left-20 lg:w-80 lg:block overflow-y-auto border-r border-gray-200 dark:border-gray-700 block w-full left-0 dark:bg-black">
      <div className="px-5">
        <div className="flex-col">
          <div className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 py-4">
            People
          </div>
        </div>
        {getUserBoxJSX()}
      </div>
    </aside>
  );
}

export default UserList;
