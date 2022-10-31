import type { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Footer from "../components/Footer";
import Navbar, { NavProps } from "../components/Navbar";

interface AboutUsProps extends NavProps {}

export const getStaticProps = (ctx: GetStaticPropsContext): GetStaticPropsResult<any> => {
    return {
        props: {}
    }
}

export default function AboutUs(props: AboutUsProps){
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