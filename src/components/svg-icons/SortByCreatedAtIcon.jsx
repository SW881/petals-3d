import React from 'react'

const SortByCreatedAtIcon = ({ color, size }) => {
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
                d="M18.363 12.5227L18.363 22ZM18.363 22L21.9999 18.446ZM18.363 22L14.7261 18.446Z"
                fill="white"
            />
            <path
                d="M18.363 12.5227L18.363 22M18.363 22L21.9999 18.446M18.363 22L14.7261 18.446"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M10.321 18.2625C8.67523 18.2625 7.06646 17.7856 5.69808 16.8921C4.32971 15.9986 3.26319 14.7287 2.63339 13.2429C2.0036 11.7571 1.83882 10.1222 2.15989 8.5449C2.48095 6.9676 3.27345 5.51875 4.43715 4.38158C5.60086 3.24441 7.08351 2.46998 8.69762 2.15624C10.3117 1.84249 11.9848 2.00352 13.5053 2.61895C15.0257 3.23439 16.3253 4.27659 17.2396 5.61376C18.1539 6.95093 18.6419 8.52302 18.6419 10.1312"
                stroke={color}
                stroke-miterlimit="2.61313"
                strokeLinejoin="round"
            />
            <rect
                x="9.83154"
                y="4.86975"
                width="0.978936"
                height="6.6963"
                rx="0.489468"
                fill={color}
            />
            <rect
                width="0.96784"
                height="6.77488"
                rx="0.48392"
                transform="matrix(-0.715214 0.698906 -0.715214 -0.698906 15.3691 15.3445)"
                fill={color}
            />
        </svg>
    )
}

export default SortByCreatedAtIcon
