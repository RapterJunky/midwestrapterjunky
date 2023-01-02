import { GetStaticPathsContext, GetStaticPathsResult, GetStaticPropsContext, GetStaticPropsResult, NextPage } from "next";

interface ArticleProps {}

export const getStaticPaths = async (ctx: GetStaticPathsContext): Promise<GetStaticPathsResult> => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export const getStaticProps = async (ctx: GetStaticPropsContext): Promise<GetStaticPropsResult<ArticleProps>> => {
    return {
        props: {}
    }
}

const Article: NextPage<ArticleProps> = () => {
    return (
        <div></div>
    );
}

export default Article;