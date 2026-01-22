import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import type { City } from '../../types';

interface CityMultiSelectProps {
    cities: City[];
    value: string[]; // Array of city IDs
    onChange: (value: string[]) => void;
    placeholder?: string;
    label?: string;
    loading?: boolean;
}

export default function CityMultiSelect({
    cities,
    value,
    onChange,
    placeholder = 'Select cities...',
    label,
    loading = false
}: CityMultiSelectProps) {
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

    const filteredCities = cities.filter(city =>
        city.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.nameAr.includes(searchTerm) ||
        city.region?.nameEn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleCity = (cityId: string) => {
        if (value.includes(cityId)) {
            onChange(value.filter(id => id !== cityId));
        } else {
            onChange([...value, cityId]);
        }
    };

    const selectAll = () => {
        onChange(cities.map(city => city.id));
    };

    const clearAll = () => {
        onChange([]);
    };

    const removeCity = (cityId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(id => id !== cityId));
    };

    const getSelectedCities = () => {
        return cities.filter(city => value.includes(city.id));
    };

    // Group cities by region
    const groupedCities = filteredCities.reduce((acc, city) => {
        const regionName = city.region?.nameEn || 'Unknown Region';
        if (!acc[regionName]) {
            acc[regionName] = [];
        }
        acc[regionName].push(city);
        return acc;
    }, {} as Record<string, City[]>);

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
                    onClick={() => !loading && setIsOpen(!isOpen)}
                    className={`min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg ${loading ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-400'} focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500`}
                >
                    {loading ? (
                        <span className="text-gray-400">Loading cities...</span>
                    ) : value.length === 0 ? (
                        <span className="text-gray-400">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {getSelectedCities().map(city => (
                                <span
                                    key={city.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
                                >
                                    {city.nameEn}
                                    <button
                                        type="button"
                                        onClick={(e) => removeCity(city.id, e)}
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
                {isOpen && !loading && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden">
                        {/* Search */}
                        <div className="p-2 border-b border-gray-200">
                            <input
                                type="text"
                                placeholder="Search cities or regions..."
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
                                Select All ({cities.length})
                            </button>
                            <button
                                type="button"
                                onClick={clearAll}
                                className="flex-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Options Grouped by Region */}
                        <div className="overflow-y-auto max-h-72">
                            {Object.keys(groupedCities).length === 0 ? (
                                <div className="p-4 text-center text-gray-500 text-sm">
                                    No cities found
                                </div>
                            ) : (
                                Object.entries(groupedCities).map(([regionName, regionCities]) => (
                                    <div key={regionName}>
                                        <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase sticky top-0">
                                            {regionName}
                                        </div>
                                        {regionCities.map(city => (
                                            <div
                                                key={city.id}
                                                onClick={() => toggleCity(city.id)}
                                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                                            >
                                                <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${value.includes(city.id)
                                                        ? 'bg-primary-500 border-primary-500'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {value.includes(city.id) && (
                                                        <Check size={14} className="text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {city.nameEn}
                                                    </div>
                                                    <div className="text-xs text-gray-500" dir="rtl">
                                                        {city.nameAr}
                                                    </div>
                                                </div>
                                                {!city.isOperational && (
                                                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                                                        Not Operational
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Selected Count */}
                        {value.length > 0 && (
                            <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
                                {value.length} {value.length === 1 ? 'city' : 'cities'} selected
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}


