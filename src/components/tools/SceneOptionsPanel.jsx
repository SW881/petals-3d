import React from 'react'

import SunIcon from '../svg-icons/SunIcon'
import AddIcon from '../svg-icons/AddIcon'
import DeleteIcon from '../svg-icons/DeleteIcon'
import RenameIcon from '../svg-icons/RenameIcon'
import EyeOpenIcon from '../svg-icons/EyeOpenIcon'
import OpacityIcon from '../svg-icons/OpacityIcon'
import CorrectIcon from '../svg-icons/CorrectIcon'
import GroupingIcon from '../svg-icons/GroupingIcon'
import EyeCloseIcon from '../svg-icons/EyeCloseIcon'
import SceneOptionIcon from '../svg-icons/SceneOptionIcon'

import ColorPicker from '../ColorPicker'

import { dashboardStore } from '../../hooks/useDashboardStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'

const SceneOptionsPanel = ({ isSmall }) => {
    const {
        sceneOptions,

        groupOptions,
        setGroupOptions,

        groupData,

        selectedGroups,
        addToSelectedGroup,
        removeFromSelectedGroup,

        renderOptions,
        setRenderOptions,

        postProcess,
        setPostProcess,

        sequentialLoading,
        setSequentialLoading,

        canvasBackgroundColor,
        setCanvasBackgroundColor,

        intensityBackground,
        setIntensityBackground,

        lightIntensity,
        setLightIntensity,
    } = canvasRenderStore((state) => state)

    const {
        setNewGroupModal,
        setCopyGroupModal,
        setRenameGroupModal,
        setDeleteGroupModal,
    } = dashboardStore((state) => state)

    function handleSceneActiveOptions(option) {
        switch (option) {
            case 'groups':
                setRenderOptions(false)
                setGroupOptions(true)
                break
            case 'render':
                setGroupOptions(false)
                setRenderOptions(true)
                break

            default:
                break
        }
    }

    function handleLightIntensitySlider(e) {
        e.preventDefault()
        setLightIntensity(e.target.value)
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        setIntensityBackground(
            ((currentVal - min) / (max - min)) * 100 + '% 100%'
        )
    }

    async function handleSelectGroup(e, data) {
        if (e.target.checked) {
            addToSelectedGroup(data)
        } else {
            removeFromSelectedGroup(data.uuid)
        }
    }

    function handleGroupOperation(operation) {
        switch (operation) {
            case 'add':
                setNewGroupModal(true)
                break
            case 'rename':
                setRenameGroupModal(true)
                break
            case 'copy':
                setCopyGroupModal(true)
                break
            case 'delete':
                setDeleteGroupModal(true)
                break
            default:
                break
        }
    }

    async function handleGroupVisibility(data) {
        canvasRenderStore
            .getState()
            .updateVisibleGroupProduct(data.uuid, !data.visible)
        const updatedGroupData = canvasRenderStore.getState().groupData
        await saveGroupToIndexDB(updatedGroupData)
    }

    async function handleActiveGroup(data) {
        canvasRenderStore.getState().setActiveGroup(data)
        canvasRenderStore.getState().updateActiveGroupProduct(data.uuid)
        const updatedGroupData = canvasRenderStore.getState().groupData
        await saveGroupToIndexDB(updatedGroupData)
    }

    return (
        <>
            <div>
                <div className="absolute w-[180px] md:w-[240px] top-[72px] right-[12px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <div className="flex justify-around mb-[8px]">
                        <div
                            onClick={(e) => handleSceneActiveOptions('groups')}
                            className={`${
                                groupOptions
                                    ? 'border-[#00A36C]'
                                    : 'border-[#121212]'
                            } font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <GroupingIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </div>

                        <div
                            onClick={(e) => handleSceneActiveOptions('render')}
                            className={`${
                                renderOptions
                                    ? 'border-[#00A36C]'
                                    : 'border-[#121212]'
                            }  font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <SceneOptionIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </div>
                    </div>

                    {sceneOptions && groupOptions && (
                        <div className="flex justify-center mb-[8px]">
                            <div
                                onClick={(e) => handleGroupOperation('add')}
                                className="hover:bg-[#5CA367]/25 p-[8px] cursor-pointer rounded-[4px]"
                            >
                                <AddIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('rename')}
                                className="hover:bg-[#5CA367]/25 p-[8px] cursor-pointer rounded-[4px]"
                            >
                                <RenameIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('delete')}
                                className="hover:bg-[#5CA367]/25 p-[8px] cursor-pointer rounded-[4px]"
                            >
                                <DeleteIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {sceneOptions &&
                            groupOptions &&
                            groupData.map((data, key) => {
                                return (
                                    <div
                                        key={key}
                                        className="text-[8px] md:text-[12px] z-5 m-[4px] flex flex-col rounded-[4px] text-[#000000] funnel-sans-regular"
                                    >
                                        <div
                                            className={`${
                                                data.active
                                                    ? 'bg-[#5CA367]'
                                                    : 'bg-[#FFFFFF]'
                                            } flex cursor-pointer justify-between items-center rounded-[4px] px-[8px]`}
                                        >
                                            <label className="cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only border-[1px]"
                                                    checked={selectedGroups.some(
                                                        (group) =>
                                                            group.uuid ===
                                                            data.uuid
                                                    )}
                                                    onChange={(e) =>
                                                        handleSelectGroup(
                                                            e,
                                                            data
                                                        )
                                                    }
                                                    onFocus={(e) =>
                                                        e.preventDefault()
                                                    }
                                                />
                                                <div
                                                    className={`w-[12px] h-[12px] md:w-[16px] md:h-[16px] rounded-[20px] bg-[#ffffff] border-[1px] border-[#4B5563]/25 peer-checked:bg-[#005eff] flex items-center justify-center`}
                                                >
                                                    <CorrectIcon
                                                        size={isSmall ? 8 : 12}
                                                        color="#FFFFFF"
                                                    />
                                                </div>
                                            </label>
                                            <div
                                                onClick={(e) =>
                                                    handleActiveGroup(data)
                                                }
                                                className="p-[4px] w-full mx-[8px]"
                                            >
                                                {data.name.length > 13
                                                    ? `${data.name.slice(
                                                          0,
                                                          13
                                                      )}...`
                                                    : data.name}
                                            </div>

                                            <div
                                                onClick={(e) =>
                                                    handleGroupVisibility(data)
                                                }
                                                className="flex justify-between gap-[8px] items-center p-[4px] rounded-[4px]"
                                            >
                                                {data.visible && (
                                                    <EyeOpenIcon
                                                        color="#000000"
                                                        size={isSmall ? 12 : 20}
                                                    />
                                                )}
                                                {!data.visible && (
                                                    <EyeCloseIcon
                                                        color="#000000"
                                                        size={isSmall ? 12 : 20}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>

                    {sceneOptions && renderOptions && (
                        <div className="funnel-sans-regular z-5 items-center rounded-[8px] w-full text-[#000000] bg-[#FFFFFF]">
                            <div className="flex justify-between items-center px-[12px] border-b-[1px] border-[#4B5563]/25">
                                <div className="flex justify-between items-center">
                                    <div className="font-bold p-[8px] cursor-pointer flex gap-[12px]">
                                        <SunIcon
                                            color="#000000"
                                            size={isSmall ? 12 : 20}
                                        />
                                    </div>

                                    <div className="flex flex-col m-[4px] gesture-allowed">
                                        <div className="range-container">
                                            <div className="range-wrapper">
                                                <input
                                                    onChange={(e) =>
                                                        handleLightIntensitySlider(
                                                            e
                                                        )
                                                    }
                                                    type="range"
                                                    name="range"
                                                    id="range-slider"
                                                    step={1}
                                                    value={lightIntensity}
                                                    min={0}
                                                    max={10}
                                                    style={{
                                                        width: isSmall
                                                            ? '80px'
                                                            : '120px',
                                                        backgroundSize:
                                                            intensityBackground,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold p-[4px] cursor-pointer flex text-[8px] md:text-[12px]">
                                    {lightIntensity}
                                </div>
                            </div>

                            <div className="m-[12px] flex items-center justify-between">
                                <div className="text-[8px] md:text-[12px]">
                                    Post Process
                                </div>
                                {postProcess && (
                                    <div
                                        onClick={(e) =>
                                            setPostProcess(!postProcess)
                                        }
                                        className="m-[12px] flex items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#16b826] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#16b826"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}
                                {!postProcess && (
                                    <div
                                        onClick={(e) =>
                                            setPostProcess(!postProcess)
                                        }
                                        className="m-[12px] flex items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#A9A9A9] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#A9A9A9"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="m-[12px] flex items-center justify-between">
                                <div className="text-[8px] md:text-[12px]">
                                    Sequential Loading
                                </div>
                                {sequentialLoading && (
                                    <div
                                        onClick={(e) =>
                                            setSequentialLoading(
                                                !sequentialLoading
                                            )
                                        }
                                        className="m-[12px] flex items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#16b826] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#16b826"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!sequentialLoading && (
                                    <div
                                        onClick={(e) =>
                                            setSequentialLoading(
                                                !sequentialLoading
                                            )
                                        }
                                        className="m-[12px] flex-col items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#A9A9A9] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#A9A9A9"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t-[1px] border-[#4B5563]/25 gesture-allowed">
                                <ColorPicker
                                    value={canvasBackgroundColor}
                                    onChange={setCanvasBackgroundColor}
                                    isSmall={isSmall}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default SceneOptionsPanel
