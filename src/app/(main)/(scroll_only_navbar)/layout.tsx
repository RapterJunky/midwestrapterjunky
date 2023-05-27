const ScrollOnlyNavbarLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <header>

            </header>
            <main>
                {children}
            </main>
        </>
    );
}

export default ScrollOnlyNavbarLayout;