import React from 'react'

const NotesIcon = ({ color, size }) => {
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
            <rect
                x="-0.5"
                y="0.5"
                width="15"
                height="19"
                rx="1.5"
                transform="matrix(-1 0 0 1 19 2)"
                stroke={color}
            />
            <rect x="6" y="5" width="11" height="2" rx="1" fill={color} />
            <rect x="6" y="10" width="7" height="2" rx="1" fill={color} />
            <rect x="6" y="15" width="5" height="2" rx="1" fill={color} />
        </svg>
    )
}

export default NotesIcon
