import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-zinc-300 dark:bg-zinc-800", className)}
      {...props}
    />
  )
}

export { Skeleton }
