interface StatusBadgeProps {
  text: string;
  variant?: "pro" | "beta" | "next" | "default";
  className?: string;
}

export const StatusBadge = ({
  text,
  variant = "default",
  className = "",
}: StatusBadgeProps) => {
  const variants = {
    pro: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm shadow-orange-500/20",
    beta: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
    next: "bg-muted text-muted-foreground border border-border",
    default: "bg-primary/10 text-primary border border-primary/20",
  };

  return (
    <span
      className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${variants[variant]} ${className}`}
    >
      {text}
    </span>
  );
};
