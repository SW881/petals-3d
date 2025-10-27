import React from 'react'

const ArcIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <path d="M0.5 0.5V23.5H23.5V0.5H0.5Z" stroke="none" />
            <path
                d="M20.9854 16.5C20.8628 14.2953 19.9338 12.2053 18.3643 10.6357C16.6764 8.94791 14.3869 8 12 8C9.61305 8 7.32357 8.94791 5.63574 10.6357C4.06616 12.2053 3.13724 14.2953 3.01465 16.5L2.51367 16.5C2.63678 14.1626 3.61885 11.9456 5.28223 10.2822C7.06382 8.50063 9.48044 7.5 12 7.5C14.5196 7.5 16.9362 8.50063 18.7178 10.2822C20.3812 11.9456 21.3632 14.1626 21.4863 16.5L20.9854 16.5Z"
                stroke={color}
                stroke-linejoin="bevel"
            />
        </svg>
    )
}

export default ArcIcon
