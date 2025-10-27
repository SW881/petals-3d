import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import WrongIcon from '../../../svg-icons/WrongIcon'

import { drawStore } from '../../../../hooks/useDrawStore'
import { dashboardStore } from '../../../../hooks/useDashboardStore'
import { saveGroupToIndexDB } from '../../../../helpers/sceneFunction'

const RenameGroups = () => {
    const { id } = useParams()
    const { setRenameGroupModal, session } = dashboardStore((state) => state)
    const [animateOut, setAnimateOut] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)

    const { updateGroupNamesFromSelected } = drawStore((state) => state)

    function handleClose() {
        setAnimateOut(true)
        setGroupName('')
        setTimeout(() => {
            setRenameGroupModal(false)
            setAnimateOut(false)
        }, 200) // matches animation duration
    }

    function handleNameChange(e) {
        setGroupName(e.target.value)
    }

    async function handleRenameGroup(e) {
        try {
            setLoading(true)

            updateGroupNamesFromSelected(groupName)

            const updatedGroups = drawStore.getState().groupData
            // console.log('Updated groups  : ', updatedGroups)

            const response = await saveGroupToIndexDB(updatedGroups, id)

            if (response) {
                handleClose()
            } else {
                setError('Error while saving data')
                handleClose()
            }
        } catch (error) {
            // console.error(error)
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
                                    Rename Groups
                                </div>
                                <div
                                    onClick={(e) => handleClose(e)}
                                    className="p-[4px] flex justify-between rounded-[4px] items-center cursor-pointer border-1 border-[#FFFFFF] hover:border-[#0096c7]"
                                >
                                    <WrongIcon color="#000000" size={12} />
                                </div>
                            </div>
                            <div className="bg-[#FFFFFF] mx-[20px] mt-[12px]">
                                <div className="mt-[16px]">
                                    <label className="text-left text-[12px] block funnel-sans-regular text-[#FFFFFF] mb-[8px]">
                                        Name
                                    </label>
                                    <input
                                        onChange={(e) => handleNameChange(e)}
                                        type="text"
                                        className="bg-[#FFFFFF] border-[1px] border-[#d9d9d9] text-[#444444] rounded-[4px] block w-full text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                        required
                                        disabled={loading}
                                    />
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
                                    onClick={(e) => handleRenameGroup(e)}
                                    className="px-[12px] py-[4px] rounded-[4px] text-[#000000] bg-[#8ce7bb] border-[1px] border-[#2cc182] hover:bg-[#6cd5aa] cursor-pointer"
                                >
                                    Rename
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RenameGroups
