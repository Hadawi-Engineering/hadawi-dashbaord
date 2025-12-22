import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    label?: string;
}

export default function TagInput({
    tags,
    onChange,
    placeholder = 'Type and press Enter to add tags...',
    label
}: TagInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
            // Remove last tag when backspace is pressed on empty input
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmedValue = inputValue.trim().toLowerCase();

        if (trimmedValue === '') return;

        if (tags.includes(trimmedValue)) {
            alert('This tag already exists');
            return;
        }

        onChange([...tags, trimmedValue]);
        setInputValue('');
    };

    const removeTag = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
                <div className="flex flex-wrap gap-2">
                    {/* Tags */}
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="hover:text-gray-900"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}

                    {/* Input */}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={addTag}
                        placeholder={tags.length === 0 ? placeholder : ''}
                        className="flex-1 min-w-[120px] outline-none text-sm"
                    />
                </div>
            </div>

            <p className="text-xs text-gray-500">
                Press Enter to add a tag
            </p>
        </div>
    );
}
