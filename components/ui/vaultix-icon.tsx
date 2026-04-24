export function VaultixIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Vault hinge bar with rivets */}
            <rect x="6" y="3.4" width="8" height="1.4" rx="0.7" fill="white" opacity="0.9" />
            <circle cx="6" cy="4.1" r="0.7" fill="white" />
            <circle cx="14" cy="4.1" r="0.7" fill="white" />

            {/* The V */}
            <path
                d="M3.6 6.2 L9.5 16.4 Q10 17.2 10.5 16.4 L16.4 6.2"
                stroke="white"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Apex dot */}
            <circle cx="10" cy="16.7" r="1.4" fill="white" />
        </svg>
    );
}
