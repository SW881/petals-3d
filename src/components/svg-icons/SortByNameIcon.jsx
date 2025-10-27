import React from 'react'

const SortByNameIcon = ({ color, size }) => {
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
                d="M18.1378 12.1462L18.1378 21.623ZM18.1378 21.623L21 18.9237ZM18.1378 21.623L15.2756 18.9237Z"
                fill={color}
            />
            <path
                d="M18.1378 12.1462L18.1378 21.623M18.1378 21.623L21 18.9237M18.1378 21.623L15.2756 18.9237"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M6.06141 3.92773L3.7411 11H1.87196L5.04188 2.46875H6.23134L6.06141 3.92773ZM7.98915 11L5.66298 3.92773L5.47548 2.46875H6.67665L9.86415 11H7.98915ZM7.88368 7.82422V9.20117H3.37782V7.82422H7.88368Z"
                fill={color}
            />
            <path
                d="M12.391 19.2904V20.6615H6.34408V19.2904H12.391ZM12.3031 13.1088L7.12337 20.6615H5.88705V19.6537L11.1077 12.1302H12.3031V13.1088ZM11.6995 12.1302V13.5072H5.89291V12.1302H11.6995Z"
                fill={color}
            />
        </svg>
    )
}

export default SortByNameIcon
