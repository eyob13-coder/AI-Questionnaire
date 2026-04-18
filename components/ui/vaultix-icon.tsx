export function VaultixIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="10" cy="10" r="6.5" stroke="white" strokeWidth="1.4" opacity="0.65" />
            <line x1="10" y1="3.5" x2="10" y2="16.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="3.5" y1="10" x2="16.5" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="5.4" y1="5.4" x2="14.6" y2="14.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="14.6" y1="5.4" x2="5.4" y2="14.6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="10" cy="10" r="2.5" fill="white" />
        </svg>
    );
}
