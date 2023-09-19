import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormDescription from './FormDescription'
import FormRow from '../../../../components/shared/FormRow'
import { Field, Form, Formik } from 'formik'
import { HiOutlineUserCircle, HiOutlineMail } from 'react-icons/hi'
import { BiWorld } from 'react-icons/bi'
import * as Yup from 'yup'
import type { FieldProps } from 'formik'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { setLang, setUser, useAppDispatch } from '@/store'
import { apiUpdateUserProfile } from '@/services/AccountServices'
import { CustomControl, CustomSelectOption } from '@/components/shared'
import { langOptions, LanguageOption } from '@/@types/system'

export type ProfileFormModel = {
    id: string
    name: string
    email: string
    avatar: string
    lang: string
    country: string
}

type ProfileProps = {
    data: ProfileFormModel
}

const Profile = ({
    data = {
        id: '',
        name: '',
        email: '',
        avatar: '',
        lang: '',
        country: '',
    },
}: ProfileProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()

    const validationSchema = Yup.object().shape({
        name: Yup.string()
            .min(3, `${t('validations.minString')} 3)`)
            .max(100, `${t('validations.maxString')} 100)`)
            .required(t('validations.required') || 'Required'),
        email: Yup.string()
            .email(t('validations.email') || 'Invalid Email')
            .required(t('validations.required') || 'Required'),
        lang: Yup.string(),
    })
    const onFormSubmit = async (
        values: ProfileFormModel,
        setSubmitting: (isSubmitting: boolean) => void,
    ) => {
        try {
            const { data: user } = await apiUpdateUserProfile({
                id: values.id,
                name: values.name,
                email: values.email,
                avatar: values.avatar,
                lang: values.lang
            })
            toast.push(
                <Notification
                    title={t('notifications.profile.updated') || ''}
                    type="success"
                />,
                {
                    placement: 'top-center',
                },
            )
            const lang = values.lang || 'en'
            await i18n.changeLanguage(lang)
            dispatch(setLang(lang))
            dispatch(setUser(user))
        } catch {
            toast.push(
                <Notification title={t('error.generic') || ''} type="danger" />,
                {
                    placement: 'top-center',
                },
            )
        }

        setSubmitting(false)
    }

    return (
        <Formik
            enableReinitialize
            initialValues={{
                name: data.name,
                email: data.email,
                country: data.country,
                lang: i18n.language,
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                onFormSubmit(
                    {
                        ...data,
                        ...values,
                    },
                    setSubmitting,
                )
            }}
        >
            {({ values, touched, errors, isSubmitting }) => {
                const validatorProps = { touched, errors }
                return (
                    <Form>
                        <FormContainer>
                            <FormDescription
                                title={t(
                                    'pages.settings.sections.general.title',
                                )}
                                desc={t('pages.settings.sections.general.desc')}
                            />
                            <FormRow
                                name="name"
                                label={t('fields.name') || 'Name'}
                                {...validatorProps}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="name"
                                    label={t('fields.name')}
                                    component={Input}
                                    prefix={
                                        <HiOutlineUserCircle className="text-xl" />
                                    }
                                />
                            </FormRow>
                            <FormRow
                                name="email"
                                label={t('fields.email') || 'Name'}
                                {...validatorProps}
                            >
                                <Field
                                    type="email"
                                    autoComplete="off"
                                    name="email"
                                    disabled={true}
                                    label={t('fields.email')}
                                    component={Input}
                                    prefix={
                                        <HiOutlineMail className="text-xl" />
                                    }
                                />
                            </FormRow>
                            <FormRow
                                name="country"
                                label={t('fields.country') || 'Name'}
                                {...validatorProps}
                            >
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="country"
                                    disabled={true}
                                    label={t('fields.country')}
                                    component={Input}
                                    prefix={<BiWorld className="text-xl" />}
                                />
                            </FormRow>
                            <FormDescription
                                className="mt-8"
                                title={t(
                                    'pages.settings.sections.preferences.title',
                                )}
                                desc={t(
                                    'pages.settings.sections.preferences.desc',
                                )}
                            />
                            <FormRow
                                name="lang"
                                label={t('fields.language') || 'language'}
                                {...validatorProps}
                            >
                                <Field name="lang">
                                    {({ field, form }: FieldProps) => (
                                        <Select<LanguageOption>
                                            field={field}
                                            form={form}
                                            options={langOptions}
                                            components={{
                                                Option: CustomSelectOption,
                                                Control: CustomControl,
                                            }}
                                            value={langOptions.filter(
                                                (option) =>
                                                    option.value ===
                                                    values?.lang,
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value,
                                                )
                                            }
                                        />
                                    )}
                                </Field>
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
    )
}

export default Profile
