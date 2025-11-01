import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { v4 as uuid } from 'uuid'

import EraseLine from './EraseLine'
import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../../hooks/useCanvasViewStore'

import DynamicGuidePlane from './DynamicGuidePlane'
import DynamicBendGuidePlane from './DynamicBendGuidePlane'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'
import TransfromGuide from './TransformGuide'

import DrawLine from './DrawLine'
import TransformLine from './TransformLine'

export default function CanvasOperations({ id }) {
    const {
        penActive,
        eraseGuide,
        selectLines,
        selectGuide,
        setDrawGuide,
        eraserActive,
        setEraseGuide,
        bendPlaneGuide,
        setBendPlaneGuide,
        dynamicDrawingPlaneMesh,
        setDynamicDrawingPlaneMesh,
    } = canvasDrawStore((state) => state)

    const { setActiveScene } = canvasRenderStore((state) => state)
    // const { session } = dashboardStore((state) => state)

    const { scene, gl } = useThree()

    // camera.layers.disableAll
    // camera.layers.enable(1)

    // useEffect(() => {
    //     ;(async () => {
    //         const data = {
    //             uuid: uuid(),
    //             name: 'Group_1',
    //             note_id: id,
    //             created_at: new Date().toISOString(),
    //             deleted_at: null,
    //             created_by: session.id,
    //             visible: true,
    //             active: true,
    //         }

    //         addNewGroup(data)
    //         sortGroupsByName()
    //         drawStore.getState().setActiveGroup(data.uuid)
    //         let gpD = [...groupData, data]

    //         const response = await saveGroupToIndexDB(gpD, id)
    //     })()
    // }, [])

    const { setOrbitalLock } = canvasViewStore((state) => state)

    const handleGuideDrawingFinished = (guideMesh) => {
        // console.log('Adding Dynamic meshes : ', guideMesh)
        setDrawGuide(false)
        if (bendPlaneGuide) {
            setBendPlaneGuide(false)
            scene.remove(dynamicDrawingPlaneMesh)
        }
        setOrbitalLock(true)
        setDynamicDrawingPlaneMesh(guideMesh) // Store the guide mesh
    }

    useEffect(() => {
        setActiveScene(scene)
        // console.log({ scene })
        // console.log({ gl })
    }, [])

    function ClearGuidePlanes() {
        // console.log(WebGLRenderer.Info)
        // console.log(WebGLRenderer)

        useEffect(() => {
            const meshes = []
            scene.traverse((child) => {
                if (
                    // child.type === 'Mesh' &&
                    child.userData?.type === 'Bend_Guide_Plane' ||
                    child.userData?.type === 'tranfromer' ||
                    child.userData?.type === 'OG_Guide_Plane'
                ) {
                    meshes.push(child)
                }
            })
            meshes.forEach((mesh) => {
                scene.remove(mesh)
                // console.log('Mesh: ', mesh)
                mesh.geometry.dispose()
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((mat) => {
                        if (mat.map) mat.map.dispose()
                        mat.dispose()
                    })
                } else {
                    if (mesh.material.map) mesh.material.map.dispose()
                    mesh.material.dispose()
                }
                mesh.geometry = null
                mesh.material = null
            })
            gl.info.autoReset = false
            gl.info.reset()
            setEraseGuide(false)
            // console.log('Cleared all custom geometries')
            // console.log({ scene })
            // console.log({ gl })
        }, [scene, gl])
        return null
    }

    return (
        <>
            <DynamicGuidePlane onDrawingFinished={handleGuideDrawingFinished} />

            {bendPlaneGuide && (
                <DynamicBendGuidePlane
                    onDrawingFinished={handleGuideDrawingFinished}
                />
            )}

            {/* {penActive && dynamicDrawingPlaneMesh && <DrawLine24 id={id} />} */}
            {/* {penActive && dynamicDrawingPlaneMesh && <DrawLine26 id={id} />} */}
            {/* {penActive && dynamicDrawingPlaneMesh && <DrawLine30 id={id} />} */}
            {penActive && dynamicDrawingPlaneMesh && <DrawLine id={id} />}

            {eraseGuide && <ClearGuidePlanes />}

            {eraserActive && <EraseLine id={id} />}

            {selectLines && <TransformLine id={id} />}

            {/* {selectGuide && dynamicDrawingPlaneMesh && <TransfromGuide />} */}
        </>
    )
}
