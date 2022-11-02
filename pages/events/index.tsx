import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import Footer from "../../components/Footer";
import Navbar, { NavProps } from "../../components/Navbar";

interface EventsProps extends NavProps {}

export const getStaticProps = (ctx: GetStaticPropsContext): GetStaticPropsResult<any> => {
    return {
        props: {}
    }
}

export default function Events(props: EventsProps){
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