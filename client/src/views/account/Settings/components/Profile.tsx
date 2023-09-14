import Input from '@/components/ui/Input'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Notification from '@/components/ui/Notification'
import toast from '@/components/ui/toast'
import { FormContainer } from '@/components/ui/Form'
import FormDesription from './FormDesription'
import FormRow from './FormRow'
import { Field, Form, Formik } from 'formik'
import { components } from 'react-select'
import { HiOutlineUserCircle, HiOutlineMail, HiCheck } from 'react-icons/hi'
import * as Yup from 'yup'
import type { OptionProps, ControlProps } from 'react-select'
import type { FieldProps } from 'formik'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { setLang, useAppDispatch } from '@/store'

export type ProfileFormModel = {
    id: string
    name: string
    email: string
    avatar: string
    lang: string
}

type ProfileProps = {
    data: ProfileFormModel
}

type LanguageOption = {
    value: string
    label: string
    imgPath: string
}

const { Control } = components

const langOptions: LanguageOption[] = [
    { value: 'en', label: 'English (US)', imgPath: '/img/countries/us.png' },
    {
        value: 'es',
        label: 'Español (Latinoamérica)',
        imgPath: '/img/countries/sp.png',
    },
]

const CustomSelectOption = ({
    innerProps,
    label,
    data,
    isSelected,
}: OptionProps<LanguageOption>) => {
    return (
        <div
            className={`flex items-center justify-between p-2 ${
                isSelected
                    ? 'bg-gray-100 dark:bg-gray-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            {...innerProps}
        >
            <div className="flex items-center">
                <Avatar shape="circle" size={20} src={data.imgPath} />
                <span className="ml-2 rtl:mr-2">{label}</span>
            </div>
            {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
        </div>
    )
}

const CustomControl = ({
    children,
    ...props
}: ControlProps<LanguageOption>) => {
    const selected = props.getValue()[0]
    return (
        <Control {...props}>
            {selected && (
                <Avatar
                    className="ltr:ml-4 rtl:mr-4"
                    shape="circle"
                    size={18}
                    src={selected.imgPath}
                />
            )}
            {children}
        </Control>
    )
}

const Profile = ({
    data = {
        id: '',
        name: '',
        email: '',
        avatar: '',
        lang: '',
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
        setSubmitting: (isSubmitting: boolean) => void
    ) => {
        toast.push(
            <Notification
                title={t('notifications.profile.updated') || ''}
                type="success"
            />,
            {
                placement: 'top-center',
            }
        )
        console.log(values)
        const lang = values.lang || 'en'
        await i18n.changeLanguage(lang)
        dispatch(setLang(lang))
        setSubmitting(false)
    }

    return (
        <Formik
            enableReinitialize
            initialValues={{
                name: data.name,
                email: data.email,
                lang: data.lang || i18n.language,
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
                setSubmitting(true)
                setTimeout(() => {
                    onFormSubmit(
                        {
                            ...data,
                            ...values,
                        },
                        setSubmitting
                    )
                }, 2000)
            }}
        >
            {({ values, touched, errors, isSubmitting }) => {
                const validatorProps = { touched, errors }
                return (
                    <Form>
                        <FormContainer>
                            <FormDesription
                                title={t('settings.sections.general.title')}
                                desc={t('settings.sections.general.desc')}
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
                            <FormDesription
                                className="mt-8"
                                title={t('settings.sections.preferences.title')}
                                desc={t('settings.sections.preferences.desc')}
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
                                                    values?.lang
                                            )}
                                            onChange={(option) =>
                                                form.setFieldValue(
                                                    field.name,
                                                    option?.value
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
