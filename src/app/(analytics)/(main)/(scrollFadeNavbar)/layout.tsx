import Navbar from "@components/layout/Navbar";

const ScrollFadeNavbarLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <header>
        <Navbar variant="scrollFade" />
      </header>
      <main className="flex flex-auto flex-col">{children}</main>
    </>
  );
};

export default ScrollFadeNavbarLayout;
