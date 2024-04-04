"use client";

import ErrorPage from "@/components/error/ErrorPage";

const PageError: React.FC<{ error: { digest: string; message: string } }> = ({
  error,
}) => {
  return <ErrorPage {...error} />;
};

export default PageError;
