import {
    Avatar,
    Badge,
    Button,
    Card,
    Dropdown,
    FormItem,
    Input,
    ModalForm,
    Select,
} from '@/components/ui'
import { BsCreditCard2Front } from 'react-icons/bs'
import {
    ConfirmDialog,
    Container,
    EllipsisButton,
    FormCustomFormatInput,
    IconText,
    Loading,
} from '@/components/shared'
import { HiOutlinePencilAlt, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { HiEye } from 'react-icons/hi2'
import currencyFormat from '@/utils/currencyFormat'
import EmptyState from '@/components/shared/EmptyState'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import * as Yup from 'yup'
import { useMemo, useState } from 'react'
import { MdOutlineAttachMoney } from 'react-icons/md'
import { SelectFieldItem } from '@/components/ui/Form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiGetUserCurrencies } from '@/services/AccountService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiGetCreditCardList,
    apiCreateCreditCard,
    apiUpdateCreditCard,
    apiDeleteCreditCard,
} from '@/services/CreditCardService'

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

const CardTitle = (props: { creditCard: any }) => {
    const { creditCard } = props

    let subTitle: string = creditCard.issuer

    if (creditCard.lastFourDigits) {
        subTitle = `•••• ${creditCard.lastFourDigits}`
    } else if (creditCard.cardHolder) {
        subTitle = creditCard.cardHolder
    }

    return (
        <div className="grid ">
            <span className="pl-2 text-xs font-light inline-flex">
                {subTitle.toLocaleUpperCase()}
            </span>
            <span className="pl-2 text-lg inline-flex">
                {creditCard.label.toLocaleUpperCase()}
            </span>
        </div>
    )
}

function cardExpiryFormat(val: string) {
    const month = limit(val.substring(0, 2), '12')
    const date = limit(val.substring(2, 4), '31')

    return month + (date.length ? '/' + date : '')
}

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
    const [selectedCreditCard, setSelectedCreditCard] = useState<
        any | undefined
    >(undefined)
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)

    const { t } = useTranslation()

    const { data: userCurrencies, isFetching: isFetchingUserCurrencies } =
        useQuery({
            queryKey: ['user-currencies'],
            queryFn: apiGetUserCurrencies,
        })

    const {
        data: creditCardList,
        isFetching: isFetchingCreditCards,
        refetch: refetchUserCurrencies,
    } = useQuery({
        queryKey: ['user-credit-cards'],
        queryFn: apiGetCreditCardList,
    })

    const onMutationSuccess = async (title: string) => {
        refetchUserCurrencies()
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const createCreditCardMutation = useMutation({
        mutationFn: apiCreateCreditCard,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.creditCard.created') || '')
        },
    })

    const updateCreditCardMutation = useMutation({
        mutationFn: apiUpdateCreditCard,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.creditCard.updated') || '')
        },
    })

    const deleteCreditCardMutation = useMutation({
        mutationFn: apiDeleteCreditCard,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.creditCard.deleted') || '')
        },
    })

    const ISSUERS = [
        { label: 'Visa', value: 'visa' },
        { label: 'Mastercard', value: 'mastercard' },
        { label: t('placeholders.other'), value: 'other' },
    ]

    const CREDIT_CARD_STATUS = [
        { label: t('creditCardStatus.ACTIVE'), value: 'ACTIVE' },
        { label: t('creditCardStatus.BLOCKED'), value: 'BLOCKED' },
    ]

    const validationSchema = Yup.object().shape({
        label: Yup.string().required(t('validations.required') || ''),
        expiration: Yup.string().required(t('validations.required') || ''),
        issuer: Yup.string().required(t('validations.required') || ''),
        status: Yup.string().required(t('validations.required') || ''),
        creditLimitAmount: Yup.string().required(
            t('validations.required') || '',
        ),
        creditLimitCurrencyId: Yup.string().required(
            t('validations.required') || '',
        ),
    })

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedCreditCard(undefined)
    }
    const onFormSubmit = (data: any) => {
        if (selectedCreditCard) {
            const expiration = data.expiration.replace('/', '')
            updateCreditCardMutation.mutate({
                ...data,
                id: selectedCreditCard.id,
                expiration,
            })
        } else {
            createCreditCardMutation.mutate(data)
        }
        onFormClose()
    }

    const onDeleteConfirmClose = () => {
        setIsConfirmDeleteOpen(false)
        setSelectedCreditCard(undefined)
    }

    const onDelete = async () => {
        if (selectedCreditCard) {
            deleteCreditCardMutation.mutate(selectedCreditCard.id)
        }
        onDeleteConfirmClose()
    }

    const defaultValue = useMemo(() => {
        if (selectedCreditCard) {
            return {
                ...selectedCreditCard,
                creditLimitCurrencyId:
                    selectedCreditCard.creditLimitCurrency.id,
            }
        }
        return {
            status: 'ACTIVE',
        }
    }, [selectedCreditCard])

    const CreditCardForm = () => (
        <ModalForm
            isOpen={isFormOpen}
            entity={defaultValue}
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
                        asterisk
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
                        invalid={
                            !!errors.lastFourDigits || !!touched.lastFourDigits
                        }
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
                        asterisk
                        label={t(`fields.expiration`) || ''}
                        invalid={!!errors.expiration || !!touched.expiration}
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
                                        onValueChange={(e) =>
                                            form.setFieldValue(
                                                field.name,
                                                e.value,
                                            )
                                        }
                                    />
                                )
                            }}
                        </Field>
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t(`fields.issuer`) || ''}
                        invalid={(errors.issuer || touched.issuer) as boolean}
                        errorMessage={errors.issuer?.toString()}
                    >
                        <Field name="issuer">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    field={field}
                                    form={form}
                                    placeholder={t(`fields.issuer`) || ''}
                                    options={ISSUERS}
                                    id="issuer-select"
                                    value={ISSUERS.filter(
                                        (issuer) =>
                                            issuer.value === field.value,
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
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t(`fields.status`) || ''}
                        invalid={(errors.status || touched.status) as boolean}
                        errorMessage={errors.status?.toString()}
                    >
                        <Field name="status">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    field={field}
                                    form={form}
                                    placeholder={t(`fields.status`) || ''}
                                    options={CREDIT_CARD_STATUS}
                                    id="status-select"
                                    value={CREDIT_CARD_STATUS.filter(
                                        (status: any) =>
                                            status.value === field.value,
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
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t(`fields.creditLimitAmount`) || ''}
                        invalid={
                            !!errors.creditLimitAmount ||
                            !!touched.creditLimitAmount
                        }
                        errorMessage={errors.creditLimitAmount?.toString()}
                    >
                        <Field
                            type="number"
                            autoComplete="off"
                            name="creditLimitAmount"
                            placeholder={t(`fields.creditLimitAmount`)}
                            component={Input}
                            prefix={
                                <MdOutlineAttachMoney className="text-xl" />
                            }
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t('fields.currency') || ''}
                        invalid={
                            !!errors.creditLimitCurrencyId ||
                            !!touched.creditLimitCurrencyId
                        }
                        errorMessage={errors.creditLimitCurrencyId?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="creditLimitCurrencyId"
                            placeholder={t('fields.currency')}
                            options={userCurrencies?.map((c) => ({
                                value: c.id,
                                label: `${c.code} - ${t(
                                    `currencies.${c.code}`,
                                )}`,
                            }))}
                            isLoading={isFetchingUserCurrencies}
                            className="currency-select"
                            id="currency-select"
                            component={SelectFieldItem}
                        />
                    </FormItem>
                </>
            )}
            isSaving={
                createCreditCardMutation.isPending ||
                updateCreditCardMutation.isPending
            }
            onClose={onFormClose}
            onSubmit={onFormSubmit}
        />
    )

    if (!creditCardList || isFetchingCreditCards) {
        return (
            <div
                className="flex h-full mx-auto w-0"
                data-tn="credit-cards-page"
            >
                <Loading loading />
            </div>
        )
    }

    if (creditCardList.length === 0) {
        return (
            <Container data-tn="credit-cards-page">
                <CreditCardForm />
                <EmptyState
                    title={t('pages.creditCards.emptyState.title')}
                    description={t('pages.creditCards.emptyState.description')}
                    className="bg-transparent dark:bg-transparent"
                    data-tn="empty-state-no-credit-cards"
                >
                    <Button
                        variant="solid"
                        className="mt-4"
                        icon={<HiPlus />}
                        data-tn="add-credit-card-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.creditCards.addCreditCardButton')}
                    </Button>
                </EmptyState>
            </Container>
        )
    }

    const getBadgedColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'emerald'
            case 'BLOCKED':
                return 'yellow'
            case 'EXPIRED':
                return 'red'
            default:
                return 'gray'
        }
    }
    return (
        <Container data-tn="credit-cards-page">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {creditCardList.map((c) => (
                    <Card
                        key={c.id}
                        className="my-4"
                        bodyClass="p-0"
                        data-tn={`credit-card-${c.id}`}
                        header={
                            <div className="grid grid-flow-col auto-cols-max gap-4 items-center relative">
                                <CardIcon cardIssuer={c.issuer} />
                                <CardTitle creditCard={c} />
                                <Dropdown
                                    className="absolute right-0 top-0"
                                    placement="middle-end-top"
                                    renderTitle={
                                        <EllipsisButton data-tn="dropdown-credit-card-btn" />
                                    }
                                >
                                    <Dropdown.Item
                                        eventKey="edit"
                                        data-tn={`edit-credit-card-btn-${c.id}`}
                                        onClick={() => {
                                            setSelectedCreditCard(c)
                                            setIsFormOpen(true)
                                        }}
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
                                        data-tn={`delete-credit-card-btn-${c.id}`}
                                        onClick={() => {
                                            setSelectedCreditCard(c)
                                            setIsConfirmDeleteOpen(true)
                                        }}
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
                            <div className="grid grid-cols-2 pb-4 items-center p-4">
                                <div className="flex flex-col">
                                    <small className="font-light">
                                        {t(`fields.expiration`)}
                                    </small>
                                    <span className="font-semibold">
                                        {c.expiration}
                                    </span>
                                </div>
                                <div className="text-right w-full">
                                    <Badge
                                        content={t(
                                            `creditCardStatus.${c.status}`,
                                        ).toUpperCase()}
                                        innerClass={`bg-${getBadgedColor(
                                            c.status,
                                        )}-500`}
                                        className="text-sm"
                                    />
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="block mb-2">
                                    <p className="text-gray-500 font-light">
                                        {t(`fields.creditLimitAmount`)}
                                    </p>
                                    <p className="text-4xl font-semibold text-center">
                                        {currencyFormat(
                                            c.creditLimitAmount,
                                            c.creditLimitCurrency.code,
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 hidden">
                                <Button
                                    block
                                    variant="twoTone"
                                    size="sm"
                                    icon={<HiEye />}
                                >
                                    {t('actions.viewDetail')}
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                <Card
                    bordered
                    className="my-4 bg-transparent dark:bg-transparent cursor-pointer hover:border-purple-500 border-4 border-dashed"
                    bodyClass="flex flex-col justify-center items-center h-full"
                    data-tn="add-credit-card-btn"
                    style={{ minHeight: '240px' }}
                    onClick={() => setIsFormOpen(true)}
                >
                    <div className="p-4 rounded-full bg-gray-50 dark:bg-gray-600">
                        <HiPlus
                            size={32}
                            color="888888"
                            className="text-4xl text-gray-300"
                        />
                    </div>
                    <p className="m-4 font-semibold">
                        {t('pages.creditCards.addCreditCardButton')}
                    </p>
                </Card>
            </div>
            <CreditCardForm />
            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                type="danger"
                title={t('pages.creditCards.deleteConfirmation.title')}
                data-tn="confirm-delete-credit-card-dialog"
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                onClose={onDeleteConfirmClose}
                onRequestClose={onDeleteConfirmClose}
                onCancel={onDeleteConfirmClose}
                onConfirm={onDelete}
            >
                <p>{t('pages.creditCards.deleteConfirmation.description')}</p>
            </ConfirmDialog>
        </Container>
    )
}

export default CreditCards
