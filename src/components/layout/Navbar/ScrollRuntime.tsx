"use client";

import { useCallback, useEffect } from "react";

const ScrollRuntime = () => {
  const onScroll = useCallback(() => {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    if (window.scrollY > 0) {
      navbar.classList.remove("bg-opacity-0", "text-white");
      navbar.classList.add("bg-opacity-100", "text-black", "shadow");
    } else {
      navbar.classList.add("bg-opacity-0", "text-white");
      navbar.classList.remove("bg-opacity-100", "text-black", "shadow");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  return null;
};

export default ScrollRuntime;
