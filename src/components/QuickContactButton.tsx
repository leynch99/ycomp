"use client";

export function QuickContactButton({
  className,
  label = "Швидкий звʼязок",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event("quick-contact:open"));
      }}
      className={className}
    >
      {label}
    </button>
  );
}
