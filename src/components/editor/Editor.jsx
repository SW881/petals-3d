import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

import Canvas3d from './Canvas3d'
import ToolPanel from './canvas/tools/ToolPanel'
import ViewsPanel from './canvas/tools/ViewsPanel'

import PenIcon from '../svg-icons/PenIcon'
import SaveIcon from '../svg-icons/SaveIcon'
import DarkIcon from '../svg-icons/DarkIcon'
import MouseIcon from '../svg-icons/MouseIcon'
import TouchIcon from '../svg-icons/TouchIcon'
import LightIcon from '../svg-icons/LightIcon'
import GitHubIcon from '../svg-icons/GitHubIcon'
import BurgerIcon from '../svg-icons/BurgerIcon'

import { dashboardStore } from '../../hooks/useDashboardStore'
import { canvasDrawStore } from '../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../hooks/useCanvasViewStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'

import ToolTip from '../info/ToolTip'
import CopyGroups from './canvas/groups/CopyGroups'
import AddNewGroups from './canvas/groups/AddNewGroups'
import RenameGroups from './canvas/groups/RenameGroups'
import DeleteGroups from './canvas/groups/DeleteGroups'

import { loadSceneFromIndexedDB, saveGroupToIndexDB } from '../../db/storage'

const Editor = () => {
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isSmall, setIsSmall] = useState(window.innerWidth < 768)
    const [showOptions, setShowOptions] = useState(false)

    const { sceneOptions } = canvasRenderStore((state) => state)

    const {
        newGroupModal,
        copyGroupModal,
        renameGroupModal,
        deleteGroupModal,
    } = dashboardStore((state) => state)

    const hasRun = useRef(false)

    const { setNotesData, pointerType, setPointerType } = canvasDrawStore(
        (state) => state
    )
    const { addNewGroup, activeScene, setGroupData, setActiveGroup } =
        canvasRenderStore((state) => state)

    const { darkTheme, setDarkTheme } = canvasViewStore((state) => state)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true

        fetchNoteData()
    }, [])

    const fetchNoteData = async () => {
        try {
            setLoading(true)
            setNotesData(null)

            const { groupData } = await loadSceneFromIndexedDB()

            // console.log({ groupData })
            if (groupData && groupData.length > 0) {
                setGroupData(groupData)
                const activeGroup = groupData.find((g) => g.active)
                setActiveGroup(activeGroup)
            } else {
                const data = {
                    uuid: uuid(),
                    name: 'Group 1',
                    created_at: new Date().toISOString(),
                    deleted_at: null,
                    visible: true,
                    active: true,
                    objects: [],
                }
                addNewGroup(data)
                setActiveGroup(data)

                await saveGroupToIndexDB(canvasRenderStore.getState().groupData)

                setGroupData(canvasRenderStore.getState().groupData)
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function downloadFile(e) {
        const sceneToExport = activeScene.clone()

        const exporter = new GLTFExporter()

        exporter.parse(
            sceneToExport,
            (result) => {
                if (result?.meshes?.length > 0) {
                    const output =
                        typeof result === 'string'
                            ? result
                            : JSON.stringify(result, null, 2)
                    const blob = new Blob([output], {
                        type: 'application/json',
                    })
                    const link = document.createElement('a')
                    link.href = URL.createObjectURL(blob)
                    link.download = `scene.gltf`
                    link.click()
                    URL.revokeObjectURL(link.href)
                }
            },
            { binary: false, includeCustomExtensions: true }
        )
    }

    const DisableBrowserGestures = () => {
        useEffect(() => {
            const preventDefaultTouch = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                if (e.touches && e.touches.length > 1) {
                    e.preventDefault()
                }
            }

            const preventPullToRefresh = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                if (window.scrollY === 0) {
                    e.preventDefault()
                }
            }

            const preventDefaultGestures = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
            }

            const preventContextMenu = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
            }

            let lastTouchEnd = 0
            const preventDoubleTapZoom = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                const now = Date.now()
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault()
                }
                lastTouchEnd = now
            }

            const preventScroll = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
                e.stopPropagation()
                return false
            }

            const preventWheel = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
            }

            const preventKeyboardScroll = (e) => {
                if (
                    e.target.closest(
                        '.overflow-y-auto, .custom-scrollbar, .gesture-allowed'
                    )
                ) {
                    return
                }
                const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]
                if (scrollKeys.includes(e.keyCode)) {
                    e.preventDefault()
                    return false
                }
            }

            document.addEventListener('gesturestart', preventDefaultGestures, {
                passive: false,
            })
            document.addEventListener('gesturechange', preventDefaultGestures, {
                passive: false,
            })
            document.addEventListener('gestureend', preventDefaultGestures, {
                passive: false,
            })

            document.addEventListener('touchmove', preventPullToRefresh, {
                passive: false,
            })
            document.addEventListener('touchstart', preventDefaultTouch, {
                passive: false,
            })
            document.addEventListener('touchend', preventDoubleTapZoom, {
                passive: false,
            })

            document.addEventListener('contextmenu', preventContextMenu)

            document.addEventListener('scroll', preventScroll, {
                passive: false,
            })
            document.addEventListener('wheel', preventWheel, { passive: false })
            document.addEventListener('mousewheel', preventWheel, {
                passive: false,
            })
            document.addEventListener('DOMMouseScroll', preventWheel, {
                passive: false,
            })
            document.addEventListener('keydown', preventKeyboardScroll, {
                passive: false,
            })

            document.body.addEventListener('scroll', preventScroll, {
                passive: false,
            })
            document.documentElement.addEventListener('scroll', preventScroll, {
                passive: false,
            })

            window.scrollTo(0, 0)

            return () => {
                document.removeEventListener(
                    'gesturestart',
                    preventDefaultGestures
                )
                document.removeEventListener(
                    'gesturechange',
                    preventDefaultGestures
                )
                document.removeEventListener(
                    'gestureend',
                    preventDefaultGestures
                )

                document.removeEventListener('touchmove', preventPullToRefresh)
                document.removeEventListener('touchstart', preventDefaultTouch)
                document.removeEventListener('touchend', preventDoubleTapZoom)

                document.removeEventListener('contextmenu', preventContextMenu)

                document.removeEventListener('scroll', preventScroll)
                document.removeEventListener('wheel', preventWheel)
                document.removeEventListener('mousewheel', preventWheel)
                document.removeEventListener('DOMMouseScroll', preventWheel)
                document.removeEventListener('keydown', preventKeyboardScroll)

                document.body.removeEventListener('scroll', preventScroll)
                document.documentElement.removeEventListener(
                    'scroll',
                    preventScroll
                )
            }
        }, [])

        return null
    }

    useEffect(() => {
        const onResize = () => setIsSmall(window.innerWidth < 768)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    return (
        <>
            <DisableBrowserGestures />

            <div className="flex w-screen h-screen overflow-hidden prevent-select z-5">
                {/* <div className="bg-[#FFFFFF]"> */}
                <div className="absolute top-[12px] left-[12px] z-5 flex items-center gap-[4px] p-[4px] rounded-[8px]  border-[1px] border-[#4B5563]/25 bg-[#FFFFFF] hover:bg-[#5CA367]/75">
                    <button
                        onClick={(e) => setShowOptions(!showOptions)}
                        className="flex justify-center font-bold p-[8px] rounded-[4px]"
                    >
                        <BurgerIcon color="#000000" size={isSmall ? 8 : 12} />
                    </button>
                </div>
                {/* </div> */}

                {showOptions && (
                    <div className="absolute top-[72px] left-[12px] z-5 flex-col items-center gap-[4px] text-[8px] md:text-[12px] funnel-sans-regular rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl ">
                        <ul>
                            <li
                                onClick={(e) => downloadFile(e)}
                                className="flex justify-between items-center text-[8px] m-[4px] md:text-[12px] funnel-sans-regular gap-[12px] hover:bg-[#5CA367]/25 rounded-[4px] cursor-pointer"
                            >
                                <ToolTip
                                    text="Download model"
                                    position="right-bottom"
                                    delay={100}
                                >
                                    <button className="flex justify-center items-center font-bold px-[8px] rounded-[4px] cursor-pointer">
                                        <SaveIcon
                                            color="#000000"
                                            size={isSmall ? 12 : 16}
                                        />

                                        <div className="p-[12px] funnel-sans-regular">
                                            Download file
                                        </div>
                                    </button>
                                </ToolTip>
                            </li>

                            {/* <li className="flex justify-between items-center text-[8px] m-[4px] md:text-[12px] funnel-sans-regular gap-[12px] hover:bg-[#5CA367]/25 rounded-[4px] cursor-pointer">
                                <ToolTip
                                    text="GitHub"
                                    position="bottom-right"
                                    delay={100}
                                >
                                    <a
                                        className="flex justify-center items-center font-bold px-[8px] rounded-[4px] cursor-pointer"
                                        href="https://github.com/SW881/penxil"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <div>
                                            <GitHubIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 16}
                                            />
                                        </div>

                                        <div className="p-[12px] funnel-sans-regular">
                                            GitHub
                                        </div>
                                    </a>
                                </ToolTip>
                            </li> */}

                            <li className="flex border-b-[1px] border-[#4B5563]/25"></li>
                            {/* <li className="flex justify-between items-center p-[4px] m-[4px] gap-[12px]">
                                <div>Theme</div>
                                <div className="flex justify-between items-center gap-[4px]">
                                    <ToolTip
                                        text="Light"
                                        position="bottom"
                                        delay={100}
                                    >
                                        <button
                                            onClick={(e) => setDarkTheme(false)}
                                            className={`flex justify-center font-bold p-[8px] rounded-[4px] cursor-pointer ${
                                                !darkTheme
                                                    ? 'bg-[#5CA367]'
                                                    : 'hover:bg-[#5CA367]/25'
                                            }`}
                                        >
                                            <LightIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </button>
                                    </ToolTip>

                                    <ToolTip
                                        text="Dark"
                                        position="bottom"
                                        delay={100}
                                    >
                                        <button
                                            onClick={(e) => setDarkTheme(true)}
                                            className={`flex justify-center font-bold p-[8px] rounded-[4px] cursor-pointer ${
                                                darkTheme
                                                    ? 'bg-[#5CA367]'
                                                    : 'hover:bg-[#5CA367]/25'
                                            }`}
                                        >
                                            <DarkIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </button>
                                    </ToolTip>
                                </div>
                            </li> */}
                            {/* <li className="flex border-b-[1px] border-[#4B5563]/25"></li> */}
                            <li className="flex justify-between items-center p-[4px] m-[4px] gap-[12px]">
                                <div>Pointer</div>
                                <div className="flex justify-between items-center gap-[4px]">
                                    <ToolTip
                                        text="Stylus"
                                        position="bottom"
                                        delay={100}
                                    >
                                        <button
                                            onClick={(e) =>
                                                setPointerType('pen')
                                            }
                                            className={`flex justify-center font-bold p-[8px] rounded-[4px] cursor-pointer ${
                                                pointerType === 'pen'
                                                    ? 'bg-[#5CA367]'
                                                    : 'hover:bg-[#5CA367]/25'
                                            }`}
                                        >
                                            <PenIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </button>
                                    </ToolTip>

                                    <ToolTip
                                        text="Mouse"
                                        position="bottom"
                                        delay={100}
                                    >
                                        <button
                                            onClick={(e) =>
                                                setPointerType('mouse')
                                            }
                                            className={`flex justify-center font-bold p-[8px] rounded-[4px] cursor-pointer ${
                                                pointerType === 'mouse'
                                                    ? 'bg-[#5CA367]'
                                                    : 'hover:bg-[#5CA367]/25'
                                            }`}
                                        >
                                            <MouseIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </button>
                                    </ToolTip>

                                    <ToolTip
                                        text="Touch"
                                        position="bottom"
                                        delay={100}
                                    >
                                        <button
                                            onClick={(e) =>
                                                setPointerType('touch')
                                            }
                                            className={`flex justify-center font-bold p-[8px] rounded-[4px] cursor-pointer ${
                                                pointerType === 'touch'
                                                    ? 'bg-[#5CA367]'
                                                    : 'hover:bg-[#5CA367]/25'
                                            }`}
                                        >
                                            <TouchIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </button>
                                    </ToolTip>
                                </div>
                            </li>
                        </ul>
                    </div>
                )}

                {sceneOptions && newGroupModal && <AddNewGroups />}
                {sceneOptions && renameGroupModal && <RenameGroups />}
                {sceneOptions && copyGroupModal && <CopyGroups />}
                {sceneOptions && deleteGroupModal && <DeleteGroups />}

                <div>
                    <ToolPanel isSmall={isSmall} />
                </div>
                <div className="flex-grow w-full h-full">
                    <Canvas3d />
                </div>
                <div>
                    <ViewsPanel isSmall={isSmall} />
                </div>
            </div>
        </>
    )
}

export default Editor
