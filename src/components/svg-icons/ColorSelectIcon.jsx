import React from 'react'

const ColorSelectIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={color}
        >
            <rect
                x="0.5"
                y="0.5"
                width="23"
                height="23"
                rx="3.5"
                stroke={color}
            />
        </svg>
    )
}

export default ColorSelectIcon
