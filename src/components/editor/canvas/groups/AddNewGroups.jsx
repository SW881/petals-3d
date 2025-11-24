import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import WrongIcon from '../../../svg-icons/WrongIcon'
import { dashboardStore } from '../../../../hooks/useDashboardStore'
import { saveGroupToIndexDB } from '../../../../helpers/sceneFunction'
import { canvasRenderStore } from '../../../../hooks/useRenderSceneStore'
import WrongButtonIcon from '../../../svg-icons/WrongButtonIcon'

const AddNewGroups = () => {
    const { id = 1 } = useParams()
    const { setNewGroupModal } = dashboardStore((state) => state)
    const [animateOut, setAnimateOut] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)

    const { session } = dashboardStore((state) => state)

    const { resetSelectedGroups, groupData, addNewGroup, sortGroupsByName } =
        canvasRenderStore((state) => state)

    function handleClose() {
        setAnimateOut(true)
        setGroupName('')
        setTimeout(() => {
            setNewGroupModal(false)
            setAnimateOut(false)
        }, 200)
    }

    function handleNameChange(e) {
        setGroupName(e.target.value)
    }

    async function handleCreateNewGroup(e) {
        try {
            setLoading(true)
            if (!groupName.length > 0) {
                setLoading(false)
                return
            }
            // console.log('Creating New Group  : ', session)

            const data = {
                uuid: uuid(),
                name: groupName,
                note_id: id,
                created_at: new Date().toISOString(),
                deleted_at: null,
                // created_by: session.id,
                visible: true,
                active: false,
            }

            addNewGroup(data)
            sortGroupsByName()
            let gpD = [...groupData, data]

            const response = await saveGroupToIndexDB(gpD, id)

            if (response) {
                resetSelectedGroups()
                handleClose()
            } else {
                setError('Error while saving data')
                handleClose()
            }
        } catch (error) {
            console.error(error)
            setError(error.message)
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
                            className={`bg-[#171717] relative overflow-hidden rounded-[8px] w-[320px] md:w-[420px] transition-all duration-200 ease-out transform
                                ${
                                    animateOut
                                        ? 'animate-fade-out'
                                        : 'animate-fade-in'
                                }`}
                        >
                            <div className="flex justify-between items-center text-left text-[12px] md:text-[16px] p-[12px] m-[4px] border-b-[1px] border-[#FFFFFF] funnel-sans-semibold">
                                <div className="text-[#FFFFFF]">
                                    Create new group
                                </div>
                                <div
                                    onClick={(e) => handleClose(e)}
                                    className="group text-[#606060] hover:text-[#FFFFFF] active:scale-90 p-[4px] flex justify-between rounded-[8px] items-center cursor-pointer"
                                >
                                    <WrongButtonIcon size={12} />
                                </div>
                            </div>
                            <div className="mx-[20px] mt-[12px]">
                                <div className="mt-[16px]">
                                    <label className="text-left text-[12px] block funnel-sans-regular text-[#FFFFFF] mb-[8px]">
                                        Name
                                    </label>
                                    <input
                                        onChange={(e) => handleNameChange(e)}
                                        type="text"
                                        className="border-[1px] border-[#d9d9d9] text-[#ffffff] rounded-[8px] block w-full text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="mt-[12px] flex justify-end items-center px-4 py-3 gap-[12px]">
                                <button
                                    onClick={(e) => handleClose(e)}
                                    className="active:scale-90 text-[#FFFFFF] border-[#FFFFFF] border-[1px] px-[12px] py-[4px] rounded-[8px] cursor-pointer "
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={loading}
                                    onClick={(e) => handleCreateNewGroup(e)}
                                    className="active:scale-90 text-[#FFFFFF] px-[12px] py-[4px] rounded-[8px] border-[#5D3FD3] bg-[#5D3FD3]/50 border-[1px] cursor-pointer"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddNewGroups
