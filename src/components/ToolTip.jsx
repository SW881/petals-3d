import React, { useState, useRef, useEffect } from 'react'

const ToolTip = ({
    children,
    text,
    position = 'top',
    delay = 300,
    className = '',
}) => {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef(null)

    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true)
        }, delay)
    }

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setIsVisible(false)
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-[4px]',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-[4px]',
        left: 'right-full top-1/2 -translate-y-1/2 mr-[4px]',
        right: 'left-full top-1/2 -translate-y-1/2 ml-[4px]',
    }

    return (
        <div
            className={`relative inline-block ${className} `}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {children}
            {isVisible && text && (
                <div
                    className={`absolute z-[9999] p-[8px] text-[12px] font-medium text-white bg-[#000000]/75 rounded-[8px] whitespace-nowrap pointer-events-none transition-opacity duration-200 ${positionClasses[position]}`}
                    style={{
                        animation: 'tooltipFadeIn 0.2s ease-out',
                    }}
                >
                    {text}
                </div>
            )}
        </div>
    )
}

export default ToolTip
