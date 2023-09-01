import { useCallback } from "react";
import toRelativeTime from "@/lib/utils/toRelativeTime";


/**
    @see https://github.com/rxaviers/relative-time/blob/master/src/relative-time.js 
**/
const useRelativeTime = () => {
  const formatter = useCallback(toRelativeTime, []);
  return formatter;
};

export default useRelativeTime;
