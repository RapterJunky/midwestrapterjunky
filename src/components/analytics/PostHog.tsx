"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { PostHogProvider } from "posthog-js/react";
import { useEffect } from "react";
import posthog from "posthog-js";
import { host } from "@/lib/utils/host";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: `${host}/ingest`,
    autocapture: {
      dom_event_allowlist: ["click"],
      css_selector_allowlist: ["ph-autocapture"]
    }
  });
}

export function PostHogConfig() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }

      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);
}

export default function PHProvider({ children }: React.PropsWithChildren) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
