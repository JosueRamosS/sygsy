import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface NeoSelectProps {
    label?: string;
    value: string | number;
    options: Option[];
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const NeoSelect: React.FC<NeoSelectProps> = ({
    label,
    value,
    options,
    onChange,
    placeholder = 'Seleccionar...',
    className = '',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string | number) => {
        if (!disabled) {
            onChange(optionValue);
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold mb-2 uppercase">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between bg-white border-2 border-black p-3 font-bold text-left transition-all
                    ${isOpen ? 'shadow-none translate-y-[2px] translate-x-[2px]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'}
                    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}
                `}
            >
                <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-black'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                    {options.length > 0 ? (
                        <ul className="py-1">
                            {options.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`
                                        px-4 py-3 cursor-pointer flex items-center justify-between font-bold border-b-2 border-transparent hover:bg-neo-yellow hover:border-black transition-colors last:mb-0
                                        ${option.value === value ? 'bg-neo-blue text-white hover:bg-neo-blue hover:text-white' : 'text-black'}
                                    `}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && <Check size={16} strokeWidth={4} />}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500 font-medium italic">
                            No hay opciones
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
