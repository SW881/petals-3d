import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../../hooks/useCanvasViewStore'

// ========== Core helpers ==========

function dropDuplicateLoopEnd(arr, eps = 1e-9) {
    if (!arr || arr.length < 2) return arr
    const first = arr[0],
        last = arr[arr.length - 1]
    const d = 'z' in first ? first.distanceTo(last) : first.distanceTo(last)
    return d < Math.sqrt(eps) ? arr.slice(0, -1) : arr
}

function buildPlaneBasisFromNormal(normal) {
    const n = normal.clone().normalize()
    const ref =
        Math.abs(n.y) < 0.99
            ? new THREE.Vector3(0, 1, 0)
            : new THREE.Vector3(1, 0, 0)
    const u = new THREE.Vector3().crossVectors(ref, n).normalize()
    const v = new THREE.Vector3().crossVectors(n, u).normalize()
    return { u, v, n }
}

function estimatePolylineNormal3D(points) {
    const c = new THREE.Vector3()
    for (const p of points) c.add(p)
    c.multiplyScalar(1 / points.length)
    const n = new THREE.Vector3()
    for (let i = 0; i < points.length - 1; i++) {
        const v1 = points[i].clone().sub(c)
        const v2 = points[i + 1].clone().sub(c)
        n.add(v1.cross(v2))
    }
    return n.lengthSq() > 0 ? n.normalize() : new THREE.Vector3(0, 0, 1)
}

function estimatePolygonNormal(points) {
    let nx = 0,
        ny = 0,
        nz = 0
    for (let i = 0; i < points.length; i++) {
        const p0 = points[i],
            p1 = points[(i + 1) % points.length]
        nx += (p0.y - p1.y) * (p0.z + p1.z)
        ny += (p0.z - p1.z) * (p0.x + p1.x)
        nz += (p0.x - p1.x) * (p0.y + p1.y)
    }
    const n = new THREE.Vector3(nx, ny, nz)
    return n.lengthSq() > 0 ? n.normalize() : new THREE.Vector3(0, 0, 1)
}

function projectPointsTo2D(points, origin, u, v) {
    const out = []
    for (const p of points) {
        const d = new THREE.Vector3().subVectors(p, origin)
        out.push(new THREE.Vector2(d.dot(u), d.dot(v)))
    }
    return out
}

// ========== Adaptive path sampling ==========

function computeCurvature(points, closed = false) {
    const curvatures = []
    const n = points.length
    for (let i = 0; i < n; i++) {
        let angle = 0
        if (i === 0 && !closed) {
            if (points.length > 2) {
                const v1 = new THREE.Vector3()
                    .subVectors(points[1], points[0])
                    .normalize()
                const v2 = new THREE.Vector3()
                    .subVectors(points[2], points[1])
                    .normalize()
                angle = Math.acos(THREE.MathUtils.clamp(v1.dot(v2), -1, 1))
            }
        } else if (i === n - 1 && !closed) {
            if (i >= 2) {
                const v1 = new THREE.Vector3()
                    .subVectors(points[i - 1], points[i - 2])
                    .normalize()
                const v2 = new THREE.Vector3()
                    .subVectors(points[i], points[i - 1])
                    .normalize()
                angle = Math.acos(THREE.MathUtils.clamp(v1.dot(v2), -1, 1))
            }
        } else {
            const prev = closed && i === 0 ? n - 1 : Math.max(0, i - 1)
            const next = closed && i === n - 1 ? 0 : Math.min(n - 1, i + 1)
            const v1 = new THREE.Vector3()
                .subVectors(points[i], points[prev])
                .normalize()
            const v2 = new THREE.Vector3()
                .subVectors(points[next], points[i])
                .normalize()
            angle = Math.acos(THREE.MathUtils.clamp(v1.dot(v2), -1, 1))
        }
        curvatures.push(angle)
    }
    return curvatures
}

function samplePathAdaptiveWithNormals(
    pathPoints,
    pathNormals = null,
    { closed = false, minSamples = 16, maxSamples = 128 } = {}
) {
    const curve = new THREE.CatmullRomCurve3(
        pathPoints,
        !!closed,
        'centripetal',
        0.5
    )
    const totalLength = curve.getLength()

    const initSamples = Math.min(pathPoints.length * 4, 64)
    curve.arcLengthDivisions = initSamples * 3
    const initialPoints = curve.getSpacedPoints(initSamples)

    const curvatures = computeCurvature(initialPoints, closed)
    const maxCurv = Math.max(...curvatures, 1e-6)
    const sampleDensities = curvatures.map((c) =>
        Math.max(1, (c / maxCurv) * 4)
    )
    const totalDensity = sampleDensities.reduce((a, b) => a + b, 0)

    const targetSamples = THREE.MathUtils.clamp(
        Math.ceil(totalLength * 2),
        minSamples,
        maxSamples
    )

    const segments = []
    for (let i = 0; i < initialPoints.length - 1; i++) {
        const localSamples = Math.max(
            1,
            Math.round((sampleDensities[i] / totalDensity) * targetSamples)
        )
        segments.push({ start: i, end: i + 1, samples: localSamples })
    }

    const adaptivePoints = []
    const adaptiveNormals = []

    for (const seg of segments) {
        const t0 = seg.start / (initialPoints.length - 1)
        const t1 = seg.end / (initialPoints.length - 1)
        for (let j = 0; j < seg.samples; j++) {
            const t = t0 + (t1 - t0) * (j / seg.samples)
            adaptivePoints.push(curve.getPointAt(t))

            if (pathNormals && pathNormals.length === pathPoints.length) {
                const tScaled = t * (pathPoints.length - 1)
                const idx0 = Math.floor(tScaled)
                const idx1 = Math.min(idx0 + 1, pathPoints.length - 1)
                const localT = tScaled - idx0
                const n0 = pathNormals[idx0]
                const n1 = pathNormals[idx1]
                const interpolated = new THREE.Vector3()
                    .lerpVectors(n0, n1, localT)
                    .normalize()
                adaptiveNormals.push(interpolated)
            }
        }
    }

    let pts = adaptivePoints
    let norms = adaptiveNormals.length === pts.length ? adaptiveNormals : null

    if (!closed) {
        pts = dropDuplicateLoopEnd(pts, 1e-9)
        if (norms && norms.length > pts.length)
            norms = norms.slice(0, pts.length)
    }

    return { points: pts, normals: norms }
}
// ========== Profile building ==========

function simplifyPolyline2D(points, angleThreshold = 0.1, minPoints = 8) {
    if (points.length <= minPoints) return points
    const simplified = [points[0]]
    for (let i = 1; i < points.length - 1; i++) {
        const p0 = points[i - 1],
            p1 = points[i],
            p2 = points[i + 1]
        const v1 = new THREE.Vector2().subVectors(p1, p0).normalize()
        const v2 = new THREE.Vector2().subVectors(p2, p1).normalize()
        const angle = Math.acos(THREE.MathUtils.clamp(v1.dot(v2), -1, 1))
        if (angle > angleThreshold || i % 3 === 0) simplified.push(p1)
    }
    simplified.push(points[points.length - 1])
    return simplified.length < minPoints ? points : simplified
}

function buildProfile2DAdaptiveWithNormal(
    guidePoints,
    guidePointNormals = null,
    { shapeScale = 1, minSegments = 8, maxSegments = 32 } = {}
) {
    if (!guidePoints || guidePoints.length < 2) return []

    const closed3D =
        guidePoints.length > 2 &&
        guidePoints[0].distanceToSquared(guidePoints[guidePoints.length - 1]) <
            1e-12

    let planeNormal
    if (guidePointNormals && guidePointNormals.length > 0) {
        planeNormal = new THREE.Vector3()
        for (const n of guidePointNormals) planeNormal.add(n)
        planeNormal.normalize()
    } else {
        planeNormal = closed3D
            ? estimatePolygonNormal(guidePoints)
            : estimatePolylineNormal3D(guidePoints)
    }

    const { u, v } = buildPlaneBasisFromNormal(planeNormal)
    const origin = guidePoints[0]
    let pts2 = projectPointsTo2D(guidePoints, origin, u, v).map(
        (p) => new THREE.Vector2(p.x * shapeScale, p.y * shapeScale)
    )
    pts2 = dropDuplicateLoopEnd(pts2, 1e-9)

    const simplified = simplifyPolyline2D(pts2, 0.15, minSegments)
    if (simplified.length > maxSegments) {
        const step = Math.ceil(simplified.length / maxSegments)
        const decimated = []
        for (let i = 0; i < simplified.length; i += step)
            decimated.push(simplified[i])
        return decimated
    }
    return simplified
}
// ========== PLANE-LOCKED sweep (profile stays perpendicular to path plane) ==========

function sweepWithPlaneNormal(
    brushPolyline2D,
    guidePathPoints,
    pathPlaneNormal,
    pathNormals = null,
    {
        closedPath = false,
        minPathSamples = 16,
        maxPathSamples = 128,
        twistFn = null,
        taperFn = null,
    } = {}
) {
    if (
        !brushPolyline2D ||
        brushPolyline2D.length < 2 ||
        !guidePathPoints ||
        guidePathPoints.length < 2
    )
        return null

    const { points: P, normals: sampledNormals } =
        samplePathAdaptiveWithNormals(guidePathPoints, pathNormals, {
            closed: !!closedPath,
            minSamples: minPathSamples,
            maxSamples: maxPathSamples,
        })

    // CRITICAL: Use path plane normal to keep profile perpendicular
    const pathPlane = pathPlaneNormal
        ? pathPlaneNormal.clone().normalize()
        : new THREE.Vector3(0, 1, 0)

    const brush = dropDuplicateLoopEnd(brushPolyline2D, 1e-9)
    const shapeLen = brush.length
    const positions = [],
        indices = [],
        uvs = []

    for (let i = 0; i < P.length; i++) {
        const center = P[i]

        // Tangent along path
        let tangent
        if (i === 0) {
            tangent = new THREE.Vector3().subVectors(P[1], P[0]).normalize()
        } else if (i === P.length - 1) {
            tangent = new THREE.Vector3().subVectors(P[i], P[i - 1]).normalize()
        } else {
            const prev = new THREE.Vector3()
                .subVectors(P[i], P[i - 1])
                .normalize()
            const next = new THREE.Vector3()
                .subVectors(P[i + 1], P[i])
                .normalize()
            tangent = prev.add(next).normalize()
        }

        // Use path plane normal as the "up" direction for the sweep
        // This keeps the profile perpendicular to the path plane
        const pathUp = pathPlane.clone()

        // Binormal = perpendicular to both tangent and path plane normal
        let binormal = new THREE.Vector3()
            .crossVectors(tangent, pathUp)
            .normalize()
        if (binormal.lengthSq() < 1e-6) {
            // Tangent parallel to path plane normal, use fallback
            const fallback = new THREE.Vector3(1, 0, 0)
            binormal = new THREE.Vector3()
                .crossVectors(tangent, fallback)
                .normalize()
        }

        // Normal = perpendicular to tangent and binormal (stays in path plane)
        const normal = new THREE.Vector3()
            .crossVectors(binormal, tangent)
            .normalize()

        const u = P.length > 1 ? i / (P.length - 1) : 0
        const twist = twistFn ? twistFn(u) : 0.0
        const scale = taperFn ? taperFn(u) : 1.0
        const cosT = Math.cos(twist),
            sinT = Math.sin(twist)

        for (let j = 0; j < shapeLen; j++) {
            const sp = brush[j]
            const x0 = sp.x * scale,
                y0 = sp.y * scale
            const x = x0 * cosT - y0 * sinT
            const y = x0 * sinT + y0 * cosT
            const v = new THREE.Vector3()
                .copy(center)
                .addScaledVector(binormal, x)
                .addScaledVector(normal, y)
            positions.push(v.x, v.y, v.z)
            uvs.push(u, shapeLen > 1 ? j / (shapeLen - 1) : 0)
        }

        if (i > 0) {
            const prev = (i - 1) * shapeLen,
                curr = i * shapeLen
            for (let j = 0; j < shapeLen - 1; j++) {
                const a = prev + j,
                    b = prev + j + 1,
                    c = curr + j,
                    d = curr + j + 1
                indices.push(a, b, c, b, d, c)
            }
        }
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3)
    )
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geometry.setIndex(indices)
    geometry.computeVertexNormals()
    return geometry
}
// ========== Main function WITH plane-locked sweep ==========

function bendOGGuide(
    guidePoints,
    guidePathPoints,
    shapeScale = 1,
    options = {}
) {
    const {
        minPathSamples = 16,
        maxPathSamples = 128,
        minProfileSegments = 8,
        maxProfileSegments = 32,
        closedPath = false,
        guidePointNormals = null, // Vector3[] - normals for profile (averaged for plane)
        guidePathPointNormals = null, // Vector3[] - normals for path (averaged for plane)
    } = options

    if (
        !guidePoints ||
        !guidePathPoints ||
        guidePoints.length < 2 ||
        guidePathPoints.length < 2
    )
        return null

    // Get path plane normal (average of all path normals OR estimate from path points)
    let pathPlaneNormal
    if (guidePathPointNormals && guidePathPointNormals.length > 0) {
        pathPlaneNormal = new THREE.Vector3()
        for (const n of guidePathPointNormals) pathPlaneNormal.add(n)
        pathPlaneNormal.normalize()
    } else {
        const closedPath3D =
            guidePathPoints.length > 2 &&
            guidePathPoints[0].distanceToSquared(
                guidePathPoints[guidePathPoints.length - 1]
            ) < 1e-12
        pathPlaneNormal = closedPath3D
            ? estimatePolygonNormal(guidePathPoints)
            : estimatePolylineNormal3D(guidePathPoints)
    }

    // Build profile WITH its plane normal
    const brushPolyline2D = buildProfile2DAdaptiveWithNormal(
        guidePoints,
        guidePointNormals,
        {
            shapeScale,
            minSegments: minProfileSegments,
            maxSegments: maxProfileSegments,
        }
    )

    // Sweep WITH plane-locked orientation (profile stays perpendicular to path plane)
    return sweepWithPlaneNormal(
        brushPolyline2D,
        guidePathPoints,
        pathPlaneNormal,
        guidePathPointNormals,
        {
            closedPath,
            minPathSamples,
            maxPathSamples,
        }
    )
}

const DynamicBendGuidePlane = ({ onDrawingFinished }) => {
    const { camera, scene, gl } = useThree()
    const planeRef = useRef()

    const MAX_POINTS = 50000
    const SMOOTH_PERCENTAGE = 25
    const DISTANCE_THRESHOLD = 0.01
    const OPTIMIZATION_THRESHOLD = 0.01 // Threshold for pre-smoothing filtering
    let startPoint = null
    let currentNormal = null // To store the normal of the drawing plane

    const {
        drawGuide,
        drawShape,
        strokeOpacity,
        ogGuidePoints,
        ogGuideNormals,
        bendPlaneGuide,
    } = canvasDrawStore((state) => state)

    const { orbitalLock, setOrbitalLock } = canvasViewStore((state) => state)

    let isDrawing = false
    let points = []
    let pressures = []
    let normals = []
    let currentMesh = null

    const color = new THREE.Color('#e5e4e2')

    // Circle
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

    // Square
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

            // Align local XY plane with the normal
            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            // Square side length from radius (radius = half diagonal)
            const sideLength = radius * Math.sqrt(2) // so diagonal = 2*radius
            const halfSide = sideLength / 2

            // Corner radius for smooth rounding (adjust cornerRadiusFactor for more/less rounding)
            const cornerRadiusFactor = 0.15 // 15% of side length
            const cornerRadius = sideLength * cornerRadiusFactor
            const straightLength = halfSide - cornerRadius

            // Four corners positions (in local space before rotation)
            const corners = [
                {
                    x: straightLength,
                    y: straightLength,
                    startAngle: 0,
                    endAngle: Math.PI / 2,
                }, // top-right
                {
                    x: -straightLength,
                    y: straightLength,
                    startAngle: Math.PI / 2,
                    endAngle: Math.PI,
                }, // top-left
                {
                    x: -straightLength,
                    y: -straightLength,
                    startAngle: Math.PI,
                    endAngle: Math.PI * 1.5,
                }, // bottom-left
                {
                    x: straightLength,
                    y: -straightLength,
                    startAngle: Math.PI * 1.5,
                    endAngle: Math.PI * 2,
                }, // bottom-right
            ]

            const pointsPerSide = Math.floor(segments / 4)
            const pointsPerCorner = cornerSegments

            // Generate square with rounded corners
            corners.forEach((corner, idx) => {
                const nextCorner = corners[(idx + 1) % 4]

                // Rounded corner arc
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

                // Straight edge to next corner
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

            // Close the loop
            squarePoints.push(squarePoints[0].clone())
            squareNormals.push(normal.clone())

            // return {
            //     squarePoints,
            //     squareNormals,
            // }
            return {
                squarePoints: squarePoints,
                squareNormals: squareNormals,
            }
        },
        []
    )

    // Semi Circle close arc
    const generateSemiCirclePointsWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const semiCirclePoints = []
            const semiCircleNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            // Align local XY plane with the normal
            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            // Semi-circle arc (top half, 180 degrees)
            const arcSegments = Math.floor(segments * 0.6) // 60% for the arc
            for (let i = 0; i <= arcSegments; i++) {
                const angle = Math.PI + (i / arcSegments) * Math.PI // from 180° to 360° (top half)
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                semiCirclePoints.push(tempVector.clone())
                semiCircleNormals.push(normal.clone())
            }

            // Straight base line (bottom, closing the semi-circle)
            const baseSegments = Math.floor(segments * 0.4) // 40% for the base
            for (let i = 1; i < baseSegments; i++) {
                const t = i / baseSegments
                tempVector.set(
                    radius - t * (2 * radius), // from right (-radius) to left (+radius)
                    0,
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                semiCirclePoints.push(tempVector.clone())
                semiCircleNormals.push(normal.clone())
            }

            // Close the loop
            semiCirclePoints.push(semiCirclePoints[0].clone())
            semiCircleNormals.push(normal.clone())

            // return {
            //     semiCirclePoints,
            //     semiCircleNormals,
            // }
            return {
                circlePoints: semiCirclePoints,
                circleNormals: semiCircleNormals,
            }
        },
        []
    )

    // Semi circle opened arc
    const generateSemiCircleOpenArcWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const arcPoints = []
            const arcNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            // Just the arc, no closing line
            for (let i = 0; i <= segments; i++) {
                const angle = Math.PI + (i / segments) * Math.PI // 180° arc
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

    function getSnappedPoint(origin, target) {
        const delta = new THREE.Vector3().subVectors(target, origin)
        const angle = Math.atan2(delta.y, delta.x)
        const snapIncrement = Math.PI / 4
        const snappedAngle = Math.round(angle / snapIncrement) * snapIncrement
        const length = delta.length()
        const snappedDir = new THREE.Vector3(
            Math.cos(snappedAngle),
            Math.sin(snappedAngle),
            0
        )
        return origin.clone().add(snappedDir.multiplyScalar(length))
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

        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide,
            forceSinglePass: true,
            depthTest: true,
            depthWrite: true,
        })

        const mesh = new THREE.Mesh(geometry, material)
        scene.add(mesh)
        return mesh
    }

    function updateLine(mesh, rawPts, pressuresArr, normalsArr) {
        if (rawPts.length < 2) return

        const geometry = mesh.geometry

        let pts = rawPts
        let pressures = pressuresArr
        let finalNormals = normalsArr

        if (drawShape === 'free_hand') {
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

            const halfW = 0.025
            const halfH = 0.025

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

            ;[tl, tr, br, bl].forEach((v) => {
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
            mesh.material.needsUpdate = true
        }
    }

    function startDrawing(event) {
        if (!planeRef.current) return

        isDrawing = true
        points = []
        pressures = []
        normals = []

        const { point, normal } = getPlaneIntersection(event)
        if (!point) return

        startPoint = point.clone()
        currentNormal = normal.clone()
        currentMesh = createInitialLineMesh()

        const pressure = 1.0

        points.push(startPoint.clone())
        pressures.push(pressure)
        normals.push(currentNormal)

        if (drawShape === 'free_hand') {
            const secondPoint = new THREE.Vector3()
                .copy(startPoint)
                .addScalar(0.001)
            points.push(secondPoint)
            pressures.push(pressure)
            normals.push(currentNormal)
        }

        updateLine(currentMesh, points, pressures, normals)
    }

    function continueDrawing(event) {
        if (!isDrawing || !planeRef.current) return
        const { point, normal } = getPlaneIntersection(event)
        if (!point) return

        const pressure = 1.0

        if (drawShape === 'free_hand') {
            let newPoint = point.clone()

            const last = points[points.length - 1]
            if (newPoint.distanceTo(last) < DISTANCE_THRESHOLD) return

            points.push(newPoint)
            pressures.push(pressure)
            normals.push(normal)

            if (points.length > MAX_POINTS) {
                points.shift()
                pressures.shift()
                normals.shift()
            }

            updateLine(currentMesh, points, pressures, normals)
        } else if (drawShape === 'straight') {
            if (!startPoint || !currentNormal) return

            // Snap point to constrained angle (max 45°)
            // const snappedPoint = getSnappedPoint(startPoint, point, 1) // 45 is max angle for snapping
            const { snappedEnd, interpolatedPoints } =
                getSnappedLinePointsInPlane({
                    startPoint,
                    currentPoint: point,
                    normal,
                    camera,
                    snapAngle: 1,
                    pointDensity: 0.05,
                })

            // Only two points: start and snapped end
            points.length = 0
            points.push(startPoint.clone())
            points.push(snappedEnd.clone())

            pressures.length = 0
            pressures.push(pressure)
            pressures.push(pressure)

            normals.length = 0
            normals.push(currentNormal.clone())
            normals.push(normal.clone())

            updateLine(currentMesh, points, pressures, normals)
        } else if (drawShape === 'circle') {
            if (!startPoint || !currentNormal) return

            const radius = startPoint.distanceTo(point)
            const pressure = 1.0

            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPoint,
                currentNormal,
                radius
            )
            // console.log({ circlePoints })
            const circlePressures = Array(circlePoints.length).fill(pressure)

            updateLine(
                currentMesh,
                circlePoints,
                circlePressures,
                circleNormals
            )
        } else if (drawShape === 'square') {
            if (!startPoint || !currentNormal) return

            const radius = startPoint.distanceTo(point)
            const pressure = 1.0

            const { squarePoints, squareNormals } = generateSquarePointsWorld(
                startPoint,
                currentNormal,
                radius
            )
            // console.log({ circlePoints })
            const squarePressures = Array(squarePoints.length).fill(pressure)

            updateLine(
                currentMesh,
                squarePoints,
                squarePressures,
                squareNormals
            )
        } else if (drawShape === 'arc') {
            if (!startPoint || !currentNormal) return

            const radius = startPoint.distanceTo(point)
            const pressure = 1.0

            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPoint,
                currentNormal,
                radius
            )
            const arcPressures = Array(arcPoints.length).fill(pressure)

            updateLine(currentMesh, arcPoints, arcPressures, arcNormals)
        }
    }

    function stopDrawing(event) {
        if (!isDrawing || !planeRef.current) return

        if (drawShape === 'free_hand' || drawShape === 'straight') {
            if (!currentMesh || !startPoint || points.length < 2) {
                if (currentMesh) scene.remove(currentMesh)
                currentMesh = null
                startPoint = null
                return
            }

            // Generate Bend Guide
            // console.log('Bending original guide free_hand || straight')
            const wrappedRibbon = bendOGGuide(
                ogGuidePoints, // Vector3[] cross-section
                points, // Vector3[] path
                1, // shapeScale
                {
                    minPathSamples: 16,
                    maxPathSamples: 128,
                    minProfileSegments: 8,
                    maxProfileSegments: 32,
                    closedPath: false,
                    guidePointNormals: ogGuideNormals, // Vector3[] normals for profile (optional)
                    guidePathPointNormals: normals, // Vector3[] normals for path (locks orientation!)
                }
            )

            if (wrappedRibbon) {
                const ribbonMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0x7393b3),
                    wireframe: false,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                })

                const ribbonMesh = new THREE.Mesh(wrappedRibbon, ribbonMaterial)
                ribbonMesh.userData.type = 'Bend_Guide_Plane'
                scene.add(ribbonMesh)

                scene.remove(currentMesh)
                currentMesh.geometry.dispose()
                currentMesh.material.dispose()

                if (onDrawingFinished && ribbonMesh) {
                    onDrawingFinished(ribbonMesh)
                }
            }
        } else if (drawShape === 'circle') {
            const lastPoint =
                getPlaneIntersection(event)?.point || points[points.length - 1]
            const radius = startPoint.distanceTo(lastPoint)

            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPoint,
                currentNormal,
                radius
            )

            const finalPressures = Array(circlePoints.length).fill(
                pressures[0] || 1.0
            )

            updateLine(currentMesh, circlePoints, finalPressures, circleNormals)

            // Generate Bend Guide
            const wrappedRibbon = bendOGGuide(
                ogGuidePoints, // Vector3[] cross-section
                circlePoints, // Vector3[] path
                1, // shapeScale
                {
                    minPathSamples: 16,
                    maxPathSamples: 128,
                    minProfileSegments: 8,
                    maxProfileSegments: 32,
                    closedPath: true,
                    guidePointNormals: ogGuideNormals, // Vector3[] normals for profile (optional)
                    guidePathPointNormals: circleNormals, // Vector3[] normals for path (locks orientation!)
                }
            )

            // console.log({ wrappedRibbon })

            if (wrappedRibbon) {
                const ribbonMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0x7393b3),
                    wireframe: false,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                })

                const ribbonMesh = new THREE.Mesh(wrappedRibbon, ribbonMaterial)
                ribbonMesh.userData.type = 'Bend_Guide_Plane'
                scene.add(ribbonMesh)

                scene.remove(currentMesh)
                currentMesh.geometry.dispose()
                currentMesh.material.dispose()

                if (onDrawingFinished && ribbonMesh) {
                    onDrawingFinished(ribbonMesh)
                }
            }
        } else if (drawShape === 'square') {
            const lastPoint =
                getPlaneIntersection(event)?.point || points[points.length - 1]
            const radius = startPoint.distanceTo(lastPoint)

            const { squarePoints, squareNormals } = generateSquarePointsWorld(
                startPoint,
                currentNormal,
                radius
            )

            const squarePressures = Array(squarePoints.length).fill(
                pressures[0] || 1.0
            )

            updateLine(
                currentMesh,
                squarePoints,
                squarePressures,
                squareNormals
            )

            // Generate Bend Guide
            const wrappedRibbon = bendOGGuide(
                ogGuidePoints, // Vector3[] cross-section
                squarePoints, // Vector3[] path
                1, // shapeScale
                {
                    minPathSamples: 16,
                    maxPathSamples: 128,
                    minProfileSegments: 8,
                    maxProfileSegments: 32,
                    closedPath: true,
                    guidePointNormals: ogGuideNormals, // Vector3[] normals for profile (optional)
                    guidePathPointNormals: squareNormals, // Vector3[] normals for path (locks orientation!)
                }
            )

            // console.log({ wrappedRibbon })

            if (wrappedRibbon) {
                const ribbonMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0x7393b3),
                    wireframe: false,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                })

                const ribbonMesh = new THREE.Mesh(wrappedRibbon, ribbonMaterial)
                ribbonMesh.userData.type = 'Bend_Guide_Plane'
                scene.add(ribbonMesh)

                scene.remove(currentMesh)
                currentMesh.geometry.dispose()
                currentMesh.material.dispose()

                if (onDrawingFinished && ribbonMesh) {
                    onDrawingFinished(ribbonMesh)
                }
            }
        } else if (drawShape === 'arc') {
            const lastPoint =
                getPlaneIntersection(event)?.point || points[points.length - 1]
            const radius = startPoint.distanceTo(lastPoint)

            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPoint,
                currentNormal,
                radius
            )

            const arcPressures = Array(arcPoints.length).fill(
                pressures[0] || 1.0
            )

            updateLine(currentMesh, arcPoints, arcPressures, arcNormals)

            // Generate Bend Guide
            const wrappedRibbon = bendOGGuide(
                ogGuidePoints, // Vector3[] cross-section
                arcPoints, // Vector3[] path
                1, // shapeScale
                {
                    minPathSamples: 16,
                    maxPathSamples: 128,
                    minProfileSegments: 8,
                    maxProfileSegments: 32,
                    closedPath: false,
                    guidePointNormals: ogGuideNormals, // Vector3[] normals for profile (optional)
                    guidePathPointNormals: arcNormals, // Vector3[] normals for path (locks orientation!)
                }
            )

            // console.log({ wrappedRibbon })

            if (wrappedRibbon) {
                const ribbonMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(0x7393b3),
                    wireframe: false,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                })

                const ribbonMesh = new THREE.Mesh(wrappedRibbon, ribbonMaterial)
                ribbonMesh.userData.type = 'Bend_Guide_Plane'
                scene.add(ribbonMesh)

                scene.remove(currentMesh)
                currentMesh.geometry.dispose()
                currentMesh.material.dispose()

                if (onDrawingFinished && ribbonMesh) {
                    onDrawingFinished(ribbonMesh)
                }
            }
        }

        setOrbitalLock(false)
        currentMesh = null
        startPoint = null
        currentNormal = null
        isDrawing = false
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

    const SyncCameraFromMain = ({ planeRef }) => {
        const { camera } = useThree()
        useFrame(() => {
            if (!planeRef.current && drawGuide) return
            planeRef.current.rotation.copy(camera.rotation)
        })
        return null
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

        // Interpolate between startPoint and snappedEnd
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

    return (
        <>
            {ogGuidePoints && bendPlaneGuide && (
                <SyncCameraFromMain planeRef={planeRef} />
            )}
            {ogGuidePoints && bendPlaneGuide && (
                <mesh
                    ref={planeRef}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    onPointerDown={startDrawing}
                    onPointerMove={continueDrawing}
                    onPointerUp={stopDrawing}
                >
                    <planeGeometry args={[4000, 4000]} />
                    <meshBasicMaterial
                        visible={false}
                        color="#f0f0f0"
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </>
    )
}

export default DynamicBendGuidePlane
