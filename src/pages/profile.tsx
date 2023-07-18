import type {
  GetStaticPropsContext,
  GetStaticPropsResult,
  NextPage,
} from "next";
import { useSession, signOut } from "next-auth/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";

import FaFacebook from "@components/icons/FaFacebook";
import FaGoogle from "@components/icons/FaGoogle";
import Navbar from "@components/layout/OldNavbar";
import type { FullPageProps } from "@type/page";
import Footer from "@components/layout/Footer";
import { fetchCachedQuery } from "@lib/cache";
import SiteTags from "@components/SiteTags";
import Query from "@query/queries/generic";
import { singleFetch } from "@api/fetch";
import genericSeoTags from "@utils/genericSeoTags";
import type { SeoOrFaviconTag } from "react-datocms/seo";

type Props = FullPageProps & { seo: SeoOrFaviconTag[] };

type User = {
  id: string;
  name?: string;
  email?: string;
  emailVerified: null | boolean;
  image: string;
  sqaureId: string;
  banned: number;
  accounts: { type: string; provider: string; providerAccountId: string }[];
};

export const getStaticProps = async (
  ctx: GetStaticPropsContext,
): Promise<GetStaticPropsResult<Props>> => {
  const data = await fetchCachedQuery<Props>("GenericPage", Query);
  return {
    props: {
      ...data,
      seo: genericSeoTags({
        title: "Profile - Midwest Raptor Junkies",
        robots: false,
        description: "Midwest Raptor Junkies user profile page.",
        url: "https://midwestraptorjunkies.com/profile",
      }),
      preview: (ctx?.draftMode || ctx.preview) ?? false,
    },
  };
};

const ConfirmDialog = dynamic(
  () => import("@components/dialogs/ConfirmDialog"),
);

const deleteDialogData = {
  title: "Confirm Action",
  message: "Are you sure you want to delete your account?",
  cancelIntent: "ok" as "ok" | "error",
  confirmIntent: "error" as "ok" | "error",
};

/**
 * @see https://flowbite.com/application-ui/demo/users/settings/
 * @see https://tailwindui.com/components/application-ui/page-examples/settings-screens
 *
 */
const Profile: NextPage<Props> = ({ navbar, _site, seo }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(deleteDialogData);
  const { data } = useSession({
    required: true,
  });
  const {
    data: user,
    isLoading,
    error,
  } = useSWR<User, Response>("/api/account", singleFetch);
  return (
    <div className={`flex h-full flex-col`}>
      <SiteTags tags={[_site.faviconMetaTags, seo]} />
      <header>
        <Navbar {...navbar} mode="only-scroll" />
      </header>
      <ConfirmDialog
        cancelIntent={dialogData.cancelIntent}
        confirmIntent={dialogData.confirmIntent}
        open={dialogOpen}
        confirm={async () => {
          setDialogOpen(false);
          if (dialogData.title !== "Confirm Action") return;
          try {
            await singleFetch("/api/account", { method: "DELETE" });
            await signOut({
              callbackUrl: "/",
            });
          } catch (error) {
            setDialogData({
              title: "Failure",
              message:
                "The server was unable to delete your account at this time, Please try again.",
              cancelIntent: "ok",
              confirmIntent: "ok",
            });
            console.error(error);
          }
        }}
        close={() => setDialogOpen(false)}
        title={dialogData.title}
        message={dialogData.message}
      />
      <main className="flex flex-1 flex-col items-center gap-4">
        <div className="h-20"></div>
        <section className="flex w-full gap-2 rounded-sm bg-slate-100 p-8 shadow-sm md:w-1/3">
          <Image
            className="rounded-full"
            src={data?.user.image ?? ""}
            width={100}
            height={100}
            alt="avatar"
          />
          <div>
            <h1 className="text-xl font-bold">
              {data?.user.banned !== 0 ? (
                <div className="my-[5px] mr-2 inline-flex cursor-pointer items-center justify-between rounded-sm bg-red-600 px-[12px] py-0 text-[13px] font-normal normal-case leading-loose text-white">
                  Banned
                </div>
              ) : null}
              {data?.user.name}
            </h1>
            <h2 className="font-normal">{data?.user.email}</h2>
          </div>
        </section>
        <section className="flex w-full flex-col rounded-sm bg-slate-100 p-8 shadow-sm md:w-1/3">
          <h1 className="text-xl font-bold">Social accounts</h1>
          <ul className="divide-y">
            <li className="flex items-center gap-2 py-4">
              <div>
                <FaFacebook className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold">
                  Facebook account
                </span>
                <span className="text-sm font-normal text-neutral-600">
                  {isLoading
                    ? "Loading..."
                    : error
                    ? "Failed to loaded provider."
                    : user?.accounts.some(
                        (value) => value.provider === "facebook",
                      )
                    ? "Connected"
                    : "Not connected"}
                </span>
              </div>
              <div></div>
            </li>
            <li className="flex items-center gap-2 py-4">
              <div>
                <FaGoogle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-semibold">Google account</span>
                <span className="text-sm font-normal text-neutral-600">
                  {isLoading
                    ? "Loading..."
                    : error
                    ? "Failed to loaded provider."
                    : user?.accounts.some(
                        (value) => value.provider === "google",
                      )
                    ? "Connected"
                    : "Not connected"}
                </span>
              </div>
              <div></div>
            </li>
          </ul>
        </section>
        <section className="mb-4 flex w-full flex-col rounded-sm bg-slate-100 p-8 shadow-sm md:w-1/3">
          <h1 className="text-xl font-bold">Delete account</h1>
          <div>
            <p className="my-4 text-sm">
              No longer want to use our service? You can delete your account
              here. This action is not reversible. All information related to
              this account will be deleted permanently.
            </p>
            <button
              onClick={() => {
                setDialogData(deleteDialogData);
                setDialogOpen(true);
              }}
              type="button"
              className="inline-block rounded-sm bg-danger px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#dc4c64] transition duration-150 ease-in-out hover:bg-danger-600 hover:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:bg-danger-600 focus:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)] focus:outline-none focus:ring-0 active:bg-danger-700 active:shadow-[0_8px_9px_-4px_rgba(220,76,100,0.3),0_4px_18px_0_rgba(220,76,100,0.2)]"
            >
              Yes, delete my account
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
