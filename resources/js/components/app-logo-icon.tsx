import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            {/* Outer circle with gradient */}
            <defs>
                <radialGradient id="unoGradient" cx="0.5" cy="0.3" r="0.8">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
                </radialGradient>
                <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--uno-red)" />
                    <stop offset="25%" stopColor="var(--uno-yellow)" />
                    <stop offset="50%" stopColor="var(--uno-green)" />
                    <stop offset="75%" stopColor="var(--uno-blue)" />
                    <stop offset="100%" stopColor="var(--uno-red)" />
                </linearGradient>
            </defs>
            
            {/* Outer colorful border */}
            <circle cx="60" cy="60" r="58" fill="url(#borderGradient)" />
            
            {/* Main circle */}
            <circle cx="60" cy="60" r="50" fill="white" />
            
            {/* Inner shadow/gradient */}
            <circle cx="60" cy="60" r="50" fill="url(#unoGradient)" />
            
            {/* UNO text */}
            <text 
                x="60" 
                y="75" 
                textAnchor="middle" 
                fontSize="32" 
                fontWeight="900" 
                fill="var(--uno-black)"
                fontFamily="system-ui, -apple-system, sans-serif"
            >
                UNO
            </text>
            
            {/* Small decorative elements */}
            <circle cx="35" cy="35" r="4" fill="var(--uno-red)" />
            <circle cx="85" cy="35" r="4" fill="var(--uno-blue)" />
            <circle cx="35" cy="85" r="4" fill="var(--uno-green)" />
            <circle cx="85" cy="85" r="4" fill="var(--uno-yellow)" />
        </svg>
    );
}
