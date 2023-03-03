import Script from "next/script";

/**
 * Uses facebook comments plugin.
 * @see https://developers.facebook.com/docs/plugins/comments/
 * 
 */
const Comments = ({ pageSlug, numPosts = 3 }: { pageSlug: string, numPosts?: number }) => {
    return (
        <>
            <div className="fb-comments" data-width="100%" data-numposts={numPosts.toString()} data-lazy data-href={`https://midwestraptorjunkies.com/blog/${pageSlug}`}></div>
            <Script async defer crossOrigin="anonymous" strategy="lazyOnload" nonce="VI21h7U0" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v16.0" />
        </>
    );
}

export default Comments;