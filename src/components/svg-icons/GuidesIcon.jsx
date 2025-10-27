import React from 'react'

const GuidesIcon = ({ color, size }) => {
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
                x="13.2856"
                y="3"
                width="7.71429"
                height="7.71429"
                fill={color}
            />
            <path
                d="M15.2142 17.1429L17.1428 13.2858L19.0714 17.1429L20.9999 21.0001H13.2856L15.2142 17.1429Z"
                fill={color}
            />
            <rect
                x="3"
                y="3"
                width="7.71429"
                height="7.71429"
                rx="3.85714"
                fill={color}
            />
            <path
                d="M5.14286 15.0001L6.85714 13.2858L8.57143 15.0001L10.7143 17.1429L9 21.0001H6.85714H4.71429L3 17.1429L5.14286 15.0001Z"
                fill={color}
            />
        </svg>
    )
}

export default GuidesIcon
