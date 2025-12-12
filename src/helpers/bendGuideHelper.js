import * as THREE from 'three'

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
export function bendOGGuide(
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
