import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const EraseLine = ({ id }) => {
    // const { camera, scene, gl } = useThree()

    function EraserTool({ eraseFilter = () => true }) {
        const { camera, mouse, raycaster, scene } = useThree()
        const [dragging, setDragging] = useState(false)
        const highlighted = useRef(new Set())

        const resetHighlight = () => {
            highlighted.current.forEach((obj) => {
                if (obj.material && obj.material.transparent !== undefined) {
                    obj.material.opacity = 1
                }
            })
            highlighted.current.clear()
        }

        useEffect(() => {
            const onPointerDown = () => {
                resetHighlight()
                setDragging(true)
            }

            const onPointerUp = () => {
                setDragging(false)

                console.log('Deleteing Objects...')
                highlighted.current.forEach((obj) => {
                    if (obj.parent) {
                        obj.parent.remove(obj)
                        obj.geometry.dispose()
                        obj.material.dispose()
                    }
                })

                highlighted.current.clear()
            }

            window.addEventListener('pointerdown', onPointerDown)
            window.addEventListener('pointerup', onPointerUp)

            return () => {
                window.removeEventListener('pointerdown', onPointerDown)
                window.removeEventListener('pointerup', onPointerUp)
            }
        }, [scene])

        useFrame(() => {
            if (!dragging) return

            raycaster.setFromCamera(mouse, camera)

            const objectsToCheck = scene.children.filter(
                (obj) =>
                    obj.isMesh &&
                    obj.userData?.type === 'Line' &&
                    eraseFilter(obj)
            )

            const intersects = raycaster.intersectObjects(objectsToCheck, true)

            intersects.forEach(({ object }) => {
                if (!highlighted.current.has(object)) {
                    highlighted.current.add(object)
                    if (object.material) {
                        object.material.transparent = true
                        object.material.opacity = 0.5
                    }
                }
            })
        })
        return null
    }

    return (
        <>
            <EraserTool />
        </>
    )
}

export default EraseLine
