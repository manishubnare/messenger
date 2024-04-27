import { User } from "@prisma/client";
import Image from "next/image";

function UserResult({ connectedUser }: { connectedUser: User[] | null }) {
  return (
    <div className="flex flex-col gap-3 px-8 py-4 sm:px-0 sm:mt-2">
      <div>
        <span className="text-xl">Results:</span>
      </div>
      {connectedUser?.map((user) => (
        <div className="flex items-center p-4 rounded-lg bg-white dark:bg-black shadow w-80">
          <div className="flex-shrink-0 mr-4">
            <Image
              className="w-12 h-12 rounded-full"
              src={user.image || ""}
              alt="User Image"
              width={12}
              height={12}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UserResult;
