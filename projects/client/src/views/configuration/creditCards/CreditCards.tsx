import {
    Avatar,
    Badge,
    Button,
    Card,
    Checkbox,
    DatePicker,
    Drawer,
    Dropdown,
    FormItem,
    Input,
    ModalForm,
    Segment,
    Select,
    Tabs,
} from '@/components/ui'
import { BsCreditCard2Front } from 'react-icons/bs'
import {
    AdaptableCard,
    ConfirmDialog,
    Container,
    EllipsisButton,
    FormCustomFormatInput,
    IconText,
    Loading,
    SegmentItemOption,
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
    apiGetCreditCard,
    apiCreateCreditCardMonthlyStatement,
} from '@/services/CreditCardService'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import TabContent from '@/components/ui/Tabs/TabContent'
import { DateTime } from 'luxon'
import { useAppSelector } from '@/store'
import { LuFilter } from 'react-icons/lu'

const CREDIT_CARD_STATUSES = ['ACTIVE', 'BLOCKED', 'EXPIRED']

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

const CreditCardFilter = (props: {
    defaultValue: any
    onFilter: (activeFilters: any) => void
}) => {
    const { defaultValue, onFilter } = props

    const [isOpen, setIsOpen] = useState(false)
    const [statuses, setStatuses] = useState<string[]>(defaultValue.statuses)

    const { t } = useTranslation()

    const isFilterApplied: boolean =
        defaultValue.statuses.length !== CREDIT_CARD_STATUSES.length

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    return (
        <>
            <Badge enabled={isFilterApplied}>
                <Button
                    variant="default"
                    size="sm"
                    data-tn="open-saving-filter-btn"
                    className="p-2 ml-2"
                    icon={<LuFilter />}
                    onClick={() => setIsOpen(true)}
                />
            </Badge>
            <Drawer
                title={
                    <div>
                        <h4 className="mb-2">
                            {t('pages.creditCards.filterTitle')}
                        </h4>
                    </div>
                }
                isOpen={isOpen}
                placement="right"
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-700"
                footer={
                    <div className="text-right w-full grid grid-cols-2">
                        <Button
                            size="sm"
                            className="mr-1"
                            onClick={() => onDrawerClose()}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            className="ml-1"
                            variant="solid"
                            data-tn="apply-credit-card-filter-btn"
                            onClick={() => {
                                onFilter({ statuses })
                                onDrawerClose()
                            }}
                        >
                            {t('actions.filter')}
                        </Button>
                    </div>
                }
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
            >
                <AdaptableCard bordered className="mt-2">
                    <p className="mb-2 font-bold">
                        {t('fields.creditCardStatus')}{' '}
                    </p>
                    <Segment
                        value={statuses}
                        selectionType="multiple"
                        onChange={(val) => setStatuses(val as string[])}
                    >
                        <div className="flex flex-col gap-2 w-full py-2">
                            {CREDIT_CARD_STATUSES.map((item: string) => (
                                <Segment.Item key={item} value={item}>
                                    {({ active, onSegmentItemClick }) => {
                                        return (
                                            <SegmentItemOption
                                                hoverable
                                                active={active}
                                                className="w-full py-2"
                                                customCheck={<></>}
                                                data-tn={`credit-card-status-filter-${item.toLowerCase()}-opt`}
                                                onSegmentItemClick={
                                                    onSegmentItemClick
                                                }
                                            >
                                                <Checkbox
                                                    readOnly
                                                    checked={active}
                                                />
                                                <span className="text-sm">
                                                    {t(
                                                        `creditCardStatus.${item}`,
                                                    )}
                                                </span>
                                            </SegmentItemOption>
                                        )
                                    }}
                                </Segment.Item>
                            ))}
                        </div>
                    </Segment>
                </AdaptableCard>
            </Drawer>
        </>
    )
}

const CreditCardDrawer = (props: {
    isOpen: boolean
    creditCard: any
    onClose: () => void
}) => {
    const { isOpen, creditCard, onClose } = props
    const [activeTab, setActiveTab] = useState<string>('next')
    const [showCreateStatementForm, setShowCreateStatementForm] =
        useState<boolean>(false)

    const { t, i18n } = useTranslation()

    const userState = useAppSelector((state) => state.auth.user)

    const {
        data: creditCardDetail,
        isFetching: isFetchingCreditCardDetail,
        refetch: refetchCreditCardDetail,
    } = useQuery({
        enabled: isOpen && !!creditCard,
        queryKey: [`user-creditCard-${creditCard?.id ?? ''}`],
        queryFn: async () => apiGetCreditCard(creditCard.id),
    })

    const createCreditCardMonthlyStatementMutation = useMutation({
        mutationFn: apiCreateCreditCardMonthlyStatement,
        onSuccess: async () => {
            toast.push(
                <Notification
                    title={t('notifications.creditCard.created') || ''}
                    type="success"
                />,
                {
                    placement: 'top-center',
                },
            )
            await refetchCreditCardDetail()
        },
    })

    if (!isOpen || !creditCard) return null

    const ExpenseList = (props: { expenses: any }) => {
        const { expenses } = props
        return (
            <>
                {expenses.map((e: any) => (
                    <Card
                        key={e.id}
                        bordered
                        className="mt-2"
                        data-tn={`expense-item-${e.id}`}
                    >
                        <div className="w-full flex justify-between items-center">
                            <small>{e.category.name}</small>
                            <small>
                                {DateTime.fromISO(e.billableDate).toFormat(
                                    'dd/MM/yyyy',
                                )}
                            </small>
                        </div>
                        <div className="w-full flex justify-between items-center">
                            <span>
                                {e.description
                                    ? e.description
                                    : t('pages.expenses.genericDescription', {
                                          billableDate: DateTime.fromISO(
                                              e.billableDate,
                                          ).toFormat('dd/MM/yyyy'),
                                      })}
                            </span>
                            <span className="text-right font-bold">
                                {currencyFormat(
                                    e.amount,
                                    e.currency.code,
                                    i18n.language,
                                    userState.country?.code,
                                )}
                            </span>
                        </div>
                    </Card>
                ))}
            </>
        )
    }

    const CreateStatementForm = () => {
        const [closeDate, setCloseDate] = useState<Date>(new Date())

        const saving = createCreditCardMonthlyStatementMutation.isPending

        return (
            <div className="h-full flex flex-col justify-center">
                <Loading type="cover" loading={saving}>
                    <Card>
                        <h3 className="mb-4">
                            {t(
                                'pages.creditCards.detailView.newStatementButton',
                            )}
                        </h3>
                        <DatePicker
                            inputtable
                            locale={i18n.language}
                            defaultValue={closeDate}
                            inputFormat="DD/MM/YYYY"
                            clearable={false}
                            data-tn="close-date-input"
                            onChange={(newDate) =>
                                newDate && setCloseDate(newDate)
                            }
                        />
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <Button
                                data-tn="cancel-btn"
                                onClick={() => {
                                    setShowCreateStatementForm(false)
                                    setCloseDate(new Date())
                                }}
                            >
                                {t('actions.cancel')}
                            </Button>
                            <Button
                                variant="solid"
                                data-tn="save-btn"
                                onClick={() => {
                                    createCreditCardMonthlyStatementMutation.mutate(
                                        {
                                            creditCardId: creditCard.id,
                                            closeDate:
                                                DateTime.fromJSDate(
                                                    closeDate,
                                                ).toISO() ?? '',
                                        },
                                    )
                                    setShowCreateStatementForm(false)
                                    setCloseDate(new Date())
                                }}
                            >
                                {saving
                                    ? t('actions.saving')
                                    : t('actions.save')}
                            </Button>
                        </div>
                    </Card>
                </Loading>
            </div>
        )
    }

    const DrawerContent = () => {
        if (!creditCardDetail || isFetchingCreditCardDetail) {
            return <Loading loading />
        }

        if (showCreateStatementForm) {
            return <CreateStatementForm />
        }

        return (
            <Tabs
                value={activeTab}
                defaultValue="next"
                className="h-full overflow-hidden"
                onChange={(tabValue) => setActiveTab(tabValue)}
            >
                <TabList>
                    <TabNav
                        value="next"
                        style={{ minWidth: 'fit-content' }}
                        data-tn="next-statement"
                    >
                        {t('pages.creditCards.detailView.nextStatement')}
                    </TabNav>
                    {creditCardDetail.monthlyStatements.map((ms: any) => (
                        <TabNav
                            key={`ms-tab-nav-${ms.id}`}
                            value={ms.id}
                            style={{ minWidth: 'fit-content' }}
                            data-tn={`statement-${ms.id}`}
                        >
                            {DateTime.fromISO(ms.closeDate)
                                .setLocale(i18n.language)
                                .toFormat('MMMM')}
                        </TabNav>
                    ))}
                </TabList>

                <TabContent
                    value="next"
                    className={activeTab === 'next' ? 'h-full' : ''}
                >
                    <div
                        className={
                            creditCardDetail.expensesNextStatement.length
                                ? 'overflow-y-auto'
                                : 'flex flex-col justify-center'
                        }
                        style={{
                            height: 'calc(100% - 70px - 38px)',
                        }}
                    >
                        {creditCardDetail.expensesNextStatement.length ? (
                            <ExpenseList
                                expenses={
                                    creditCardDetail.expensesNextStatement
                                }
                            />
                        ) : (
                            <EmptyState bordered className="mt-4 border-0">
                                <h4 className="text-2xl text-gray-500">
                                    {t(
                                        'pages.creditCards.detailView.emptyState.nextStatement',
                                    )}
                                </h4>
                            </EmptyState>
                        )}
                    </div>
                    <Button
                        block
                        variant="solid"
                        className="mt-4"
                        data-tn="new-statement-button"
                        onClick={() => setShowCreateStatementForm(true)}
                    >
                        {t('pages.creditCards.detailView.newStatementButton')}
                    </Button>
                </TabContent>
                {creditCardDetail.monthlyStatements.map((ms: any) => (
                    <TabContent
                        key={`ms-content-${ms.id}`}
                        value={ms.id}
                        className={activeTab === ms.id ? 'h-full' : ''}
                    >
                        <div
                            className={
                                ms.expenses.length
                                    ? 'overflow-y-auto'
                                    : 'flex flex-col justify-center'
                            }
                            style={{
                                height: 'calc(100% - 70px)',
                            }}
                        >
                            {ms.expenses.length ? (
                                <ExpenseList expenses={ms.expenses} />
                            ) : (
                                <EmptyState bordered className="mt-4 border-0">
                                    <h4 className="text-2xl text-gray-500">
                                        {t(
                                            'pages.creditCards.detailView.emptyState.existingStatement',
                                        )}
                                    </h4>
                                </EmptyState>
                            )}
                        </div>
                    </TabContent>
                ))}
            </Tabs>
        )
    }

    return (
        <Drawer
            headerClass="!items-start !bg-gray-100 dark:!bg-gray-700"
            bodyClass={`overflow-hidden ${
                showCreateStatementForm ? 'bg-gray-300' : ''
            }`}
            title={
                <div className="flex flex-col w-full divide-y">
                    <div className="grid grid-flow-col auto-cols-max gap-4 items-center mb-4">
                        <CardIcon cardIssuer={creditCard.issuer} />
                        <CardTitle creditCard={creditCard} />
                    </div>
                    <div className="grid grid-cols-2 items-center pt-4">
                        <div className="flex flex-col">
                            <small className="font-light">
                                {t(`fields.expiration`)}
                            </small>
                            <span className="font-semibold">
                                {creditCard.expiration}
                            </span>
                        </div>
                        <div className="text-right w-full">
                            <Badge
                                content={t(
                                    `creditCardStatus.${creditCard.status}`,
                                ).toUpperCase()}
                                innerClass={`bg-${getBadgedColor(
                                    creditCard.status,
                                )}-500`}
                                className="text-sm"
                            />
                        </div>
                    </div>
                </div>
            }
            data-tn="credit-card-detail-drawer"
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
        >
            <DrawerContent />
        </Drawer>
    )
}

const CreditCards = () => {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
    const [selectedCreditCard, setSelectedCreditCard] = useState<
        any | undefined
    >(undefined)
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)
    const [showCreditCardInfo, setShowCreditCardInfo] = useState<boolean>(false)
    const [filters, setFilters] = useState({
        statuses: ['ACTIVE'],
    })

    const { t } = useTranslation()

    const { data: userCurrencies, isFetching: isFetchingUserCurrencies } =
        useQuery({
            queryKey: ['user-currencies'],
            queryFn: apiGetUserCurrencies,
        })

    const {
        data: creditCardList,
        isFetching: isFetchingCreditCards,
        refetch: refetchCreditCards,
    } = useQuery({
        queryKey: ['user-credit-cards'],
        queryFn: async () =>
            apiGetCreditCardList({ statuses: filters.statuses }),
    })

    const onMutationSuccess = async (title: string) => {
        refetchCreditCards()
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

    const onFilterChange = (newFilters: any) => {
        setFilters(() => {
            setTimeout(() => {
                refetchCreditCards()
            }, 100)
            return newFilters
        })
    }

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

    const handleClickCreditCard = (creditCard: any) => {
        setShowCreditCardInfo(true)
        setSelectedCreditCard(creditCard)
    }

    if (!creditCardList) {
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
                <div className="lg:flex items-center justify-between mb-4 my-2">
                    <h2>{t('pages.creditCards.header')}</h2>
                    <div className="flex flex-col lg:flex-row lg:items-center">
                        <div className="flex my-2">
                            <CreditCardFilter
                                defaultValue={filters}
                                onFilter={onFilterChange}
                            />
                        </div>
                    </div>
                </div>
                <CreditCardForm />
                <EmptyState
                    title={t('pages.creditCards.emptyState.title')}
                    description={t('pages.creditCards.emptyState.description')}
                    data-tn="empty-state-no-credit-cards"
                >
                    <Button
                        variant="twoTone"
                        className="mt-4 w-full md:w-96"
                        size="lg"
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
    return (
        <Container data-tn="credit-cards-page">
            <div className="lg:flex items-center justify-between mb-4 my-2">
                <h2>{t('pages.creditCards.header')}</h2>
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <div className="flex my-2">
                        <CreditCardFilter
                            defaultValue={filters}
                            onFilter={onFilterChange}
                        />
                    </div>
                </div>
            </div>
            <Loading loading={isFetchingCreditCards} type="cover">
                <Card bodyClass="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {creditCardList.map((c) => (
                        <Card
                            key={c.id}
                            bordered
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
                                            eventKey="view"
                                            data-tn={`view-credit-card-btn-${c.id}`}
                                            onClick={() =>
                                                handleClickCreditCard(c)
                                            }
                                        >
                                            <IconText
                                                className="text-sm font-semibold w-full"
                                                icon={<HiEye />}
                                            >
                                                {t('actions.view')}
                                            </IconText>
                                        </Dropdown.Item>
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
                            <div
                                className="divide-y cursor-pointer"
                                onClick={() => handleClickCreditCard(c)}
                            >
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
                </Card>
            </Loading>
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
            <CreditCardDrawer
                isOpen={showCreditCardInfo}
                creditCard={selectedCreditCard}
                onClose={() => setShowCreditCardInfo(false)}
            />
        </Container>
    )
}

export default CreditCards
