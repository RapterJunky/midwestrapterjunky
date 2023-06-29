"use client";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const SignInList: React.FC = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") ?? undefined;
  return (
    <>
      <button
        data-cy="google-login-btn"
        type="button"
        onClick={() =>
          signIn("google", { callbackUrl }).catch((e) => console.error(e))
        }
        className="mb-2 flex w-full items-center justify-center gap-1 rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
      >
        <FaGoogle /> continue with Google
      </button>
      <button
        data-cy="facebook-login-btn"
        type="button"
        onClick={() =>
          signIn("facebook", { callbackUrl }).catch((e) => console.error(e))
        }
        className="mb-2 flex w-full items-center justify-center gap-1 rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
      >
        <FaFacebook /> continue with Facebook
      </button>
    </>
  );
};

export default SignInList;
