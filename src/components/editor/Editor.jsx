import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

import ViewsPanel from './ViewsPanel'
import Canvas3d from './Canvas3d'
import ToolPanel from './ToolPanel'

import SaveIcon from '../svg-icons/SaveIcon'
import CloudIcon from '../svg-icons/CloudIcon'
import SignOutIcon from '../svg-icons/SignOutIcon'

// import { drawStore } from '../../hooks/useDrawStore'
import { dashboardStore } from '../../hooks/useDashboardStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'

import { loadSceneFromIndexedDB } from '../../helpers/sceneFunction'
import { ADD_NOTE_DATA, FETECH_NOTE_BY_ID } from '../../services/api'
import { UserAuth } from '../../context/AuthContext'

const Editor = () => {
    const { id } = useParams()
    const { signOut } = UserAuth()
    const navigate = useNavigate()

    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(false)

    const excludedKeys = ['geometry', 'material', 'mesh']

    // const { setNotesData } = drawStore((state) => state)
    const { activeScene } = canvasRenderStore((state) => state)
    const { setSession } = dashboardStore((state) => state)

    useEffect(() => {
        const fetchNoteData = async () => {
            try {
                setLoading(true)
                // setNotesData(null)

                let url = `${FETECH_NOTE_BY_ID}/${id}`
                let result = await axios.get(url, {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })

                if (result?.data?.success) {
                    // setNotesData(result.data.lines)
                }
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchNoteData()
        }
    }, [id])

    async function saveScene(e) {
        setLoading(true)
        try {
            let { groupData, lineData } = await loadSceneFromIndexedDB(id)
            if (groupData || lineData) {
                const formData = new FormData()
                formData.append('note_id', id)

                // if ('storage' in navigator && 'estimate' in navigator.storage) {
                //     navigator.storage.estimate().then(({ usage, quota }) => {
                //     })
                // }

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
            // console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function downloadFile(e) {
        const exporter = new GLTFExporter()

        activeScene.traverse((child) => {
            if (child.isMesh) {
                child.material.needsUpdate = true
            }
        })

        exporter.parse(
            activeScene,
            (result) => {
                const output =
                    typeof result === 'string' ? result : JSON.stringify(result)
                const blob = new Blob([output], { type: 'application/json' })

                // Create a link and download the file
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = `scene_${id}.gltf`
                link.click()
                URL.revokeObjectURL(link.href)
            },
            { binary: false, includeCustomExtensions: true } // Set to true if you want .glb
        )
    }

    async function highResRenderer({ scene, camera }) {
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
            {loading && (
                <div className="relative funnel-sans-regular">
                    <div className="fixed inset-0 bg-transparent transition-opacity duration-200"></div>
                </div>
            )}

            <div className="flex h-screen overflow-hidden prevent-select z-5">
                <button
                    className="absolute top-[16px] left-[20px] p-[8px] border-[1px] z-5 border-[#FFFFFF] bg-[#000000] hover:bg-[#202020] rounded-[4px] cursor-pointer"
                    onClick={(e) => handleLogout(e)}
                >
                    <SignOutIcon color="#FFFFFF" size={20} />
                </button>

                <button
                    onClick={(e) => saveScene(e)}
                    className="absolute funnel-sans-regular top-[16px] left-[64px] p-[8px] z-5 border-[1px] border-[#FFFFFF] bg-[#000000] hover:bg-[#202020] rounded-[4px] cursor-pointer"
                >
                    <CloudIcon color="#FFFFFF" size={20} />
                </button>

                <button
                    onClick={(e) => downloadFile(e)}
                    className="absolute funnel-sans-regular top-[16px] left-[108px] z-5 p-[8px] border-[1px] border-[#FFFFFF] bg-[#000000] hover:bg-[#202020] rounded-[4px] cursor-pointer"
                >
                    <SaveIcon color="#FFFFFF" size={20} />
                </button>
                <div>
                    <ToolPanel />
                </div>
                <div className="flex-grow">
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
