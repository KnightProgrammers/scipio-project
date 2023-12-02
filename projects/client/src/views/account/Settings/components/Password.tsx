import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormDescription from './FormDescription'
import FormRow from '../../../../components/shared/FormRow'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'
import { updatePassword } from 'firebase/auth'
import { auth } from '@/services/FirebaseService'
import { useNavigate } from 'react-router-dom'

type PasswordFormModel = {
    newPassword: string
    confirmNewPassword: string
}

const Password = () => {
    const { t } = useTranslation()

    const navigate = useNavigate()

    const validationSchema = Yup.object().shape({
        newPassword: Yup.string()
            .required(t('validations.required') || 'Required')
            .min(8, `${t('validations.minString')} 8)`),
        confirmNewPassword: Yup.string().oneOf(
            [Yup.ref('newPassword'), ''],
            t('validations.passwordMismatch') || 'Password not match',
        ),
    })
    const onFormSubmit = async (
        values: PasswordFormModel,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        const user = auth.currentUser
        if (!user) {
            navigate('/sign-in')
            return
        }
        try {
            await updatePassword(user, values.newPassword)
            toast.push(
                <Notification
                    title={
                        t('notifications.password.updated') ||
                        'Password updated'
                    }
                    type="success"
                />,
                {
                    placement: 'top-center',
                },
            )
        } catch (e) {
            toast.push(
                <Notification
                    title={t('error.generic') || 'Please try again'}
                    type="danger"
                />,
                {
                    placement: 'top-center',
                },
            )
        }
        setSubmitting(false)
    }

    return (
        <>
            <Formik
                initialValues={{
                    newPassword: '',
                    confirmNewPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true)
                    setTimeout(() => {
                        onFormSubmit(values, setSubmitting)
                    }, 1000)
                }}
            >
                {({ touched, errors, isSubmitting }) => {
                    const validatorProps = { touched, errors }
                    return (
                        <Form>
                            <FormContainer>
                                <FormDescription
                                    title={t(
                                        'pages.settings.sections.password.title',
                                    )}
                                    desc={t(
                                        'pages.settings.sections.password.desc',
                                    )}
                                />
                                <FormRow
                                    name="newPassword"
                                    label={
                                        t('fields.newPassword') ||
                                        'New Password'
                                    }
                                    {...validatorProps}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="off"
                                        name="newPassword"
                                        placeholder={t('fields.newPassword')}
                                        component={Input}
                                    />
                                </FormRow>
                                <FormRow
                                    name="confirmNewPassword"
                                    label={
                                        t('fields.confirmPassword') ||
                                        'Confirm Password'
                                    }
                                    {...validatorProps}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="off"
                                        name="confirmNewPassword"
                                        placeholder={t(
                                            'fields.confirmPassword',
                                        )}
                                        component={Input}
                                    />
                                </FormRow>
                                <div className="mt-4 ltr:text-right">
                                    <Button
                                        variant="solid"
                                        loading={isSubmitting}
                                        type="submit"
                                    >
                                        {isSubmitting
                                            ? t('actions.updating')
                                            : t('actions.update')}
                                    </Button>
                                </div>
                            </FormContainer>
                        </Form>
                    )
                }}
            </Formik>
        </>
    )
}

export default Password
