import {
    Button,
    Card,
    Checkbox,
    Dialog,
    Drawer,
    Dropdown,
    FormContainer,
    FormItem,
    Input,
    ModalForm,
    Segment,
} from '@/components/ui'
import {
    AdaptableCard,
    ConfirmDialog,
    Container,
    Divider,
    EllipsisButton,
    GrowShrinkTag,
    IconText,
    Loading,
    SegmentItemOption,
} from '@/components/shared'
import { DateTime } from 'luxon'
import Collapsible from '@/components/shared/Collapsible'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
    apiCreateExpense,
    apiDeleteExpense,
    apiGetExpenseList,
} from '@/services/ExpenseService'
import currencyFormat from '@/utils/currencyFormat'
import { HiOutlineCreditCard, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import { useAppSelector } from '@/store'
import { useTranslation } from 'react-i18next'
import { apiGetUserCurrenciesWithExpenses } from '@/services/AccountService'
import EmptyState from '@/components/shared/EmptyState'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useEffect, useState } from 'react'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import * as Yup from 'yup'
import { SelectFieldItem } from '@/components/ui/Form'
import { MdOutlineAttachMoney } from 'react-icons/md'
import DatePicker from '@/components/ui/DatePicker'
import { BsCalendarRange, BsCashCoin } from 'react-icons/bs'
import { LuFilter } from 'react-icons/lu'
import { useConfig } from '@/components/ui/ConfigProvider'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { apiGetCreditCardListForSelect } from '@/services/CreditCardService'
import { PiMoneyBold } from 'react-icons/pi'
import { useNavigate } from 'react-router-dom'

const getTotalExpenseByCurrency = (expenses: any[], currencyCode: string) => {
    const total = expenses
        .filter((e: any) => e.currency.code === currencyCode)
        .reduce((prevE, curE) => prevE + curE.amount, 0)
    if (!total) return null
    return total
}

type EXPENSE_TYPE = 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE'
type PAYMENT_METHOD_TYPE = 'CASH' | 'CREDIT_CARD'

type ExpenseFilter = {
    fromDate: Date
    toDate: Date
    expenseType: EXPENSE_TYPE | 'ALL'
    paymentMethod: PAYMENT_METHOD_TYPE | 'ALL'
    currencies: string[]
}

const ExpensesSummary = (props: {
    userCurrencies: any[]
    countryCode: string
}) => {
    const { t, i18n } = useTranslation()
    return (
        <div>
            <p className="mb-4">{t('pages.expenses.headers.summary')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {props.userCurrencies.map((currency: any) => {
                    const total: number = currency.expenses.reduce(
                        (acc: number, e: any) => acc + e.amount,
                        0,
                    )
                    if (!total) return null

                    const budgetDiff = currency.budget - total

                    const valuation =
                        budgetDiff > 0 ? 1 : budgetDiff < 0 ? -1 : 0

                    return (
                        <Card
                            key={currency.id}
                            data-tn={`summary-card-${currency.code.toLowerCase()}`}
                        >
                            <div className="flex items-center justify-between my-2">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <p className="font-bold text-4xl text-purple-500 dark:text-purple-500">
                                            {currency.code}
                                        </p>
                                        <p>
                                            <small>
                                                {t(
                                                    'pages.expenses.labels.budget',
                                                )}
                                            </small>
                                        </p>
                                        <p className="font-light">
                                            {currencyFormat(
                                                currency.budget,
                                                currency.code,
                                                i18n.language,
                                                props.countryCode,
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right rtl:text-left">
                                    <h3 className="mb-2">
                                        <span>
                                            {currencyFormat(
                                                total,
                                                currency.code,
                                                i18n.language,
                                                props.countryCode,
                                            )}
                                        </span>
                                    </h3>
                                    <GrowShrinkTag
                                        inverse
                                        valuation={valuation}
                                        value={currencyFormat(
                                            budgetDiff,
                                            currency.code,
                                            i18n.language,
                                            props.countryCode,
                                        )}
                                    />
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

const ExpenseTag = (props: {
    value: number
    budget: any
    currencyCode: string
    lang: string
    country: string
}) => {
    const { value = 0, budget, currencyCode, lang, country } = props
    const { t } = useTranslation()

    if (!budget) return null

    const budgetDiff: number = budget.limit - value

    const valuation = budgetDiff > 0 ? 1 : budgetDiff < 0 ? -1 : 0

    return (
        <Card bordered bodyClass="py-2" className="w-full">
            <div className="flex items-center justify-between my-2">
                <div className="flex items-center gap-3">
                    <div>
                        <p className="font-bold text-xl text-purple-500 dark:text-purple-500">
                            {currencyCode}
                        </p>
                        <p>
                            <small>{t('pages.expenses.labels.budget')}</small>
                        </p>
                        <p className="font-light">
                            {currencyFormat(
                                budget.limit,
                                currencyCode,
                                lang,
                                country,
                            )}
                        </p>
                    </div>
                </div>
                <div className="text-right rtl:text-left">
                    <p className="mb-2 text-lg font-bold">
                        <span>
                            {currencyFormat(value, currencyCode, lang, country)}
                        </span>
                    </p>
                    <GrowShrinkTag
                        inverse
                        valuation={valuation}
                        value={currencyFormat(
                            budgetDiff,
                            currencyCode,
                            lang,
                            country,
                        )}
                    />
                </div>
            </div>
        </Card>
    )
}

const ExpenseForm = (props: {
    open: boolean
    selectedExpense: any
    userCurrencies: any[]
    categories: any[]
    creditCards: any[]
    onFormClose: () => void
    onFormSubmit: (value: any) => void
    isSaving: boolean
}) => {
    const {
        open,
        selectedExpense,
        userCurrencies,
        categories,
        creditCards,
        isSaving,
        onFormClose,
        onFormSubmit,
    } = props
    const [selectedType, setSelectedType] = useState<string | undefined>(
        undefined,
    )

    const { t, i18n } = useTranslation()
    const { textTheme } = useThemeClass()
    const handleClose = () => {
        setSelectedType(undefined)
        onFormClose()
    }

    const handleSubmit = (data: any) => {
        setSelectedType(undefined)
        onFormSubmit(data)
    }

    const EXPENSE_TYPES = [
        {
            label: 'CASH',
            icon: <BsCashCoin />,
        },
        {
            label: 'CREDIT_CARD',
            icon: <HiOutlineCreditCard />,
        },
    ]

    if (!selectedType) {
        return (
            <Dialog
                isOpen={open}
                contentClassName="pb-0 px-0"
                width={300}
                onClose={handleClose}
                onRequestClose={handleClose}
            >
                <div className="flex flex-col h-full justify-between">
                    <h5 className={`mb-4 px-4 ${textTheme} dark:${textTheme}`}>
                        {t('pages.expenses.form.newTitle')}
                    </h5>
                    <Divider />
                    <Segment
                        value={selectedType}
                        selectionType="single"
                        onChange={(val) =>
                            setSelectedType((val as string[])[0])
                        }
                    >
                        <div className="flex flex-col items-center gap-4 w-full p-4">
                            {EXPENSE_TYPES.map((item: any) => (
                                <Segment.Item
                                    key={item.label}
                                    value={item.label}
                                >
                                    {({ active, onSegmentItemClick }) => {
                                        return (
                                            <SegmentItemOption
                                                hoverable
                                                active={active}
                                                className="bg-white dark:bg-gray-800 w-full"
                                                data-tn={`payment-method-selector-${item.label.toLowerCase()}-opt`}
                                                onSegmentItemClick={
                                                    onSegmentItemClick
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {item.icon}
                                                    </span>
                                                    <h6>
                                                        {t(
                                                            `expensePaymentType.${item.label}`,
                                                        )}
                                                    </h6>
                                                </div>
                                            </SegmentItemOption>
                                        )
                                    }}
                                </Segment.Item>
                            ))}
                        </div>
                    </Segment>
                </div>
            </Dialog>
        )
    }

    const validationSchema = Yup.object().shape({
        billableDate: Yup.string().required(t('validations.required') || ''),
        amount: Yup.string().required(t('validations.required') || ''),
        currencyId: Yup.string().required(t('validations.required') || ''),
        categoryId: Yup.string().required(t('validations.required') || ''),
        creditCardId:
            selectedType === 'CREDIT_CARD'
                ? Yup.string().required(t('validations.required') || '')
                : Yup.string(),
    })

    function generateCreditCardLabel(creditCard: any): string {
        let subLabel: string = ''

        if (creditCard.lastFourDigits) {
            subLabel += ` - •••• ${creditCard.lastFourDigits}`
        }
        if (creditCard.cardHolder) {
            subLabel += `- ${creditCard.cardHolder}`
        }
        return `${creditCard.label} ${subLabel}`
    }

    return (
        <ModalForm
            isOpen={open}
            entity={
                selectedExpense || {
                    billableDate: DateTime.now().toISO(),
                }
            }
            title={t('pages.expenses.form.newTitle')}
            validationSchema={validationSchema}
            fields={(
                errors: FormikErrors<any>,
                touched: FormikTouched<any>,
            ) => (
                <>
                    <FormItem
                        asterisk
                        label={t(`fields.date`) || ''}
                        invalid={
                            !!errors.billableDate || !!touched.billableDate
                        }
                        errorMessage={errors.billableDate?.toString()}
                    >
                        <Field name="billableDate" placeholder="DD/MM/YYYY">
                            {({ field, form }: FieldProps) => (
                                <DatePicker
                                    inputtable
                                    inputtableBlurClose={false}
                                    inputFormat="DD/MM/YYYY"
                                    defaultValue={new Date()}
                                    locale={i18n.language}
                                    clearable={false}
                                    data-tn="billable-date-input"
                                    onChange={(value: Date | null) => {
                                        const d = value
                                            ? DateTime.fromJSDate(value)
                                            : DateTime.now()
                                        form.setFieldValue(
                                            field.name,
                                            d.toISO(),
                                        )
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>
                    <FormItem
                        label={t(`fields.description`) || ''}
                        invalid={!!errors.description || !!touched.description}
                        errorMessage={errors.description?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="description"
                            placeholder={t(`fields.description`)}
                            component={Input}
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t(`fields.amount`) || ''}
                        invalid={!!errors.amount || !!touched.amount}
                        errorMessage={errors.amount?.toString()}
                    >
                        <Field
                            type="number"
                            autoComplete="off"
                            name="amount"
                            placeholder={t(`fields.amount`)}
                            component={Input}
                            prefix={
                                <MdOutlineAttachMoney className="text-xl" />
                            }
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t('fields.currency') || ''}
                        invalid={!!errors.currencyId || !!touched.currencyId}
                        errorMessage={errors.currencyId?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="currencyId"
                            placeholder={t('fields.currency')}
                            options={userCurrencies.map((c) => ({
                                value: c.id,
                                label: `${c.code} - ${t(
                                    `currencies.${c.code}`,
                                )}`,
                            }))}
                            className="currency-select"
                            id="currency-select"
                            component={SelectFieldItem}
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t('fields.category') || ''}
                        invalid={!!errors.categoryId || !!touched.categoryId}
                        errorMessage={errors.categoryId?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="categoryId"
                            placeholder={t('fields.category')}
                            options={categories.map((c: any) => ({
                                value: c.id,
                                label: c.name,
                            }))}
                            className="category-select"
                            id="category-select"
                            component={SelectFieldItem}
                        />
                    </FormItem>
                    {selectedType === 'CREDIT_CARD' && (
                        <FormItem
                            asterisk
                            label={t('fields.creditCard') || ''}
                            invalid={
                                !!errors.creditCardId || !!touched.creditCardId
                            }
                            errorMessage={errors.creditCardId?.toString()}
                        >
                            <Field
                                type="text"
                                autoComplete="off"
                                name="creditCardId"
                                placeholder={t('fields.creditCard')}
                                options={creditCards.map((c: any) => ({
                                    value: c.id,
                                    label: generateCreditCardLabel(c),
                                }))}
                                className="credit-card-select"
                                id="credit-card-select"
                                component={SelectFieldItem}
                            />
                        </FormItem>
                    )}
                </>
            )}
            isSaving={isSaving}
            onClose={handleClose}
            onSubmit={handleSubmit}
        />
    )
}

const ExpenseFilter = (props: {
    userCurrencies: any[]
    defaultValue: ExpenseFilter
    onFilter: (filters: ExpenseFilter) => void
}) => {
    const { userCurrencies = [], onFilter } = props

    const [isOpen, setIsOpen] = useState(false)

    const [fromDate, setFromDate] = useState<Date>(props.defaultValue.fromDate)
    const [toDate, setToDate] = useState<Date>(props.defaultValue.toDate)

    const [selectedDateFilterText, setSelectedDateFilterText] = useState('')

    const { t } = useTranslation()

    const EXPENSE_TYPES: EXPENSE_TYPE[] = ['FIXED_EXPENSE', 'VARIABLE_EXPENSE']
    const PAYMENT_METHODS: PAYMENT_METHOD_TYPE[] = ['CASH', 'CREDIT_CARD']

    const [expenseTypes, setExpenseTypes] =
        useState<EXPENSE_TYPE[]>(EXPENSE_TYPES)
    const [currencyIds, setCurrencyIds] = useState<string[]>(
        props.defaultValue.currencies,
    )
    const [paymentMethods, setPaymentMethods] =
        useState<PAYMENT_METHOD_TYPE[]>(PAYMENT_METHODS)

    const { themeColor } = useConfig()

    useEffect(() => {
        const fromDateParsed =
            DateTime.fromJSDate(fromDate).toFormat('dd/MM/yyyy')
        const toDateParsed = DateTime.fromJSDate(toDate).toFormat('dd/MM/yyyy')
        setSelectedDateFilterText(`${fromDateParsed} - ${toDateParsed}`)
    }, [fromDate, toDate])

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    return (
        <div
            className="flex items-center mb-2"
            style={{ justifyContent: 'flex-end' }}
        >
            <span className="border bordered flex items-center mx-2 px-4 py-1 rounded-full">
                <span className="mr-2">{selectedDateFilterText}</span>
                <BsCalendarRange />
            </span>
            <Button
                size="sm"
                data-tn="open-expense-filter-btn"
                icon={<LuFilter />}
                onClick={() => setIsOpen(true)}
            />
            <Drawer
                title={
                    <div>
                        <h4 className="mb-2">
                            {t('pages.expenses.filterTitle')}
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
                            data-tn="apply-expense-filter-btn"
                            onClick={() => {
                                onFilter({
                                    fromDate,
                                    toDate,
                                    expenseType:
                                        expenseTypes.length > 1
                                            ? 'ALL'
                                            : expenseTypes[0],
                                    currencies: currencyIds,
                                    paymentMethod:
                                        paymentMethods.length > 1
                                            ? 'ALL'
                                            : paymentMethods[0],
                                })
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
                <AdaptableCard bordered className="">
                    <FormContainer
                        layout="vertical"
                        className="grid grid-cols-1"
                    >
                        <FormItem label={t('fields.from')} className="mb-2">
                            <DatePicker
                                inputtable
                                inputtableBlurClose={false}
                                defaultValue={fromDate}
                                value={fromDate}
                                maxDate={toDate}
                                clearable={false}
                                data-tn="filter-from-date-input"
                                inputFormat="DD/MM/YYYY"
                                dayClassName={(date, { selected }) => {
                                    if (
                                        date.getDate() === toDate.getDate() &&
                                        date.getMonth() === toDate.getMonth() &&
                                        date.getFullYear() ===
                                            toDate.getFullYear()
                                    ) {
                                        return `text-white bg-${themeColor}-500 dark:bg-${themeColor}-500 rounded-bl-none rounded-tl-none`
                                    }

                                    if (date < toDate && date > fromDate) {
                                        return `bg-${themeColor}-100 rounded-none`
                                    }

                                    if (selected) {
                                        return 'text-white rounded-br-none rounded-tr-none'
                                    }

                                    return 'text-gray-700 dark:text-gray-200'
                                }}
                                onChange={(value) =>
                                    value && setFromDate(value)
                                }
                            />
                        </FormItem>
                        <FormItem label={t('fields.to')} className="mb-2">
                            <DatePicker
                                inputtable
                                inputtableBlurClose={false}
                                defaultValue={toDate}
                                value={toDate}
                                minDate={fromDate}
                                clearable={false}
                                data-tn="filter-to-date-input"
                                inputFormat="DD/MM/YYYY"
                                dayClassName={(date, { selected }) => {
                                    if (
                                        date.getDate() === fromDate.getDate() &&
                                        date.getMonth() ===
                                            fromDate.getMonth() &&
                                        date.getFullYear() ===
                                            fromDate.getFullYear()
                                    ) {
                                        return `text-white bg-${themeColor}-500 dark:bg-${themeColor}-500 rounded-br-none rounded-tr-none`
                                    }

                                    if (selected) {
                                        return 'text-white rounded-bl-none rounded-tl-none'
                                    }

                                    if (date < toDate && date > fromDate) {
                                        return `bg-${themeColor}-100 rounded-none`
                                    }

                                    return 'text-gray-700 dark:text-gray-200'
                                }}
                                onChange={(value) => value && setToDate(value)}
                            />
                        </FormItem>
                    </FormContainer>
                    <div className="grid grid-cols-2 items-center p-2 card-border border-dashed rounded">
                        <Button
                            className="mr-2"
                            size="sm"
                            variant="twoTone"
                            onClick={() => {
                                setFromDate(
                                    DateTime.now().set({ day: 1 }).toJSDate(),
                                )
                                setToDate(
                                    DateTime.now().endOf('month').toJSDate(),
                                )
                            }}
                        >
                            {t('placeholders.currentMonth')}
                        </Button>
                        <Button
                            className="ml-2"
                            size="sm"
                            variant="twoTone"
                            onClick={() => {
                                setFromDate(
                                    DateTime.now()
                                        .minus({ month: 1 })
                                        .set({ day: 1 })
                                        .toJSDate(),
                                )
                                setToDate(
                                    DateTime.now()
                                        .minus({ month: 1 })
                                        .endOf('month')
                                        .toJSDate(),
                                )
                            }}
                        >
                            {t('placeholders.lastMonth')}
                        </Button>
                    </div>
                </AdaptableCard>
                <AdaptableCard bordered className="mt-2">
                    <p className="mb-2 font-bold">{t('fields.expenseType')} </p>
                    <Segment
                        value={expenseTypes}
                        selectionType="multiple"
                        onChange={(val) =>
                            setExpenseTypes(val as EXPENSE_TYPE[])
                        }
                    >
                        <div className="flex flex-col items-center gap-4 w-full">
                            {EXPENSE_TYPES.map((item: EXPENSE_TYPE) => (
                                <Segment.Item key={item} value={item}>
                                    {({ active, onSegmentItemClick }) => {
                                        return (
                                            <SegmentItemOption
                                                hoverable
                                                active={active}
                                                className="w-full"
                                                customCheck={<></>}
                                                data-tn={`expense-type-filter-${item.toLowerCase()}-opt`}
                                                onSegmentItemClick={
                                                    onSegmentItemClick
                                                }
                                            >
                                                <Checkbox
                                                    readOnly
                                                    checked={active}
                                                />
                                                <span className="text-sm">
                                                    {t(`expenseType.${item}`)}
                                                </span>
                                            </SegmentItemOption>
                                        )
                                    }}
                                </Segment.Item>
                            ))}
                        </div>
                    </Segment>
                </AdaptableCard>
                <AdaptableCard bordered className="mt-2">
                    <p className="mb-2 font-bold">{t('fields.currency')} </p>
                    <Segment
                        value={currencyIds}
                        selectionType="multiple"
                        onChange={(val) => setCurrencyIds(val as string[])}
                    >
                        <div className="flex flex-col gap-2 w-full py-2">
                            {userCurrencies.map((item: any) => (
                                <Segment.Item key={item.id} value={item.id}>
                                    {({ active, onSegmentItemClick }) => {
                                        return (
                                            <SegmentItemOption
                                                hoverable
                                                active={active}
                                                className="w-full py-2"
                                                customCheck={<></>}
                                                data-tn={`expense-currency-filter-${item.code.toLowerCase()}-opt`}
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
                                                        `currencies.${item.code}`,
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
                <AdaptableCard bordered className="mt-2">
                    <p className="mb-2 font-bold">
                        {t('fields.paymentMethod')}{' '}
                    </p>
                    <Segment
                        value={paymentMethods}
                        selectionType="multiple"
                        onChange={(val) =>
                            setPaymentMethods(val as PAYMENT_METHOD_TYPE[])
                        }
                    >
                        <div className="flex flex-col gap-2 w-full py-2">
                            {PAYMENT_METHODS.map(
                                (item: PAYMENT_METHOD_TYPE) => (
                                    <Segment.Item key={item} value={item}>
                                        {({ active, onSegmentItemClick }) => {
                                            return (
                                                <SegmentItemOption
                                                    hoverable
                                                    active={active}
                                                    className="w-full py-2"
                                                    customCheck={<></>}
                                                    data-tn={`payment-method-filter-${item.toLowerCase()}-opt`}
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
                                                            `expensePaymentType.${item}`,
                                                        )}
                                                    </span>
                                                </SegmentItemOption>
                                            )
                                        }}
                                    </Segment.Item>
                                ),
                            )}
                        </div>
                    </Segment>
                </AdaptableCard>
            </Drawer>
        </div>
    )
}

const ExpenseTypeIcon = (props: { expense: any }) => {
    const { expense } = props
    const { t } = useTranslation()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    let icon = <PiMoneyBold className="text-lg" />
    const label = t(`expensePaymentType.${expense.type ?? 'CASH'}`)

    if (expense.type === 'CREDIT_CARD') {
        icon = <HiOutlineCreditCard className="text-lg" />
    }

    const cursorClassName: string =
        expense.type === 'CREDIT_CARD' ? 'cursor-pointer' : 'cursor-default'

    const handleClick = () => {
        if (expense.type === 'CREDIT_CARD') {
            navigate(
                `/conf/credit-cards?=selected-credit-card=${expense.creditCard.id}`,
            )
        }
    }

    return (
        <span onClick={handleClick}>
            <IconText
                className={`${textTheme} text-sm font-semibold ${cursorClassName}`}
                icon={icon}
            >
                {label}
            </IconText>
        </span>
    )
}

const Expenses = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedExpense, setSelectedExpense] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)

    const [expenseFilter, setExpenseFilter] = useState<ExpenseFilter>({
        fromDate: DateTime.now().set({ day: 1 }).toJSDate(),
        toDate: DateTime.now().endOf('month').toJSDate(),
        expenseType: 'ALL',
        currencies: [],
        paymentMethod: 'ALL',
    })

    const userState = useAppSelector((state) => state.auth.user)
    const { t, i18n } = useTranslation()

    const {
        data: userCurrencies,
        isFetching: isFetchingUserCurrencies,
        refetch: getUserCurrencies,
    } = useQuery({
        queryKey: ['user-currencies-with-expenses'],
        queryFn: async () => {
            const data = await apiGetUserCurrenciesWithExpenses({
                fromDate:
                    DateTime.fromJSDate(expenseFilter.fromDate).toISO() ??
                    undefined,
                toDate:
                    DateTime.fromJSDate(expenseFilter.toDate).toISO() ??
                    undefined,
            })
            if (expenseFilter.currencies.length === 0) {
                setExpenseFilter({
                    ...expenseFilter,
                    currencies: data.map((uc: any) => uc.id),
                })
            }
            return data
        },
    })

    const {
        data: categories,
        isFetching: isFetchingExpenses,
        refetch: getExpenses,
    } = useQuery({
        queryKey: ['user-expenses-by-category'],
        queryFn: async () =>
            apiGetExpenseList({
                fromDate:
                    DateTime.fromJSDate(expenseFilter.fromDate).toISO() ??
                    undefined,
                toDate:
                    DateTime.fromJSDate(expenseFilter.toDate).toISO() ??
                    undefined,
            }),
    })

    const { data: creditCards } = useQuery({
        queryKey: ['user-credit-cards-for-select'],
        queryFn: apiGetCreditCardListForSelect,
    })

    const onMutationSuccess = async (title: string) => {
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
        getExpenses()
        getUserCurrencies()
    }

    const onDeleteConfirmClose = () => {
        setIsConfirmDeleteOpen(false)
        setSelectedExpense(undefined)
    }

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedExpense(undefined)
    }

    const deleteExpenseMutation = useMutation({
        mutationFn: apiDeleteExpense,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.expenses.deleted') || '')
        },
    })

    const createExpenseMutation = useMutation({
        mutationFn: apiCreateExpense,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.expenses.created') || '')
        },
    })

    const onDelete = () => {
        if (selectedExpense) {
            deleteExpenseMutation.mutate(selectedExpense.id)
            onDeleteConfirmClose()
        }
    }

    const onFormSubmit = (value: any) => {
        createExpenseMutation.mutate(value)
        onFormClose()
    }

    const onFilterChange = (filters: ExpenseFilter) => {
        setExpenseFilter((prevState) => {
            if (
                prevState.toDate !== filters.toDate ||
                prevState.fromDate !== filters.fromDate
            ) {
                setTimeout(() => {
                    getExpenses()
                    getUserCurrencies()
                }, 100)
            }
            return filters
        })
    }

    if (!categories || !userCurrencies || !creditCards) {
        return (
            <Container className="h-full">
                <Loading loading />
            </Container>
        )
    }

    const newCategories = categories
        .filter((c: any) => {
            if (expenseFilter && expenseFilter.expenseType !== 'ALL') {
                if (c.isFixedPayment) {
                    return expenseFilter.expenseType === 'FIXED_EXPENSE'
                } else {
                    return expenseFilter.expenseType === 'VARIABLE_EXPENSE'
                }
            }
            return true
        })
        .map((c: any) => {
            if (
                expenseFilter &&
                (expenseFilter.currencies || expenseFilter.paymentMethod)
            ) {
                return {
                    ...c,
                    expenses: c.expenses
                        .filter((e: any) => {
                            if (
                                expenseFilter &&
                                expenseFilter.paymentMethod !== 'ALL'
                            ) {
                                return expenseFilter.paymentMethod === e.type
                            }
                            return true
                        })
                        .filter((e: any) =>
                            expenseFilter.currencies.includes(e.currency.id),
                        ),
                }
            }
            return c
        })

    const userCurrenciesFiltered = userCurrencies
        .filter((uc: any) =>
            expenseFilter ? expenseFilter.currencies.includes(uc.id) : true,
        )
        .map((uc: any) => {
            if (expenseFilter && expenseFilter.expenseType !== 'ALL') {
                return {
                    ...uc,
                    expenses: uc.expenses.filter((e: any) => {
                        if (e.category.isFixedPayment) {
                            return expenseFilter.expenseType === 'FIXED_EXPENSE'
                        } else {
                            return (
                                expenseFilter.expenseType === 'VARIABLE_EXPENSE'
                            )
                        }
                    }),
                }
            }
            return uc
        })
    const filteredCategories = newCategories.filter(
        (c: any) => c.expenses.length,
    )

    if (!filteredCategories.length) {
        return (
            <Container>
                <div className="flex flex-col md:flex-row justify-between mb-4">
                    <h2 className="mb-2">{t('pages.expenses.header')}</h2>
                    <ExpenseFilter
                        userCurrencies={userCurrencies}
                        defaultValue={expenseFilter}
                        onFilter={onFilterChange}
                    />
                </div>
                <EmptyState
                    title={t('pages.expenses.emptyState.title')}
                    data-tn="empty-state-no-expenses"
                >
                    <Button
                        className="mt-4 w-full md:w-96"
                        size="lg"
                        variant="twoTone"
                        icon={<HiPlus />}
                        data-tn="add-expense-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.expenses.addExpenseButton')}
                    </Button>
                </EmptyState>
                <ExpenseForm
                    open={isFormOpen}
                    selectedExpense={selectedExpense}
                    categories={categories}
                    userCurrencies={userCurrencies}
                    creditCards={creditCards}
                    isSaving={createExpenseMutation.isPending}
                    onFormClose={onFormClose}
                    onFormSubmit={onFormSubmit}
                />
            </Container>
        )
    }

    return (
        <Container>
            <Loading
                type="cover"
                loading={isFetchingExpenses || isFetchingUserCurrencies}
                className="rounded-lg"
            >
                <div className="flex flex-col md:flex-row justify-between mb-4">
                    <h2 className="mb-2">{t('pages.expenses.header')}</h2>
                    <ExpenseFilter
                        userCurrencies={userCurrencies}
                        defaultValue={expenseFilter}
                        onFilter={onFilterChange}
                    />
                </div>
                <ExpensesSummary
                    userCurrencies={userCurrenciesFiltered}
                    countryCode={userState.country?.code || 'UY'}
                />
                <div className="mt-4">
                    <p className="mb-4">{t('pages.expenses.headers.detail')}</p>
                    {filteredCategories.map((c: any) => (
                        <Collapsible
                            key={c.id}
                            collapsibleClassName="my-4"
                            headerClassName=""
                            data-tn={`category-detail-${c.id}`}
                            header={
                                <div className="w-full flex flex-col items-center">
                                    <div className="w-full flex justify-between items-center mr-4">
                                        <span className="text-md sm:text-lg lg:text-2xl font-semibold">
                                            {c.name}
                                        </span>
                                        <Button
                                            variant="twoTone"
                                            size="sm"
                                            icon={<HiPlus />}
                                            data-tn={`add-expense-cat-${c.id}-btn`}
                                            onClick={() => {
                                                setIsFormOpen(true)
                                                setSelectedExpense({
                                                    categoryId: c.id,
                                                    billableDate:
                                                        DateTime.now().toISO(),
                                                })
                                            }}
                                        >
                                            {t(
                                                'pages.expenses.addExpenseButton',
                                            )}
                                        </Button>
                                    </div>
                                    {c.budget && (
                                        <div className="w-full pb-2 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mr-4">
                                            {userCurrencies.map(
                                                (
                                                    currency: any,
                                                    index: number,
                                                ) => (
                                                    <ExpenseTag
                                                        key={index}
                                                        value={getTotalExpenseByCurrency(
                                                            c.expenses,
                                                            currency.code,
                                                        )}
                                                        budget={c.budget.currencies.find(
                                                            (c: any) =>
                                                                c.currency
                                                                    .code ===
                                                                currency.code,
                                                        )}
                                                        currencyCode={
                                                            currency.code
                                                        }
                                                        lang={i18n.language}
                                                        country={
                                                            userState.country
                                                                ?.code || 'UY'
                                                        }
                                                    />
                                                ),
                                            )}
                                        </div>
                                    )}
                                </div>
                            }
                        >
                            <ul>
                                {c.expenses.map((item: any) => (
                                    <li
                                        key={item.id}
                                        className="py-2 px-4 flex flex-col w-full items-center card-border my-2 rounded-lg relative"
                                        data-tn={`expense-container-${item.id}`}
                                    >
                                        <div className="w-full flex">
                                            <div className="flex items-center">
                                                <ExpenseTypeIcon
                                                    expense={item}
                                                />
                                                <span className="font-light text-current ml-2">
                                                    {DateTime.fromISO(
                                                        item.billableDate,
                                                    ).toFormat('dd/MM/yyyy')}
                                                </span>
                                            </div>

                                            <Dropdown
                                                className="absolute right-2 top-1"
                                                placement="middle-end-top"
                                                renderTitle={
                                                    <EllipsisButton data-tn="dropdown-expense-btn" />
                                                }
                                            >
                                                <Dropdown.Item
                                                    eventKey="delete"
                                                    data-tn="delete-expense-btn"
                                                    onClick={() => {
                                                        setIsConfirmDeleteOpen(
                                                            true,
                                                        )
                                                        setSelectedExpense(item)
                                                    }}
                                                >
                                                    <IconText
                                                        className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                                        icon={
                                                            <HiOutlineTrash />
                                                        }
                                                    >
                                                        {t('actions.delete')}
                                                    </IconText>
                                                </Dropdown.Item>
                                            </Dropdown>
                                        </div>
                                        <div className="w-full grid grid-cols-2 items-center">
                                            <p className="text-lg">
                                                {item.description
                                                    ? item.description
                                                    : t(
                                                          'pages.expenses.genericDescription',
                                                          {
                                                              billableDate:
                                                                  DateTime.fromISO(
                                                                      item.billableDate,
                                                                  ).toFormat(
                                                                      'dd/MM/yyyy',
                                                                  ),
                                                          },
                                                      )}
                                            </p>
                                            <span className="text-right font-bold">
                                                {currencyFormat(
                                                    item.amount,
                                                    item.currency.code,
                                                    i18n.language,
                                                    userState.country?.code,
                                                )}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Collapsible>
                    ))}
                </div>
            </Loading>
            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                type="danger"
                title={t('pages.expenses.deleteConfirmation.title')}
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                data-tn="confirm-delete-dialog"
                onClose={onDeleteConfirmClose}
                onRequestClose={onDeleteConfirmClose}
                onCancel={onDeleteConfirmClose}
                onConfirm={onDelete}
            >
                <p>
                    {t('pages.expenses.deleteConfirmation.description', {
                        description: selectedExpense?.description
                            ? selectedExpense.description
                            : t('pages.expenses.genericDescription', {
                                  billableDate: selectedExpense
                                      ? DateTime.fromISO(
                                            selectedExpense.billableDate,
                                        ).toFormat('dd/MM/yyyy')
                                      : '',
                              }),
                    })}
                </p>
            </ConfirmDialog>
            <ExpenseForm
                open={isFormOpen}
                selectedExpense={selectedExpense}
                categories={categories}
                userCurrencies={userCurrencies}
                creditCards={creditCards}
                isSaving={createExpenseMutation.isPending}
                onFormClose={onFormClose}
                onFormSubmit={onFormSubmit}
            />
            <Button
                style={{
                    position: 'fixed',
                    right: '1rem',
                    bottom: '2rem',
                }}
                shape="circle"
                variant="solid"
                size="lg"
                data-tn="add-expense-btn"
                icon={<HiPlus />}
                onClick={() => setIsFormOpen(true)}
            />
        </Container>
    )
}

export default Expenses
