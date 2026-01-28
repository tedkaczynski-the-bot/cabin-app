export const CabinIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Roof */}
    <path d="M3 11L12 3L21 11" />
    {/* Cabin body */}
    <path d="M5 10V20H19V10" />
    {/* Door */}
    <path d="M10 20V15H14V20" />
    {/* Window */}
    <rect x="7" y="12" width="3" height="3" />
    {/* Chimney */}
    <path d="M16 6V3H18V8" />
    {/* Tree (pine) */}
    <path d="M22 20L20 14L22 14L20 9L22 9L20 5L18 9L20 9L18 14L20 14L18 20" />
  </svg>
);
