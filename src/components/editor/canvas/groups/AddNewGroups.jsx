import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { v4 as uuid } from 'uuid'

import { dashboardStore } from '../../../../hooks/useDashboardStore'

import WrongIcon from '../../../svg-icons/WrongIcon'
import { saveGroupToIndexDB } from '../../../../helpers/sceneFunction'
import { drawStore } from '../../../../hooks/useDrawStore'

const AddNewGroups = () => {
    const { id } = useParams()
    // console.log('Note Id : ', id)
    const { setNewGroupModal } = dashboardStore((state) => state)
    const [animateOut, setAnimateOut] = useState(false)
    const [groupName, setGroupName] = useState('')
    const [loading, setLoading] = useState(false)

    const { session } = dashboardStore((state) => state)

    const { groupData, addNewGroup, sortGroupsByName } = drawStore(
        (state) => state
    )

    function handleClose() {
        setAnimateOut(true)
        setGroupName('')
        setTimeout(() => {
            setNewGroupModal(false)
            setAnimateOut(false)
        }, 200) // matches animation duration
    }

    function handleNameChange(e) {
        // console.log('Group Name : ', e.target.value)
        setGroupName(e.target.value)
    }

    async function handleCreateNewGroup(e) {
        try {
            setLoading(true)
            // console.log('Creating New Group  : ', session)

            const data = {
                uuid: uuid(),
                name: groupName,
                note_id: id,
                created_at: new Date().toISOString(),
                deleted_at: null,
                created_by: session.id,
                visible: true,
                active: false,
            }

            addNewGroup(data)
            sortGroupsByName()
            let gpD = [...groupData, data]

            const response = await saveGroupToIndexDB(gpD, id)

            if (response) {
                handleClose()
            } else {
                setError('Error while saving data')
                handleClose()
            }
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
                                <div className="text-[#FFFFFF]">
                                    Create new group
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
                                        className="bg-[#000000] border-[1px] border-[#d9d9d9] text-[#ffffff] rounded-[4px] block w-full text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                            <div className="mt-[12px] flex justify-end items-center px-4 py-3 gap-[12px]">
                                <button
                                    onClick={(e) => handleClose(e)}
                                    className="active:scale-85 border-[1px] text-[#FFFFFF] border-[#D9D9D9] px-[12px] py-[4px] rounded-[4px] cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={loading}
                                    onClick={(e) => handleCreateNewGroup(e)}
                                    className="text-[#000000] active:scale-85 px-[12px] py-[4px] rounded-[4px] bg-[#00FF7F] border-[1px] cursor-pointer"
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
