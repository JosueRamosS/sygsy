import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold mb-2 uppercase tracking-wide">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full border-3 border-black p-3 font-medium outline-none focus:shadow-neo transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed',
                        error ? 'border-neo-red bg-red-50' : 'bg-white',
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-neo-red text-sm mt-1 font-bold">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
