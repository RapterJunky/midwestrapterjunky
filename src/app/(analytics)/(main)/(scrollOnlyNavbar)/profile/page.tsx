import type { Metadata, ResolvingMetadata } from "next";
import UserProfile from "@/components/pages/profile/UserProfile";
import Provider from "@/components/providers/SessionProvider";
import getSeoTags from "@/lib/helpers/getSeoTags";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return getSeoTags({
    parent,
    seo: {
      title: "Profile",
      robots: false,
      description: "Midwest Raptor Junkies user profile page.",
      slug: "/profile",
    },
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
