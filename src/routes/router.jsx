import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import SignIn from '../components/signin/SignIn'
import Editor from '../components/editor/Editor'

import PublicRoute from '../public-routes/PublicRoute'
import ProtectedRoute from '../protected-routes/ProtectedRoute'

export const router = createBrowserRouter([
    // Protected Routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/*',
                element: <Navigate to="/editor" replace />,
            },
            {
                path: '/editor',
                element: <Editor />,
            },
        ],
    },

    // Non-Protected Routes
    {
        path: '/sign-in',
        element: (
            <PublicRoute>
                <SignIn />
            </PublicRoute>
        ),
    },
])
