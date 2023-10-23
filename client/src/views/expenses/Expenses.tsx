import {
    Button,
    Card,
    Dropdown,
    FormItem,
    Input,
    ModalForm,
} from '@/components/ui'
import {
    ConfirmDialog,
    Container,
    EllipsisButton,
    IconText,
    Loading,
} from '@/components/shared'
import { DateTime } from 'luxon';
import Collapsible from '@/components/shared/Collapsible'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
    apiCreateExpense,
    apiDeleteExpense,
    apiGetExpenseList,
} from '@/services/ExpenseService'
import currencyFormat from '@/utils/currencyFormat'
import { HiOutlineTrash, HiPlus } from 'react-icons/hi'
import { useAppSelector } from '@/store'
import { useTranslation } from 'react-i18next'
import { apiGetUserCurrenciesWithExpenses } from '@/services/AccountService'
import EmptyState from '@/components/shared/EmptyState'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useState } from 'react'
import { Field, FieldProps, FormikErrors, FormikTouched } from "formik";
import * as Yup from 'yup'
import { SelectFieldItem } from '@/components/ui/Form'
import { MdOutlineAttachMoney } from "react-icons/md";
import DatePicker from "@/components/ui/DatePicker";

const getTotalExpenseByCurrency = (
    expenses: any[],
    currencyCode: string,
    lang: string,
    countryCode: string,
) => {
    const total = expenses
        .filter((e: any) => e.currency.code === currencyCode)
        .reduce((prevE, curE) => prevE + curE.amount, 0)
    if (!total) return null
    return currencyFormat(total, currencyCode, lang, countryCode)
}

const ExpensesSummary = (props: {
    userCurrencies: any[]
    countryCode: string
    lang: string
}) => {
    return (
        <div>
            <p className="mb-4">Summary</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {props.userCurrencies.map((currency: any) => {
                    const total: number = currency.expenses.reduce(
                        (acc: number, e: any) => acc + e.amount,
                        0,
                    )
                    if (!total) return null
                    return (
                        <Card key={currency.id}>
                            <h6 className="font-light mb-4 text-sm">
                                {currency.code}
                            </h6>
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">
                                        {currencyFormat(
                                            total,
                                            currency.code,
                                            props.lang,
                                            props.countryCode,
                                        )}
                                    </h3>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

const ExpenseTag = (props: { value: string }) => {
    return (
        <span className="text-xs py-1 mr-2 px-4 rounded-lg bg-violet-900 ">
            {props.value}
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

    const userState = useAppSelector((state) => state.auth.user)
    const { t, i18n } = useTranslation()

    const {
        data: categories,
        isFetching: isFetchingExpenses,
        refetch: getExpenses,
    } = useQuery({
        queryKey: ['user-expenses-by-category'],
        queryFn: apiGetExpenseList,
        suspense: true,
    })

    const {
        data: userCurrencies,
        isFetching: isFetchingUserCurrencies,
        refetch: getUserCurrencies,
    } = useQuery({
        queryKey: ['user-currencies-with-expenses'],
        queryFn: apiGetUserCurrenciesWithExpenses,
        suspense: true,
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
        onSettled: onDeleteConfirmClose,
    })

    const createExpenseMutation = useMutation({
        mutationFn: apiCreateExpense,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.expenses.created') || '')
        },
        onSettled: onFormClose,
    })

    const onDelete = () => {
        if (selectedExpense) {
            deleteExpenseMutation.mutate(selectedExpense.id)
        }
    }

    const onFormSubmit = (value: any) => {
        createExpenseMutation.mutate(value)
    }

    if (
        !categories ||
        isFetchingExpenses ||
        !userCurrencies ||
        isFetchingUserCurrencies
    ) {
        return (
            <Container className="h-full">
                <Loading loading />
            </Container>
        )
    }

    const validationSchema = Yup.object().shape({
        billableDate: Yup.string().required(t('validations.required') || ''),
        amount: Yup.string().required(t('validations.required') || ''),
    })

    const filteredCategories = categories.filter((c: any) => c.expenses.length)



    const ExpenseForm = () => (
        <ModalForm
            isOpen={isFormOpen}
            entity={
                selectedExpense || {
                    billableDate: DateTime.now().toFormat('dd/MM/yyyy'),
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
                        label={t(`fields.billableDate`) || ''}
                        invalid={
                            !!errors.billableDate || !!touched.billableDate
                        }
                        errorMessage={errors.billableDate?.toString()}
                    >
                        <Field name="billableDate" placeholder="DD/MM/YYYY">
                            {({ field, form }: FieldProps) => (
                                <DatePicker
                                    inputFormat="DD/MM/YYYY"
                                    defaultValue={new Date()}
                                    locale={i18n.language}
                                    clearable={false}
                                    onChange={(value: Date | null) => {
                                        const d = value
                                            ? DateTime.fromJSDate(
                                                value,
                                            )
                                            : DateTime.now();
                                        form.setFieldValue(
                                            field.name,
                                            d.toFormat('dd/MM/yyyy'),
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
                            options={userCurrencies?.map((c) => ({
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
                            placeholder={t('fields.categoryId')}
                            options={categories?.map((c: any) => ({
                                value: c.id,
                                label: c.name,
                            }))}
                            className="category-select"
                            id="category-select"
                            component={SelectFieldItem}
                        />
                    </FormItem>
                </>
            )}
            isSaving={createExpenseMutation.isLoading}
            onClose={onFormClose}
            onSubmit={onFormSubmit}
        />
    )

    if (!filteredCategories.length) {
        return (
            <Container>
                <EmptyState title="Sin Gastos Reportados">
                    <Button
                        className="mt-4"
                        variant="twoTone"
                        icon={<HiPlus />}
                        onClick={() => setIsFormOpen(true)}
                    >
                        Agregar Gasto
                    </Button>
                </EmptyState>
                <ExpenseForm />
            </Container>
        )
    }

    return (
        <Container>
            <ExpensesSummary
                userCurrencies={userCurrencies}
                countryCode={userState.country?.code || 'UY'}
                lang={i18n.language}
            />
            <div className="mt-4">
                <p className="mb-4">Detail</p>
                {filteredCategories.map((c: any) => (
                    <Collapsible
                        key={c.id}
                        collapsibleClassName="my-4"
                        headerClassName="text-white bg-purple-500"
                        header={
                            <div className="w-full flex items-center">
                                <div className="w-full flex flex-col">
                                    <span className="text-2xl text-white">
                                        {c.name}
                                    </span>
                                    <span className="rounded-md text-white mt-2">
                                        {userCurrencies
                                            .map((currency) =>
                                                getTotalExpenseByCurrency(
                                                    c.expenses,
                                                    currency.code,
                                                    i18n.language,
                                                    userState.country?.code ||
                                                        'UY',
                                                ),
                                            )
                                            .map(
                                                (
                                                    value: string | null,
                                                    index: number,
                                                ) =>
                                                    value ? (
                                                        <ExpenseTag
                                                            key={index}
                                                            value={value}
                                                        />
                                                    ) : null,
                                            )}
                                    </span>
                                </div>
                                <Button
                                    variant="twoTone"
                                    size="xs"
                                    className="mr-4"
                                    icon={<HiPlus />}
                                    onClick={() => {
                                        setIsFormOpen(true)
                                        setSelectedExpense({
                                            categoryId: c.id,
                                            billableDate: DateTime.now().toFormat('dd/MM/yyyy')
                                        })
                                    }}
                                >
                                    Add Expense
                                </Button>
                            </div>
                        }
                    >
                        <ul>
                            {c.expenses.map((item: any) => (
                                <li
                                    key={item.id}
                                    className="py-2 px-4 flex items-center card-border my-2 rounded-lg relative"
                                >
                                    <span className="w-full flex flex-col">
                                        <small className="font-light text-current">
                                            {item.billableDate}
                                        </small>
                                        <span className="text-lg">
                                            {item.description}
                                        </span>
                                    </span>
                                    <span className="text-left font-bold mt-4">
                                        {currencyFormat(
                                            item.amount,
                                            item.currency.code,
                                            i18n.language,
                                            userState.country?.code,
                                        )}
                                    </span>
                                    <Dropdown
                                        className="absolute right-2 top-1"
                                        placement="middle-end-top"
                                        renderTitle={
                                            <EllipsisButton data-tn="dropdown-bank-account-btn" />
                                        }
                                    >
                                        <Dropdown.Item
                                            eventKey="delete"
                                            data-tn="delete-bank-account-btn"
                                            onClick={() => {
                                                setIsConfirmDeleteOpen(true)
                                                setSelectedExpense(item)
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
                                </li>
                            ))}
                        </ul>
                    </Collapsible>
                ))}
            </div>
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
                        description: selectedExpense?.description,
                    })}
                </p>
            </ConfirmDialog>
            <ExpenseForm />
            <Button
                className=""
                style={{
                    position: 'fixed',
                    right: '1rem',
                    bottom: '2rem',
                }}
                shape="circle"
                variant="solid"
                size="lg"
                icon={<HiPlus />}
                onClick={() => setIsFormOpen(true)}
            />
        </Container>
    )
}

export default Expenses
