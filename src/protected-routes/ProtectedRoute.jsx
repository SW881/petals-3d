import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { dashboardStore } from '../hooks/useDashboardStore'

const ProtectedRoute = () => {
    const { validateSession } = UserAuth()
    const { session, loading } = dashboardStore((state) => state)

    useEffect(() => {
        validateSession()
    }, [])

    // if (loading) return <>Loading... 123</>
    if (loading) return <></>

    if (session) {
        return <Outlet />
    } else {
        return <Navigate to="/sign-in" replace />
    }
}

export default ProtectedRoute
