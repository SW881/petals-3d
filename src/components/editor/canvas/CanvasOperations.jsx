import React, { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../../hooks/useCanvasViewStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

import EraseLine from './EraseLine'
import DrawLine52 from './DrawLine52'
import TransformLine from './TransformLine'
import TransfromGuide from './TransformGuide'
import LoftGuidePlane18 from './LoftGuidePlane18'
import DynamicGuidePlane from './DynamicGuidePlane'
import DynamicBendGuidePlane from './DynamicBendGuidePlane'

export default function CanvasOperations({ id }) {
    const { scene, gl } = useThree()

    const {
        eraseGuide,
        selectLines,
        selectGuide,
        setDrawGuide,
        setEraseGuide,
        bendPlaneGuide,
        loftGuidePlane,
        setBendPlaneGuide,
        dynamicDrawingPlaneMesh,
        setDynamicDrawingPlaneMesh,
        setPlane,
        highlighted,
        setHighlighted,
        setLoftGuidePlane,
        setGenerateLoftSurface,
    } = canvasDrawStore((state) => state)

    const { setActiveScene, groupData } = canvasRenderStore((state) => state)

    const handleGuideDrawingFinished = (guideMesh) => {
        setDrawGuide(false)
        if (bendPlaneGuide) {
            setBendPlaneGuide(false)
            scene.remove(dynamicDrawingPlaneMesh)
        }
        if (loftGuidePlane) {
            setBendPlaneGuide(false)
            setLoftGuidePlane(false)
            setGenerateLoftSurface(false)
            scene.remove(dynamicDrawingPlaneMesh)
        }
        setDynamicDrawingPlaneMesh(guideMesh)
        setPlane(guideMesh)
    }

    useEffect(() => {
        setActiveScene(scene)
    }, [])

    function ClearGuidePlanes() {
        useEffect(() => {
            const meshes = []
            const selectedObjects = Array.from(highlighted)
            scene.traverse((child) => {
                if (
                    child.userData?.type === 'Bend_Guide_Plane' ||
                    child.userData?.type === 'tranfromer' ||
                    child.userData?.type === 'OG_Guide_Plane' ||
                    child.userData?.type === 'Dynamic_Guide_Line' ||
                    child.userData?.type === 'Loft_Surface'
                ) {
                    meshes.push(child)
                }
            })
            meshes.forEach((mesh) => {
                scene.remove(mesh)
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

            selectedObjects.forEach((obj) => {
                let baseColor = new THREE.Color(obj.userData.color)
                const colors = obj.geometry.attributes.color
                for (let i = 0; i < colors.count; i++) {
                    colors.setXYZW(
                        i,
                        baseColor.r,
                        baseColor.g,
                        baseColor.b,
                        obj.userData.opacity
                    )
                }
                colors.needsUpdate = true
            })

            setHighlighted([])
        }, [scene, gl])
        return null
    }

    const groupsByUuid = new Map(
        Object.values(groupData).map((g) => [g.uuid, g])
    )

    useEffect(() => {
        // console.log('Updating visible groups...')
        scene.traverse((child) => {
            if (
                (child.userData?.type === 'Line' ||
                    child.userData.type === 'Merged_Line') &&
                child.userData.group_id
            ) {
                const group = groupsByUuid.get(child.userData.group_id)
                child.visible = group.visible
            }
        })
    }, [groupData])

    return (
        <>
            <DynamicGuidePlane onDrawingFinished={handleGuideDrawingFinished} />
            {bendPlaneGuide && (
                <DynamicBendGuidePlane
                    onDrawingFinished={handleGuideDrawingFinished}
                />
            )}

            <LoftGuidePlane18 onDrawingFinished={handleGuideDrawingFinished} />

            <DrawLine52 id={id} />

            {eraseGuide && <ClearGuidePlanes />}
            <EraseLine id={id} />
            {selectLines && <TransformLine id={id} />}
            {selectGuide && <TransfromGuide />}
        </>
    )
}
