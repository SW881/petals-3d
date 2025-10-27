import React from 'react'

const DownIcon = ({ color, size }) => {
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
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.29231 7.36572C1.90256 7.7706 1.90256 8.42623 2.29231 8.83008L10.5559 17.3926C11.3364 18.2024 12.6025 18.2024 13.383 17.3926L21.7075 8.76807C22.0933 8.36732 22.0983 7.71989 21.7175 7.31397C21.3288 6.89977 20.6882 6.89475 20.2935 7.30274L12.6765 15.1963C12.2857 15.6012 11.6531 15.6012 11.2624 15.1963L3.70538 7.36572C3.31563 6.96083 2.68305 6.96083 2.29231 7.36572Z"
                fill={color}
            />
        </svg>
    )
}

export default DownIcon
