import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three/webgpu' // The WebGPU build
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber'
import {
    GizmoHelper,
    GizmoViewport,
    OrbitControls,
    OrthographicCamera,
    PerspectiveCamera,
    Stats,
} from '@react-three/drei'
import { Perf } from 'r3f-perf'

extend(THREE)

import { EffectComposer, Bloom } from '@react-three/postprocessing'

import { canvasViewStore } from '../../hooks/useCanvasViewStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'

import CanvasOperations from './canvas/CanvasOperations'

const Canvas3d = ({ id }) => {
    const {
        orbitalLock,
        dprValue,
        isOrthographic,
        setIsOrthographic,
        cameraFov,
        gridPlaneX,
        gridPlaneY,
        gridPlaneZ,
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

        // Current vector from camera to target
        const camToTarget = new THREE.Vector3()
        camToTarget.subVectors(camera.position, target)

        // Current zoom distance (length)
        const zoomDist = camToTarget.length()

        // Direction vector normalized
        const direction = camToTarget.clone().normalize()

        // Absolute direction values
        const absDir = {
            x: Math.abs(direction.x),
            y: Math.abs(direction.y),
            z: Math.abs(direction.z),
        }

        // Decide dominant axis and sign but keep the zoom distance same
        let snapPosition = new THREE.Vector3()

        if (absDir.x > absDir.y && absDir.x > absDir.z) {
            // Snap along X axis
            snapPosition.set(direction.x > 0 ? 1 : -1, 0, 0)
        } else if (absDir.y > absDir.x && absDir.y > absDir.z) {
            // Snap along Y axis
            snapPosition.set(0, direction.y > 0 ? 1 : -1, 0)
        } else {
            // Snap along Z axis
            snapPosition.set(0, 0, direction.z > 0 ? 1 : -1)
        }

        // Scale snapPosition to the original zoom distance to keep same zoom
        snapPosition.multiplyScalar(zoomDist)

        // Place camera position relative to target
        camera.position.copy(target).add(snapPosition)

        // Do NOT change camera rotation: keep current rotation so no lookAt call

        // Update controls target
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
                // if (child.userData?.type === 'Line') {
                child.visible = false
                // child.castShadow = true
                // child.receiveShadow = true
                sampleObjects.push(child)
                // }
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

    const createWebGPURenderer = async (props) => {
        const renderer = new THREE.WebGPURenderer({
            ...props,
            forceWebGL: true,
        })
        await renderer.init()
        return renderer
    }

    // Hide lines
    return (
        <>
            <Canvas
                className="cursor-crosshair"
                style={{ backgroundColor: canvasBackgroundColor }}
                camera={{ position: [20, 20, 20] }}
                shadows={{ type: THREE.PCFSoftShadowMap, enabled: true }}
                onDoubleClick={(e) => {
                    setSnaping(true)
                }}
                onChange={(e) => camera.updateProjectionMatrix()}
                dpr={1}
            >
                <directionalLight
                    color={0xffffff}
                    intensity={Math.max(lightIntensity, 0)}
                    castShadow={true}
                    position={[150, 150, -150]}
                    shadow-camera-top={250}
                    shadow-camera-bottom={-250}
                    shadow-camera-left={250}
                    shadow-camera-right={-250}
                    shadow-bias={-0.01}
                    shadow-normalBias={0.1}
                    shadow-camera-near={0.1}
                    shadow-camera-far={400}
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
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
                {/* <Perf position="bottom-right" /> */}

                {(gridPlaneX || gridPlaneY || gridPlaneZ) && (
                    <group>
                        {gridPlaneX && (
                            <gridHelper
                                scale={1}
                                rotation={[0, 0, 0]}
                                args={[50, 50, `#DE3163`, `#D3D3D3`]}
                            />
                        )}

                        {gridPlaneY && (
                            <gridHelper
                                rotation={[Math.PI / 2, 0, 0]}
                                args={[50, 50, `#50C878`, `#D3D3D3`]}
                            />
                        )}

                        {gridPlaneZ && (
                            <gridHelper
                                rotation={[0, 0, Math.PI / 2]}
                                args={[50, 50, `#0096FF`, `#D3D3D3`]}
                            />
                        )}
                    </group>
                )}
                <ambientLight intensity={10} color="#FFFFFF" />
                <SmoothFOV />
                <OrbitControls
                    ref={orbitControlsRef}
                    minDistance={20} // how close user can zoom in
                    maxDistance={150} // how far user can zoom out
                    enabled={true}
                    enableRotate={!orbitalLock}
                    enablePan={!orbitalLock}
                    enableZoom={true}
                    enableDamping={false}
                    maxZoom={200}
                    minZoom={10}
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
