import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from '@/components/ui/toast'
import { DateTime } from 'luxon'
import Notification from '@/components/ui/Notification'
import {
    apiDeleteIncome,
    apiCreateIncome,
    apiGetIncomeList,
} from '@/services/IncomeService'
import { apiGetUserBankAccountList } from '@/services/BankAccountService'
import { apiGetUserCurrencies } from '@/services/AccountService'
import currencyFormat from '@/utils/currencyFormat'
import { useAppSelector } from '@/store'
import {
    AdaptableCard,
    ColumnDef,
    ConfirmDialog,
    Container,
    Loading,
    SegmentItemOption,
} from '@/components/shared'
import DatePicker from '@/components/ui/DatePicker'
import { FormContainer, SelectFieldItem } from '@/components/ui/Form'
import EmptyState from '@/components/shared/EmptyState'
import { HiOutlineTrash, HiPlus } from 'react-icons/hi'
import { MdOutlineAttachMoney } from 'react-icons/md'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import * as Yup from 'yup'
import {
    Button,
    Card,
    Checkbox,
    Drawer,
    FormItem,
    Input,
    ModalForm,
    Segment,
    Table,
    Tooltip,
} from '@/components/ui'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getExpandedRowModel,
    flexRender,
} from '@tanstack/react-table'
import TBody from '@/components/ui/Table/TBody'
import Tr from '@/components/ui/Table/Tr'
import THead from '@/components/ui/Table/THead'
import Th from '@/components/ui/Table/Th'
import { useConfig } from '@/components/ui/ConfigProvider'
import { BsCalendarRange } from 'react-icons/bs'
import { LuFilter } from 'react-icons/lu'

type IncomeFilterType = {
    fromDate: Date
    toDate: Date
    currencies: string[]
}

function generateBankAccountLabel(bankAccount: any): string {
    return `${bankAccount.bank.name} - ${bankAccount.accountNumber} (${bankAccount.currency.code})`
}

const IncomeForm = (props: {
    isOpen: boolean
    isSaving: boolean
    bankAccounts: any[]
    onFormClose: () => void
    onFormSubmit: (data: any) => Promise<void>
}) => {
    const { isOpen, isSaving, bankAccounts, onFormClose, onFormSubmit } = props

    const { t, i18n } = useTranslation()

    const validationSchema = Yup.object().shape({
        description: Yup.string().required(t('validations.required') || ''),
        incomeDate: Yup.string().required(t('validations.required') || ''),
        bankAccountId: Yup.string().required(t('validations.required') || ''),
    })

    return (
        <ModalForm
            isOpen={isOpen}
            entity={{
                incomeDate: DateTime.now().toISO(),
            }}
            title={t('pages.incomes.form.newTitle')}
            validationSchema={validationSchema}
            fields={(
                errors: FormikErrors<any>,
                touched: FormikTouched<any>,
            ) => (
                <>
                    <FormItem
                        asterisk
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
                        label={t(`fields.targetDate`) || ''}
                        invalid={!!errors.incomeDate || !!touched.incomeDate}
                        errorMessage={errors.incomeDate?.toString()}
                    >
                        <Field name="incomeDate" placeholder="DD/MM/YYYY">
                            {({ field, form }: FieldProps) => (
                                <DatePicker
                                    inputtable
                                    inputtableBlurClose={false}
                                    inputFormat="DD/MM/YYYY"
                                    defaultValue={new Date()}
                                    locale={i18n.language}
                                    clearable={false}
                                    data-tn="income-date-input"
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
                        label={t('fields.bankAccount') || ''}
                        invalid={
                            !!errors.bankAccountId || !!touched.bankAccountId
                        }
                        errorMessage={errors.bankAccountId?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="bankAccountId"
                            placeholder={t('fields.bankAccount')}
                            options={bankAccounts.map((ba: any) => ({
                                value: ba.id,
                                label: generateBankAccountLabel(ba),
                            }))}
                            className="bank-account-select"
                            id="bank-account-select"
                            component={SelectFieldItem}
                        />
                    </FormItem>
                </>
            )}
            isSaving={isSaving}
            onClose={onFormClose}
            onSubmit={onFormSubmit}
        />
    )
}

const IncomeFilter = (props: {
    userCurrencies: any[]
    defaultValue: IncomeFilterType
    onFilter: (filters: IncomeFilterType) => void
}) => {
    const { userCurrencies = [], onFilter } = props

    const [isOpen, setIsOpen] = useState(false)

    const [fromDate, setFromDate] = useState<Date>(props.defaultValue.fromDate)
    const [toDate, setToDate] = useState<Date>(props.defaultValue.toDate)

    const [selectedDateFilterText, setSelectedDateFilterText] = useState('')

    const [currencyIds, setCurrencyIds] = useState<string[]>(
        props.defaultValue.currencies,
    )

    const { t } = useTranslation()

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
                data-tn="open-income-filter-btn"
                icon={<LuFilter />}
                onClick={() => setIsOpen(true)}
            />
            <Drawer
                title={
                    <div>
                        <h4 className="mb-2">
                            {t('pages.incomes.filterTitle')}
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
                            data-tn="apply-income-filter-btn"
                            onClick={() => {
                                onFilter({
                                    fromDate,
                                    toDate,
                                    currencies: currencyIds,
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
                                    DateTime.now().startOf('year').toJSDate(),
                                )
                                setToDate(
                                    DateTime.now().endOf('year').toJSDate(),
                                )
                            }}
                        >
                            {t('placeholders.currentYear')}
                        </Button>
                        <Button
                            className="ml-2"
                            size="sm"
                            variant="twoTone"
                            onClick={() => {
                                setFromDate(
                                    DateTime.now()
                                        .minus({ year: 1 })
                                        .startOf('year')
                                        .toJSDate(),
                                )
                                setToDate(
                                    DateTime.now()
                                        .minus({ year: 1 })
                                        .endOf('year')
                                        .toJSDate(),
                                )
                            }}
                        >
                            {t('placeholders.lastYear')}
                        </Button>
                    </div>
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
                                                data-tn={`income-currency-filter-${item.code.toLowerCase()}-opt`}
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
            </Drawer>
        </div>
    )
}

const Incomes = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedIncome, setSelectedIncome] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)

    const [incomeFilter, setIncomeFilter] = useState<IncomeFilterType>({
        fromDate: DateTime.now().startOf('year').toJSDate(),
        toDate: DateTime.now().endOf('year').toJSDate(),
        currencies: [],
    })

    const { t, i18n } = useTranslation()
    const userState = useAppSelector((state) => state.auth.user)

    const {
        data: incomes,
        isFetching: isLoadingIncomes,
        refetch: refetchIncomes,
    } = useQuery({
        queryKey: ['user-incomes'],
        queryFn: async () => {
            return apiGetIncomeList({
                fromDate:
                    DateTime.fromJSDate(incomeFilter.fromDate).toISO() ??
                    undefined,
                toDate:
                    DateTime.fromJSDate(incomeFilter.toDate).toISO() ??
                    undefined,
            })
        },
    })

    const { data: bankAccounts, isFetching: isLoadingBankAccounts } = useQuery({
        queryKey: ['user-bank-accounts-by-incomes'],
        queryFn: apiGetUserBankAccountList,
    })

    const { data: userCurrencies } = useQuery({
        queryKey: ['user-currencies'],
        queryFn: async () => {
            const data: any[] = await apiGetUserCurrencies()
            if (incomeFilter.currencies.length === 0) {
                setIncomeFilter({
                    ...incomeFilter,
                    currencies: data.map((uc: any) => uc.id),
                })
            }
            return data
        },
    })

    const onMutationSuccess = async (title: string) => {
        refetchIncomes()
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedIncome(undefined)
    }

    const onDeleteConfirmClose = () => {
        setIsConfirmDeleteOpen(false)
        setSelectedIncome(undefined)
    }

    const deleteIncomeMutation = useMutation({
        mutationFn: apiDeleteIncome,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.incomes.deleted') || '')
        },
    })

    const createIncomeMutation = useMutation({
        mutationFn: apiCreateIncome,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.incomes.created') || '')
        },
    })

    const onDelete = () => {
        if (selectedIncome) {
            deleteIncomeMutation.mutate(selectedIncome.id)
            onDeleteConfirmClose()
        }
    }

    const onFormSubmit = async (value: any) => {
        await createIncomeMutation.mutateAsync(value)
        onFormClose()
    }

    const onFilterChange = (filters: IncomeFilterType) => {
        setIncomeFilter((prevState) => {
            if (
                prevState.toDate !== filters.toDate ||
                prevState.fromDate !== filters.fromDate
            ) {
                setTimeout(() => {
                    refetchIncomes()
                }, 100)
            }
            return filters
        })
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                id: 'incomeDate',
                header: t('fields.date'),
                accessorFn: (row) =>
                    DateTime.fromISO(row.incomeDate).toFormat('dd/MM/yyyy'),
            },
            {
                accessorKey: 'description',
                header: t('fields.description'),
            },
            {
                accessorKey: 'currency',
                header: t('fields.currency'),
                accessorFn: (row) => row.currency.code,
            },
            {
                accessorKey: 'amount',
                header: t('fields.amount'),
                accessorFn: (row) =>
                    currencyFormat(
                        row.amount,
                        row.currency.code,
                        i18n.language,
                        userState.country?.code || 'UY',
                    ),
            },
            {
                id: 'bankAccount',
                header: t('fields.bankAccount'),
                accessorFn: (row) => generateBankAccountLabel(row.bankAccount),
            },
            {
                id: 'actions',
                header: () => null,
                cell: ({ row }) => (
                    <Tooltip title={t('actions.delete')} placement="left">
                        <Button
                            className="hover:text-red-600"
                            size="sm"
                            shape="circle"
                            variant="plain"
                            color="red"
                            data-tn={`delete-income-btn-${row.original.id}`}
                            icon={<HiOutlineTrash />}
                            onClick={() => {
                                setIsConfirmDeleteOpen(true)
                                setSelectedIncome(row.original)
                            }}
                        />
                    </Tooltip>
                ),
            },
        ],
        [t, i18n.language, userState.country?.code],
    )

    const table = useReactTable({
        defaultColumn: {
            size: 100,
        },
        data: incomes ?? [],
        columns,
        state: {
            globalFilter: incomeFilter,
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowCanExpand: () => true,
        globalFilterFn: (row) => {
            return incomeFilter.currencies.includes(row.original.currency.id)
        },
        getColumnCanGlobalFilter: () => true,
        enableGlobalFilter: true,
        enableFilters: true,
        getExpandedRowModel: getExpandedRowModel(),
        autoResetAll: false,
    })

    const rows = table.getFilteredRowModel().flatRows

    if (!incomes || !bankAccounts || !userCurrencies) {
        return (
            <Container className="h-full" data-tn="incomes-page">
                <Loading loading />
            </Container>
        )
    }

    if (!rows.length) {
        return (
            <Container data-tn="incomes-page">
                <div className="lg:flex items-center justify-between mb-4">
                    <h2>{t('pages.incomes.header')}</h2>
                    <div className="flex flex-col lg:flex-row lg:items-center">
                        <IncomeFilter
                            userCurrencies={userCurrencies}
                            defaultValue={incomeFilter}
                            onFilter={onFilterChange}
                        />
                    </div>
                </div>
                <Loading
                    type="cover"
                    loading={isLoadingIncomes || isLoadingBankAccounts}
                >
                    <EmptyState
                        title={t('pages.incomes.emptyState.title')}
                        description={t('pages.incomes.emptyState.description')}
                        data-tn="empty-state-no-incomes"
                    >
                        <Button
                            variant="twoTone"
                            className="mt-4 w-full md:w-96"
                            size="lg"
                            icon={<HiPlus />}
                            data-tn="add-income-btn"
                            onClick={() => setIsFormOpen(true)}
                        >
                            {t('pages.incomes.addIncomeButton')}
                        </Button>
                    </EmptyState>
                </Loading>
                <IncomeForm
                    isOpen={isFormOpen}
                    isSaving={createIncomeMutation.isPending}
                    bankAccounts={bankAccounts}
                    onFormSubmit={onFormSubmit}
                    onFormClose={onFormClose}
                />
            </Container>
        )
    }

    return (
        <Container data-tn="incomes-page">
            <div className="lg:flex items-center justify-between mb-4">
                <h2 className="mb-2">{t('pages.incomes.header')}</h2>
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <IncomeFilter
                        userCurrencies={userCurrencies}
                        defaultValue={incomeFilter}
                        onFilter={onFilterChange}
                    />
                    <Button
                        variant="solid"
                        size="sm"
                        className="ml-2 mb-2"
                        icon={<HiPlus />}
                        data-tn="add-income-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.incomes.addIncomeButton')}
                    </Button>
                </div>
            </div>
            <Loading
                type="cover"
                loading={isLoadingIncomes || isLoadingBankAccounts}
            >
                <Card className="mt-4">
                    <Table>
                        <THead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <Tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <Th
                                                key={header.id}
                                                colSpan={header.colSpan}
                                            >
                                                {flexRender(
                                                    header.column.columnDef
                                                        .header,
                                                    header.getContext(),
                                                )}
                                            </Th>
                                        )
                                    })}
                                </Tr>
                            ))}
                        </THead>
                        <TBody>
                            {rows.map((row: any) => {
                                return (
                                    <Tr
                                        key={row.original.id}
                                        data-tn={`income-row-${row.original.id}`}
                                    >
                                        {row
                                            .getVisibleCells()
                                            .map((cell: any) => {
                                                return (
                                                    <td key={cell.id}>
                                                        {flexRender(
                                                            cell.column
                                                                .columnDef.cell,
                                                            cell.getContext(),
                                                        )}
                                                    </td>
                                                )
                                            })}
                                    </Tr>
                                )
                            })}
                        </TBody>
                    </Table>
                </Card>
            </Loading>
            <IncomeForm
                isOpen={isFormOpen}
                isSaving={createIncomeMutation.isPending}
                bankAccounts={bankAccounts}
                onFormSubmit={onFormSubmit}
                onFormClose={onFormClose}
            />
            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                type="danger"
                title={t('pages.incomes.deleteConfirmation.title')}
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                data-tn="confirm-delete-dialog"
                onClose={onDeleteConfirmClose}
                onRequestClose={onDeleteConfirmClose}
                onCancel={onDeleteConfirmClose}
                onConfirm={onDelete}
            >
                <p>{t('pages.incomes.deleteConfirmation.description')}</p>
            </ConfirmDialog>
        </Container>
    )
}

export default Incomes
