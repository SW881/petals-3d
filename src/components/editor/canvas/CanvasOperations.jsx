import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { v4 as uuid } from 'uuid'

import EraseLine from './EraseLine'
import TransformLine from './TransformLine'
import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../../hooks/useCanvasViewStore'

import { dashboardStore } from '../../../hooks/useDashboardStore'
import { saveGroupToIndexDB } from '../../../helpers/sceneFunction'
import DynamicGuidePlane from './DynamicGuidePlane'
import DynamicBendGuidePlane from './DynamicBendGuidePlane'
import DrawLine24 from './DrawLine'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

export default function CanvasOperations({ id }) {
    const {
        penActive,
        eraseGuide,
        selectLines,
        setDrawGuide,
        eraserActive,
        setEraseGuide,
        bendPlaneGuide,
        setBendPlaneGuide,
        dynamicDrawingPlaneMesh,
        setDynamicDrawingPlaneMesh,
    } = canvasDrawStore((state) => state)

    const { setActiveScene } = canvasRenderStore((state) => state)

    const { scene, gl } = useThree()

    const { setOrbitalLock } = canvasViewStore((state) => state)

    const handleGuideDrawingFinished = (guideMesh) => {
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
    }, [])

    function ClearGuidePlanes() {
        useEffect(() => {
            const meshes = []
            scene.traverse((child) => {
                if (
                    child.userData?.type === 'Bend_Guide_Plane' ||
                    child.userData?.type === 'tranfromer' ||
                    child.userData?.type === 'OG_Guide_Plane'
                ) {
                    meshes.push(child)
                }
            })
            meshes.forEach((mesh) => {
                scene.remove(mesh)
                console.log('Mesh: ', mesh)
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

            {penActive && dynamicDrawingPlaneMesh && <DrawLine24 id={id} />}

            {eraseGuide && <ClearGuidePlanes />}

            {eraserActive && <EraseLine id={id} />}

            {selectLines && <TransformLine id={id} />}
        </>
    )
}
