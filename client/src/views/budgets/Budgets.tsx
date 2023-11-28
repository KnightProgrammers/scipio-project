import { useEffect, useState } from 'react'
import { ConfirmDialog, Container, Loading } from '@/components/shared'
import EmptyState from '@/components/shared/EmptyState'
import { Alert, Button, Input, Select, Spinner, Table } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { HiOutlineRocketLaunch } from 'react-icons/hi2'
import { BiSave, BiTrash } from 'react-icons/bi'
import { FormItem } from '@/components/ui/Form'
import TFoot from '@/components/ui/Table/TFoot'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiGetCategoryList } from '@/services/CategoryService'
import { apiGetUserCurrencies } from '@/services/AccountService'
import { MultiValue } from 'react-select'
import {
    apiCreateBudget,
    apiDeleteBudgetItem,
    apiGetBudget,
    apiUpdateBudgetCurrencies,
    apiUpsertBudgetItem,
} from '@/services/BudgetService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { HiPlus } from 'react-icons/hi'
import { GrUndo } from 'react-icons/gr'
import currencyFormat from '@/utils/currencyFormat'
import { useAppSelector } from '@/store'

const { Tr, Th, Td, THead, TBody } = Table

const CategoryCell = (props: {
    readonly: boolean
    category: any
    categoryList: any[]
    budgetId: string
    onChange: (category: any) => void
}) => {
    const {
        readonly = true,
        category,
        categoryList,
        budgetId,
        onChange,
    } = props

    const [isSelected, setIsSelected] = useState(!category)

    const [value, setValue] = useState<any>()

    useEffect(() => {
        setIsSelected(!category)
        setValue(
            category
                ? {
                      value: category.id,
                      label: category.name,
                  }
                : null,
        )
    }, [category])

    const { t } = useTranslation()

    const onValueChange = (newValue: any) => {
        const selectedCategory = categoryList.find(
            (c: any) => c.id === newValue.value,
        )
        setIsSelected(false)
        setValue(value)
        onChange(selectedCategory)
    }

    if (isSelected || !category) {
        return (
            <Td>
                <Select
                    placeholder={t('fields.category')}
                    id={
                        budgetId
                            ? `category-select-${budgetId}`
                            : 'category-select-new-budget-item'
                    }
                    value={value}
                    defaultValue={
                        category
                            ? { value: category.id, label: category.name }
                            : null
                    }
                    defaultInputValue=""
                    size="sm"
                    isDisabled={false}
                    isLoading={false}
                    options={categoryList.map((c: any) => ({
                        label: c.name,
                        value: c.id,
                    }))}
                    onBlur={() => setIsSelected(false)}
                    onChange={(newValue) => onValueChange(newValue as any)}
                />
            </Td>
        )
    }

    return (
        <Td
            onClick={() => {
                if (!readonly) setIsSelected(true)
            }}
        >
            {category.name}
        </Td>
    )
}

const getDefaultBudgetItem = (selectedCurrencies: any[]) => {
    return {
        category: null,
        currencies: selectedCurrencies.map((c: string) => ({
            currency: {
                code: c,
            },
            limit: 0,
        })),
    }
}

const CurrencyCell = (props: {
    limit: number
    currencyCode: string
    lang: string
    country: string
    editionMode: boolean
    onChange: (newValue: number) => void
    onEdited: (isEdited: boolean) => void
    'data-tn': string
}) => {
    const {
        limit,
        currencyCode,
        lang,
        country,
        editionMode,
        onChange,
        onEdited,
    } = props
    const [value, setValue] = useState(limit)

    const handleValueChange = (newValue: string) => {
        let valueAsNumber: number = parseFloat(newValue)
        if (isNaN(valueAsNumber)) {
            valueAsNumber = 0
        }
        setValue(valueAsNumber)
        onChange(valueAsNumber)
    }

    if (editionMode) {
        return (
            <Td data-tn={`${props['data-tn']}`}>
                <Input
                    width={50}
                    className=""
                    size="sm"
                    type="number"
                    value={value}
                    prefix="$"
                    onBlur={(event) => {
                        handleValueChange(event.target.value)
                    }}
                    onKeyDown={(event: any) => {
                        if (event.key === 'Enter') {
                            handleValueChange(
                                event.nativeEvent.target.value ?? '0',
                            )
                        }
                    }}
                    onChange={(event) => handleValueChange(event.target.value)}
                />
            </Td>
        )
    }

    return (
        <Td data-tn={`${props['data-tn']}`} onClick={() => onEdited(true)}>
            {currencyFormat(limit, currencyCode, lang, country)}
        </Td>
    )
}

const BudgetRow = (props: {
    budgetId: string
    budgetItem: any
    categoryList: any[]
    currencies: string[]
    onRefetch: () => void
}) => {
    const { budgetId, budgetItem, categoryList, currencies, onRefetch } = props
    const [wasModified, setWasModified] = useState(false)
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
    const [newItem, setNewItem] = useState(
        JSON.parse(JSON.stringify(budgetItem)),
    )

    const { t, i18n } = useTranslation()

    const userState = useAppSelector((state) => state.auth.user)

    const upsertBudgetItemMutation = useMutation({
        mutationFn: apiUpsertBudgetItem,
    })

    const deleteBudgetItemMutation = useMutation({
        mutationFn: apiDeleteBudgetItem,
        onSuccess: async () => {
            toast.push(
                <Notification
                    title={t('notifications.budget.updated') || ''}
                    type="success"
                />,
                {
                    placement: 'top-center',
                },
            )
            onRefetch()
        },
    })

    const handleUpdate = async (itemUpdated: any) => {
        setWasModified(false)
        setNewItem(itemUpdated)
        await upsertBudgetItemMutation.mutateAsync({
            budgetId,
            categoryId: itemUpdated.category.id,
            currencies: itemUpdated.currencies.map((c: any) => ({
                currencyCode: c.currency.code,
                limit: c.limit,
            })),
        })
        toast.push(
            <Notification
                title={t('notifications.budget.updated') || ''}
                type="success"
            />,
            {
                placement: 'top-center',
            },
        )
        onRefetch()
    }

    const findCurrencyIndex = (currencyCode: string) => {
        return newItem.currencies.findIndex(
            (c: any) => c.currency.code === currencyCode,
        )
    }

    const getLimit = (currencyCode: string) => {
        const index = findCurrencyIndex(currencyCode)
        return newItem.currencies[index]?.limit ?? 0
    }

    const setLimit = (newLimit: number, currencyCode: string) => {
        const index = findCurrencyIndex(currencyCode)
        if (index < 0) {
            newItem.currencies.push({
                currency: { code: currencyCode },
                limit: newLimit,
            })
            setNewItem(newItem)
        } else {
            newItem.currencies[index].limit = newLimit
            setNewItem(newItem)
        }
    }

    const isLoading =
        upsertBudgetItemMutation.isPending || deleteBudgetItemMutation.isPending

    return (
        <Tr
            data-tn={`budget-item-${
                newItem?.category?.id ?? 'new-category'
            }-row`}
        >
            <CategoryCell
                readonly={!!newItem.id}
                category={newItem?.category}
                categoryList={categoryList}
                budgetId={newItem.id}
                onChange={async (category: any) => {
                    await handleUpdate({
                        ...newItem,
                        category,
                    })
                }}
            />
            {currencies.map((currencyCode: string) => (
                <CurrencyCell
                    key={`${
                        newItem?.category?.id ?? 'new-category'
                    }-currency-${currencyCode.toLowerCase()}`}
                    data-tn={`${
                        newItem?.category?.id ?? 'new-category'
                    }-currency-${currencyCode.toLowerCase()}-limit`}
                    limit={getLimit(currencyCode)}
                    currencyCode={currencyCode}
                    lang={i18n.language}
                    country={userState.country?.code || 'UY'}
                    editionMode={wasModified}
                    onEdited={(isEdited: boolean) => setWasModified(isEdited)}
                    onChange={(newValue: number) => {
                        setWasModified(true)
                        setLimit(newValue, currencyCode)
                    }}
                />
            ))}
            {isLoading ? (
                <Td width={120}>
                    <Spinner />
                </Td>
            ) : (
                <Td width={120}>
                    {wasModified ? (
                        <>
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<BiSave />}
                                data-tn="save-budget-item"
                                onClick={async () => handleUpdate(newItem)}
                            />
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<GrUndo />}
                                data-tn="reset-limits-btn"
                                onClick={() => {
                                    setWasModified(false)
                                    console.log(budgetItem)
                                    setNewItem(
                                        JSON.parse(JSON.stringify(budgetItem)),
                                    )
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <Button
                                variant="plain"
                                size="sm"
                                icon={<BiTrash />}
                                data-tn="delete-budget-item"
                                onClick={() => {
                                    if (newItem.id) {
                                        setIsConfirmDeleteOpen(true)
                                    } else {
                                        onRefetch()
                                    }
                                }}
                            />
                            <ConfirmDialog
                                isOpen={isConfirmDeleteOpen}
                                type="danger"
                                title={t(
                                    'pages.budgets.deleteConfirmation.title',
                                )}
                                confirmButtonColor="red-600"
                                confirmText={t('actions.delete')}
                                cancelText={t('actions.cancel')}
                                data-tn="confirm-delete-dialog"
                                onClose={() => setIsConfirmDeleteOpen(false)}
                                onRequestClose={() =>
                                    setIsConfirmDeleteOpen(false)
                                }
                                onCancel={() => setIsConfirmDeleteOpen(false)}
                                onConfirm={() => {
                                    setIsConfirmDeleteOpen(false)
                                    deleteBudgetItemMutation.mutate({
                                        id: newItem.id,
                                        budgetId,
                                    })
                                }}
                            >
                                <p>
                                    {t(
                                        'pages.budgets.deleteConfirmation.description',
                                        {
                                            categoryName:
                                                budgetItem.category?.name ?? '',
                                        },
                                    )}
                                </p>
                            </ConfirmDialog>
                        </>
                    )}
                </Td>
            )}
        </Tr>
    )
}

const Budgets = () => {
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>()
    const [remainingCategories, setRemainingCategories] = useState<any[]>([])
    const [showNewItemRow, setShowNewItemRow] = useState<boolean>(false)
    const [totalByCurrency, setTotalByCurrency] = useState<any>({})
    const { t, i18n } = useTranslation()

    const userState = useAppSelector((state) => state.auth.user)

    const { data: categoryList, isFetching: isLoadingCategories } = useQuery({
        queryKey: ['user-categories'],
        queryFn: apiGetCategoryList,
    })

    const { data: userCurrencies, isFetching: isFetchingUserCurrencies } =
        useQuery({
            queryKey: ['user-currencies'],
            queryFn: apiGetUserCurrencies,
        })

    const {
        data: budget,
        isLoading: isLoadingBudget,
        refetch: refetchBudget,
    } = useQuery({
        queryKey: ['user-budget'],
        enabled: userCurrencies !== undefined,
        queryFn: async () => {
            const data = await apiGetBudget()
            const getTotalByCurrency = (currencyCode: string) => {
                return data.items.reduce((acc: number, item: any) => {
                    return (
                        item.currencies.find(
                            (c: any) => c.currency.code === currencyCode,
                        ).limit + acc
                    )
                }, 0)
            }
            const availableCurrencies =
                data && data.items.length > 0
                    ? data.items[0].currencies.map((c: any) => c.currency.code)
                    : userCurrencies?.map((c: any) => c.code) ?? []

            setSelectedCurrencies(availableCurrencies)
            if (data) {
                const newValue: any = {}
                for (const c of availableCurrencies) {
                    newValue[c] = getTotalByCurrency(c)
                }
                setTotalByCurrency(newValue)
            }
            return data
        },
    })

    const onMutationSuccess = (title: string) => {
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const createBudgetMutation = useMutation({
        mutationFn: apiCreateBudget,
        onSuccess: async () => {
            onMutationSuccess(t('notifications.budget.created') || '')
            await refetchBudget()
        },
    })

    const updateBudgetCurrenciesMutation = useMutation({
        mutationFn: apiUpdateBudgetCurrencies,
        onSuccess: async () => {
            onMutationSuccess(t('notifications.budget.updated') || '')
            await refetchBudget()
        },
    })

    const addNewBudgetItem = () => {
        setShowNewItemRow(true)
    }

    const handleOnRefetch = async () => {
        setShowNewItemRow(false)
        await refetchBudget()
    }

    const isStarting: boolean = createBudgetMutation.isPending

    useEffect(() => {
        if (budget && categoryList) {
            const budgetCategories: any[] = budget.items.map(
                (i: any) => i.category.id,
            )
            setRemainingCategories(
                categoryList.filter(
                    (c: any) => !budgetCategories.includes(c.id),
                ),
            )
        }
    }, [budget, categoryList])

    if (
        budget === undefined ||
        !categoryList ||
        isLoadingCategories ||
        selectedCurrencies === undefined ||
        isFetchingUserCurrencies
    ) {
        return (
            <div className="flex h-full mx-auto w-0" data-tn="budgets-page">
                <Loading loading />
            </div>
        )
    }

    if (!budget) {
        return (
            <Container data-tn="budgets-page">
                <Loading type="cover" loading={isStarting}>
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                        <h2 className="mb-2">{t('pages.budgets.header')}</h2>
                    </div>
                    <EmptyState
                        title={t('pages.budgets.emptyState.title')}
                        description={t('pages.budgets.emptyState.description')}
                    >
                        <Button
                            icon={<HiOutlineRocketLaunch />}
                            data-tn="budget-start"
                            loading={isStarting}
                            variant="twoTone"
                            size="lg"
                            className="w-full md:w-96"
                            onClick={() => createBudgetMutation.mutate()}
                        >
                            {isStarting
                                ? t('actions.starting')
                                : t('actions.start')}
                        </Button>
                    </EmptyState>
                </Loading>
            </Container>
        )
    }

    const handleCurrenciesChange = (newCurrencies: string[]) => {
        if (budget.items.length > 0) {
            updateBudgetCurrenciesMutation.mutate({
                id: budget.id,
                currencies: newCurrencies,
            })
        } else {
            setSelectedCurrencies(newCurrencies)
        }
    }

    return (
        <Container data-tn="budgets-page">
            <div className="flex flex-col md:flex-row justify-between mb-4 relative">
                <h2 className="mb-2">{t('pages.budgets.header')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2"></div>
                <FormItem layout="horizontal" label={t('fields.currency')}>
                    <Select
                        placeholder={t('fields.currency')}
                        id="currency-select"
                        defaultValue={selectedCurrencies.map((c: string) => ({
                            label: c,
                            value: c,
                        }))}
                        isDisabled={false}
                        isClearable={false}
                        isLoading={false}
                        size="sm"
                        isMulti={true}
                        defaultInputValue=""
                        options={
                            userCurrencies?.map((c: any) => ({
                                label: c.code,
                                value: c.code,
                            })) ?? []
                        }
                        onChange={(newValue: MultiValue<any>) => {
                            handleCurrenciesChange(
                                (newValue as any[]).map((nv: any) => nv.label),
                            )
                        }}
                    />
                </FormItem>
            </div>
            <Table className="w-full h-full">
                <THead>
                    <Tr>
                        <Th>{t('fields.category')}</Th>
                        {selectedCurrencies.map((c: string) => (
                            <Th key={`currency-head-colum-${c.toLowerCase()}`}>
                                {c}
                            </Th>
                        ))}
                        <Th></Th>
                    </Tr>
                </THead>
                <TBody>
                    {budget.items.map((item: any) => (
                        <BudgetRow
                            key={`budget-row-${item.id}`}
                            budgetId={budget.id}
                            budgetItem={item}
                            categoryList={remainingCategories}
                            currencies={selectedCurrencies}
                            onRefetch={handleOnRefetch}
                        />
                    ))}
                    {showNewItemRow && (
                        <BudgetRow
                            budgetId={budget.id}
                            budgetItem={getDefaultBudgetItem(
                                selectedCurrencies,
                            )}
                            categoryList={remainingCategories}
                            currencies={selectedCurrencies}
                            onRefetch={handleOnRefetch}
                        />
                    )}
                    {!budget.items.length && !showNewItemRow && (
                        <Tr>
                            <Td colSpan={selectedCurrencies.length + 2}>
                                <Alert
                                    showIcon
                                    className="justify-center"
                                    type="info"
                                    data-tn="budget-without-items"
                                >
                                    {t('pages.budgets.emptyState.noItems')}
                                </Alert>
                            </Td>
                        </Tr>
                    )}
                </TBody>
                <TFoot>
                    {!!remainingCategories.length && (
                        <Tr>
                            <Td colSpan={selectedCurrencies.length + 2}>
                                <Button
                                    variant="twoTone"
                                    className="w-80"
                                    disabled={!remainingCategories.length}
                                    icon={<HiPlus />}
                                    data-tn="add-budget-item-btn"
                                    onClick={addNewBudgetItem}
                                >
                                    {t('pages.budgets.addBudgetItem')}
                                </Button>
                            </Td>
                        </Tr>
                    )}
                    <Loading
                        asElement={'tr'}
                        type="cover"
                        loading={isLoadingBudget}
                    >
                        <Td>
                            <b>{t('placeholders.total')}:</b>
                        </Td>
                        {selectedCurrencies.map((c: string) => (
                            <Td key={`currency-colum-${c}`}>
                                {currencyFormat(
                                    totalByCurrency[c] ?? 0,
                                    c,
                                    i18n.language,
                                    userState.country?.code || 'UY',
                                )}
                            </Td>
                        ))}
                        <Td></Td>
                    </Loading>
                </TFoot>
            </Table>
        </Container>
    )
}

export default Budgets
