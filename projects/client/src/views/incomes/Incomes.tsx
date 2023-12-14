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
import EmptyState from '@/components/shared/EmptyState'
import {
    HiLibrary,
    HiOutlineCheck,
    HiOutlineCreditCard,
    HiOutlineTrash,
    HiOutlineTrendingDown,
    HiOutlineTrendingUp,
    HiPlus,
} from 'react-icons/hi'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
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

    const deleteExpenseMutation = useMutation({
        mutationFn: apiCreateIncome,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.expenses.deleted') || '')
        },
    })

    const createExpenseMutation = useMutation({
        mutationFn: apiCreateIncome,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.expenses.created') || '')
        },
    })

    const onDelete = () => {
        if (selectedIncome) {
            deleteExpenseMutation.mutate(selectedIncome.id)
            onDeleteConfirmClose()
        }
    }

    if (!incomes || !bankAccounts) {
        return (
            <div className="flex h-full mx-auto w-0" data-tn="incomes-page">
                <Loading loading />
            </div>
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
            </Container>
        )
    }

    return <Container data-tn="incomes-page">

        <Loading type="cover" loading={isLoadingIncomes || isLoadingBankAccounts}>
            HOla
        </Loading>

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
