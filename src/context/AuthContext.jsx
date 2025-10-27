import { createContext, useContext } from 'react'
import axios from 'axios'

import { dashboardStore } from '../hooks/useDashboardStore'
import { supabase } from '../utils/supabase'
import {
    SIGNIN_USER,
    SIGNUP_USER,
    ME_USER,
    SIGNOUT_USER,
} from '../services/api/index'

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
    const { session, setSession, setLoading } = dashboardStore((state) => state)

    const validateSession = async () => {
        setLoading(true)
        try {
            const result = await axios.get(ME_USER, {
                withCredentials: true,
            })

            setSession(result.data.user)
            return { success: true, session }
        } catch (error) {
            console.error('Failed to fetch session:', error)
            setSession(null)
            return { success: false, session }
        } finally {
            setLoading(false)
        }
    }

    // Sign Up
    const signUpNewUser = async (name, email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        display_name: name,
                    },
                },
            })

            if (error) {
                console.error('Error while signing up : ', error)
                return { success: false, error }
            } else {
                if (data?.session) {
                    setLoading(true)
                    let result = await axios.post(
                        SIGNUP_USER,
                        {
                            access_token: data.session.access_token,
                            refresh_token: data.session.refresh_token,
                        },
                        {
                            withCredentials: true, // Axios equivalent of `credentials: 'include'`
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                    // console.log({ result })
                    setSession(result.data.user)
                    setLoading(false)
                }
                // console.log('Succesfully signed up new user : ', data)
                return { success: true, data: data }
            }
        } catch (error) {
            console.error('Error occured while signing up+ : ', error)
            return { success: false, error: error.message }
        }
    }

    // Sign Out
    const signOut = async () => {
        try {
            const result = await axios.get(SIGNOUT_USER, {
                withCredentials: true,
            })

            // console.log({ result })

            if (result.data.success) {
                const { error } = await supabase.auth.signOut()
                if (error) {
                    console.error('Error while signing out : ', error)
                    return { success: false, error }
                } else {
                    return { success: true }
                }
            } else {
                console.error('Error while signing out : ', error)
                return { success: false, error }
            }
        } catch (error) {
            console.error('Error while signing out : ', error)
            return { success: false, error }
        }
    }

    // Sign In
    const signInUser = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            })

            if (error) {
                console.error('Error while signing in : ', error)
                return { success: false, error }
            } else {
                // console.log('Succesfully signed in user : ', data)

                if (data?.session) {
                    setLoading(true)
                    const result = await axios.post(
                        SIGNIN_USER,
                        {
                            access_token: data.session.access_token,
                            refresh_token: data.session.refresh_token,
                        },
                        {
                            withCredentials: true, // Axios equivalent of `credentials: 'include'`
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    )
                    if (result.data.success) {
                        setSession(result.data.user)
                        return { success: true, error: result.message }
                    } else {
                        return { success: false }
                    }
                }
                return { success: true, data }
            }
        } catch (error) {
            console.error('Error occured while signing in : ', error)
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    const resetPassword = async (email) => {
        try {
            const { data, error } = await supabase.auth.resetPasswordForEmail({
                email: email,
            })

            if (error) {
                console.error('Error while fetching authentication : ', error)
                return { success: false, error }
            } else {
                // console.log('Succesfully fetched authentication : ', data)
                return { success: true, data }
            }
        } catch (error) {
            console.error(
                'Error occured while fetching authentication : ',
                error
            )
        }
    }

    return (
        <AuthContext.Provider
            value={{
                session,
                validateSession,
                signUpNewUser,
                signOut,
                signInUser,
                resetPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => {
    return useContext(AuthContext)
}
