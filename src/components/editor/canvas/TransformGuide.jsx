import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TransformControls } from 'three/addons/controls/TransformControls.js'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const TransfromGuide = () => {
    const { camera, mouse, raycaster, scene, gl, invalidate } = useThree()
    const { axisMode, transformMode } = canvasDrawStore((state) => state)

    const transformRef = useRef()
    const dummyTarget = useRef(new THREE.Group())
    const selectedCenter = useRef(new THREE.Vector3())
    const isTransformDragging = useRef(false)
    const highlighted = useRef(new Set())

    const [attachedGizmos, setAttachedGizmos] = useState(false)
    const [draggingSelection, setDraggingSelection] = useState(false)

    const tempMatrix = useMemo(() => new THREE.Matrix4(), [])
    const tempPosition = useMemo(() => new THREE.Vector3(), [])
    const tempQuaternion = useMemo(() => new THREE.Quaternion(), [])
    const tempScale = useMemo(() => new THREE.Vector3(), [])

    const toLocalSpace = (object, newParent) => {
        object.updateMatrixWorld(true)
        const objectWorldMatrix = object.matrixWorld

        newParent.updateMatrixWorld(true)
        const parentInverseMatrix = tempMatrix
            .copy(newParent.matrixWorld)
            .invert()

        const localMatrix = tempMatrix.multiplyMatrices(
            parentInverseMatrix,
            objectWorldMatrix
        )

        localMatrix.decompose(tempPosition, tempQuaternion, tempScale)

        object.position.copy(tempPosition)
        object.rotation.setFromQuaternion(tempQuaternion)
        object.scale.copy(tempScale)
    }

    // Initialize TransformControls once
    useEffect(() => {
        const controls = new TransformControls(camera, gl.domElement)
        controls.setSpace(axisMode)
        controls.setMode(transformMode)
        transformRef.current = controls

        // CUSTOMIZE COLORS
        controls.setColors({
            x: '#ff0000', // Red for X axis
            y: '#00ff00', // Green for Y axis
            z: '#0000ff', // Blue for Z axis
            active: '#FF5F1F', // Yellow when dragging
        })

        // HIDE PLANES AND EXTRA ELEMENTS TO REDUCE DRAW CALLS
        // Hide the XY, YZ, XZ plane helpers
        controls.showX = true // Keep X arrow
        controls.showY = true // Keep Y arrow
        controls.showZ = true // Keep Z arrow

        // Access the gizmo helper and hide specific elements
        const helper = controls._gizmo.gizmo.translate.children

        helper.forEach((child) => {
            if (
                child.name == 'XY' ||
                child.name == 'XZ' ||
                child.name == 'YZ' ||
                child.name == 'XYZ' ||
                (child.geometry.type === 'CylinderGeometry' &&
                    child.geometry?.paramters?.radiusTop === 0.0075)
            ) {
                child.scale.set(0, 0, 0)
                child.material.visible = false
                child.visible = false
                child.updateMatrixWorld(true)
            }
        })

        // Add event listeners
        const onDragStart = () => {
            isTransformDragging.current = true
        }

        const onDragEnd = () => {
            isTransformDragging.current = false
        }

        const onDraggingChanged = (e) => {
            isTransformDragging.current = e.value
        }

        controls.addEventListener('mouseDown', onDragStart)
        controls.addEventListener('mouseUp', onDragEnd)
        controls.addEventListener('dragging-changed', onDraggingChanged)

        // Cleanup
        return () => {
            controls.removeEventListener('mouseDown', onDragStart)
            controls.removeEventListener('mouseUp', onDragEnd)
            controls.removeEventListener('dragging-changed', onDraggingChanged)

            const helper = controls.getHelper()
            if (scene.children.includes(helper)) {
                scene.remove(helper)
            }
            controls.detach()
            controls.dispose()

            const dummy = dummyTarget.current
            if (!dummy) return

            const childrenToRestore = [...dummy.children]
            childrenToRestore.forEach((child) => {
                if (!scene.children.includes(child)) {
                    child.updateMatrixWorld()
                    child.applyMatrix4(dummy.matrixWorld)
                    scene.add(child)
                }
                dummy.remove(child)
            })

            if (scene.children.includes(dummy)) {
                scene.remove(dummy)
            }

            highlighted.current.clear()
            gl.info.autoReset = false
            gl.info.reset()
        }
    }, [camera, gl, scene])

    // Update visibility when mode changes
    useEffect(() => {
        if (transformRef.current) {
            transformRef.current.setMode(transformMode)

            // Re-hide planes after mode change
            const helper = transformRef.current.getHelper()
            const gizmoIndex =
                transformMode === 'translate'
                    ? 0
                    : transformMode === 'rotate'
                    ? 1
                    : 2

            if (helper.children[gizmoIndex]) {
                const gizmo = helper.children[gizmoIndex]
                gizmo.children.forEach((child) => {
                    if (
                        child.name &&
                        (child.name.includes('XY') ||
                            child.name.includes('YZ') ||
                            child.name.includes('XZ') ||
                            child.name.includes('XYZ') ||
                            child.name.includes('E'))
                    ) {
                        child.scale.set(0, 0, 0)
                        child.material.visible = false
                        child.visible = false
                        child.updateMatrixWorld(true)
                    }
                })
            }
        }
    }, [transformMode])

    // Attach/detach controls based on attachedGizmos state
    useEffect(() => {
        const controls = transformRef.current
        if (!controls) return

        if (attachedGizmos && dummyTarget.current) {
            controls.attach(dummyTarget.current)
            // Use getHelper() instead of adding controls directly
            const helper = controls.getHelper()
            if (!scene.children.includes(helper)) {
                scene.add(helper)
            }
        } else {
            controls.detach()
            const helper = controls.getHelper()
            if (scene.children.includes(helper)) {
                scene.remove(helper)
            }
        }
    }, [attachedGizmos, scene])

    // Update transform mode and space when they change
    useEffect(() => {
        if (transformRef.current) {
            transformRef.current.setMode(transformMode)
        }
    }, [transformMode])

    useEffect(() => {
        if (transformRef.current) {
            transformRef.current.setSpace(axisMode)
        }
    }, [axisMode])

    const computeCenter = (objects) => {
        const box = new THREE.Box3()
        const center = new THREE.Vector3()

        if (objects.length === 0) return center

        objects.forEach((obj) => {
            obj.updateMatrixWorld(true)
            box.expandByObject(obj)
        })

        return box.getCenter(center)
    }

    const onPointerDownWindow = (event) => {
        if (
            event.target.localName === 'canvas' &&
            !isTransformDragging.current &&
            !attachedGizmos
        ) {
            resetHighlight()
            setDraggingSelection(true)
        }
    }

    const onPointerUpWindow = () => {
        if (
            !draggingSelection ||
            isTransformDragging.current ||
            attachedGizmos
        ) {
            setDraggingSelection(false)
            return
        }

        setDraggingSelection(false)

        const selectedObjects = Array.from(highlighted.current)
        if (selectedObjects.length === 0) return

        const center = computeCenter(selectedObjects)
        selectedCenter.current.copy(center)
        dummyTarget.current.position.copy(center)

        if (!scene.children.includes(dummyTarget.current)) {
            scene.add(dummyTarget.current)
        }

        selectedObjects.forEach((obj) => {
            toLocalSpace(obj, dummyTarget.current)
            dummyTarget.current.add(obj)
            if (obj.material) {
                obj.material.transparent = true
                obj.material.opacity = 0.25
            }
        })

        invalidate() // Add this

        setAttachedGizmos(true)
    }

    const resetHighlight = () => {
        highlighted.current.forEach((obj) => {
            if (obj.material) {
                obj.material.transparent = true
                obj.material.opacity = 0.25
            }
        })
        highlighted.current.clear()
    }

    useEffect(() => {
        window.addEventListener('pointerdown', onPointerDownWindow)
        window.addEventListener('pointerup', onPointerUpWindow)
        return () => {
            window.removeEventListener('pointerdown', onPointerDownWindow)
            window.removeEventListener('pointerup', onPointerUpWindow)
        }
    }, [draggingSelection, attachedGizmos])

    useFrame(() => {
        if (!draggingSelection || attachedGizmos) return

        raycaster.setFromCamera(mouse, camera)
        const objectsToTest = scene.children.filter(
            (obj) =>
                obj.isMesh &&
                (obj.userData?.type === 'Bend_Guide_Plane' ||
                    obj.userData?.type === 'Loft_Surface' ||
                    obj.userData?.type === 'Dynamic_Guide_Line' ||
                    obj.userData?.type === 'OG_Guide_Plane')
        )

        const intersects = raycaster.intersectObjects(objectsToTest, true)
        let hasNewHighlight = false

        intersects.forEach(({ object }) => {
            if (!highlighted.current.has(object)) {
                highlighted.current.add(object)
                if (object.material) {
                    object.material.transparent = true
                    object.material.opacity = 0.5
                }
            }
        })

        if (hasNewHighlight) {
            invalidate()
        }
    })
}

export default TransfromGuide
