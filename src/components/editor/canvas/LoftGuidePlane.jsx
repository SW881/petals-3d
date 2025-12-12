import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'

import {
    ensureEvenCount,
    alignCurvesForLofting,
    resampleCurveNoNormals,
    normalizeGuideSetNoNormals,
    createControlledLoftedSurface,
    detectAndCombineConnectedLoop,
} from '../../../helpers/loftGuideHelper'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const LoftGuidePlane = ({ onDrawingFinished }) => {
    const { camera, mouse, raycaster, scene, invalidate } = useThree()
    const {
        radialPercentage,
        waistPercentage,
        polyCountPercentage,
        generateLoftSurface,
        loftGuidePlane,
        setHighlighted,
        addToHighlighted,
        pointerType,
    } = canvasDrawStore((state) => state)

    const { activeGroup } = canvasRenderStore((state) => state)

    const highlighted = useRef(new Set())
    const [draggingSelection, setDraggingSelection] = useState(false)
    const loftedSurfaceRef = useRef(null)
    const prevGenerateLoftRef = useRef(false)

    const resetHighlightedObjects = useCallback(() => {
        const selectedObjects = Array.from(highlighted.current)
        selectedObjects.forEach((obj) => {
            if (obj.userData && obj.userData.color) {
                let baseColor = new THREE.Color(obj.userData.color)
                const colors = obj.geometry.attributes.color
                if (colors) {
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
                }
            }
        })
        highlighted.current.clear()
    }, [])

    const onPointerDownWindow = useCallback((event) => {
        if (event.pointerType === pointerType) {
            if (event.target.localName === 'canvas') {
                setDraggingSelection(true)
            }
        }
    }, [])

    const onPointerUpWindow = useCallback(() => {
        if (!draggingSelection) {
            setDraggingSelection(false)
            return
        }

        setDraggingSelection(false)

        const selectedObjects = Array.from(highlighted.current)
        if (selectedObjects.length === 0) return

        let guideDataSets = []

        if (selectedObjects.length > 1) {
            const combinedGuide = detectAndCombineConnectedLoop(selectedObjects)
            if (combinedGuide) {
                guideDataSets.push(combinedGuide)
            } else {
                selectedObjects.forEach((obj) => {
                    guideDataSets.push({
                        guidePoints: obj.userData.loft_points,
                    })
                })
            }
        } else {
            selectedObjects.forEach((obj) => {
                guideDataSets.push({
                    guidePoints: obj.userData.loft_points,
                })
            })
        }

        if (guideDataSets.length === 0) return

        const TARGET_SEGMENTS = 128

        const normalizedSets = guideDataSets.map((gs) => {
            const normalized = normalizeGuideSetNoNormals(gs)
            return {
                guidePoints: normalized.points,
                isClosed: normalized.isClosed,
            }
        })

        const alignedSets = alignCurvesForLofting(normalizedSets)

        const finalizedGuideSets = alignedSets.map((gs) => {
            const resampled = resampleCurveNoNormals(
                gs.guidePoints,
                TARGET_SEGMENTS,
                gs.isClosed
            )
            const evened = ensureEvenCount(resampled.points, gs.isClosed)
            return { guidePoints: evened.points, isClosed: gs.isClosed }
        })

        if (selectedObjects.length === finalizedGuideSets.length) {
            finalizedGuideSets.forEach((gs, i) => {
                if (selectedObjects[i] && selectedObjects[i].userData) {
                    selectedObjects[i].userData.loft_points = gs.guidePoints
                }
            })
        }

        if (finalizedGuideSets.length < 2) {
            console.warn(
                'Need at least 2 guide curves for lofting. Selected:',
                finalizedGuideSets.length
            )
            return
        }

        if (loftedSurfaceRef.current) {
            loftedSurfaceRef.current.dispose()
        }

        const initialRadial = (radialPercentage ?? 50) / 100
        const initialWaist = (waistPercentage ?? 50) / 100
        const initialPolyCount = (polyCountPercentage ?? 50) / 100

        loftedSurfaceRef.current = createControlledLoftedSurface(
            finalizedGuideSets,
            {
                initialRadial: initialRadial,
                initialWaist: initialWaist,
                initialPolyCount: initialPolyCount,
            }
        )

        if (loftedSurfaceRef.current?.mesh) {
            scene.add(loftedSurfaceRef.current.mesh)
        } else {
            console.error('❌ Failed to create loft surface mesh')
        }

        invalidate()
    }, [
        draggingSelection,
        radialPercentage,
        waistPercentage,
        polyCountPercentage,
        scene,
        invalidate,
    ])

    useEffect(() => {
        if (loftedSurfaceRef.current && radialPercentage !== undefined) {
            const radial = radialPercentage / 100
            loftedSurfaceRef.current.setRadial(radial)
        }
        if (loftedSurfaceRef.current && waistPercentage !== undefined) {
            const waist = waistPercentage / 100
            loftedSurfaceRef.current.setWaist(waist)
        }
        if (loftedSurfaceRef.current && polyCountPercentage !== undefined) {
            const polyLevel = polyCountPercentage / 100
            loftedSurfaceRef.current.setPolyCount(polyLevel)
        }
    }, [radialPercentage, waistPercentage, polyCountPercentage])

    useEffect(() => {
        if (loftGuidePlane) {
            if (generateLoftSurface && !prevGenerateLoftRef.current) {
                // console.log('Generating loft guide')
                prevGenerateLoftRef.current = true

                if (!loftedSurfaceRef.current) return

                const loftMesh = loftedSurfaceRef.current.mesh
                if (!loftMesh) return

                const currentGeometry = loftMesh.geometry
                let finalGeometry = currentGeometry.clone()

                if (finalGeometry.index !== null) {
                    finalGeometry = finalGeometry.toNonIndexed()
                }

                const staticMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color('#C0C0C0'),
                    wireframe: false,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                })

                const staticMesh = new THREE.Mesh(finalGeometry, staticMaterial)
                staticMesh.userData = {
                    type: 'LOFT_SURFACE',
                    isDrawable: true,
                }

                staticMesh.updateMatrix()
                staticMesh.updateMatrixWorld(true)

                loftedSurfaceRef.current.dispose()
                loftedSurfaceRef.current = null

                finalGeometry.computeBoundingBox()
                finalGeometry.computeBoundingSphere()
                finalGeometry.attributes.position.needsUpdate = true

                scene.add(staticMesh)
                // console.log('Generated loft guide added to scene')

                resetHighlightedObjects()
                setHighlighted([])

                invalidate()

                if (onDrawingFinished && staticMesh) {
                    onDrawingFinished(staticMesh)
                }
            }
        } else if (!loftGuidePlane) {
            resetHighlightedObjects()

            if (loftedSurfaceRef.current) {
                if (loftedSurfaceRef.current.mesh) {
                    scene.remove(loftedSurfaceRef.current.mesh)
                }
                loftedSurfaceRef.current.dispose()
                loftedSurfaceRef.current = null
            }

            setDraggingSelection(false)
            prevGenerateLoftRef.current = false

            invalidate()
        }
    }, [
        generateLoftSurface,
        loftGuidePlane,
        scene,
        onDrawingFinished,
        invalidate,
        resetHighlightedObjects,
    ])

    useEffect(() => {
        if (!loftGuidePlane) return

        window.addEventListener('pointerdown', onPointerDownWindow)
        window.addEventListener('pointerup', onPointerUpWindow)

        return () => {
            window.removeEventListener('pointerdown', onPointerDownWindow)
            window.removeEventListener('pointerup', onPointerUpWindow)
        }
    }, [loftGuidePlane, onPointerDownWindow, onPointerUpWindow])

    useFrame(() => {
        if (!draggingSelection) return

        raycaster.setFromCamera(mouse, camera)
        const objectsToTest = scene.children.filter(
            (obj) =>
                obj.isMesh &&
                !obj.userData.is_deleted &&
                obj.userData?.type === 'LINE' &&
                obj.userData?.group_id === activeGroup.uuid
        )

        const intersects = raycaster.intersectObjects(objectsToTest, true)
        let hasNewHighlight = false

        intersects.forEach(({ object }) => {
            if (!highlighted.current.has(object)) {
                highlighted.current.add(object)
                addToHighlighted(object)
                hasNewHighlight = true

                const colors = object.geometry.attributes.color
                const greenColor = new THREE.Color('#FF4433')
                for (let i = 0; i < colors.count; i++) {
                    colors.setXYZW(
                        i,
                        greenColor.r,
                        greenColor.g,
                        greenColor.b,
                        object.userData.opacity
                    )
                }
                colors.needsUpdate = true
            }
        })

        if (hasNewHighlight) {
            invalidate()
        }
    })

    return null
}

export default LoftGuidePlane
