import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Footer from "../components/Footer";
import Navbar, { NavProps } from "../components/Navbar";

interface CalendarProps extends NavProps {}

export const getStaticProps = (ctx: GetStaticPropsContext): GetStaticPropsResult<any> => {
    return {
        props: {}
    }
}

export default function Calendar(props: CalendarProps){
    return (
        <>
            <header>
                <Navbar {...props.navbar}/>
            </header>
            <main>

            </main>
            <Footer/>
        </>
    );
}