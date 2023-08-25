import Navbar from "@components/layout/Navbar";

const ScrollOnlyNavbarLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <header>
        <Navbar variant="scrollOnly" />
      </header>
      <main className="flex flex-auto flex-col">{children}</main>
    </>
  );
};

export default ScrollOnlyNavbarLayout;
