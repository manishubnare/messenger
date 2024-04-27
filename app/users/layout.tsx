import getConnectedUsers from "@/actions/getConnectedUsers";
import getUser from "@/actions/getUsers";
import ClientOnly from "@/components/ClientOnly";
import UserList from "@/components/UserList";
import Sidebar from "@/components/sidebar/Sidebar";

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const connectedUser = await getConnectedUsers();
  const connectedUserDetails = connectedUser?.connectedUsers;

  return (
    //@ts-expect-error Server Component
    <Sidebar>
      <div className="h-full">
        <ClientOnly>
          <UserList items={connectedUserDetails} />
        </ClientOnly>
        {children}
      </div>
    </Sidebar>
  );
}
