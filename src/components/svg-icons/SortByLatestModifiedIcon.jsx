import React from 'react'

const SortByLatestModifiedIcon = ({ color, size }) => {
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
                d="M2 4.88235L16.1176 4.88235M2 10.7647L12.5882 10.7647M2 16.6471L9.05882 16.6471M18.4706 9.58823L18.4706 19M18.4706 19L22 15.4706M18.4706 19L14.9412 15.4706"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default SortByLatestModifiedIcon
