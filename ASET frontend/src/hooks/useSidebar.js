import { useState } from 'react';

export const useSidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeItem, setActiveItem] = useState('current-chat');

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const setActive = (item) => {
        setActiveItem(item);
    };

    return {
        isExpanded,
        activeItem,
        toggleSidebar,
        setActive
    };
};
