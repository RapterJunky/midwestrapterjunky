import Navbar from "@components/layout/Navbar";

const ScrollFadeNavbarLayout: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <>
      <header>
        <Navbar mode="scroll-fade" />
      </header>
      <main className="flex flex-auto flex-col">{children}</main>
    </>
  );
};

export default ScrollFadeNavbarLayout;
