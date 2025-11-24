import React from 'react'

const PenIcon = ({ color, size }) => {
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
                d="M15.6226 5.49725L18.4787 8.32622M3 21L3.04792 20.6677C3.21747 19.4922 3.30226 18.9044 3.4951 18.3556C3.66623 17.8686 3.89999 17.4055 4.19064 16.9778C4.51817 16.4957 4.94208 16.0758 5.78987 15.2362L17.5522 3.5859C18.341 2.8047 19.6197 2.8047 20.4085 3.5859C21.1972 4.3671 21.1972 5.63368 20.4085 6.41488L8.43025 18.2789C7.66112 19.0407 7.27656 19.4216 6.83853 19.7245C6.44973 19.9933 6.0304 20.216 5.58916 20.3881C5.09206 20.5819 4.55891 20.6884 3.49272 20.9015L3 21Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default PenIcon
