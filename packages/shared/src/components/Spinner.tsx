interface SpinnerProps {
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

const sizeClasses = {
  sm: "w-4 h-4 border",
  md: "w-8 h-8 border-2",
};

export function Spinner({ label, className = "", size = "md" }: SpinnerProps) {
  const circle = (
    <div
      className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin ${label ? "" : className}`}
    />
  );

  if (label) {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        {circle}
        <span className="text-xs text-slate-400 font-medium">{label}</span>
      </div>
    );
  }

  return circle;
}
