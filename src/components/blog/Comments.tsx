import { useState, useCallback } from "react";
import Script from "next/script";

/**
 * @deprecated Should be replaced with in house version
 *
 * Uses facebook comments plugin.
 * @see https://developers.facebook.com/docs/plugins/comments/
 *
 */
const Comments = ({
  pageSlug,
  numPosts = 3,
}: {
  pageSlug: string;
  numPosts?: number;
}) => {
  const [loadComments, setLoadComments] = useState(true);

  const LoadComments = useCallback(() => {
    setLoadComments(false);
    const script = document.createElement("script");
    script.src =
      "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v16.0";
    script.async = true;
    script.setAttribute("id", "fb-sdk");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("nonce", "VI21h7U0");

    const comments = document.getElementById("comments");
    if (comments) {
      comments.classList.add("fb-comments");

      const fbScript = document.getElementById("fb-sdk");
      if (!fbScript) document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="pb-6 pt-6 text-center text-gray-700">
      {loadComments ? (
        <button onClick={LoadComments}>Load Comments</button>
      ) : null}
      <div
        id="comments"
        data-order-by="reverse-time"
        data-width="100%"
        data-numposts={numPosts.toString()}
        data-lazy
        data-href={`https://midwestraptorjunkies.com/blog/${pageSlug}`}
      ></div>
      <Script />
    </div>
  );
};

export default Comments;
