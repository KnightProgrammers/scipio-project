import { useState } from 'react'
import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import { useTranslation } from 'react-i18next'
import { auth } from '@/services/FirebaseService'
import { sendPasswordResetEmail } from 'firebase/auth'

interface ForgotPasswordFormProps extends CommonProps {
    signInUrl?: string
}

type ForgotPasswordFormSchema = {
    email: string
}

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
    const { className, signInUrl = '/sign-in' } = props

    const { t } = useTranslation()

    const validationSchema = Yup.object().shape({
        email: Yup.string().required(t('validations.required') || ''),
    })

    const [emailSent, setEmailSent] = useState(false)

    const [message, setMessage] = useTimeOutMessage()

    const onSendMail = async (
        values: ForgotPasswordFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        setSubmitting(true)
        try {
            await sendPasswordResetEmail(auth, values.email, {
                url: window.location.origin,
            })
            setSubmitting(false)
            setEmailSent(true)
        } catch (error) {
            setMessage((error as Error).toString())
            setSubmitting(false)
        }
    }

    return (
        <div className={className}>
            <div className="mb-6">
                {emailSent ? (
                    <>
                        <h3 className="mb-1">
                            {t('auth.forgotPasswordEmailSent.title')}
                        </h3>
                        <p>{t('auth.forgotPasswordEmailSent.subtitle')}</p>
                    </>
                ) : (
                    <>
                        <h3 className="mb-1">
                            {t('auth.forgotPassword.title')}
                        </h3>
                        <p>{t('auth.forgotPassword.subtitle')}</p>
                    </>
                )}
            </div>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    email: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    onSendMail(values, setSubmitting)
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <div className={emailSent ? 'hidden' : ''}>
                                <FormItem
                                    invalid={errors.email && touched.email}
                                    errorMessage={errors.email}
                                >
                                    <Field
                                        type="email"
                                        autoComplete="off"
                                        name="email"
                                        placeholder={t('fields.email')}
                                        component={Input}
                                    />
                                </FormItem>
                            </div>
                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                            >
                                {emailSent
                                    ? t('actions.reSendEmail')
                                    : t('actions.sendEmail')}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>{t('messages.backTo')}</span>
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

export default ForgotPasswordForm
