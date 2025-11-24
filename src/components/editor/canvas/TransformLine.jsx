import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const TransformLine = ({ id }) => {
    const { camera, mouse, raycaster, scene, gl, invalidate } = useThree()
    const {
        copy,
        setCopy,
        axisMode,
        lineColor,
        strokeColor,
        selectLines,
        strokeOpacity,
        transformMode,
        setSelectLines,
        mergeGeometries,
        setMergeGeometries,
        activeMaterialType,
    } = canvasDrawStore((state) => state)
    const { activeGroup, setActiveScene } = canvasRenderStore((state) => state)

    const transformRef = useRef()
    const dummyTarget = useRef(new THREE.Group())
    const selectedCenter = useRef(new THREE.Vector3())
    const isTransformDragging = useRef(false)
    const highlighted = useRef(new Set())
    const isCopying = useRef(false)
    const isMerging = useRef(false)

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
            updateLineWorldPoints3()
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
                    child.updateMatrixWorld(true)
                    child.applyMatrix4(dummy.matrixWorld)
                    dummy.remove(child)
                    scene.add(child)
                }
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

    const resetDummyTarget = () => {
        const dummy = dummyTarget.current
        if (dummy) {
            dummy.children.forEach((child) => {
                if (child.isMesh) {
                    if (child.geometry) {
                        child.geometry.dispose()
                    }
                    if (child.material) {
                        const materials = Array.isArray(child.material)
                            ? child.material
                            : [child.material]
                        materials.forEach((mat) => {
                            mat.dispose?.()
                        })
                    }
                }
                dummy.remove(child)
            })
            if (scene.children.includes(dummy)) {
                scene.remove(dummy)
            }
        }
        dummyTarget.current = new THREE.Group()
    }

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

        invalidate() // Add this
        setAttachedGizmos(true)
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
                obj.userData?.group_id === activeGroup &&
                (obj.userData?.type === 'Line' ||
                    obj.userData?.type === 'Merged_Line' ||
                    obj.userData?.type === 'Loft_Surface' ||
                    obj.userData?.type === 'Bend_Guide_Plane' ||
                    obj.userData?.type === 'OG_Guide_Plane')
        )

        const intersects = raycaster.intersectObjects(objectsToTest, true)
        let hasNewHighlight = false

        intersects.forEach(({ object }) => {
            if (!highlighted.current.has(object)) {
                highlighted.current.add(object)
                hasNewHighlight = true

                const colors = object.geometry.attributes.color
                const greenColor = new THREE.Color('#00FF00')
                for (let i = 0; i < colors.count; i++) {
                    colors.setXYZW(
                        i,
                        greenColor.r,
                        greenColor.g,
                        greenColor.b,
                        0.5
                    )
                }
                colors.needsUpdate = true
            }
        })

        if (hasNewHighlight) {
            invalidate()
        }
    })

    useEffect(() => {
        if (dummyTarget.current?.children.length > 0) {
            const newColor = new THREE.Color(lineColor) // white

            dummyTarget.current.children.forEach((obj) => {
                if (
                    obj.isMesh &&
                    obj.userData?.group_id === activeGroup &&
                    (obj.userData?.type === 'Line' ||
                        obj.userData?.type === 'Merged_Line' ||
                        obj.userData?.type === 'Loft_Surface')
                ) {
                    // Update userData.color to the new color
                    obj.userData.color = lineColor

                    const colors = obj.geometry.attributes.color
                    for (let i = 0; i < colors.count; i++) {
                        colors.setXYZW(
                            i,
                            newColor.r,
                            newColor.g,
                            newColor.b,
                            obj.userData.opacity
                        )
                    }
                    colors.needsUpdate = true
                }
            })

            invalidate()
        }
    }, [lineColor, invalidate])

    useEffect(() => {
        if (dummyTarget.current && copy && !isCopying.current) {
            isCopying.current = true
            setAttachedGizmos(false)

            const originalObjects = [...dummyTarget.current.children].map(
                (child) => {
                    child.updateMatrixWorld(true)
                    child.applyMatrix4(dummyTarget.current.matrixWorld)
                    dummyTarget.current.remove(child)
                    scene.add(child)
                    return child
                }
            )

            if (originalObjects.length === 0) {
                setCopy(false)
                isCopying.current = false
                return
            }

            const clones = originalObjects.map((original) => {
                const clone = original.clone()

                // Deep clone geometry so vertex colors can be updated independently
                clone.geometry = original.geometry.clone()

                if (Array.isArray(original.material)) {
                    clone.material = original.material.map((mat) => {
                        const clonedMat = mat.clone()
                        if (mat.flatShading) {
                            clonedMat.flatShading = true
                            clonedMat.needsUpdate = true
                        }
                        return clonedMat
                    })
                } else if (original.material) {
                    const clonedMat = original.material.clone()
                    if (original.material.flatShading) {
                        clonedMat.flatShading = true
                        clonedMat.needsUpdate = true
                    }
                    clone.material = clonedMat
                }

                if (clone.geometry.attributes.normal) {
                    clone.geometry.attributes.normal.needsUpdate = true
                }
                if (clone.geometry.attributes.position) {
                    clone.geometry.attributes.position.needsUpdate = true
                }

                clone.userData = { ...original.userData }
                clone.userData.uuid = clone.uuid
                return clone
            })

            const center = computeCenter(clones)
            selectedCenter.current.copy(center)
            dummyTarget.current.position.copy(center)

            clones.forEach((clone) => {
                toLocalSpace(clone, dummyTarget.current)
                dummyTarget.current.add(clone)
            })

            setAttachedGizmos(true)
            setCopy(false)
            isCopying.current = false
            setActiveScene(scene)
        }
    }, [copy, scene, setAttachedGizmos, setCopy, setActiveScene])

    useEffect(() => {
        if (dummyTarget.current && mergeGeometries && !isMerging.current) {
            isMerging.current = true
            setAttachedGizmos(false)

            const objectsToMerge = [...dummyTarget.current.children]

            if (objectsToMerge.length === 0) {
                setMergeGeometries(false)
                isMerging.current = false
                return
            }

            const initialScale = objectsToMerge[0].scale.x

            let lines = []
            let geometries = []
            let allGeometriesValid = true

            for (const mesh of objectsToMerge) {
                mesh.updateMatrixWorld(true)

                const objData = mesh.userData
                if (
                    objData.type === 'Line' &&
                    objData.group_id === activeGroup
                ) {
                    lines = [...lines, objData]
                    objData.merged = true
                }

                if (!(mesh instanceof THREE.Mesh) || !mesh.geometry) {
                    allGeometriesValid = false
                    continue
                }

                const clonedGeometry = mesh.geometry.clone()
                clonedGeometry.applyMatrix4(mesh.matrixWorld)
                geometries.push(clonedGeometry)

                mesh.parent.remove(mesh)
                mesh.geometry.dispose()
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach((m) => m.dispose())
                } else if (mesh.material) {
                    mesh.material.dispose()
                }
            }

            if (!allGeometriesValid || geometries.length === 0) {
                resetDummyTarget()
                setMergeGeometries(false)
                isMerging.current = false
                return
            }

            const mergedGeometry = BufferGeometryUtils.mergeGeometries(
                geometries,
                false
            )

            if (!mergedGeometry.attributes.color) {
                const count = mergedGeometry.attributes.position.count
                const colors = new Float32Array(count * 4) // RGBA

                const strokeColorObj = new THREE.Color(strokeColor)
                for (let i = 0; i < count; i++) {
                    colors[i * 4 + 0] = strokeColorObj.r
                    colors[i * 4 + 1] = strokeColorObj.g
                    colors[i * 4 + 2] = strokeColorObj.b
                    colors[i * 4 + 3] = strokeOpacity ?? 1.0
                }

                mergedGeometry.setAttribute(
                    'color',
                    new THREE.BufferAttribute(colors, 4)
                )
            }

            let material
            switch (activeMaterialType) {
                case 'flat':
                    material = new THREE.MeshBasicMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending: THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                    })
                    break

                case 'glow':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: false,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                        emissive: new THREE.Color(strokeColor),
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            const combinedMesh = new THREE.Mesh(mergedGeometry, material)
            combinedMesh.geometry.toNonIndexed()
            combinedMesh.geometry.computeVertexNormals()
            combinedMesh.geometry.computeBoundingBox()
            combinedMesh.geometry.computeBoundingSphere()

            combinedMesh.userData = {
                type: 'Merged_Line',
                note_id: id,
                is_mirror: false,
                mirror_mode: 'NA',
                color: strokeColor,
                opacity: strokeOpacity,
                uuid: combinedMesh.uuid,
                group_id: activeGroup,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                scale: { x: 1, y: 1, z: 1 },
            }

            // 2) Add merged mesh to scene (already in world space)
            scene.add(combinedMesh)

            // 3) Clear dummy and detach gizmos
            resetDummyTarget()
            setAttachedGizmos(false)

            // 4) Clear merging flags
            setMergeGeometries(false)
            isMerging.current = false
            setActiveScene(scene)
            setSelectLines(!selectLines)
        }
    }, [
        mergeGeometries,
        scene,
        setAttachedGizmos,
        setActiveScene,
        resetDummyTarget,
    ])

    const updateLineWorldPoints3 = () => {
        dummyTarget.current.children.forEach((lineObj) => {
            if (lineObj.type === 'Mesh' && lineObj.userData.type === 'Line') {
                lineObj.updateMatrixWorld(true)

                const localPoints = lineObj.userData.loft_points

                if (!localPoints || localPoints.length === 0) {
                    console.warn('No loft_points found on line object')
                    return
                }

                // Transform local points to world space
                const worldPoints = localPoints.map((localPt) => {
                    return localPt.clone().applyMatrix4(lineObj.matrixWorld)
                })

                // Update the world-space loft points
                lineObj.userData.loft_points = worldPoints
            }
        })
    }

    return null
}

export default TransformLine
