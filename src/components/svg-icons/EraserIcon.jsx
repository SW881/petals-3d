import React from 'react'

const EraserIcon = ({ color, size }) => {
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
                d="M5 2.5L19 2.5C20.3807 2.5 21.5 3.61929 21.5 5V12.0264L2.5 12.0264L2.5 5C2.5 3.61929 3.61929 2.5 5 2.5Z"
                fill="none"
                stroke={color}
            />
            <path
                d="M20 21.5L4 21.5C3.17157 21.5 2.5 20.8284 2.5 20L2.5 11.9736L21.5 11.9736L21.5 20C21.5 20.8284 20.8284 21.5 20 21.5Z"
                fill={color}
                stroke={color}
            />
        </svg>
    )
}

export default EraserIcon
