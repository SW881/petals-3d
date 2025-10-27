import React from 'react'

const AddIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect
                x="-0.5"
                y="0.5"
                width="23"
                height="23"
                transform="matrix(-1 0 0 1 23 0)"
                stroke="none"
            />
            <rect x="11" y="2" width="2" height="20" rx="1" fill={color} />
            <rect
                x="22"
                y="11"
                width="2"
                height="20"
                rx="1"
                transform="rotate(90 22 11)"
                fill={color}
            />
        </svg>
    )
}

export default AddIcon
