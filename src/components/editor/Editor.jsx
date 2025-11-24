import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import * as THREE from 'three'
import { v4 as uuid } from 'uuid'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

import { canvasDrawStore } from '../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'
import { dashboardStore } from '../../hooks/useDashboardStore'

import ViewsPanel from './ViewsPanel'
import Canvas3d from './Canvas3d'
import ToolPanel from './ToolPanel'

import SaveIcon from '../svg-icons/SaveIcon'
import CloudIcon from '../svg-icons/CloudIcon'
import SignOut from '../svg-icons/SignOut'

import {
    loadSceneFromIndexedDB,
    saveGroupToIndexDB,
} from '../../helpers/sceneFunction'
import { ADD_NOTE_DATA, FETECH_NOTE_BY_ID } from '../../services/api'
import { UserAuth } from '../../context/AuthContext'

const Editor = () => {
    const { id = 1 } = useParams()
    const { signOut } = UserAuth()
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const excludedKeys = ['geometry', 'material', 'mesh']
    const { session, setSession } = dashboardStore((state) => state)
    const hasRun = useRef(false)

    const { setNotesData } = canvasDrawStore((state) => state)
    const { addNewGroup, activeScene, setGroupData, setActiveGroup } =
        canvasRenderStore((state) => state)

    useEffect(() => {
        if (hasRun.current) return
        hasRun.current = true

        if (id) fetchNoteData()
    }, [id])

    const fetchNoteData = async () => {
        try {
            setLoading(true)
            setNotesData(null)

            const { groupData, lineData } = await loadSceneFromIndexedDB(id)

            if (groupData && groupData.length > 0) {
                setGroupData(groupData)
                const activeGroup = groupData.find((g) => g.active)
                setActiveGroup(activeGroup.uuid)
            } else {
                // console.log('Inside create group data...')
                const data = {
                    uuid: uuid(),
                    name: 'G1',
                    note_id: id,
                    created_at: new Date().toISOString(),
                    deleted_at: null,
                    created_by: session.id,
                    visible: true,
                    active: true,
                }
                addNewGroup(data)
                setActiveGroup(data.uuid)

                const response = await saveGroupToIndexDB(
                    canvasRenderStore.getState().groupData,
                    id
                )

                setGroupData(canvasRenderStore.getState().groupData)
            }

            if (lineData && lineData.length > 0) {
                // Generate and add lines
            }
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function saveScene(e) {
        setLoading(true)
        try {
            let { groupData, lineData } = await loadSceneFromIndexedDB(id)
            if (groupData || lineData) {
                const formData = new FormData()
                formData.append('note_id', id)

                if ('storage' in navigator && 'estimate' in navigator.storage) {
                    navigator.storage.estimate().then(({ usage, quota }) => {
                        // console.log(`Used: ${usage / 1024 / 1024} MB`)
                        // console.log(`Quota: ${quota / 1024 / 1024} MB`)
                    })
                }

                if (lineData) {
                    formData.append('lines', JSON.stringify(lineData))
                }

                if (groupData) {
                    formData.append('groups', JSON.stringify(groupData))
                }

                let response = await axios.post(ADD_NOTE_DATA, formData, {
                    withCredentials: true,
                })

                if (response) {
                    // console.log('Response : ', response)
                }
            } else {
                // console.log('No Groups or Lines to store')
            }
        } catch (error) {
            console.error(error)
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
                // console.log({ result })
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
                    link.download = `scene_${id}.gltf`
                    link.click()
                    URL.revokeObjectURL(link.href)
                }
            },
            { binary: false, includeCustomExtensions: true }
        )
    }

    const HighResRenderer = ({ scene, camera }) => {
        const { gl } = useThree()

        useEffect(() => {
            const width = 7680
            const height = 4320

            const renderTarget = new THREE.WebGLRenderTarget(width, height)
            renderTarget.texture.encoding = THREE.sRGBEncoding

            gl.setRenderTarget(renderTarget)
            gl.render(scene, camera)
            gl.setRenderTarget(null)

            const pixels = new Uint8Array(width * height * 4)
            gl.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixels)
        }, [gl, scene, camera])

        return null
    }

    const DisableBrowserGestures = () => {
        useEffect(() => {
            // Prevent default touch behaviors
            const preventDefaultTouch = (e) => {
                // Allow scroll on elements with 'overflow-y-auto' or 'custom-scrollbar'
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                // Allow touch on canvas for double-tap
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                if (e.touches && e.touches.length > 1) {
                    e.preventDefault()
                }
            }

            // Prevent pull-to-refresh and overscroll
            const preventPullToRefresh = (e) => {
                // Allow scroll on scrollable elements
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                // Allow on canvas
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                if (window.scrollY === 0) {
                    e.preventDefault()
                }
            }

            // Prevent default gestures
            const preventDefaultGestures = (e) => {
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
            }

            // Prevent context menu
            const preventContextMenu = (e) => {
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
            }

            // Modified: Allow double-tap on canvas, prevent elsewhere
            let lastTouchEnd = 0
            const preventDoubleTapZoom = (e) => {
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                // ALLOW double-tap on canvas (don't prevent)
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                // PREVENT double-tap zoom elsewhere
                const now = Date.now()
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault()
                }
                lastTouchEnd = now
            }

            // Prevent all scroll behavior (except on scrollable elements)
            const preventScroll = (e) => {
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
                e.stopPropagation()
                return false
            }

            // Prevent wheel/trackpad scroll (except on scrollable elements)
            const preventWheel = (e) => {
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                if (e.target.tagName === 'CANVAS') {
                    return
                }
                e.preventDefault()
            }

            // Prevent keyboard scroll
            const preventKeyboardScroll = (e) => {
                if (e.target.closest('.overflow-y-auto, .custom-scrollbar')) {
                    return
                }
                const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]
                if (scrollKeys.includes(e.keyCode)) {
                    e.preventDefault()
                    return false
                }
            }

            // Add event listeners
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

            // Cleanup
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

    const handleLogout = async (e) => {
        e.preventDefault()

        const result = await signOut()
        if (result.success) {
            setSession(null)
            navigate('/sign-in')
        }
    }

    return (
        <>
            <DisableBrowserGestures />
            {loading && (
                <div className="relative funnel-sans-regular">
                    <div className="fixed inset-0 bg-transparent transition-opacity duration-200"></div>
                </div>
            )}

            <div className="flex w-screen h-screen overflow-hidden prevent-select z-5">
                {/* <Link to="/folders">
                    <button className="absolute top-[16px] left-[20px] p-[8px] border-[1px] z-5 border-[#FFFFFF] bg-[#000000] hover:bg-[#202020] rounded-[4px] cursor-pointer">
                        <BackIcon color="#FFFFFF" size={16} />
                    </button>
                </Link> */}

                {/* <Link to="/sign-in"> */}
                <button
                    className="absolute top-[16px] left-[20px] z-5 p-[8px] bg-[#000000] hover:bg-[#5D3FD3] font-bold cursor-pointer rounded-[8px]"
                    onClick={(e) => handleLogout(e)}
                >
                    <SignOut color="#FFFFFF" size={16} />
                </button>
                {/* </Link> */}
                {/* <button
                    onClick={(e) => saveScene(e)}
                    className="absolute funnel-sans-regular top-[16px] left-[64px] p-[8px] z-5 border-[1px] border-[#FFFFFF] bg-[#000000] hover:bg-[#202020] rounded-[4px] cursor-pointer"
                >
                    <CloudIcon color="#FFFFFF" size={16} />
                </button> */}

                <button
                    onClick={(e) => downloadFile(e)}
                    className="absolute top-[16px] left-[64px] z-5 p-[8px] bg-[#000000] hover:bg-[#5D3FD3] font-bold cursor-pointer rounded-[8px]"
                >
                    <SaveIcon color="#FFFFFF" size={16} />
                </button>
                <div>
                    <ToolPanel />
                </div>
                <div className="flex-grow w-full h-full">
                    <Canvas3d id={id} />
                </div>
                <div>
                    <ViewsPanel />
                </div>
            </div>
        </>
    )
}

export default Editor
