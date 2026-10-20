export function StarRating({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1 text-amber-500" aria-label={`Rating ${value} out of 5`}>
      <span className="text-sm leading-none">
        {"★".repeat(rounded)}
        <span className="text-slate-300">{"★".repeat(5 - rounded)}</span>
      </span>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  );
}

export function InteractiveStars({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`${size === "sm" ? "text-xl" : "text-2xl"} leading-none transition ${
            n <= value ? "text-amber-500" : "text-slate-300 hover:text-amber-400"
          }`}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
