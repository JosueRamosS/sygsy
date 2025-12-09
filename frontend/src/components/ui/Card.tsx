import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    color?: 'white' | 'violet' | 'yellow' | 'pink' | 'green';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, color = 'white', ...props }, ref) => {
        const colors = {
            white: 'bg-white',
            violet: 'bg-neo-violet',
            yellow: 'bg-neo-yellow',
            pink: 'bg-neo-pink',
            green: 'bg-neo-green',
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'border-3 border-black shadow-neo p-6',
                    colors[color],
                    className
                )}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';
