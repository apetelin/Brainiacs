"use client";

import React from 'react';
import { useUser } from './UserContext';

const UserSelector: React.FC = () => {
    const { setUser } = useUser();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setUser(event.target.value as 'Stacy' | 'Mary');
    };

    return (
        <select onChange={handleChange} className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded">
            <option value="Stacy">Stacy (User)</option>
            <option value="Mary">Mary (Admin)</option>
        </select>
    );
};

export default UserSelector;