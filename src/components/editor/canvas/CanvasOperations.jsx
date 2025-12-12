import React, { useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

import DrawLine from './DrawLine'
import EraseLine from './EraseLine'
import TransformLine from './TransformLine'
import LoftGuidePlane from './LoftGuidePlane'
import TransformGuide from './TransformGuide'
import DynamicGuidePlane from './DynamicGuidePlane'
import DynamicBendGuidePlane from './DynamicBendGuidePlane'

import { eraseLineType, guideObjectType } from '../../../config/objectsConfig'

export default function CanvasOperations() {
    const { scene, gl } = useThree()

    const {
        setPlane,
        eraseGuide,
        selectLines,
        selectGuide,
        highlighted,
        setDrawGuide,
        setEraseGuide,
        bendPlaneGuide,
        setHighlighted,
        loftGuidePlane,
        setBendPlaneGuide,
        setLoftGuidePlane,
        setGenerateLoftSurface,
        dynamicDrawingPlaneMesh,
        setDynamicDrawingPlaneMesh,
    } = canvasDrawStore((state) => state)

    const { setActiveScene, groupData } = canvasRenderStore((state) => state)

    //  // Rebuild scene
    // useEffect(() => {
    //     generateScene(scene, groupData)
    // }, [])

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

    function ClearRemovedObjects() {
        useEffect(() => {
            const meshes = []
            const selectedObjects = Array.from(highlighted)
            scene.traverse((child) => {
                if (
                    (eraseLineType.includes(child.userData?.type) &&
                        child.userData?.is_deleted) ||
                    guideObjectType.includes(child.userData?.type)
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

            setEraseGuide(false)
        }, [scene, gl])
        return null
    }

    const groupsByUuid = new Map(
        Object.values(groupData).map((g) => [g.uuid, g])
    )

    useEffect(() => {
        scene.traverse((child) => {
            if (
                eraseLineType.includes(child.userData?.type) &&
                child.userData.group_id
            ) {
                const group = groupsByUuid.get(child.userData.group_id)
                if (group && !child.userData.is_deleted) {
                    child.visible = group.visible
                    group.objects.map((obj) => {
                        return { ...obj, ...child.userData }
                    })
                }
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

            <LoftGuidePlane onDrawingFinished={handleGuideDrawingFinished} />

            {selectGuide && <TransformGuide />}

            {eraseGuide && <ClearRemovedObjects />}

            <DrawLine />
            {selectLines && <TransformLine />}
            <EraseLine />
        </>
    )
}
