import UserProfile from "@/components/pages/profile/UserProfile";
import getGenericSeoTags from "@/lib/helpers/getGenericSeoTags";
import Provider from "@/components/providers/SessionProvider";
import type { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const icons = (await parent).icons;

  return getGenericSeoTags({
    icons,
    title: "Profile - Midwest Raptor Junkies",
    robots: false,
    description: "Midwest Raptor Junkies user profile page.",
    url: "https://midwestraptorjunkies.com/profile",
  });
}

const Profile: React.FC = () => {
  return (
    <>
      <div className="mb-4 h-20"></div>
      <div className="flex flex-col items-center">
        <div className="container flex flex-col gap-2 sm:max-w-2xl">
          <Provider>
            <UserProfile />
          </Provider>
        </div>
      </div>
    </>
  );
};

export default Profile;
