import getCurrentUser from "@/actions/getCurrentUser";
import getUserSearchDetail from "@/actions/getUserSearchDetails";
import getUser from "@/actions/getUsers";
import HomeTitle from "@/components/home/HomeTitle";
import SearchDetails from "@/components/home/SearchDetails";
import Sidebar from "@/components/sidebar/Sidebar";

export default async function HomeLayout() {
  const currentUser = await getCurrentUser();
  const userSearchDetails = await getUserSearchDetail();
  const allUserData = await getUser();

  return (
    // @ts-expect-error Server Component
    <Sidebar>
      <div className="flex justify-center flex-col items-center gap-6">
        <HomeTitle currentUser={currentUser} />
        <SearchDetails
          userSearchDetails={userSearchDetails}
          currentUser={currentUser}
          allUserData={allUserData}
        />
      </div>
    </Sidebar>
  );
}
