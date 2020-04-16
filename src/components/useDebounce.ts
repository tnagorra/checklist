import { useState, useEffect } from 'react';

export default function useDebounce<T>(value: T, delay = 200) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(
        () => {
            const timeout = setTimeout(
                () => {
                    setDebouncedValue(value);
                },
                delay,
            );

            return () => {
                clearTimeout(timeout);
            };
        },
        [value, delay],
    );

    return debouncedValue;
}
