import React from 'react'

const StraightLineIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect x="0.5" y="0.5" width="23" height="23" stroke="none" />
            <path
                d="M4 12L20 12"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    )
}

export default StraightLineIcon
