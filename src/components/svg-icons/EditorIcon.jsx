import React from 'react'

const EditorIcon = ({ color, size }) => {
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
                x="8.3125"
                y="18.875"
                width="13.8125"
                height="2.125"
                rx="1.0625"
                fill={color}
            />
            <path
                d="M14.1762 6.21111L16.7051 8.71593M3 19.9375L3.04243 19.6433C3.19256 18.6025 3.26763 18.082 3.43837 17.5961C3.58989 17.1649 3.79687 16.7549 4.05421 16.3762C4.34422 15.9493 4.71955 15.5776 5.4702 14.8341L15.8848 4.51877C16.5832 3.82708 17.7154 3.82708 18.4138 4.51877C19.1121 5.21045 19.1121 6.3319 18.4138 7.02359L7.80803 17.5282C7.12703 18.2027 6.78654 18.54 6.3987 18.8081C6.05445 19.0462 5.68317 19.2434 5.29249 19.3957C4.85234 19.5673 4.38029 19.6616 3.43626 19.8503L3 19.9375Z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default EditorIcon
