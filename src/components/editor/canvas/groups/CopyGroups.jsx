import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import { dashboardStore } from '../../../../hooks/useDashboardStore'

import WrongIcon from '../../../svg-icons/WrongIcon'
import { saveGroupToIndexDB } from '../../../../helpers/sceneFunction'
import { drawStore } from '../../../../hooks/useDrawStore'

const CopyGroups = () => {
    const { id } = useParams()
    const { setCopyGroupModal } = dashboardStore((state) => state)
    const [animateOut, setAnimateOut] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)

    const {
        selectedGroups,
        copySelectedGroups,
        resetSelectedGroups,
        groupData,
        copyGroups,
        setCopyGroups,
    } = drawStore((state) => state)

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
            // console.log('Copying Groups  : ', selectedGroups)
            copySelectedGroups()

            const updatedGroupData = drawStore.getState().groupData

            setCopyGroups(!copyGroups)

            const response = await saveGroupToIndexDB(updatedGroupData, id)

            resetSelectedGroups()
            // if (response) {
            handleClose()
            // } else {
            //     setError('Error while saving data')
            //     handleClose()
            // }
        } catch (error) {
            // console.error(error)
            // setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="relative z-10 funnel-sans-regular">
                <div className="fixed inset-0 bg-gray-500/75 transition-opacity duration-200"></div>

                <div className="fixed inset-0 z-10 overflow-y-auto text-[8px] md:text-[12px]">
                    <div className="flex h-full items-center justify-center text-center">
                        <div
                            className={`relative overflow-hidden rounded-[4px] bg-[#FFFFFF] w-[320px] md:w-[420px] transition-all duration-200 ease-out transform
                                ${
                                    animateOut
                                        ? 'animate-fade-out'
                                        : 'animate-fade-in'
                                }`}
                        >
                            <div className="flex justify-between items-center text-left text-[12px] md:text-[16px] p-[12px] m-[4px] border-b-[1px] border-[#D9D9D9] funnel-sans-semibold">
                                <div className="text-[#000000]">
                                    Copy Groups
                                </div>
                                <div
                                    onClick={(e) => handleClose(e)}
                                    className="p-[4px] flex justify-between rounded-[4px] items-center cursor-pointer border-1 border-[#FFFFFF] hover:border-[#0096c7]"
                                >
                                    <WrongIcon color="#000000" size={12} />
                                </div>
                            </div>
                            <div className="bg-[#FFFFFF] mx-[20px] mt-[12px]">
                                <div className="mt-[16px] text-[12px] text-[#FFFFFF] text-left">
                                    Are you sure you want to copy groups ?
                                </div>
                            </div>
                            <div className="mt-[12px] flex justify-end items-center px-4 py-3 gap-[12px]">
                                <button
                                    onClick={(e) => handleClose(e)}
                                    className="border-[1px] text-[#000000] border-[#D9D9D9] px-[12px] py-[4px] rounded-[4px] hover:bg-[#F2F2F2] cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={loading}
                                    onClick={(e) => handleCopyGroups(e)}
                                    className="px-[12px] py-[4px] rounded-[4px] text-[#000000] bg-[#8ce7bb] border-[1px] border-[#2cc182] hover:bg-[#6cd5aa] cursor-pointer"
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
