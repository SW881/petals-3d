import React from 'react'

const CameraFovIcon = ({ color, size }) => {
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
            <rect x="2" y="15" width="20" height="4" rx="1" fill={color} />
            <rect x="3" y="16" width="2" height="2" rx="1" fill={color} />
            <rect x="5" y="13" width="14" height="3" rx="1" fill={color} />
            <rect
                x="3"
                y="5.5"
                width="1"
                height="10"
                transform="rotate(-30 3 5.5)"
                fill={color}
            />
            <rect
                x="20"
                y="5"
                width="1"
                height="10"
                transform="rotate(30 20 5)"
                fill={color}
            />
        </svg>
    )
}

export default CameraFovIcon
