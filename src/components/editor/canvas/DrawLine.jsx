import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js'
import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { saveSceneLinesToIndexDB } from '../../../helpers/sceneFunction'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const DrawLine = ({ id }) => {
    const { camera, scene, gl } = useThree()
    const planeRef = useRef()

    // Tension control state and refs
    const holdTimerRef = useRef(null)
    const lastPointRef = useRef(null)
    const tensionModeRef = useRef(false)
    const originalMirrorDataRef = useRef({}) // Store original mirror data for tension
    const initialTensionYRef = useRef(0)
    const [tension, setTension] = useState(0.5)

    // Store original points and EXACT WIDTHS for tension recalculation
    const originalPointsRef = useRef([])
    const originalPressuresRef = useRef([])
    const originalNormalsRef = useRef([])
    const originalStrokeWidthsRef = useRef([]) // Store exact w and h for each point

    // Use refs instead of let variables for persistence
    const pointsRef = useRef([])
    const pressuresRef = useRef([])
    const normalsRef = useRef([])
    const currentMeshRef = useRef(null)
    const startPointRef = useRef(null)
    const currentNormalRef = useRef(null)
    const isDrawingRef = useRef(false)
    const mirrorDataRef = useRef({})
    const mirrorMeshesRef = useRef({})

    // const drawPointCountRef = useRef(0)
    const cachedWorldMatrixRef = useRef(null)
    const cachedWorldMatrixInverseRef = useRef(null)

    const {
        mirror,
        strokeType,
        strokeColor,
        strokeWidth,
        pressureMode,
        drawShapeType,
        strokeOpacity,
        activeMaterialType,
        strokeStablePercentage,
        dynamicDrawingPlaneMesh,
    } = canvasDrawStore((state) => state)

    const { activeGroup } = canvasRenderStore((state) => state)

    const MAX_POINTS = 50000
    const SMOOTH_PERCENTAGE = strokeStablePercentage
    const DISTANCE_THRESHOLD = 0.03
    const OPTIMIZATION_THRESHOLD = 0.15
    const SIMPLIFY_PERCENTAGE = 0.0

    // Tension control constants
    const HOLD_DURATION = 1000 // 5 seconds
    const HOLD_THRESHOLD = 0.02 // Distance threshold for "holding still"
    const TENSION_SENSITIVITY = 0.005 // Screen Y movement sensitivity

    const isMirroring = mirror.x || mirror.y || mirror.z
    const color = new THREE.Color(strokeColor)

    const getAdaptiveStrokWidth = (pressure, width) => {
        let w, h
        switch (strokeType) {
            case 'taper':
                w = (pressure * width) / 2
                h = (pressure * width) / 2
                break
            case 'cube':
                w = (pressure * width) / 2
                h = (pressure * width) / 2
                break
            case 'paint':
                w = (pressure * width) / 2
                h = 0.01
                break
            case 'belt':
                w = 0.01
                h = (pressure * width) / 2
                break
            default:
                break
        }
        return { w, h }
    }

    const getActiveMirrorModes = () => {
        let mirrorString = []
        if (mirror.x) mirrorString.push('X')
        if (mirror.y) mirrorString.push('Y')
        if (mirror.z) mirrorString.push('Z')
        return mirrorString
    }

    const getMirroredPoint = useCallback(
        (point, normal, mirrorAxis, planeMesh) => {
            if (!point || !normal || !mirrorAxis || !planeMesh)
                return {
                    mirroredPoint: null,
                    mirroredNormal: null,
                }

            if (!cachedWorldMatrixRef.current) {
                cachedWorldMatrixRef.current = planeMesh.matrixWorld.clone()
                cachedWorldMatrixInverseRef.current = new THREE.Matrix4()
                    .copy(planeMesh.matrixWorld)
                    .invert()
            }

            const worldMatrix = cachedWorldMatrixRef.current
            const worldMatrixInverse = cachedWorldMatrixInverseRef.current

            const localPoint = point.clone().applyMatrix4(worldMatrixInverse)
            const localNormal = normal
                .clone()
                .transformDirection(worldMatrixInverse)
                .normalize()

            const mirroredLocalPoint = localPoint.clone()
            const mirroredLocalNormal = localNormal.clone()

            if (mirrorAxis === 'X') {
                mirroredLocalPoint.x *= -1
                mirroredLocalNormal.x *= -1
            } else if (mirrorAxis === 'Y') {
                mirroredLocalPoint.y *= -1
                mirroredLocalNormal.y *= -1
            } else if (mirrorAxis === 'Z') {
                mirroredLocalPoint.z *= -1
                mirroredLocalNormal.z *= -1
            }

            const mirroredPoint = mirroredLocalPoint.applyMatrix4(worldMatrix)
            const mirroredNormal = mirroredLocalNormal
                .transformDirection(worldMatrix)
                .normalize()

            return {
                mirroredPoint,
                mirroredNormal,
            }
        },
        []
    )

    const generateCirclePointsWorld2 = useCallback(
        (center, normal, radius, segments = 64) => {
            const circlePoints = []
            const circleNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                circlePoints.push(tempVector.clone())
                circleNormals.push(normal.clone())
            }

            return {
                circlePoints,
                circleNormals,
            }
        },
        []
    )

    const generateCirclePointsWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const circlePoints = []
            const circleNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                circlePoints.push(tempVector.clone())
                circleNormals.push(normal.clone())
            }

            return {
                circlePoints,
                circleNormals,
            }
        },
        []
    )

    const generateSquarePointsWorld = useCallback(
        (
            center,
            normal,
            radius,
            { cornerSegments = 8, segments = 64 } = {}
        ) => {
            const squarePoints = []
            const squareNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            const sideLength = radius * Math.sqrt(2)
            const halfSide = sideLength / 2

            const cornerRadiusFactor = 0.15
            const cornerRadius = sideLength * cornerRadiusFactor
            const straightLength = halfSide - cornerRadius

            const corners = [
                {
                    x: straightLength,
                    y: straightLength,
                    startAngle: 0,
                    endAngle: Math.PI / 2,
                },
                {
                    x: -straightLength,
                    y: straightLength,
                    startAngle: Math.PI / 2,
                    endAngle: Math.PI,
                },
                {
                    x: -straightLength,
                    y: -straightLength,
                    startAngle: Math.PI,
                    endAngle: Math.PI * 1.5,
                },
                {
                    x: straightLength,
                    y: -straightLength,
                    startAngle: Math.PI * 1.5,
                    endAngle: Math.PI * 2,
                },
            ]

            const pointsPerSide = Math.floor(segments / 4)
            const pointsPerCorner = cornerSegments

            corners.forEach((corner, idx) => {
                const nextCorner = corners[(idx + 1) % 4]

                for (let i = 0; i < pointsPerCorner; i++) {
                    const t = i / pointsPerCorner
                    const angle =
                        corner.startAngle +
                        t * (corner.endAngle - corner.startAngle)
                    tempVector.set(
                        corner.x + cornerRadius * Math.cos(angle),
                        corner.y + cornerRadius * Math.sin(angle),
                        0
                    )
                    tempVector.applyQuaternion(tempQuaternion).add(center)
                    squarePoints.push(tempVector.clone())
                    squareNormals.push(normal.clone())
                }

                const edgeStart = {
                    x: corner.x + cornerRadius * Math.cos(corner.endAngle),
                    y: corner.y + cornerRadius * Math.sin(corner.endAngle),
                }
                const edgeEnd = {
                    x:
                        nextCorner.x +
                        cornerRadius * Math.cos(nextCorner.startAngle),
                    y:
                        nextCorner.y +
                        cornerRadius * Math.sin(nextCorner.startAngle),
                }

                for (let i = 1; i < pointsPerSide; i++) {
                    const t = i / pointsPerSide
                    tempVector.set(
                        edgeStart.x + t * (edgeEnd.x - edgeStart.x),
                        edgeStart.y + t * (edgeEnd.y - edgeStart.y),
                        0
                    )
                    tempVector.applyQuaternion(tempQuaternion).add(center)
                    squarePoints.push(tempVector.clone())
                    squareNormals.push(normal.clone())
                }
            })

            squarePoints.push(squarePoints[0].clone())
            squareNormals.push(normal.clone())

            return {
                squarePoints: squarePoints,
                squareNormals: squareNormals,
            }
        },
        []
    )

    const generateSemiCirclePointsWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const semiCirclePoints = []
            const semiCircleNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            const arcSegments = Math.floor(segments * 0.6)
            for (let i = 0; i <= arcSegments; i++) {
                const angle = Math.PI + (i / arcSegments) * Math.PI
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                semiCirclePoints.push(tempVector.clone())
                semiCircleNormals.push(normal.clone())
            }

            const baseSegments = Math.floor(segments * 0.4)
            for (let i = 1; i < baseSegments; i++) {
                const t = i / baseSegments
                tempVector.set(radius - t * (2 * radius), 0, 0)
                tempVector.applyQuaternion(tempQuaternion).add(center)
                semiCirclePoints.push(tempVector.clone())
                semiCircleNormals.push(normal.clone())
            }

            semiCirclePoints.push(semiCirclePoints[0].clone())
            semiCircleNormals.push(normal.clone())

            return {
                circlePoints: semiCirclePoints,
                circleNormals: semiCircleNormals,
            }
        },
        []
    )

    const generateSemiCircleOpenArcWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const arcPoints = []
            const arcNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            for (let i = 0; i <= segments; i++) {
                const angle = Math.PI + (i / segments) * Math.PI
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                arcPoints.push(tempVector.clone())
                arcNormals.push(normal.clone())
            }

            return {
                arcPoints: arcPoints,
                arcNormals: arcNormals,
            }
        },
        []
    )

    // Apply tension to points
    const applyTensionToPoints = useCallback((points, tensionValue) => {
        if (points.length < 2) return points

        const tensionedPoints = []
        const start = points[0]
        const end = points[points.length - 1]

        tensionedPoints.push(start.clone())

        for (let i = 1; i < points.length - 1; i++) {
            const t = i / (points.length - 1)
            const straightPoint = new THREE.Vector3().lerpVectors(start, end, t)
            const tensionedPoint = new THREE.Vector3().lerpVectors(
                points[i],
                straightPoint,
                tensionValue
            )
            tensionedPoints.push(tensionedPoint)
        }

        tensionedPoints.push(end.clone())

        return tensionedPoints
    }, [])

    const smoothPoints = useCallback((points, percentage) => {
        if (percentage === 0 || points.length < 3) return points

        const maxWindowSize = 10
        const windowSize = Math.ceil((percentage / 100) * maxWindowSize)

        const actualWindowSize = Math.max(
            1,
            Math.min(windowSize, Math.floor((points.length - 1) / 2))
        )

        const smoothed = []
        for (let i = 0; i < points.length; i++) {
            const sum = new THREE.Vector3()
            let count = 0

            for (let j = -actualWindowSize; j <= actualWindowSize; j++) {
                const index = i + j
                if (index >= 0 && index < points.length) {
                    sum.add(points[index])
                    count++
                }
            }
            smoothed.push(sum.divideScalar(count))
        }
        return smoothed
    }, [])

    const smoothArray = (arr, percentage) => {
        const maxWindowSize = 10
        const windowSize = Math.ceil((percentage / 100) * maxWindowSize)
        const actualWindowSize = Math.max(
            1,
            Math.min(windowSize, Math.floor((arr.length - 1) / 2))
        )
        const smoothed = []

        for (let i = 0; i < arr.length; i++) {
            let sum = 0
            let count = 0

            for (let j = -actualWindowSize; j <= actualWindowSize; j++) {
                const index = i + j
                if (index >= 0 && index < arr.length) {
                    sum += arr[index]
                    count++
                }
            }
            smoothed.push(sum / count)
        }

        return smoothed
    }

    const filterPoints = useCallback((pts, pressures, normals, tolerance) => {
        if (pts.length < 2)
            return {
                filteredPts: pts,
                filteredPressures: pressures,
                filteredNormals: normals,
            }

        const filteredPts = [pts[0]]
        const filteredPressures = [pressures[0]]
        const filteredNormals = [normals[0]]

        let lastKeptIndex = 0

        for (let i = 1; i < pts.length; i++) {
            if (pts[i].distanceTo(pts[lastKeptIndex]) >= tolerance) {
                filteredPts.push(pts[i])
                filteredPressures.push(pressures[i])
                filteredNormals.push(normals[i])
                lastKeptIndex = i
            }
        }

        if (lastKeptIndex !== pts.length - 1) {
            filteredPts.push(pts[pts.length - 1])
            filteredPressures.push(pressures[pressures.length - 1])
            filteredNormals.push(normals[normals.length - 1])
        }

        return {
            filteredPts,
            filteredPressures,
            filteredNormals,
        }
    }, [])

    function getSnappedPoint(start, current, maxSnapAngleDeg = 45) {
        const dir = current.clone().sub(start)
        const angle = Math.atan2(dir.y, dir.x)
        const snapAngle = THREE.MathUtils.degToRad(maxSnapAngleDeg)

        const snappedAngle = Math.round(angle / snapAngle) * snapAngle

        const length = dir.length()
        const snappedDir = new THREE.Vector3(
            Math.cos(snappedAngle),
            Math.sin(snappedAngle),
            0
        ).multiplyScalar(length)

        return start.clone().add(snappedDir)
    }

    function createInitialLineMesh() {
        const maxVertices = MAX_POINTS * 4
        const positions = new Float32Array(maxVertices * 3)
        const meshNormals = new Float32Array(maxVertices * 3)
        const indices = new Uint32Array(MAX_POINTS * 24)

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        )
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(meshNormals, 3)
        )
        geometry.setIndex(new THREE.BufferAttribute(indices, 1))
        geometry.setDrawRange(0, 0)

        let material
        switch (activeMaterialType) {
            case 'flat':
                material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(strokeColor),
                    transparent: strokeOpacity < 1,
                    opacity: strokeOpacity,
                    side: THREE.DoubleSide,
                    depthTest: true,
                    depthWrite: strokeOpacity >= 1,
                    blending:
                        strokeOpacity < 1
                            ? THREE.AdditiveBlending
                            : THREE.NormalBlending,
                })
                break

            case 'shaded':
                material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(strokeColor),
                    transparent: strokeOpacity < 1,
                    opacity: strokeOpacity,
                    side: THREE.DoubleSide,
                    depthTest: true,
                    depthWrite: strokeOpacity >= 1,
                    metalness: 0.0,
                    roughness: 1.0,
                    alphaToCoverage: true,
                    premultipliedAlpha: false,
                    blending:
                        strokeOpacity < 1
                            ? THREE.NormalBlending
                            : THREE.NormalBlending,
                    flatShading: true,
                })
                break

            case 'glow':
                material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(strokeColor),
                    wireframe: false,
                    emissive: new THREE.Color(strokeColor),
                    transparent: true,
                    opacity: strokeOpacity,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                    emissiveIntensity: 1,
                })
                break

            default:
                break
        }

        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        return mesh
    }

    const startHoldTimer = (point) => {
        // ONLY start hold timer for free_hand drawing
        if (drawShapeType !== 'free_hand') return

        lastPointRef.current = point.clone()

        holdTimerRef.current = setTimeout(() => {
            // After 5 seconds, enable tension mode
            tensionModeRef.current = true

            // Store original smoothed points and EXACT stroke widths
            if (pointsRef.current.length > 0) {
                const smoothed = smoothPoints(
                    [...pointsRef.current],
                    SMOOTH_PERCENTAGE
                )
                const smoothedPressures = smoothArray(
                    [...pressuresRef.current],
                    SMOOTH_PERCENTAGE
                )

                originalPointsRef.current = smoothed.map((p) => p.clone())
                originalPressuresRef.current = [...smoothedPressures]
                originalNormalsRef.current = [...normalsRef.current]

                // Calculate and store exact stroke widths for each point
                originalStrokeWidthsRef.current = []
                for (let i = 0; i < smoothed.length; i++) {
                    let taperFactor = 1
                    if (strokeType === 'taper') {
                        const t = i / (smoothed.length - 1)
                        const taperAmount = 1.0
                        taperFactor =
                            1 -
                            taperAmount +
                            taperAmount * Math.sin(t * Math.PI)
                    }

                    const effectivePressure = smoothedPressures[i] * taperFactor
                    const { w, h } = getAdaptiveStrokWidth(
                        effectivePressure,
                        strokeWidth
                    )
                    originalStrokeWidthsRef.current.push({ w, h })
                }

                // Store original mirror data for tension
                const activeMirrorModes = isMirroring
                    ? getActiveMirrorModes()
                    : []
                originalMirrorDataRef.current = {}

                activeMirrorModes.forEach((mode) => {
                    const mirrorData = mirrorDataRef.current[mode]
                    if (mirrorData && mirrorData.points.length > 0) {
                        const smoothedMirrorPoints = smoothPoints(
                            [...mirrorData.points],
                            SMOOTH_PERCENTAGE
                        )
                        const smoothedMirrorPressures = smoothArray(
                            [...mirrorData.pressures],
                            SMOOTH_PERCENTAGE
                        )

                        originalMirrorDataRef.current[mode] = {
                            points: smoothedMirrorPoints.map((p) => p.clone()),
                            pressures: [...smoothedMirrorPressures],
                            normals: [...mirrorData.normals],
                            strokeWidths: [],
                        }

                        // Calculate and store exact stroke widths for mirror points
                        for (let i = 0; i < smoothedMirrorPoints.length; i++) {
                            let taperFactor = 1
                            if (strokeType === 'taper') {
                                const t = i / (smoothedMirrorPoints.length - 1)
                                const taperAmount = 1.0
                                taperFactor =
                                    1 -
                                    taperAmount +
                                    taperAmount * Math.sin(t * Math.PI)
                            }

                            const effectivePressure =
                                smoothedMirrorPressures[i] * taperFactor
                            const { w, h } = getAdaptiveStrokWidth(
                                effectivePressure,
                                strokeWidth
                            )
                            originalMirrorDataRef.current[
                                mode
                            ].strokeWidths.push({ w, h })
                        }
                    }
                })

                // console.log(
                //     '🎯 Tension mode ON (free_hand only)! Points:',
                //     originalPointsRef.current.length
                // )
            }
        }, HOLD_DURATION)
    }

    const clearHoldTimer = () => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current)
            holdTimerRef.current = null
        }
        lastPointRef.current = null
    }

    const updateTensionAndLine = useCallback(
        (clientY) => {
            if (
                !tensionModeRef.current ||
                originalPointsRef.current.length === 0
            ) {
                return
            }

            // Calculate tension based on screen Y position
            const deltaY = initialTensionYRef.current - clientY

            let newTension = 0.5 + deltaY * TENSION_SENSITIVITY
            newTension = Math.max(0, Math.min(1, newTension))

            setTension(newTension)
            // console.log('Updating tension:', newTension.toFixed(2))

            // Apply tension to the original smoothed points
            const tensionedPoints = applyTensionToPoints(
                originalPointsRef.current,
                newTension
            )

            // Update the line with tensioned points and EXACT stored widths
            if (
                currentMeshRef.current &&
                originalStrokeWidthsRef.current.length > 0
            ) {
                updateLineWithTensionAndStoredWidths(
                    currentMeshRef.current,
                    tensionedPoints,
                    originalNormalsRef.current,
                    originalStrokeWidthsRef.current
                )
            }

            // Apply tension to mirror lines as well
            const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []
            activeMirrorModes.forEach((mode) => {
                const originalMirrorData = originalMirrorDataRef.current[mode]
                if (originalMirrorData && mirrorMeshesRef.current[mode]) {
                    const tensionedMirrorPoints = applyTensionToPoints(
                        originalMirrorData.points,
                        newTension
                    )

                    updateLineWithTensionAndStoredWidths(
                        mirrorMeshesRef.current[mode],
                        tensionedMirrorPoints,
                        originalMirrorData.normals,
                        originalMirrorData.strokeWidths
                    )
                }
            })
        },
        [applyTensionToPoints, isMirroring, getActiveMirrorModes]
    )

    // New function to update line with stored exact widths
    function updateLineWithTensionAndStoredWidths(
        mesh,
        tensionedPoints,
        normals,
        storedWidths
    ) {
        if (tensionedPoints.length < 2) return

        const geometry = mesh.geometry

        // Filter the tensioned points
        let pts = tensionedPoints
        let finalNormals = normals
        let finalWidths = storedWidths

        // Apply filtering
        if (pts.length >= 2) {
            const filteredPts = [pts[0]]
            const filteredNormals = [normals[0]]
            const filteredWidths = [storedWidths[0]]

            let lastKeptIndex = 0

            for (let i = 1; i < pts.length; i++) {
                if (
                    pts[i].distanceTo(pts[lastKeptIndex]) >=
                    OPTIMIZATION_THRESHOLD
                ) {
                    filteredPts.push(pts[i])
                    filteredNormals.push(normals[i])
                    filteredWidths.push(storedWidths[i])
                    lastKeptIndex = i
                }
            }

            if (lastKeptIndex !== pts.length - 1) {
                filteredPts.push(pts[pts.length - 1])
                filteredNormals.push(normals[normals.length - 1])
                filteredWidths.push(storedWidths[storedWidths.length - 1])
            }

            pts = filteredPts
            finalNormals = filteredNormals
            finalWidths = filteredWidths
        }

        if (pts.length < 2) return

        const positions = []
        const meshNormals = []
        const indices = []

        const tangents = []
        for (let i = 0; i < pts.length - 1; i++) {
            tangents.push(
                new THREE.Vector3().subVectors(pts[i + 1], pts[i]).normalize()
            )
        }

        if (pts.length === 2 && tangents.length === 0) {
            tangents.push(
                new THREE.Vector3().subVectors(pts[1], pts[0]).normalize()
            )
        }

        const transportedRights = []
        let right = new THREE.Vector3()
            .crossVectors(
                finalNormals[0],
                tangents[0] || new THREE.Vector3(1, 0, 0)
            )
            .normalize()

        if (right.lengthSq() < 1e-6) {
            right.set(0, 1, 0)
            if (tangents.length > 0 && Math.abs(tangents[0].dot(right)) > 0.99)
                right.set(1, 0, 0)
            if (tangents.length > 0)
                right.crossVectors(finalNormals[0], tangents[0]).normalize()
            else
                right
                    .crossVectors(finalNormals[0], new THREE.Vector3(1, 0, 0))
                    .normalize()
        }
        transportedRights.push(right.clone())

        for (let i = 1; i < tangents.length; i++) {
            const prevT = tangents[i - 1]
            const currT = tangents[i]
            const axis = new THREE.Vector3().crossVectors(prevT, currT)
            const angle = Math.acos(Math.max(-1, Math.min(1, prevT.dot(currT))))

            if (axis.lengthSq() < 1e-6 || angle === 0) {
                transportedRights.push(transportedRights[i - 1].clone())
            } else {
                const q = new THREE.Quaternion().setFromAxisAngle(
                    axis.normalize(),
                    angle
                )
                transportedRights.push(
                    transportedRights[i - 1]
                        .clone()
                        .applyQuaternion(q)
                        .normalize()
                )
            }
        }

        for (let i = 0; i < pts.length; i++) {
            const curr = pts[i]
            const tangent =
                i === pts.length - 1
                    ? tangents[i - 1]
                    : tangents[i] || tangents[0]
            const rightVec =
                transportedRights[i] ||
                transportedRights[transportedRights.length - 1]
            const up = new THREE.Vector3()
                .crossVectors(tangent, rightVec)
                .normalize()

            // Use stored exact widths
            const widthIndex = Math.min(i, finalWidths.length - 1)
            const halfW = finalWidths[widthIndex].w
            const halfH = finalWidths[widthIndex].h

            const tl = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, -halfW)
                .addScaledVector(up, halfH)
            const tr = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, halfW)
                .addScaledVector(up, halfH)
            const br = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, halfW)
                .addScaledVector(up, -halfH)
            const bl = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, -halfW)
                .addScaledVector(up, -halfH)

            const normal = finalNormals[i].clone()
            const baseIdx = positions.length / 3

            ;[tl, tr, br, bl, tl, tr, br, bl].forEach((v) => {
                positions.push(v.x, v.y, v.z)
                meshNormals.push(normal.x, normal.y, normal.z)
            })

            if (i > 0) {
                const prevBase = baseIdx - 4
                indices.push(prevBase, prevBase + 1, baseIdx + 1)
                indices.push(prevBase, baseIdx + 1, baseIdx)
                indices.push(prevBase + 1, prevBase + 2, baseIdx + 2)
                indices.push(prevBase + 1, baseIdx + 2, baseIdx + 1)
                indices.push(prevBase + 2, prevBase + 3, baseIdx + 3)
                indices.push(prevBase + 2, baseIdx + 3, baseIdx + 2)
                indices.push(prevBase + 3, prevBase, baseIdx)
                indices.push(prevBase + 3, baseIdx, baseIdx + 3)
            }
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        )
        geometry.setAttribute(
            'normal',
            new THREE.Float32BufferAttribute(meshNormals, 3)
        )

        geometry.setIndex(indices)

        geometry.attributes.position.needsUpdate = true
        geometry.attributes.normal.needsUpdate = true
        geometry.index.needsUpdate = true
        geometry.setDrawRange(0, indices.length)

        if (mesh.material) {
            mesh.material.needsUpdate = true
        }
    }

    function updateLine(mesh, rawPts, pressuresArr, normalsArr) {
        if (rawPts.length < 2) return

        const geometry = mesh.geometry

        let pts = rawPts
        let pressures = pressuresArr
        let finalNormals = normalsArr

        if (drawShapeType === 'free_hand' && !tensionModeRef.current) {
            pts = smoothPoints(rawPts, SMOOTH_PERCENTAGE)
            pressures = smoothArray(pressuresArr, SMOOTH_PERCENTAGE)
            const filteredResult = filterPoints(
                pts,
                pressures,
                normalsArr,
                OPTIMIZATION_THRESHOLD
            )
            pts = filteredResult.filteredPts
            pressures = filteredResult.filteredPressures
            finalNormals = filteredResult.filteredNormals
        } else if (drawShapeType === 'straight') {
            const filteredResult = filterPoints(
                pts,
                pressures,
                normalsArr,
                OPTIMIZATION_THRESHOLD
            )
            pts = filteredResult.filteredPts
            pressures = filteredResult.filteredPressures
            finalNormals = filteredResult.filteredNormals
        }

        if (pts.length < 2) return

        const positions = []
        const meshNormals = []
        const indices = []

        const tangents = []
        for (let i = 0; i < pts.length - 1; i++) {
            tangents.push(
                new THREE.Vector3().subVectors(pts[i + 1], pts[i]).normalize()
            )
        }

        if (pts.length === 2 && tangents.length === 0) {
            tangents.push(
                new THREE.Vector3().subVectors(pts[1], pts[0]).normalize()
            )
        }

        const transportedRights = []
        let right = new THREE.Vector3()
            .crossVectors(
                finalNormals[0],
                tangents[0] || new THREE.Vector3(1, 0, 0)
            )
            .normalize()

        if (right.lengthSq() < 1e-6) {
            right.set(0, 1, 0)
            if (tangents.length > 0 && Math.abs(tangents[0].dot(right)) > 0.99)
                right.set(1, 0, 0)
            if (tangents.length > 0)
                right.crossVectors(finalNormals[0], tangents[0]).normalize()
            else
                right
                    .crossVectors(finalNormals[0], new THREE.Vector3(1, 0, 0))
                    .normalize()
        }
        transportedRights.push(right.clone())

        for (let i = 1; i < tangents.length; i++) {
            const prevT = tangents[i - 1]
            const currT = tangents[i]
            const axis = new THREE.Vector3().crossVectors(prevT, currT)
            const angle = Math.acos(Math.max(-1, Math.min(1, prevT.dot(currT))))

            if (axis.lengthSq() < 1e-6 || angle === 0) {
                transportedRights.push(transportedRights[i - 1].clone())
            } else {
                const q = new THREE.Quaternion().setFromAxisAngle(
                    axis.normalize(),
                    angle
                )
                transportedRights.push(
                    transportedRights[i - 1]
                        .clone()
                        .applyQuaternion(q)
                        .normalize()
                )
            }
        }

        for (let i = 0; i < pts.length; i++) {
            const curr = pts[i]
            const tangent =
                i === pts.length - 1
                    ? tangents[i - 1]
                    : tangents[i] || tangents[0]
            const rightVec =
                transportedRights[i] ||
                transportedRights[transportedRights.length - 1]
            const up = new THREE.Vector3()
                .crossVectors(tangent, rightVec)
                .normalize()

            let taperFactor
            if (strokeType === 'taper') {
                const t = i / (pts.length - 1)
                const taperAmount = 1.0
                taperFactor =
                    1 - taperAmount + taperAmount * Math.sin(t * Math.PI)
            }

            const effectivePressure =
                pressures[i] * (strokeType === 'taper' ? taperFactor : 1)

            let { w, h } = getAdaptiveStrokWidth(effectivePressure, strokeWidth)

            const halfW = w
            const halfH = h

            const tl = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, -halfW)
                .addScaledVector(up, halfH)
            const tr = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, halfW)
                .addScaledVector(up, halfH)
            const br = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, halfW)
                .addScaledVector(up, -halfH)
            const bl = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, -halfW)
                .addScaledVector(up, -halfH)

            const normal = finalNormals[i].clone()
            const baseIdx = positions.length / 3

            ;[tl, tr, br, bl, tl, tr, br, bl].forEach((v) => {
                positions.push(v.x, v.y, v.z)
                meshNormals.push(normal.x, normal.y, normal.z)
            })

            if (i > 0) {
                const prevBase = baseIdx - 4
                indices.push(prevBase, prevBase + 1, baseIdx + 1)
                indices.push(prevBase, baseIdx + 1, baseIdx)
                indices.push(prevBase + 1, prevBase + 2, baseIdx + 2)
                indices.push(prevBase + 1, baseIdx + 2, baseIdx + 1)
                indices.push(prevBase + 2, prevBase + 3, baseIdx + 3)
                indices.push(prevBase + 2, baseIdx + 3, baseIdx + 2)
                indices.push(prevBase + 3, prevBase, baseIdx)
                indices.push(prevBase + 3, baseIdx, baseIdx + 3)
            }
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        )
        geometry.setAttribute(
            'normal',
            new THREE.Float32BufferAttribute(meshNormals, 3)
        )

        geometry.setIndex(indices)

        geometry.attributes.position.needsUpdate = true
        geometry.attributes.normal.needsUpdate = true
        geometry.index.needsUpdate = true
        geometry.setDrawRange(0, indices.length)

        if (mesh.material) {
            mesh.material.color.copy(color)
            mesh.material.opacity = strokeOpacity
            mesh.material.flatShading = true
            // mesh.material.needsUpdate = true
        }
    }

    function startDrawing(event) {
        if (!planeRef.current) return

        isDrawingRef.current = true
        tensionModeRef.current = false
        setTension(0.5)
        originalPointsRef.current = []
        originalPressuresRef.current = []
        originalNormalsRef.current = []
        originalStrokeWidthsRef.current = []
        originalMirrorDataRef.current = {} // Clear mirror tension data
        pointsRef.current = []
        pressuresRef.current = []
        normalsRef.current = []
        mirrorDataRef.current = {}

        // Clear caches
        // drawPointCountRef.current = 0
        cachedWorldMatrixRef.current = null
        cachedWorldMatrixInverseRef.current = null

        Object.values(mirrorMeshesRef.current).forEach((mesh) => {
            scene.remove(mesh)
            if (mesh.geometry) mesh.geometry.dispose()
            if (mesh.material) mesh.material.dispose()
        })
        mirrorMeshesRef.current = {}

        const intersection = getPlaneIntersection(event)
        if (!intersection) return
        const { point, normal } = intersection

        startPointRef.current = point.clone()
        currentNormalRef.current = normal.clone()
        currentMeshRef.current = createInitialLineMesh()

        const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []

        activeMirrorModes.forEach((mode) => {
            mirrorMeshesRef.current[mode] = createInitialLineMesh()
            mirrorDataRef.current[mode] = {
                points: [],
                pressures: [],
                normals: [],
            }
        })

        const pressure = pressureMode ? event.pressure : 1.0

        pointsRef.current.push(startPointRef.current.clone())
        pressuresRef.current.push(pressure)
        normalsRef.current.push(currentNormalRef.current)

        activeMirrorModes.forEach((mode) => {
            const { mirroredPoint, mirroredNormal } = getMirroredPoint(
                startPointRef.current,
                currentNormalRef.current,
                mode,
                planeRef.current
            )
            mirrorDataRef.current[mode].points.push(mirroredPoint.clone())
            mirrorDataRef.current[mode].pressures.push(pressure)
            mirrorDataRef.current[mode].normals.push(mirroredNormal)
        })

        // Start hold timer (ONLY for free_hand)
        startHoldTimer(startPointRef.current)
        initialTensionYRef.current = event.clientY

        if (drawShapeType === 'free_hand') {
            const secondPoint = new THREE.Vector3()
                .copy(startPointRef.current)
                .addScalar(0.001)
            pointsRef.current.push(secondPoint)
            pressuresRef.current.push(pressure)
            normalsRef.current.push(currentNormalRef.current)

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorSecondPoint,
                    mirroredNormal: mirrorSecondNormal,
                } = getMirroredPoint(
                    secondPoint,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )
                mirrorDataRef.current[mode].points.push(mirrorSecondPoint)
                mirrorDataRef.current[mode].pressures.push(pressure)
                mirrorDataRef.current[mode].normals.push(mirrorSecondNormal)
            })
        }

        updateLine(
            currentMeshRef.current,
            pointsRef.current,
            pressuresRef.current,
            normalsRef.current
        )

        activeMirrorModes.forEach((mode) => {
            const data = mirrorDataRef.current[mode]
            updateLine(
                mirrorMeshesRef.current[mode],
                data.points,
                data.pressures,
                data.normals
            )
        })
    }

    function getSnappedLinePointsInPlane({
        startPoint,
        currentPoint,
        normal,
        camera,
        snapAngle = 45,
        pointDensity = 0.1,
    }) {
        const delta = new THREE.Vector3().subVectors(currentPoint, startPoint)
        const length = delta.length()

        const planeZ = normal.clone()

        const tempX = new THREE.Vector3().crossVectors(planeZ, camera.up)
        if (tempX.lengthSq() < 0.0001) {
            tempX
                .set(1, 0, 0)
                .applyQuaternion(
                    new THREE.Quaternion().setFromUnitVectors(
                        new THREE.Vector3(0, 0, 1),
                        planeZ
                    )
                )
                .normalize()
        }
        const planeX = tempX.normalize()
        const planeY = new THREE.Vector3()
            .crossVectors(planeX, planeZ)
            .normalize()

        const localDeltaX = delta.dot(planeX)
        const localDeltaY = delta.dot(planeY)

        let angleRad = Math.atan2(localDeltaY, localDeltaX)
        const angleDeg = THREE.MathUtils.radToDeg(angleRad)

        const snappedDeg = Math.round(angleDeg / snapAngle) * snapAngle
        const snappedRad = THREE.MathUtils.degToRad(snappedDeg)

        const snappedDirection = new THREE.Vector3()
            .addScaledVector(planeX, Math.cos(snappedRad))
            .addScaledVector(planeY, Math.sin(snappedRad))
            .normalize()

        const snappedEnd = startPoint
            .clone()
            .addScaledVector(snappedDirection, length)

        const interpolatedPoints = []
        const numSegments = Math.max(1, Math.ceil(length / pointDensity))
        for (let i = 0; i <= numSegments; i++) {
            const t = i / numSegments
            const interpolatedPoint = new THREE.Vector3()
                .copy(startPoint)
                .lerp(snappedEnd, t)
            interpolatedPoints.push(interpolatedPoint)
        }

        return {
            snappedEnd,
            interpolatedPoints,
        }
    }

    function getPlaneBasis(normal, u, v) {
        const temp =
            Math.abs(normal.x) < 0.9
                ? new THREE.Vector3(1, 0, 0)
                : new THREE.Vector3(0, 1, 0)

        u.copy(temp).cross(normal).normalize()
        v.copy(normal).cross(u).normalize()
    }

    function continueDrawing(event) {
        if (!isDrawingRef.current || !planeRef.current) return

        // If in tension mode, update tension based on screen Y position (ONLY for free_hand)
        if (tensionModeRef.current && drawShapeType === 'free_hand') {
            updateTensionAndLine(event.clientY)
            return // Don't do normal drawing
        }

        const intersection = getPlaneIntersection(event)
        if (!intersection) return
        const { point, normal } = intersection

        // Check if pointer moved significantly in 3D space, reset hold timer (ONLY for free_hand)
        if (drawShapeType === 'free_hand' && point && lastPointRef.current) {
            const distance = point.distanceTo(lastPointRef.current)
            if (distance > HOLD_THRESHOLD) {
                clearHoldTimer()
                startHoldTimer(point)
                initialTensionYRef.current = event.clientY
            }
        }

        const pressure = pressureMode ? event.pressure : 1.0
        const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []

        if (drawShapeType === 'free_hand') {
            let newPoint = point.clone()

            const last = pointsRef.current[pointsRef.current.length - 1]
            if (newPoint.distanceTo(last) < DISTANCE_THRESHOLD) return

            pointsRef.current.push(newPoint)
            pressuresRef.current.push(pressure)
            normalsRef.current.push(normal)

            // drawPointCountRef.current++

            activeMirrorModes.forEach((mode) => {
                const { mirroredPoint, mirroredNormal } = getMirroredPoint(
                    newPoint,
                    normal,
                    mode,
                    planeRef.current
                )
                mirrorDataRef.current[mode].points.push(mirroredPoint)
                mirrorDataRef.current[mode].pressures.push(pressure)
                mirrorDataRef.current[mode].normals.push(mirroredNormal)
            })

            if (pointsRef.current.length > MAX_POINTS) {
                pointsRef.current.shift()
                pressuresRef.current.shift()
                normalsRef.current.shift()
                activeMirrorModes.forEach((mode) => {
                    mirrorDataRef.current[mode].points.shift()
                    mirrorDataRef.current[mode].pressures.shift()
                    mirrorDataRef.current[mode].normals.shift()
                })
            }

            updateLine(
                currentMeshRef.current,
                pointsRef.current,
                pressuresRef.current,
                normalsRef.current
            )

            // Skip first 3 points for mirror to avoid initial jerk
            // if (drawPointCountRef.current > 3) {
            activeMirrorModes.forEach((mode) => {
                const data = mirrorDataRef.current[mode]
                updateLine(
                    mirrorMeshesRef.current[mode],
                    data.points,
                    data.pressures,
                    data.normals
                )
            })
            // }
        } else if (drawShapeType === 'straight') {
            if (!startPointRef.current || !currentNormalRef.current) return

            const { snappedEnd, interpolatedPoints } =
                getSnappedLinePointsInPlane({
                    startPoint: startPointRef.current,
                    currentPoint: point,
                    normal,
                    camera,
                    snapAngle: 1,
                    pointDensity: 0.05,
                })

            pointsRef.current.length = 0
            pointsRef.current.push(startPointRef.current.clone())
            pointsRef.current.push(snappedEnd.clone())

            pressuresRef.current.length = 0
            pressuresRef.current.push(pressure)
            pressuresRef.current.push(pressure)

            normalsRef.current.length = 0
            normalsRef.current.push(currentNormalRef.current.clone())
            normalsRef.current.push(normal.clone())

            updateLine(
                currentMeshRef.current,
                pointsRef.current,
                pressuresRef.current,
                normalsRef.current
            )

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirroredStart,
                    mirroredNormal: mirroredNormal1,
                } = getMirroredPoint(
                    startPointRef.current,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )
                const {
                    mirroredPoint: mirroredEnd,
                    mirroredNormal: mirroredNormal2,
                } = getMirroredPoint(snappedEnd, normal, mode, planeRef.current)

                mirrorDataRef.current[mode].points = [
                    mirroredStart,
                    mirroredEnd,
                ]
                mirrorDataRef.current[mode].pressures = [pressure, pressure]
                mirrorDataRef.current[mode].normals = [
                    mirroredNormal1,
                    mirroredNormal2,
                ]

                updateLine(
                    mirrorMeshesRef.current[mode],
                    mirrorDataRef.current[mode].points,
                    mirrorDataRef.current[mode].pressures,
                    mirrorDataRef.current[mode].normals
                )
            })
        } else if (drawShapeType === 'circle') {
            if (!startPointRef.current || !currentNormalRef.current) return

            const radius = startPointRef.current.distanceTo(point)

            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )

            const circlePressures = Array(circlePoints.length).fill(pressure)

            updateLine(
                currentMeshRef.current,
                circlePoints,
                circlePressures,
                circleNormals
            )

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPointRef.current,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )

                const {
                    circlePoints: mirrorCirclePoints,
                    circleNormals: mirrorCircleNormals,
                } = generateCirclePointsWorld(
                    mirrorCenter,
                    mirrorNormal,
                    radius
                )
                const mirrorCirclePressures = Array(
                    mirrorCirclePoints.length
                ).fill(pressure)

                updateLine(
                    mirrorMeshesRef.current[mode],
                    mirrorCirclePoints,
                    mirrorCirclePressures,
                    mirrorCircleNormals
                )
            })
        } else if (drawShapeType === 'square') {
            if (!startPointRef.current || !currentNormalRef.current) return

            const radius = startPointRef.current.distanceTo(point)

            const { squarePoints, squareNormals } = generateSquarePointsWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )

            const squarePressures = Array(squarePoints.length).fill(pressure)

            updateLine(
                currentMeshRef.current,
                squarePoints,
                squarePressures,
                squareNormals
            )

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPointRef.current,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )

                const {
                    squarePoints: mirrorCirclePoints,
                    squareNormals: mirrorCircleNormals,
                } = generateSquarePointsWorld(
                    mirrorCenter,
                    mirrorNormal,
                    radius
                )
                const mirrorCirclePressures = Array(
                    mirrorCirclePoints.length
                ).fill(pressure)

                updateLine(
                    mirrorMeshesRef.current[mode],
                    mirrorCirclePoints,
                    mirrorCirclePressures,
                    mirrorCircleNormals
                )
            })
        } else if (drawShapeType === 'arc') {
            if (!startPointRef.current || !currentNormalRef.current) return

            const radius = startPointRef.current.distanceTo(point)

            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )

            const arcPressures = Array(arcPoints.length).fill(pressure)

            updateLine(
                currentMeshRef.current,
                arcPoints,
                arcPressures,
                arcNormals
            )

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPointRef.current,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )

                const {
                    arcPoints: mirrorCirclePoints,
                    arcNormals: mirrorCircleNormals,
                } = generateSemiCircleOpenArcWorld(
                    mirrorCenter,
                    mirrorNormal,
                    radius
                )
                const mirrorCirclePressures = Array(
                    mirrorCirclePoints.length
                ).fill(pressure)

                updateLine(
                    mirrorMeshesRef.current[mode],
                    mirrorCirclePoints,
                    mirrorCirclePressures,
                    mirrorCircleNormals
                )
            })
        }
    }

    function stopDrawing(event) {
        clearHoldTimer()

        if (!isDrawingRef.current || !planeRef.current) return

        // Exit tension mode
        if (tensionModeRef.current) {
            tensionModeRef.current = false
            originalPointsRef.current = []
            originalPressuresRef.current = []
            originalNormalsRef.current = []
            originalStrokeWidthsRef.current = []
            originalMirrorDataRef.current = {} // Clear mirror tension data
            // console.log(
            //     '✅ Drawing finalized with tension:',
            //     tension.toFixed(2)
            // )
        }

        const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []

        if (drawShapeType === 'free_hand' || drawShapeType === 'straight') {
            if (
                !currentMeshRef.current ||
                !startPointRef.current ||
                pointsRef.current.length < 2
            ) {
                if (currentMeshRef.current) scene.remove(currentMeshRef.current)
                Object.values(mirrorMeshesRef.current).forEach((mesh) =>
                    scene.remove(mesh)
                )
                currentMeshRef.current = null
                mirrorMeshesRef.current = {}
                startPointRef.current = null
                return
            }

            let geometry = currentMeshRef.current.geometry
            const oldMesh = currentMeshRef.current

            const countAfterNonIndex = geometry.attributes.position.count
            const reductionCount = Math.floor(
                (countAfterNonIndex / 3) * SIMPLIFY_PERCENTAGE
            )

            const modifier = new SimplifyModifier()
            const simplifiedGeometry = modifier.modify(geometry, reductionCount)
            geometry.dispose()
            geometry = simplifiedGeometry

            const pos = geometry.attributes.position
            const finalMeshNormals = new Float32Array(pos.count * 3)
            const faceNormals = []

            for (let i = 0; i < pos.count / 3; i++) {
                const idx = i * 3
                const vA = new THREE.Vector3(
                    pos.array[idx * 3],
                    pos.array[idx * 3 + 1],
                    pos.array[idx * 3 + 2]
                )
                const vB = new THREE.Vector3(
                    pos.array[(idx + 1) * 3],
                    pos.array[(idx + 1) * 3 + 1],
                    pos.array[(idx + 1) * 3 + 2]
                )
                const vC = new THREE.Vector3(
                    pos.array[(idx + 2) * 3],
                    pos.array[(idx + 2) * 3 + 1],
                    pos.array[(idx + 2) * 3 + 2]
                )
                const cb = new THREE.Vector3().subVectors(vC, vB)
                const ab = new THREE.Vector3().subVectors(vA, vB)
                const normal = new THREE.Vector3()
                    .crossVectors(cb, ab)
                    .normalize()
                faceNormals.push(normal)
            }

            const averageNormal = new THREE.Vector3()
            faceNormals.forEach((n) => averageNormal.add(n))
            averageNormal.normalize()

            if (averageNormal.lengthSq() < 1e-6) {
                averageNormal.copy(
                    currentNormalRef.current || new THREE.Vector3(0, 0, 1)
                )
            }

            for (let i = 0; i < pos.count / 3; i++) {
                const normal = faceNormals[i]
                const idx = i * 3

                if (normal.dot(averageNormal) < 0) {
                    normal.negate()
                }
                normal.normalize()

                for (let j = 0; j < 3; j++) {
                    finalMeshNormals[(idx + j) * 3] = normal.x
                    finalMeshNormals[(idx + j) * 3 + 1] = normal.y
                    finalMeshNormals[(idx + j) * 3 + 2] = normal.z
                }
            }

            geometry.setAttribute(
                'normal',
                new THREE.BufferAttribute(finalMeshNormals, 3)
            )

            geometry.attributes.position.needsUpdate = true
            geometry.attributes.normal.needsUpdate = true
            geometry.computeVertexNormals()
            geometry.toNonIndexed()
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending:
                            strokeOpacity < 1
                                ? THREE.AdditiveBlending
                                : THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        metalness: 0.0,
                        roughness: 1.0,
                        alphaToCoverage: true,
                        premultipliedAlpha: false,
                        blending:
                            strokeOpacity < 1
                                ? THREE.NormalBlending
                                : THREE.NormalBlending,
                        flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)
            if (oldMesh.material) oldMesh.material.dispose()

            const newMesh = new THREE.Mesh(geometry, finalMaterial)

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                // note_id: id,
                pts: pointsRef.current,
                normals: normalsRef.current,
                pressures: pressuresRef.current,
                opacity: strokeOpacity,
                color: strokeColor,
                width: strokeWidth,
                stroke_type: strokeType,
                uuid: newMesh.uuid,
                shape_type: drawShapeType,
                group_id: activeGroup,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }

            newMesh.material.needsUpdate = true
            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshesRef.current[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.AdditiveBlending
                                    : THREE.NormalBlending,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            metalness: 0.0,
                            roughness: 1.0,
                            alphaToCoverage: true,
                            premultipliedAlpha: false,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.NormalBlending
                                    : THREE.NormalBlending,
                            flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorDataRef.current[mode].points,
                    pressures: mirrorDataRef.current[mode].pressures,
                    normals: mirrorDataRef.current[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                    group_id: activeGroup,
                }

                mirrorNewMesh.material.needsUpdate = true
                scene.add(mirrorNewMesh)
            })
        } else if (drawShapeType === 'circle') {
            const intersection = getPlaneIntersection(event)
            const lastPoint =
                intersection?.point ||
                pointsRef.current[pointsRef.current.length - 1]
            const radius = startPointRef.current.distanceTo(lastPoint)

            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )

            const finalPressures = Array(circlePoints.length).fill(
                pressuresRef.current[0] || 1.0
            )

            updateLine(
                currentMeshRef.current,
                circlePoints,
                finalPressures,
                circleNormals
            )

            const oldMesh = currentMeshRef.current
            let geometry = currentMeshRef.current.geometry

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending:
                            strokeOpacity < 1
                                ? THREE.AdditiveBlending
                                : THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        metalness: 0.0,
                        roughness: 1.0,
                        alphaToCoverage: true,
                        premultipliedAlpha: false,
                        blending:
                            strokeOpacity < 1
                                ? THREE.NormalBlending
                                : THREE.NormalBlending,
                        flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)

            const newMesh = new THREE.Mesh(geometry, finalMaterial)
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                // note_id: id,
                pts: pointsRef.current,
                normals: normalsRef.current,
                pressures: pressuresRef.current,
                opacity: strokeOpacity,
                color: strokeColor,
                width: strokeWidth,
                stroke_type: strokeType,
                uuid: newMesh.uuid,
                shape_type: drawShapeType,
                group_id: activeGroup,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
            finalMaterial.needsUpdate = true

            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshesRef.current[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.AdditiveBlending
                                    : THREE.NormalBlending,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            metalness: 0.0,
                            roughness: 1.0,
                            alphaToCoverage: true,
                            premultipliedAlpha: false,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.NormalBlending
                                    : THREE.NormalBlending,
                            flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorDataRef.current[mode].points,
                    pressures: mirrorDataRef.current[mode].pressures,
                    normals: mirrorDataRef.current[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                    group_id: activeGroup,
                }

                mirrorNewMesh.material.needsUpdate = true

                scene.add(mirrorNewMesh)
            })
        } else if (drawShapeType === 'square') {
            const intersection = getPlaneIntersection(event)
            const lastPoint =
                intersection?.point ||
                pointsRef.current[pointsRef.current.length - 1]
            const radius = startPointRef.current.distanceTo(lastPoint)

            const { squarePoints, squareNormals } = generateSquarePointsWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )

            const squareFinalPressures = Array(squarePoints.length).fill(
                pressuresRef.current[0] || 1.0
            )

            updateLine(
                currentMeshRef.current,
                squarePoints,
                squareFinalPressures,
                squareNormals
            )

            const oldMesh = currentMeshRef.current
            let geometry = currentMeshRef.current.geometry

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending:
                            strokeOpacity < 1
                                ? THREE.AdditiveBlending
                                : THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        metalness: 0.0,
                        roughness: 1.0,
                        alphaToCoverage: true,
                        premultipliedAlpha: false,
                        blending:
                            strokeOpacity < 1
                                ? THREE.NormalBlending
                                : THREE.NormalBlending,
                        flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)

            const newMesh = new THREE.Mesh(geometry, finalMaterial)
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                // note_id: id,
                pts: pointsRef.current,
                normals: normalsRef.current,
                pressures: pressuresRef.current,
                opacity: strokeOpacity,
                color: strokeColor,
                width: strokeWidth,
                stroke_type: strokeType,
                uuid: newMesh.uuid,
                shape_type: drawShapeType,
                group_id: activeGroup,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
            finalMaterial.needsUpdate = true

            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshesRef.current[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.AdditiveBlending
                                    : THREE.NormalBlending,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            metalness: 0.0,
                            roughness: 1.0,
                            alphaToCoverage: true,
                            premultipliedAlpha: false,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.NormalBlending
                                    : THREE.NormalBlending,
                            flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }
                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorDataRef.current[mode].points,
                    pressures: mirrorDataRef.current[mode].pressures,
                    normals: mirrorDataRef.current[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                    group_id: activeGroup,
                }

                mirrorNewMesh.material.needsUpdate = true
                scene.add(mirrorNewMesh)
            })
        } else if (drawShapeType === 'arc') {
            const intersection = getPlaneIntersection(event)
            const lastPoint =
                intersection?.point ||
                pointsRef.current[pointsRef.current.length - 1]
            const radius = startPointRef.current.distanceTo(lastPoint)

            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )

            const arcFinalPressures = Array(arcPoints.length).fill(
                pressuresRef.current[0] || 1.0
            )

            updateLine(
                currentMeshRef.current,
                arcPoints,
                arcFinalPressures,
                arcNormals
            )

            const oldMesh = currentMeshRef.current
            let geometry = currentMeshRef.current.geometry

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending:
                            strokeOpacity < 1
                                ? THREE.AdditiveBlending
                                : THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        transparent: strokeOpacity < 1,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        metalness: 0.0,
                        roughness: 1.0,
                        alphaToCoverage: true,
                        premultipliedAlpha: false,
                        blending:
                            strokeOpacity < 1
                                ? THREE.NormalBlending
                                : THREE.NormalBlending,
                        flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)

            const newMesh = new THREE.Mesh(geometry, finalMaterial)
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                // note_id: id,
                pts: pointsRef.current,
                normals: normalsRef.current,
                pressures: pressuresRef.current,
                opacity: strokeOpacity,
                color: strokeColor,
                width: strokeWidth,
                stroke_type: strokeType,
                uuid: newMesh.uuid,
                shape_type: drawShapeType,
                group_id: activeGroup,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
            }
            finalMaterial.needsUpdate = true

            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshesRef.current[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.AdditiveBlending
                                    : THREE.NormalBlending,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            transparent: strokeOpacity < 1,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            metalness: 0.0,
                            roughness: 1.0,
                            alphaToCoverage: true,
                            premultipliedAlpha: false,
                            blending:
                                strokeOpacity < 1
                                    ? THREE.NormalBlending
                                    : THREE.NormalBlending,
                            flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorDataRef.current[mode].points,
                    pressures: mirrorDataRef.current[mode].pressures,
                    normals: mirrorDataRef.current[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                    group_id: activeGroup,
                }

                mirrorNewMesh.material.needsUpdate = true
                scene.add(mirrorNewMesh)
            })
        }

        currentMeshRef.current = null
        mirrorMeshesRef.current = {}
        mirrorDataRef.current = {}
        startPointRef.current = null
        currentNormalRef.current = null
        isDrawingRef.current = false
        // console.log(`--- Drawing End ---`)
    }

    const getPlaneIntersection = useCallback(
        (event) => {
            if (!planeRef.current) return null

            const canvas = gl.domElement
            const rect = canvas.getBoundingClientRect()

            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            )

            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(mouse, camera)

            const intersects = raycaster.intersectObject(planeRef.current)
            if (intersects.length > 0) {
                const intersection = intersects[0]
                const normal = intersection.face.normal
                    .clone()
                    .transformDirection(intersection.object.matrixWorld)
                    .normalize()
                return {
                    point: intersection.point.clone(),
                    normal,
                }
            }
            return null
        },
        [camera, gl]
    )

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearHoldTimer()
        }
    }, [])

    return (
        <>
            {dynamicDrawingPlaneMesh && (
                <primitive
                    object={dynamicDrawingPlaneMesh}
                    ref={planeRef}
                    onPointerDown={startDrawing}
                    onPointerMove={continueDrawing}
                    onPointerUp={stopDrawing}
                    onPointerOut={stopDrawing}
                />
            )}
        </>
    )
}

export default DrawLine
