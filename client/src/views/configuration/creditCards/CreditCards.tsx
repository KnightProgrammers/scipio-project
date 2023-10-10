import {
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    Dropdown,
    FormItem,
    Input,
    ModalForm,
    Progress, Select
} from "@/components/ui";
import { BsCreditCard2Front } from 'react-icons/bs'
import { EllipsisButton, FormCustomFormatInput, IconText } from "@/components/shared";
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { HiEye, HiFire } from 'react-icons/hi2'
import currencyFormat from '@/utils/currencyFormat'
import EmptyState from '@/components/shared/EmptyState'
import { Field, FieldProps, FormikErrors, FormikTouched } from "formik";
import { SelectFieldItem } from '@/components/ui/Form'
import * as Yup from 'yup'
import { boolean } from 'yup'
import { useState } from 'react'

type CreditCardType = {
    id: string
    label: string
    cardHolder: string
    lastFourDigits: string
    expiration: string
    billingCycle: string
    creditLimit: {
        amount: number
        currencyCode: string
    }
    issuer: 'mastercard' | 'visa' | 'other'
    creditUsage?: {
        usageAmount: number
        usagePercentage: number
    }
}

function limit(val: string, max: string) {
    if (val.length === 1 && val[0] > max[0]) {
        val = '0' + val
    }

    if (val.length === 2) {
        if (Number(val) === 0) {
            val = '01'
        } else if (val > max) {
            val = max
        }
    }

    return val
}

function cardExpiryFormat(val: string) {
    const month = limit(val.substring(0, 2), '12')
    const date = limit(val.substring(2, 4), '31')

    return month + (date.length ? '/' + date : '')
}

const DATA: CreditCardType[] = [] /*[
    {
        id: '1',
        label: 'BBVA Platinum',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '1234',
        expiration: '12/2024',
        issuer: 'mastercard',
        billingCycle: '29/10',
        creditLimit: {
            amount: 210000,
            currencyCode: 'UYU'
        }
    },
    {
        id: '1',
        label: 'ITAU Gold',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '6523',
        expiration: '12/2025',
        issuer: 'visa',
        billingCycle: '10/10',
        creditLimit: {
            amount: 78000,
            currencyCode: 'UYU'
        }
    },
    {
        id: '3',
        label: 'OCA',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '1776',
        expiration: '08/2027',
        issuer: 'mastercard',
        billingCycle: '20/10',
        creditLimit: {
            amount: 16000,
            currencyCode: 'UYU'
        }
    },
]*/

const CardIcon = (props: { cardIssuer: string }) => {
    switch (props.cardIssuer) {
        case 'mastercard':
            return (
                <Avatar
                    className="bg-transparent dark:bg-transparent"
                    src="/img/card-issuer/mastercard.png"
                    size="md"
                />
            )
        case 'visa':
            return (
                <Avatar
                    className="bg-transparent dark:bg-transparent"
                    src="/img/card-issuer/visa.png"
                    size="md"
                />
            )
        default:
            return <Avatar icon={<BsCreditCard2Front />} size="lg" />
    }
}

const CreditCards = () => {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [selectedCreditCard, setSelectedCreditCard] = useState<
        any | undefined
    >(undefined)
    const { t, i18n } = useTranslation()

    const ISSUERS = [
        { label: 'Visa', value: 'visa' },
        { label: 'Mastercard', value: 'mastercard' },
        { label: t('placeholders.other'), value: 'other' }
    ]

    const progressColor = (actualUsage: number): string => {
        if (actualUsage < 50) {
            return 'green-500'
        }
        if (actualUsage < 75) {
            return 'yellow-500'
        }
        return 'red-500'
    }

    const validationSchema = Yup.object().shape({
        cardHolder: Yup.string().required(t('validations.required') || ''),
        lastFourDigits: Yup.string().required(t('validations.required') || ''),
        expiration: Yup.string().required(t('validations.required') || ''),
    })

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedCreditCard(undefined)
    }
    const onFormSubmit = () => {
        onFormClose()
    }

    const CreditCardForm = () => (
        <ModalForm
            isOpen={isFormOpen}
            entity={{
                label: '',
            }}
            title={
                selectedCreditCard
                    ? t('pages.creditCards.form.editTitle')
                    : t('pages.creditCards.form.newTitle')
            }
            validationSchema={validationSchema}
            fields={(
                errors: FormikErrors<any>,
                touched: FormikTouched<any>,
            ) => (
                <>
                    <FormItem
                        label={t(`fields.label`) || ''}
                        invalid={!!errors.label || !!touched.label}
                        errorMessage={errors.label?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="label"
                            placeholder={t(`fields.label`)}
                            component={Input}
                        />
                    </FormItem>
                    <FormItem
                        label={t(`fields.cardHolder`) || ''}
                        invalid={!!errors.cardHolder || !!touched.cardHolder}
                        errorMessage={errors.cardHolder?.toString()}
                        asterisk
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="cardHolder"
                            placeholder={t(`fields.cardHolder`)}
                            component={Input}
                        />
                    </FormItem>
                    <FormItem
                        label={t(`fields.lastFourDigits`) || ''}
                        invalid={!!errors.lastFourDigits || !!touched.lastFourDigits}
                        errorMessage={errors.lastFourDigits?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="lastFourDigits"
                            placeholder={t(`fields.lastFourDigits`)}
                            component={Input}
                        />
                    </FormItem>
                    <FormItem
                        label={t(`fields.expiration`) || ''}
                        invalid={
                            !! errors.expiration ||
                            !! touched.expiration
                        }
                        asterisk
                        errorMessage={errors.expiration?.toString()}
                    >
                        <Field name="expiration">
                            {({ field, form }: FieldProps) => {
                                return (
                                    <FormCustomFormatInput
                                        form={form}
                                        field={field}
                                        placeholder="••/••"
                                        format={cardExpiryFormat}
                                        defaultValue={form.values.expiration}
                                        onValueChange={(e) => form.setFieldValue(field.name,e.value)}
                                    />
                                )
                            }}
                        </Field>
                    </FormItem>
                    <FormItem
                        label={t(`fields.issuer`) || ''}
                        invalid={(errors.issuer && touched.issuer) as boolean}
                        errorMessage={errors.issuer?.toString()}
                    >
                        <Field name="issuer">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    field={field}
                                    form={form}
                                    placeholder={t(`fields.issuer`) || ''}
                                    options={ISSUERS}
                                    value={ISSUERS.filter(
                                        (issuer) =>
                                            issuer.value === field.value
                                    )}
                                    onChange={(option) =>
                                        form.setFieldValue(field.name, option?.value)
                                    }
                                />
                            )}
                        </Field>
                    </FormItem>
                    <FormItem
                        label={t(`fields.creditLimitAmount`) || ''}
                        invalid={!!errors.creditLimitAmount || !!touched.creditLimitAmount}
                        errorMessage={errors.creditLimitAmount?.toString()}
                        asterisk
                    >
                        <Field
                            type="number"
                            autoComplete="off"
                            name="creditLimitAmount"
                            placeholder={t(`fields.creditLimitAmount`)}
                            component={Input}
                        />
                    </FormItem>
                </>
            )}
            isSaving={isSaving}
            onClose={onFormClose}
            onSubmit={onFormSubmit}
        />
    )

    if (DATA.length === 0) {
        return (
            <div>
                <CreditCardForm />
                <EmptyState
                    title="Sin Tarjetas de Crédito"
                    description="Prueba agregando tarjetas de crédito para asociar controlar mejor tus consumos"
                >
                    <Button
                        variant="solid"
                        className="mt-4"
                        onClick={() => setIsFormOpen(true)}
                    >
                        Agregar Tarjeta de Crédito
                    </Button>
                </EmptyState>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DATA.map((c, index) => (
                <Card
                    className="my-4"
                    header={
                        <div className="grid grid-flow-col auto-cols-max gap-4 items-center relative">
                            <CardIcon cardIssuer={c.issuer} />
                            <div className="grid ">
                                <span className="pl-2 text-xs font-light inline-flex">
                                    {c.label.toLocaleUpperCase()}
                                </span>
                                <span className="pl-2 text-lg inline-flex">
                                    **** {c.lastFourDigits}
                                </span>
                            </div>
                            <Dropdown
                                className="absolute right-0 top-0"
                                placement="middle-end-top"
                                renderTitle={
                                    <EllipsisButton data-tn="dropdown-bank-account-btn" />
                                }
                            >
                                <Dropdown.Item
                                    eventKey="edit"
                                    data-tn="edit-bank-account-btn"
                                    onClick={() => {}}
                                >
                                    <IconText
                                        className="text-sm font-semibold w-full"
                                        icon={<HiOutlinePencilAlt />}
                                    >
                                        {t('actions.edit')}
                                    </IconText>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    eventKey="delete"
                                    data-tn="delete-bank-account-btn"
                                    onClick={() => {}}
                                >
                                    <IconText
                                        className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                        icon={<HiOutlineTrash />}
                                    >
                                        {t('actions.delete')}
                                    </IconText>
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                    }
                >
                    <div className="divide-y">
                        <div className="grid grid-cols-2 pb-4 items-center">
                            <div className="flex flex-col">
                                <small className="font-light">Cierre</small>
                                <span className="font-semibold">
                                    {c.billingCycle}
                                </span>
                            </div>
                            <div className=" text-right">
                                <Badge
                                    content={'Active'}
                                    innerClass="bg-emerald-500"
                                    className="text-sm"
                                />
                            </div>
                        </div>
                        <div className="py-4">
                            <div className="block mb-2">
                                <p className="text-gray-500 font-light">
                                    Limite de crédito
                                </p>
                                <p className="text-4xl font-semibold text-center">
                                    {currencyFormat(
                                        c.creditLimit.amount,
                                        c.creditLimit.currencyCode,
                                    )}
                                </p>
                            </div>
                            <p className="text-gray-500 font-light hidden">
                                Crédito Usado
                            </p>
                            <div className="hidden">
                                <Progress
                                    percent={c.creditUsage?.usagePercentage}
                                    size="md"
                                    color={progressColor(
                                        c.creditUsage?.usagePercentage || 0,
                                    )}
                                />
                            </div>
                        </div>
                        <div className="py-4 hidden">
                            <Button
                                variant="twoTone"
                                size="sm"
                                block
                                icon={<HiEye />}
                            >
                                Ver Movimientos
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
            <CreditCardForm />
        </div>
    )
}

export default CreditCards
