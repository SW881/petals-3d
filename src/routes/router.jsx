import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import Editor from '../components/editor/Editor'

import PublicRoute from '../public-routes/PublicRoute'

export const router = createBrowserRouter([
    {
        element: <PublicRoute />,
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
])
