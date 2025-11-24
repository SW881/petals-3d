import React from 'react'

const GridIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect x="0.5" y="0.5" width="23" height="23" stroke="none" />
            <path d="M6.75 5L6.75 19" stroke={color} strokeLinecap="round" />
            <path d="M19 6.75L5 6.75" stroke={color} strokeLinecap="round" />
            <path d="M12 5L12 19" stroke={color} strokeLinecap="round" />
            <path d="M19 12L5 12" stroke={color} strokeLinecap="round" />
            <path d="M17.25 5L17.25 19" stroke={color} strokeLinecap="round" />
            <path d="M19 17.25L5 17.25" stroke={color} strokeLinecap="round" />
        </svg>
    )
}

export default GridIcon
