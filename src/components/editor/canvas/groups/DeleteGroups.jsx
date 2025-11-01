import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import { dashboardStore } from '../../../../hooks/useDashboardStore'

import WrongIcon from '../../../svg-icons/WrongIcon'
import { saveGroupToIndexDB } from '../../../../helpers/sceneFunction'
import { drawStore } from '../../../../hooks/useDrawStore'
import { canvasRenderStore } from '../../../../hooks/useRenderSceneStore'

const DeleteGroups = () => {
    const { id } = useParams()
    console.log('Note Id : ', id)
    const { setDeleteGroupModal } = dashboardStore((state) => state)
    const [animateOut, setAnimateOut] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)

    const { session } = dashboardStore((state) => state)

    const {
        groupData,
        resetSelectedGroups,
        deleteSelectedGroups,
        sortGroupsByName,
        deleteGroups,
    } = canvasRenderStore((state) => state)

    function handleClose() {
        setAnimateOut(true)
        setGroupName('')
        setTimeout(() => {
            setDeleteGroupModal(false)
            setAnimateOut(false)
        }, 200) // matches animation duration
    }

    async function handleDeleteGroups(e) {
        try {
            setLoading(true)
            console.log('Deleteing Groups  : ')

            deleteSelectedGroups()
            sortGroupsByName()

            const updatedGroupData = canvasRenderStore.getState().groupData

            const response = await saveGroupToIndexDB(updatedGroupData, id)
            resetSelectedGroups()

            if (response) {
                handleClose()
            } else {
                setError('Error while saving data')
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
                <div className="fixed inset-0 bg-gray-500/75 transition-opacity duration-200"></div>

                <div className="fixed inset-0 z-10 overflow-y-auto text-[8px] md:text-[12px]">
                    <div className="flex h-full items-center justify-center text-center">
                        <div
                            className={`bg-[#000000] relative overflow-hidden rounded-[4px] w-[320px] md:w-[420px] transition-all duration-200 ease-out transform
                                ${
                                    animateOut
                                        ? 'animate-fade-out'
                                        : 'animate-fade-in'
                                }`}
                        >
                            <div className="flex justify-between items-center text-left text-[12px] md:text-[16px] p-[12px] m-[4px] border-b-[1px] border-[#D9D9D9] funnel-sans-semibold">
                                <div className="text-[#FFFFFF]">
                                    Delete Groups
                                </div>
                                <div
                                    onClick={(e) => handleClose(e)}
                                    className="active:scale-75 p-[4px] flex justify-between rounded-[4px] items-center cursor-pointer border-1 border-[#FFFFFF] hover:border-[#0096c7]"
                                >
                                    <WrongIcon color="#FFFFFF" size={12} />
                                </div>
                            </div>
                            <div className="mx-[20px] mt-[12px]">
                                <div className="mt-[16px] text-[12px] text-[#FFFFFF] text-left">
                                    Are you sure you want to delete groups ?
                                </div>
                            </div>
                            <div className="mt-[12px] flex justify-end items-center px-4 py-3 gap-[12px]">
                                <button
                                    onClick={(e) => handleClose(e)}
                                    className="active:scale-85 text-[#FFFFFF] border-[#FFFFFF] border-[1px] px-[12px] py-[4px] rounded-[4px] cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={loading}
                                    onClick={(e) => handleDeleteGroups(e)}
                                    className="text-[#000000] active:scale-85 px-[12px] py-[4px] rounded-[4px] bg-[#FF3131] cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteGroups
