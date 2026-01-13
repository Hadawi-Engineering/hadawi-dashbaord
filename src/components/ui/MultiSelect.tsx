import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
    options: readonly string[] | string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    label?: string;
}

export default function MultiSelect({
    options,
    value,
    onChange,
    placeholder = 'Select items...',
    label
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter(v => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    const selectAll = () => {
        onChange([...options]);
    };

    const clearAll = () => {
        onChange([]);
    };

    const removeItem = (option: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== option));
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div ref={containerRef} className="relative">
                {/* Selected Items Display */}
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500"
                >
                    {value.length === 0 ? (
                        <span className="text-gray-400">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {value.map(item => (
                                <span
                                    key={item}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                                >
                                    {item.replace(/_/g, ' ')}
                                    <button
                                        type="button"
                                        onClick={(e) => removeItem(item, e)}
                                        className="hover:text-primary-900"
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <ChevronDown
                        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>

                {/* Dropdown */}
                {isOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Select/Clear All */}
                        <div className="flex gap-2 p-2 border-b border-gray-200">
                            <button
                                type="button"
                                onClick={selectAll}
                                className="flex-1 px-3 py-1 text-sm text-primary-600 hover:bg-primary-50 rounded"
                            >
                                Select All
                            </button>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="flex-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Options */}
                        <div className="overflow-y-auto max-h-48">
                            {filteredOptions.length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No options found
                                </div>
                            ) : (
                                filteredOptions.map(option => (
                                    <div
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${value.includes(option)
                                                ? 'bg-primary-500 border-primary-500'
                                                : 'border-gray-300'
                                            }`}>
                                            {value.includes(option) && (
                                                <Check size={14} className="text-white" />
                                            )}
                                        </div>
                                        <span className="text-sm capitalize">
                                            {option.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
