import { useState, useEffect, useCallback } from "react";

export const useDebouncedSearch = (initialValue: string = "", delay: number = 500) => {
    const [value, setValue] = useState(initialValue);
    const [debouncedValue, setDebouncedValue] = useState(initialValue);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    const onChange = useCallback((newValue: string) => {
        setValue(newValue);
    }, []);

    return {value, debouncedValue, onChange};
};