import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TransformControls } from '@react-three/drei'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const TransformLine = ({ eraseFilter = () => true }) => {
    const { camera, mouse, raycaster, scene, gl } = useThree()
    const {
        copy,
        setCopy,
        axisMode,
        lineColor,
        strokeColor,
        transformMode,
        mergeGeometries,
        setMergeGeometries,
    } = canvasDrawStore((state) => state)
    const { setActiveScene } = canvasRenderStore((state) => state)

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

    useEffect(() => {
        return () => {
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

            // console.log({ scene })
            highlighted.current.clear()
            gl.info.autoReset = false
            gl.info.reset()
            setAttachedGizmos(false)
            resetDummyTarget()
        }
    }, [scene])

    const resetDummyTarget = () => {
        const dummy = dummyTarget.current

        if (dummy) {
            dummy.children.forEach((child) => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose()
                    if (child.material) {
                        const materials = Array.isArray(child.material)
                            ? child.material
                            : [child.material]
                        materials.forEach((mat) => mat.dispose?.())
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
        // console.log({ selectedObjects })
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
                obj.material.opacity = 1
            }
        })

        setAttachedGizmos(true)
    }

    const resetHighlight = () => {
        highlighted.current.forEach((obj) => {
            if (obj.material?.transparent !== undefined) {
                obj.material.opacity = 1
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
                obj.isMesh && obj.userData?.type === 'Line' && eraseFilter(obj)
        )

        const intersects = raycaster.intersectObjects(objectsToTest, true)
        // console.log({ intersects })
        intersects.forEach(({ object }) => {
            if (
                // intersects.length > 0 &&
                // intersects[0]?.object &&
                !highlighted.current.has(object)
            ) {
                highlighted.current.add(object)
                if (object.material) {
                    object.material.transparent = true
                    object.material.opacity = 0.5
                }
            }
        })
    })

    useEffect(() => {
        if (dummyTarget.current?.children.length > 0) {
            dummyTarget.current.children.forEach((obj) => {
                if (
                    obj.isMesh &&
                    (obj.userData?.type === 'Line' ||
                        obj.userData?.type === 'Linked_Line')
                ) {
                    obj.material.color.set(lineColor)
                }
            })
        }
    }, [lineColor])

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
                clone.material.transparent = true
                clone.material.opacity = 1
            })

            setAttachedGizmos(true)
            setCopy(false)
            isCopying.current = false
            setActiveScene(scene)
        }
    }, [copy])

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
            // const initialGroupId = drawStore.getState().activeGroup

            let lines = []
            let geometries = []
            let allGeometriesValid = true

            for (const mesh of objectsToMerge) {
                mesh.updateMatrixWorld(true)

                const objData = mesh.userData
                if (objData.type === 'Line') {
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
            const pos = mergedGeometry.attributes.position
            const count = pos.count
            const finalNormals = new Float32Array(count * 3)

            for (let i = 0; i < count; i += 3) {
                const vIdx0 = i
                const vIdx1 = i + 1
                const vIdx2 = i + 2

                const vA = new THREE.Vector3().fromArray(pos.array, vIdx0 * 3)
                const vB = new THREE.Vector3().fromArray(pos.array, vIdx1 * 3)
                const vC = new THREE.Vector3().fromArray(pos.array, vIdx2 * 3)

                const cb = new THREE.Vector3().subVectors(vC, vB)
                const ab = new THREE.Vector3().subVectors(vA, vB)
                const normal = new THREE.Vector3()
                    .crossVectors(cb, ab)
                    .normalize()

                for (let j = 0; j < 3; j++) {
                    const n_idx = (i + j) * 3
                    finalNormals[n_idx] = normal.x
                    finalNormals[n_idx + 1] = normal.y
                    finalNormals[n_idx + 2] = normal.z
                }
            }

            mergedGeometry.setAttribute(
                'normal',
                new THREE.Float32BufferAttribute(finalNormals, 3)
            )

            mergedGeometry.attributes.normal.needsUpdate = true
            mergedGeometry.toNonIndexed()
            mergedGeometry.computeVertexNormals()
            mergedGeometry.computeBoundingBox()
            mergedGeometry.computeBoundingSphere()

            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(strokeColor),
                wireframe: false,
                transparent: true,
                opacity: strokeOpacity,
                side: THREE.DoubleSide,
                forceSinglePass: true,
                depthTest: false,
                depthWrite: false,
            })

            const mergedMesh = new THREE.Mesh(mergedGeometry, material)
            scene.add(mergedMesh)

            if (mergedMesh.material) {
                mergedMesh.material.flatShading = true
                mergedMesh.material.needsUpdate = true
            }

            mergedMesh.userData = {
                lines,
                type: 'Line',
                uuid: mergedMesh.uuid,
                scale: initialScale,
                position: new THREE.Vector3(0, 0, 0),
                rotation: new THREE.Euler(0, 0, 0),
                // group_id: initialGroupId,
            }

            resetDummyTarget()
            setMergeGeometries(false)
            isMerging.current = false
            setActiveScene(scene)
        }
    }, [
        mergeGeometries,
        scene,
        setAttachedGizmos,
        setActiveScene,
        resetDummyTarget,
    ])

    useEffect(() => {
        const controls = transformRef.current
        if (!controls) return

        const onDragStart = () => (isTransformDragging.current = true)
        const onDragEnd = () => (isTransformDragging.current = false)
        const onDraggingChanged = (e) => {
            isTransformDragging.current = e.value
        }

        controls.addEventListener('mouseDown', onDragStart)
        controls.addEventListener('mouseUp', onDragEnd)
        controls.addEventListener('dragging-changed', onDraggingChanged)

        return () => {
            controls.removeEventListener('mouseDown', onDragStart)
            controls.removeEventListener('mouseUp', onDragEnd)
            controls.removeEventListener('dragging-changed', onDraggingChanged)

            gl.info.autoReset = false
            gl.info.reset()
        }
    }, [])

    return (
        <>
            {attachedGizmos && (
                <TransformControls
                    ref={transformRef}
                    object={dummyTarget.current}
                    axisColors={['#ff0000', '#00ff00', '#0000ff']}
                    activeColor="purple"
                    mode={transformMode}
                    space={axisMode}
                    onMouseDown={() => {
                        isTransformDragging.current = true
                    }}
                    onMouseUp={() => {
                        isTransformDragging.current = false
                    }}
                    userData={{ type: 'tranfromer' }}
                />
            )}
        </>
    )
}

export default TransformLine
