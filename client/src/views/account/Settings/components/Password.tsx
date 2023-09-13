import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useTranslation } from 'react-i18next'

type PasswordFormModel = {
    password: string
    newPassword: string
    confirmNewPassword: string
}

const Password = () => {
    const { t } = useTranslation()

    const validationSchema = Yup.object().shape({
        password: Yup.string().required(
            t('validations.required') || 'Required'
        ),
        newPassword: Yup.string()
            .required(t('validations.required') || 'Required')
            .min(8, `${t('validations.minString')} 8)`),
        confirmNewPassword: Yup.string().oneOf(
            [Yup.ref('newPassword'), ''],
            t('validations.passwordMismatch') || 'Password not match'
        ),
    })
    const onFormSubmit = (
        values: PasswordFormModel,
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        toast.push(
            <Notification
                title={
                    t('notifications.password.updated') || 'Password updated'
                }
                type="success"
            />,
            {
                placement: 'top-center',
            }
        )
        setSubmitting(false)
        console.log('values', values)
    }

    return (
        <>
            <Formik
                initialValues={{
                    password: '',
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
                                <FormDesription
                                    title={t(
                                        'settings.sections.password.title'
                                    )}
                                    desc={t('settings.sections.password.desc')}
                                />
                                <FormRow
                                    name="password"
                                    label={
                                        t('fields.currentPassword') ||
                                        'Current Password'
                                    }
                                    {...validatorProps}
                                >
                                    <Field
                                        type="password"
                                        autoComplete="off"
                                        name="password"
                                        placeholder={t(
                                            'fields.currentPassword'
                                        )}
                                        component={Input}
                                    />
                                </FormRow>
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
                                            'fields.confirmPassword'
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
