import { useEffect, useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useNavigate } from 'react-router-dom'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import { auth } from '@/services/FirebaseService'
import { confirmPasswordReset } from 'firebase/auth'
import { useTranslation } from 'react-i18next'

interface ResetPasswordFormProps extends CommonProps {
    signInUrl?: string
}

type ResetPasswordFormSchema = {
    password: string
    confirmPassword: string
}

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const { className, signInUrl = '/sign-in' } = props
    const [oobCode, setOobCode] = useState('')

    const { t } = useTranslation()

    const [message, setMessage] = useTimeOutMessage()

    const navigate = useNavigate()

    useEffect(() => {
        const u = new URL(window.location.href)
        const code = u.searchParams.get('oobCode')

        if (!code) {
            navigate('/sign-in')
        } else {
            setOobCode(code)
        }
    }, [navigate])

    const validationSchema = Yup.object().shape({
        password: Yup.string().required(t('validations.required') || ''),
        confirmPassword: Yup.string().oneOf(
            [Yup.ref('password')],
            t('validations.passwordMismatch') || ''
        ),
    })

    const onSubmit = async (
        values: ResetPasswordFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { password } = values
        setSubmitting(true)
        try {
            await confirmPasswordReset(auth, oobCode, password)
            navigate('/sign-in')
        } catch (error) {
            setSubmitting(false)
            setMessage((error as Error).toString())
        }
    }

    return (
        <div className={className}>
            <div className="mb-6">
                <h3 className="mb-1">{t('pages.auth.resetPassword.title')}</h3>
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    password: '',
                    confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    onSubmit(values, setSubmitting)
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label={t('fields.password') || 'Password'}
                                invalid={errors.password && touched.password}
                                errorMessage={errors.password}
                            >
                                <Field
                                    autoComplete="off"
                                    name="password"
                                    placeholder={t('fields.password')}
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <FormItem
                                label={
                                    t('fields.confirmPassword') ||
                                    'Confirm Password'
                                }
                                invalid={
                                    errors.confirmPassword &&
                                    touched.confirmPassword
                                }
                                errorMessage={errors.confirmPassword}
                            >
                                <Field
                                    autoComplete="off"
                                    name="confirmPassword"
                                    placeholder={t('fields.confirmPassword')}
                                    component={PasswordInput}
                                />
                            </FormItem>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {isSubmitting
                                    ? t('actions.submitting')
                                    : t('actions.submit')}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>
                                    {t('pages.auth.resetPassword.footer')}{' '}
                                </span>
                                <ActionLink to={signInUrl}>
                                    {t('actions.signIn')}
                                </ActionLink>
                            </div>
                        </FormContainer>
                    </Form>
                )}
            </Formik>
        </div>
    )
}

export default ResetPasswordForm
