import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-md bg-[var(--obsidian-2)] relative overflow-hidden",
        className
      )}
      style={{
        backgroundSize: "200% 100%",
        backgroundImage: "linear-gradient(90deg, var(--obsidian-2), var(--obsidian-3), var(--obsidian-2))",
      }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(124,58,237,0.05)] to-transparent animate-shimmer" />
    </div>
  )
}

export { Skeleton }
