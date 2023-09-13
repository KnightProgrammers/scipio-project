import { FormItem, FormContainer } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import PasswordInput from '@/components/shared/PasswordInput'
import ActionLink from '@/components/shared/ActionLink'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import useAuth from '@/utils/hooks/useAuth'
import type { CommonProps } from '@/@types/common'
import { useTranslation } from 'react-i18next'

interface SignUpFormProps extends CommonProps {
    signInUrl?: string
}

type SignUpFormSchema = {
    name: string
    password: string
    email: string
    lang: string
}

const SignUpForm = (props: SignUpFormProps) => {
    const { className, signInUrl = '/sign-in' } = props

    const { t, i18n } = useTranslation()

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(t('validations.required') || ''),
        email: Yup.string()
            .email(t('validations.email') || '')
            .required(t('validations.required') || ''),
        password: Yup.string().required(t('validations.required') || ''),
        confirmPassword: Yup.string().oneOf(
            [Yup.ref('password')],
            t('validations.passwordMismatch') || ''
        ),
    })

    const { signUp } = useAuth()

    const [message, setMessage] = useTimeOutMessage()

    const onSignUp = async (
        values: SignUpFormSchema,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        const { name, password, email } = values
        setSubmitting(true)
        const result = await signUp({
            name,
            password,
            email,
            lang: i18n.language,
        })

        if (result?.status === 'failed') {
            setMessage(result.message)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {message && (
                <Alert showIcon className="mb-4" type="danger">
                    {message}
                </Alert>
            )}
            <Formik
                initialValues={{
                    name: '',
                    password: '',
                    confirmPassword: '',
                    email: '',
                    lang: i18n.language,
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    onSignUp(values, setSubmitting)
                }}
            >
                {({ touched, errors, isSubmitting }) => (
                    <Form>
                        <FormContainer>
                            <FormItem
                                label={t('fields.name') || 'Name'}
                                invalid={errors.name && touched.name}
                                errorMessage={errors.name}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="name"
                                    placeholder={t('fields.name')}
                                    component={Input}
                                />
                            </FormItem>
                            <FormItem
                                label={t('fields.email') || 'Email'}
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
                                    ? t('actions.creatingAccount')
                                    : t('actions.signUp')}
                            </Button>
                            <div className="mt-4 text-center">
                                <span>{t('auth.signUp.footer')} </span>
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

export default SignUpForm
