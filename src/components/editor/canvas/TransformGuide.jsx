import React, { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { TransformControls } from '@react-three/drei'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const TransfromGuide = ({ eraseFilter = () => true }) => {
    const { camera, mouse, raycaster, scene, gl } = useThree()
    const { axisMode, transformMode, dynamicDrawingPlaneMesh } =
        canvasDrawStore((state) => state)

    const planeRef = useRef()

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
                // obj.material.opacity = 1
                obj.material.color = new THREE.Color(0xf2f2f2)
                // obj.material.needsUpdate = true
            }
        })

        setAttachedGizmos(true)
    }

    const resetHighlight = () => {
        highlighted.current.forEach((obj) => {
            if (obj.material?.transparent !== undefined) {
                // obj.material.opacity = 1
                // obj.material.color = new THREE.Color(0xf2f2f2)
                // obj.material.needsUpdate = true
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
                // obj.isMesh && obj.userData?.type === 'Line' && eraseFilter(obj)
                obj.isMesh &&
                (obj.userData?.type === 'OG_Guide_Plane' ||
                    obj.userData?.type === 'Bend_Guide_Plane') &&
                eraseFilter(obj)
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
                    // object.material.opacity = 0.5
                    object.material.color = new THREE.Color(0x008000)
                    object.material.needsUpdate = true
                    // object.material.color =
                }
            }
        })
    })

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

            {dynamicDrawingPlaneMesh && (
                <primitive object={dynamicDrawingPlaneMesh} ref={planeRef} />
            )}
        </>
    )
}

export default TransfromGuide
