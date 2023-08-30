import Navbar from "@components/layout/Navbar";

const FixedNavbarLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <header>
        <Navbar />
      </header>
      <main className="flex flex-auto flex-col">{children}</main>
    </>
  );
};

export default FixedNavbarLayout;
