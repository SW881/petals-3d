import React, { useState } from 'react'
import GoogleIcon from '../svg-icons/GoogleIcon'
import { Link, useNavigate } from 'react-router-dom'
import { UserAuth } from '../../context/AuthContext'
import CorrectIcon from '../svg-icons/CorrectIcon'
import WrongIcon from '../svg-icons/WrongIcon'
import EyeOpenIcon from '../svg-icons/EyeOpenIcon'
import EyeCloseIcon from '../svg-icons/EyeCloseIcon'
import Petals3DIcon from '../svg-icons/Petals3DIcon'

const SignIn = () => {
    const [userInputs, setUserInputs] = useState({
        email: '',
        password: '',
    })
    const [formError, setFormError] = useState({
        emailError: null,
        passwordError: null,
    })
    const [hidePassowrd, setHidePassowrd] = useState(true)
    const [loading, setLoading] = useState(false)
    const [signInError, setSignInError] = useState('')

    const [passwordValidation, setPasswordValidation] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialCharacter: false,
        has8orMore: false,
    })

    let specialCharatcer = `Special character (e.g. !?<>@#$%)`

    const navigate = useNavigate()
    const { signInUser } = UserAuth()

    const handleSignIn = async (e) => {
        e.preventDefault()
        setLoading(true)
        console.log('Signing In...')

        if (
            !formError.emailError &&
            !formError.passwordError &&
            userInputs.email &&
            userInputs.password
        ) {
            try {
                const result = await signInUser(
                    userInputs.email,
                    userInputs.password
                )
                if (result.success) {
                    navigate('/folders')
                } else if (result.error) {
                    setSignInError(
                        `Error while sign in : ${result.error.message}`
                    )
                    console.log(result.error.message)
                }
            } catch (error) {
                console.error('Error while sign in : ', error)
                setSignInError('Error while sign in')
            } finally {
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }

    function handleEmailChange(e) {
        e.preventDefault()
        setUserInputs({
            ...userInputs,
            email: e.target.value,
        })

        if (e.target.value.length <= 0) {
            console.log('e.target.value.length : ', e.target.value.length)
            setFormError({
                ...formError,
                emailError: 'Email is required',
            })
        } else if (
            !e.target.value.includes('@') ||
            !e.target.value.includes('.com')
        ) {
            setFormError({
                ...formError,
                emailError: 'Email is invalid',
            })
        } else {
            setFormError({
                ...formError,
                emailError: null,
            })
        }
    }

    function handlePasswordChange(e) {
        e.preventDefault()
        setUserInputs({
            ...userInputs,
            password: e.target.value,
        })
        let { upc, lpc, num, sp, h8 } = handlePasswordValidation(e.target.value)

        setPasswordValidation({
            hasUpperCase: upc,
            hasLowerCase: lpc,
            hasNumber: num,
            hasSpecialCharacter: sp,
            has8orMore: h8,
        })
    }

    const handlePasswordValidation = (str) => {
        let upc, lpc, num, sp, h8
        upc = /[A-Z]/.test(str)
        lpc = /[a-z]/.test(str)
        num = /\d/.test(str)
        sp = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(str)
        h8 = str.length > 7

        if (!upc) {
            setFormError({
                ...formError,
                passwordError: 'Password must have 1 uppercase letter',
            })
        }
        if (!lpc) {
            setFormError({
                ...formError,
                passwordError: 'Password must have 1 lowercase letter',
            })
        }
        if (!num) {
            setFormError({
                ...formError,
                passwordError: 'Password must have 1 number',
            })
        }
        if (!sp) {
            setFormError({
                ...formError,
                passwordError: 'Password must have 1 symbol',
            })
        }
        if (!h8) {
            setFormError({
                ...formError,
                passwordError: 'Password must be at least 8 characters',
            })
        }
        if (upc && lpc && num && sp && h8) {
            setFormError({
                ...formError,
                passwordError: null,
            })
        }
        return { upc, lpc, num, sp, h8 }
    }

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <div className="flex justify-center items-center gap-[8px] m-[32px] funnel-sans-bold text-[24px]">
                    <Petals3DIcon size={32} />
                    <div>Petals 3</div>
                </div>
                <div className="flex flex-col justify-center items-center overflow-y-auto custom-scrollbar m-[12px]">
                    <div className="flex items-center justify-center funnel-sans-regular">
                        <div className="flex flex-col justify-center">
                            <div className="text-[24px] funnel-sans-regular">
                                Welcome back
                            </div>
                            <div className="text-[12px] text-[#777777]">
                                Sign in to your account
                            </div>
                            <div className="flex md:w-[370px] p-[8px] justify-center items-center border-[1px] gap-[8px] mt-[32px] self-center px-[24px] py-[4px] rounded-[4px] cursor-pointer">
                                <div className="text-[20px] p-[4px] rounded-[4px]">
                                    <GoogleIcon color="#000000" size={24} />
                                </div>
                                <div className="text-[16px] px-[4px] rounded-[4px] funnel-sans-regular">
                                    Continue with Google
                                </div>
                            </div>
                            <div className="self-center mt-[16px] flex justify-center items-center">
                                <div> or </div>
                            </div>

                            <form noValidate>
                                <div className="flex flex-col">
                                    <div className="">
                                        <label className="text-[12px] block funnel-sans-regular text-[#FFFFFF] mb-[8px]">
                                            Email
                                        </label>
                                        <input
                                            onChange={(e) =>
                                                handleEmailChange(e)
                                            }
                                            type="email"
                                            className="bg-[#FFFFFF] border-[1px] border-[#d9d9d9] text-[#444444] rounded-[4px] block w-full text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                            placeholder="you@example.com"
                                            required
                                            disabled={loading}
                                        />
                                        {formError.emailError && (
                                            <p className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center text-[#e84444]">
                                                {formError.emailError}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-[16px]">
                                        <div className="flex justify-between items-center  mb-[8px]">
                                            <label className="text-[12px] block funnel-sans-regular text-[#444444]">
                                                Password
                                            </label>
                                            <Link to="/forgot-password">
                                                <label className="text-[12px] block funnel-sans-regular text-[#444444] cursor-pointer">
                                                    Forgot Password?
                                                </label>
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <div
                                                onClick={(e) =>
                                                    setHidePassowrd(
                                                        !hidePassowrd
                                                    )
                                                }
                                                className="absolute border-[1px] border-[#d9d9d9] px-[4px] rounded-[4px] right-[8px] top-1/2 -translate-y-1/2 hover:bg-[#f5f5f5]"
                                            >
                                                {hidePassowrd ? (
                                                    <EyeOpenIcon
                                                        color="#d9d9d9"
                                                        size={24}
                                                    />
                                                ) : (
                                                    <EyeCloseIcon
                                                        color="#d9d9d9"
                                                        size={24}
                                                    />
                                                )}
                                            </div>
                                            <input
                                                onChange={(e) =>
                                                    handlePasswordChange(e)
                                                }
                                                type={
                                                    hidePassowrd
                                                        ? 'password'
                                                        : 'text'
                                                }
                                                autoComplete="on"
                                                className="bg-[#FFFFFF] border-[1px] border-[#d9d9d9] text-[#444444] rounded-[4px] block w-full text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        {formError.passwordError && (
                                            <p className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center text-[#e84444]">
                                                {formError.passwordError}
                                            </p>
                                        )}
                                    </div>

                                    {signInError && (
                                        <p className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center text-[#e84444]">
                                            {signInError}
                                        </p>
                                    )}

                                    {userInputs.password.length > 0 && (
                                        <div className="mt-[16px] flex flex-col text-[#444444]">
                                            <ul className="list-none w-full funnel-sans-regular">
                                                <li className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center">
                                                    {!passwordValidation.hasUpperCase ? (
                                                        <WrongIcon
                                                            color="#e84444"
                                                            size={12}
                                                        />
                                                    ) : (
                                                        <CorrectIcon
                                                            color="#2cc182"
                                                            size={12}
                                                        />
                                                    )}
                                                    Uppercase letter
                                                </li>
                                                <li className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center">
                                                    {!passwordValidation.hasLowerCase ? (
                                                        <WrongIcon
                                                            color="#e84444"
                                                            size={12}
                                                        />
                                                    ) : (
                                                        <CorrectIcon
                                                            color="#2cc182"
                                                            size={12}
                                                        />
                                                    )}
                                                    Lowercase letter
                                                </li>
                                                <li className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center">
                                                    {!passwordValidation.hasNumber ? (
                                                        <WrongIcon
                                                            color="#e84444"
                                                            size={12}
                                                        />
                                                    ) : (
                                                        <CorrectIcon
                                                            color="#2cc182"
                                                            size={12}
                                                        />
                                                    )}
                                                    Number
                                                </li>
                                                <li className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center">
                                                    {!passwordValidation.hasSpecialCharacter ? (
                                                        <WrongIcon
                                                            color="#e84444"
                                                            size={12}
                                                        />
                                                    ) : (
                                                        <CorrectIcon
                                                            color="#2cc182"
                                                            size={12}
                                                        />
                                                    )}
                                                    {specialCharatcer}
                                                </li>
                                                <li className="mt-[8px] text-[12px] flex justify-start gap-[4px] items-center">
                                                    {!passwordValidation.has8orMore ? (
                                                        <WrongIcon
                                                            color="#e84444"
                                                            size={12}
                                                        />
                                                    ) : (
                                                        <CorrectIcon
                                                            color="#2cc182"
                                                            size={12}
                                                        />
                                                    )}
                                                    8 characters or more
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <button
                                    disabled={
                                        formError.emailError ||
                                        formError.passwordError ||
                                        !userInputs.email ||
                                        !userInputs.password
                                    }
                                    onClick={(e) => handleSignIn(e)}
                                    className="flex w-full p-[4px] text-[16px] justify-center items-center gap-[8px] mt-[32px] self-center px-[24px] py-[8px] rounded-[4px] bg-[#8ce7bb] border-[1px] border-[#2cc182] cursor-pointer hover:bg-[#6cd5aa]"
                                >
                                    <div className="flex items-center justify-center gap-[4px]">
                                        Sign In
                                    </div>
                                </button>
                            </form>

                            {/* <div className="self-center mt-[16px] flex justify-center items-center">
                            <div className="flex gap-[2px] text-[12px]">
                                <div>Don't have an account?</div>
                                <Link to="/sign-up">
                                    <div className="underline cursor-pointer funnel-sans-semibold">
                                        Sign Up Now
                                    </div>
                                </Link>
                            </div>
                        </div> */}
                        </div>
                    </div>
                    <div className="text-center mt-[32px] flex justify-center px-[12px] text-[12px] funnel-sans-regular text-[#747474]">
                        By continuing, you agree to Petals's Terms of Service
                        and Privacy Policy, and to receive periodic emails with
                        updates.
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignIn
