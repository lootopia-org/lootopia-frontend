export const LootopiaLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Treasure chest */}
    <rect x="8" y="18" width="24" height="14" rx="2" fill="currentColor" opacity="0.8" />
    <rect x="8" y="18" width="24" height="3" fill="currentColor" />
    
    {/* Chest lid */}
    <path d="M 8 18 Q 20 8 32 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    
    {/* Map pointer/marker */}
    <path d="M 20 8 L 25 18 Q 20 24 15 18 Z" fill="currentColor" opacity="0.6" />
    
    {/* Gold/treasure sparkle */}
    <circle cx="20" cy="25" r="2" fill="currentColor" opacity="0.9" />
    <circle cx="16" cy="22" r="1.5" fill="currentColor" opacity="0.7" />
    <circle cx="24" cy="22" r="1.5" fill="currentColor" opacity="0.7" />
  </svg>
);
