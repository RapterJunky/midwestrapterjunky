"use client";
import { useSearchParams } from "next/navigation";

const errors = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification:
    "The sign in link is no longer valid. It may have been used already or it may have expired.",
  Default: "There was an error.",
};

const ErrorMessage: React.FC = () => {
  const params = useSearchParams();
  return (
    <>
      <p className="mt-4 text-2xl font-bold tracking-wider text-gray-500 md:text-3xl lg:text-5xl">
        {params?.get("error") ?? "Unknown Error"}
      </p>
      <p className="mt-4 border-b-2 pb-4 text-center text-gray-500">
        {
          errors[
            (params?.get("error") as keyof typeof errors | null) ?? "Default"
          ]
        }
      </p>
    </>
  );
};

export default ErrorMessage;
