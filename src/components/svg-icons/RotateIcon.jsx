import React from 'react'

const RotateIcon = ({ color, size }) => {
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
            <path
                d="M3.06963 13.125C3.02367 12.7564 3 12.381 3 12C3 7.02943 7.02943 3 12 3C14.8132 3 17.3248 4.29068 18.9752 6.31218M18.9752 6.31218V3M18.9752 6.31218V6.37492L15.6002 6.375M20.9304 10.875C20.9764 11.2436 21 11.619 21 12C21 16.9706 16.9706 21 12 21C9.31194 21 6.89913 19.8216 5.25 17.953M5.25 17.953V17.625H8.625M5.25 17.953V21"
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default RotateIcon
