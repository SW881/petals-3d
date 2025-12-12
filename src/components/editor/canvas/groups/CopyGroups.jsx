import React, { useState } from 'react'

import WrongButtonIcon from '../../../svg-icons/WrongButtonIcon'

import { saveGroupToIndexDB } from '../../../../db/storage'
import { dashboardStore } from '../../../../hooks/useDashboardStore'
import { canvasRenderStore } from '../../../../hooks/useRenderSceneStore'

const CopyGroups = () => {
    const { setCopyGroupModal } = dashboardStore((state) => state)
    const [animateOut, setAnimateOut] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)

    const {
        copySelectedGroups,
        resetSelectedGroups,
        copyGroups,
        setCopyGroups,
    } = canvasRenderStore((state) => state)

    function handleClose() {
        setAnimateOut(true)
        setGroupName('')
        setTimeout(() => {
            setCopyGroupModal(false)
            setAnimateOut(false)
        }, 200)
    }

    async function handleCopyGroups(e) {
        try {
            setLoading(true)
            copySelectedGroups()

            const updatedGroupData = canvasRenderStore.getState().groupData

            setCopyGroups(!copyGroups)

            const response = await saveGroupToIndexDB(updatedGroupData)

            if (response) {
                resetSelectedGroups()
                handleClose()
            } else {
                handleClose()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="relative z-10 funnel-sans-regular">
                <div className="fixed inset-0 bg-[#606060]/50 transition-opacity duration-200"></div>

                <div className="fixed inset-0 z-10 overflow-y-auto text-[8px] md:text-[12px]">
                    <div className="flex h-full items-center justify-center text-center">
                        <div
                            className={`bg-[#FFFFFF] relative overflow-hidden rounded-[8px] w-[320px] md:w-[420px] transition-all duration-200 ease-out transform
                                ${
                                    animateOut
                                        ? 'animate-fade-out'
                                        : 'animate-fade-in'
                                }`}
                        >
                            <div className="flex justify-between items-center text-left text-[12px] md:text-[16px] p-[12px] m-[4px] border-b-[1px] border-[#D9D9D9] funnel-sans-semibold">
                                <div className="text-[#000000]">
                                    Copy selected groups
                                </div>
                                <div
                                    onClick={(e) => handleClose(e)}
                                    className="active:scale-90 p-[4px] rounded-[8px] cursor-pointer"
                                >
                                    <WrongButtonIcon
                                        color="#000000"
                                        size={16}
                                    />
                                </div>
                            </div>

                            <div className="mx-[20px] mt-[12px]">
                                <div className="mt-[16px] text-[12px] text-[#000000] text-left">
                                    Are you sure you want to copy groups ?
                                </div>
                            </div>
                            <div className="mt-[12px] flex justify-end items-center px-4 py-3 gap-[12px]">
                                <button
                                    onClick={(e) => handleClose(e)}
                                    className="active:scale-90 text-[#000000] border-[#d9d9d9] border-[1px] px-[12px] py-[4px] rounded-[8px] cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={loading}
                                    onClick={(e) => handleCopyGroups(e)}
                                    className="active:scale-90 text-[#000000] px-[16px] py-[4px] rounded-[8px] border-[#5CA367] bg-[#5CA367]/25 border-[1px] cursor-pointer"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CopyGroups
