import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
    GizmoHelper,
    GizmoViewport,
    OrbitControls,
    OrthographicCamera,
    PerspectiveCamera,
    Stats,
} from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

import { canvasViewStore } from '../../hooks/useCanvasViewStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'

import CanvasOperations from './canvas/CanvasOperations'

const Canvas3d = ({ id }) => {
    const {
        cameraFov,
        gridPlaneX,
        gridPlaneY,
        gridPlaneZ,
        orbitalLock,
        isOrthographic,
    } = canvasViewStore((state) => state)

    const {
        lightIntensity,
        canvasBackgroundColor,
        postProcess,
        sequentialLoading,
        setSequentialLoading,
    } = canvasRenderStore((state) => state)

    const [snaping, setSnaping] = useState(false)

    const orbitControlsRef = useRef()

    function SnapCameraPositionAndRotation() {
        const { camera } = useThree()
        const target = new THREE.Vector3(0, 0, 0)

        // Get the direction from the camera to the target (where it's looking)
        const direction = new THREE.Vector3()
        direction.subVectors(target, camera.position).normalize()

        // Absolute values to compare which axis the camera is facing most
        const absDir = {
            x: Math.abs(direction.x),
            y: Math.abs(direction.y),
            z: Math.abs(direction.z),
        }

        // Decide which axis is dominant (and the sign)
        let snapPosition = new THREE.Vector3()

        if (absDir.x > absDir.y && absDir.x > absDir.z) {
            snapPosition.set(direction.x > 0 ? -40 : 40, 0, 0) // Along X
        } else if (absDir.y > absDir.x && absDir.y > absDir.z) {
            snapPosition.set(0, direction.y > 0 ? -40 : 40, 0) // Along Y
        } else {
            snapPosition.set(0, 0, direction.z > 0 ? -40 : 40) // Along Z
        }

        // Move camera and reset controls
        camera.position.copy(snapPosition)
        camera.lookAt(target)

        if (orbitControlsRef.current) {
            orbitControlsRef.current.target.copy(target)
            orbitControlsRef.current.update()
        }

        setSnaping(false)
    }

    function SmoothFOV() {
        const { camera } = useThree()
        const fovRef = useRef(camera.fov)

        useFrame(() => {
            // Lerp current fov toward target
            fovRef.current += (cameraFov - fovRef.current) * 0.9
            camera.fov = fovRef.current
            camera.updateProjectionMatrix()
        })

        return null
    }

    function SceneComposer() {
        const { camera, gl } = useThree()
        const [ready, setReady] = useState(false)

        useFrame(() => {
            if (!ready) setReady(true)
        })

        useEffect(() => {
            camera.layers.enable(1)
            gl.autoClear = false
        }, [camera, gl])

        if (!ready) return null // ⏸️ wait one frame

        return (
            <EffectComposer multisampling={8} autoClear={false}>
                <Bloom mipmapBlur intensity={1.5} luminanceThreshold={0.01} />
            </EffectComposer>
        )
    }

    function SequentialLoader({ onComplete }) {
        const { scene } = useThree()

        useEffect(() => {
            const sampleObjects = []

            // Traverse the whole scene
            scene.traverse((child) => {
                if (child.userData?.type === 'Line') {
                    child.visible = false
                    sampleObjects.push(child)
                }
            })

            // Sequential visibility with delay
            const showSequentially = async () => {
                for (const obj of sampleObjects) {
                    await new Promise((resolve) => setTimeout(resolve, 10)) // 1 sec
                    obj.visible = true
                }

                if (onComplete) onComplete()
            }

            showSequentially()
        }, [scene, onComplete])
        return null
    }

    return (
        <>
            <Canvas
                className="cursor-crosshair"
                style={{ backgroundColor: canvasBackgroundColor }}
                camera={{ position: [20, 20, 20] }}
                gl={{ antialias: true }}
                renderpriority={0}
                shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
                onDoubleClick={(e) => {
                    setSnaping(true)
                }}
                onChange={(e) => camera.updateProjectionMatrix()}
                // dpr={dprValue}
                dpr={[1, 2]}
            >
                <directionalLight
                    color={0xffffff}
                    intensity={Math.max(lightIntensity, 0)} // instead of conditional rendering
                    castShadow
                    position={[200, 200, 0]}
                />

                {isOrthographic ? (
                    <OrthographicCamera
                        makeDefault
                        position={[20, 20, 20]}
                        zoom={50}
                    />
                ) : (
                    <PerspectiveCamera fov={cameraFov} />
                )}

                {snaping && <SnapCameraPositionAndRotation />}

                {(gridPlaneX || gridPlaneY || gridPlaneZ) && (
                    <group>
                        {gridPlaneX && (
                            <gridHelper
                                scale={2}
                                rotation={[0, 0, 0]}
                                args={[50, 50, `#DE3163`, `#D3D3D3`]}
                            />
                        )}

                        {gridPlaneY && (
                            <gridHelper
                                scale={2}
                                rotation={[Math.PI / 2, 0, 0]}
                                args={[50, 50, `#50C878`, `#D3D3D3`]}
                            />
                        )}

                        {gridPlaneZ && (
                            <gridHelper
                                scale={2}
                                rotation={[0, 0, Math.PI / 2]}
                                args={[50, 50, `#0096FF`, `#D3D3D3`]}
                            />
                        )}
                    </group>
                )}
                <ambientLight intensity={1} color="#FFFFFF" />
                <SmoothFOV />
                <OrbitControls
                    ref={orbitControlsRef}
                    minDistance={20} // how close user can zoom in
                    maxDistance={200} // how far user can zoom out
                    enabled={true}
                    enableRotate={!orbitalLock}
                    enablePan={!orbitalLock}
                    enableZoom={true}
                    enableDamping={false}
                    maxZoom={200}
                    minZoom={20}
                />
                <CanvasOperations id={id} />

                {/* <GizmoHelper
                    alignment="center-right" // Position the gizmo in the bottom-right corner
                    margin={[80, 80]} // Add margin from the corner
                >
                    <GizmoViewport
                        axisColors={['red', 'green', 'blue']} // Set custom colors for the axes
                        labelColor="black" // Set the label color for "X", "Y", "Z"
                    />
                </GizmoHelper> */}
                {sequentialLoading && (
                    <SequentialLoader
                        onComplete={() => setSequentialLoading(false)}
                    />
                )}
                {postProcess && <SceneComposer />}
            </Canvas>
        </>
    )
}

export default Canvas3d
