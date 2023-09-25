import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Checkbox from '@/components/ui/Checkbox'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import { useTranslation } from 'react-i18next'
import Divider from '@/components/shared/Divider'
import { auth } from '@/services/FirebaseService'

import {
    signInWithPopup,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
} from 'firebase/auth'

import { FcGoogle } from 'react-icons/fc'
import { useState } from 'react'
import useAuth from '@/utils/hooks/useAuth'

interface SignInFormProps extends CommonProps {
    forgotPasswordUrl?: string
    signUpUrl?: string
}

type SignInFormSchema = {
    email: string
    password: string
    rememberMe: boolean
}

const SignInForm = (props: SignInFormProps) => {
    const [loadingWithProvider, setLoadingWithProvider] = useState(false)

    const { t } = useTranslation()
    const { signIn } = useAuth()
    auth.useDeviceLanguage()
    const googleAuthProvider = new GoogleAuthProvider()

    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .email(t('validations.email') || '')
            .required(t('validations.required') || ''),
        password: Yup.string().required(t('validations.required') || ''),
        rememberMe: Yup.bool(),
    })

    const {
        className,
        forgotPasswordUrl = '/forgot-password',
        signUpUrl = '/sign-up',
    } = props

    const [message, setMessage] = useTimeOutMessage()

    const onSignInWithGoogle = async () => {
        try {
            setLoadingWithProvider(true)
            const credential = await signInWithPopup(auth, googleAuthProvider)
            GoogleAuthProvider.credentialFromResult(credential)
            await signIn(credential)
        } catch {
            setLoadingWithProvider(false)
            setMessage(t('error.generic') || 'Error with Google')
        }
    }
    const onSignInWithPassword = async (
        values: SignInFormSchema,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        try {
            const credential = await signInWithEmailAndPassword(
                auth,
                values.email,
                values.password,
            )
            await signIn(credential)
        } catch {
            setSubmitting(false)
            setMessage(
                t('error.auth.invalidCredentials') || 'Something went wrong',
            )
        }
    }

    return (
        <div className={className}>
            <div className="mb-4">
                <Button
                    icon={<FcGoogle />}
                    loading={loadingWithProvider}
                    onClick={() => onSignInWithGoogle()}
                >
                    <span>Sign in with Google</span>
                </Button>
            </div>
            {!loadingWithProvider && (
                <>
                    <Divider label="Or sign in with email" />
                    {message && (
                        <Alert showIcon className="mb-4 mt-4" type="danger">
                            <>{message}</>
                        </Alert>
                    )}
                    <Formik
                        initialValues={{
                            email: '',
                            password: '',
                            rememberMe: false,
                        }}
                        validationSchema={validationSchema}
                        onSubmit={async (values, { setSubmitting }) => {
                            await onSignInWithPassword(values, setSubmitting)
                        }}
                    >
                        {({ touched, errors, isSubmitting }) => (
                            <Form>
                                <FormContainer className="mb-4">
                                    <FormItem
                                        label={t('fields.email') || 'Email'}
                                        invalid={
                                            (errors.email &&
                                                touched.email) as boolean
                                        }
                                        errorMessage={errors.email}
                                    >
                                        <Field
                                            type="text"
                                            autoComplete="off"
                                            name="email"
                                            placeholder={t('fields.email')}
                                            component={Input}
                                        />
                                    </FormItem>
                                    <FormItem
                                        label={
                                            t('fields.password') || 'Password'
                                        }
                                        invalid={
                                            (errors.password &&
                                                touched.password) as boolean
                                        }
                                        errorMessage={errors.password}
                                    >
                                        <Field
                                            autoComplete="off"
                                            name="password"
                                            placeholder={t('fields.password')}
                                            component={PasswordInput}
                                        />
                                    </FormItem>
                                    <div className="flex justify-between mb-6">
                                        <Field
                                            className="mb-0"
                                            name="rememberMe"
                                            component={Checkbox}
                                        >
                                            {t('fields.rememberMe')}
                                        </Field>
                                        <ActionLink to={forgotPasswordUrl}>
                                            {t(
                                                'pages.auth.signIn.forgotPassword',
                                            )}
                                        </ActionLink>
                                    </div>
                                    <Button
                                        block
                                        loading={isSubmitting}
                                        variant="solid"
                                        type="submit"
                                        data-tn="sign-in"
                                    >
                                        {isSubmitting
                                            ? t('actions.signingIn')
                                            : t('actions.signIn')}
                                    </Button>
                                </FormContainer>
                            </Form>
                        )}
                    </Formik>
                    <div className="text-center">
                        <span>{t('pages.auth.signIn.footer')} </span>
                        <ActionLink to={signUpUrl}>
                            {t('actions.signUp')}
                        </ActionLink>
                    </div>
                </>
            )}
        </div>
    )
}

export default SignInForm
