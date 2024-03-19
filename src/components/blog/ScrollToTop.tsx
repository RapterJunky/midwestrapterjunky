"use client";

import { ArrowUp, MessagesSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  comments: boolean;
}

const ScrollToTop = ({ comments = false }: Props) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleWindowScroll = () => {
      if (window.scrollY > 50) setShow(true);
      else setShow(false);
    };

    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  const handleScrollTop = () => window.scrollTo({ top: 0 });

  const handleScrollToComment = () =>
    document.getElementById("comment")?.scrollIntoView();

  return (
    <div
      className={`fixed bottom-8 right-8 hidden flex-col gap-3 ${
        show ? "md:flex" : "md:hidden"
      }`}
    >
      {comments ? (
        <button
          data-cy="scroll-to-comments"
          aria-label="Scroll To Comment"
          type="button"
          onClick={handleScrollToComment}
          className="rounded-full bg-gray-200 p-4 text-gray-500 transition-all hover:bg-gray-300"
        >
          <MessagesSquare />
        </button>
      ) : null}
      <button
        data-cy="scroll-to-top"
        aria-label="Scroll To Top"
        type="button"
        onClick={handleScrollTop}
        className="rounded-full bg-gray-200 p-4 text-gray-500 transition-all hover:bg-gray-300"
      >
        <ArrowUp />
      </button>
    </div>
  );
};

export default ScrollToTop;
