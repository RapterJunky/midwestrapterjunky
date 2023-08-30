import type { GetStaticPropsResult, NextPage } from "next";

export function getStaticProps(): GetStaticPropsResult<object> {
  if (process.env.CI) {
    return {
      props: {},
    };
  }

  return {
    redirect: {
      permanent: true,
      destination: "/not-found",
    },
  };
}

const NotFound: NextPage = () => {
  return null;
};

export default NotFound;
