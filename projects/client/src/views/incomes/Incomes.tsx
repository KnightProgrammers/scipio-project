import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from '@/components/ui/toast'
import { DateTime } from 'luxon'
import Notification from '@/components/ui/Notification'
import { apiCreateIncome, apiGetIncomeList } from '@/services/IncomeService'
import { apiGetUserBankAccountList } from '@/services/BankAccountService'
import currencyFormat from '@/utils/currencyFormat'
import { ConfirmDialog, Container, Loading } from '@/components/shared'
import DatePicker from '@/components/ui/DatePicker'
import { SelectFieldItem } from '@/components/ui/Form'
import EmptyState from '@/components/shared/EmptyState'
import {
    HiLibrary,
    HiOutlineCheck,
    HiOutlineCreditCard,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import { MdOutlineAttachMoney } from 'react-icons/md'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import * as Yup from 'yup'
import {
    Avatar,
    Badge,
    Button,
    Card,
    FormItem,
    Input,
    ModalForm,
    Select,
    Table,
    Tooltip,
} from '@/components/ui'

type IncomeFilterType = {
    fromDate: Date
    toDate: Date
    currencies: string[]
}

const IncomeForm = (props: {
    isOpen: boolean
    isSaving: boolean
    bankAccounts: any[]
    onFormClose: () => void
    onFormSubmit: (data: any) => Promise<void>
}) => {
    const {
        isOpen,
        isSaving,
        bankAccounts,
        onFormClose,
        onFormSubmit,
    } = props

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
                        invalid={
                            !!errors.amount || !!touched.amount
                        }
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
                                label: `${ba.bank.name} - ${
                                    ba.label ? `${ba.label}/` : ''
                                }${ba.accountNumber} (${ba.currency.code})`,
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

const Incomes = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedIncome, setSelectedIncome] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)

    const [incomeFilter, setIncomeFilter] = useState<IncomeFilterType>({
        fromDate: DateTime.now().set({ day: 1 }).toJSDate(),
        toDate: DateTime.now().endOf('month').toJSDate(),
        currencies: [],
    })

    const { t } = useTranslation()

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
        }
    })

    const {
        data: bankAccounts,
        isFetching: isLoadingBankAccounts
    } = useQuery({
        queryKey: ['user-bank-accounts-by-incomes'],
        queryFn: apiGetUserBankAccountList,
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
        mutationFn: apiCreateIncome,
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

    if (!incomes || !bankAccounts) {
        return (
            <Container className="h-full" data-tn="incomes-page">
                <Loading loading />
            </Container>
        )
    }

    if (!incomes.length) {
        return (
            <Container data-tn="incomes-page">
                <div className="lg:flex items-center justify-between mb-4">
                    <h2>{t('pages.incomes.header')}</h2>
                </div>
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
                        data-tn="add-category-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.incomes.addIncomeButton')}
                    </Button>
                </EmptyState>
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

    return <Container data-tn="incomes-page">
        <Loading type="cover" loading={isLoadingIncomes || isLoadingBankAccounts}>
            HOla
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
            <p>
                {t('pages.incomes.deleteConfirmation.description')}
            </p>
        </ConfirmDialog>
    </Container>
}

export default Incomes
