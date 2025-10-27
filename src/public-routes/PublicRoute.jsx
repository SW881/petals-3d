import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { UserAuth } from '../context/AuthContext'
import { dashboardStore } from '../hooks/useDashboardStore'

const PublicRoute = ({ children }) => {
    const { validateSession } = UserAuth()
    const { session, loading } = dashboardStore((state) => state)

    useEffect(() => {
        validateSession()
    }, [])

    // if (loading) return <>Loading.. 456</>
    if (loading) return <></>

    if (session) {
        return <Navigate to="/folders" replace />
    } else {
        return children
    }
}

export default PublicRoute
