import {
    ConfirmDialog,
    Container,
    CopyButton,
    EllipsisButton,
    IconText,
    Loading,
} from '@/components/shared'
import {
    Avatar,
    Button,
    Card,
    Dropdown,
    FormItem,
    Input,
    ModalForm,
    Tooltip,
} from '@/components/ui'
import currencyFormat from '@/utils/currencyFormat'
import { useState } from 'react'
import { BankAccountDataType, BankDataType } from '@/@types/system'
import {
    apiGetBankAccountList,
    apiCreateBankAccount,
    apiUpdateBankAccount,
    apiDeleteBankAccount,
} from '@/services/BankAccountService'
import EmptyState from '@/components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import useThemeClass from '@/utils/hooks/useThemeClass'
import {
    HiLibrary,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import { useConfig } from '@/components/ui/ConfigProvider'
import { Field, FormikErrors, FormikTouched } from 'formik'
import { apiGetUserCurrencies } from '@/services/AccountService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { SelectFieldItem } from '@/components/ui/Form'
import * as Yup from 'yup'
import { useAppSelector } from '@/store'
import { useMutation, useQuery } from '@tanstack/react-query'
import { MdOutlineAttachMoney } from 'react-icons/md'
import { PiWarningOctagonBold } from 'react-icons/pi'
import {
    apiCreateBank,
    apiDeleteBank,
    apiUpdateBank,
} from '@/services/BankService'

const BankAccounts = () => {
    const [selectedBankAccount, setSelectedBankAccount] = useState<
        BankAccountDataType | undefined
    >(undefined)
    const [selectedBank, setSelectedBank] = useState<BankDataType | undefined>(
        undefined,
    )
    const [isAccountFormOpen, setIsAccountFormOpen] = useState<boolean>(false)
    const [isAccountConfirmDeleteOpen, setIsAccountConfirmDeleteOpen] =
        useState<boolean>(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false)

    const userState = useAppSelector((state) => state.auth.user)

    const { data: userCurrencies, isFetching: isFetchingUserCurrencies } =
        useQuery({
            queryKey: ['user-currencies'],
            queryFn: apiGetUserCurrencies,
        })

    const {
        data: bankAccountList,
        isFetching: isFetchingBankAccounts,
        refetch: refetchBankAccounts,
    } = useQuery({
        queryKey: ['user-bank-accounts'],
        queryFn: apiGetBankAccountList,
    })

    const onMutationSuccess = async (title: string) => {
        refetchBankAccounts()
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const onBankFormClose = () => {
        setSelectedBank(undefined)
        setIsFormOpen(false)
    }

    const onBankDeleteConfirmClose = () => {
        setSelectedBank(undefined)
        setIsDeleteOpen(false)
    }

    const createBankAccountMutation = useMutation({
        mutationFn: apiCreateBankAccount,
        onSuccess: async () => {
            await onMutationSuccess(
                t('notifications.bankAccount.created') || '',
            )
        },
    })

    const updateBankAccountMutation = useMutation({
        mutationFn: apiUpdateBankAccount,
        onSuccess: async () => {
            await onMutationSuccess(
                t('notifications.bankAccount.updated') || '',
            )
        },
    })

    const deleteBankAccountMutation = useMutation({
        mutationFn: apiDeleteBankAccount,
        onSuccess: async () => {
            await onMutationSuccess(
                t('notifications.bankAccount.deleted') || '',
            )
        },
    })

    const createBankMutation = useMutation({
        mutationFn: apiCreateBank,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.bank.created') || '')
        },
        onSettled: onBankFormClose,
    })

    const updateBankMutation = useMutation({
        mutationFn: apiUpdateBank,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.bank.updated') || '')
        },
        onSettled: onBankFormClose,
    })

    const deleteBankMutation = useMutation({
        mutationFn: apiDeleteBank,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.bank.deleted') || '')
        },
        onSettled: onBankDeleteConfirmClose,
    })

    const { t, i18n } = useTranslation()
    const { themeColor } = useConfig()
    const { textTheme, bgTheme } = useThemeClass()

    const validationSchema = Yup.object().shape({
        accountNumber: Yup.string().required(t('validations.required') || ''),
        accountBalance: Yup.string().required(t('validations.required') || ''),
        accountCurrency: Yup.string().required(t('validations.required') || ''),
    })

    const onAccountFormClose = () => {
        setIsAccountFormOpen(false)
        setSelectedBank(undefined)
        setSelectedBankAccount(undefined)
    }

    const onAccountFormSubmit = async (data: any) => {
        const currency = userCurrencies?.find(
            (c) => c.id === data.accountCurrency,
        )
        if (!!selectedBank && !!currency) {
            if (!data.id) {
                createBankAccountMutation.mutate({
                    accountName: data.accountName,
                    accountNumber: data.accountNumber,
                    accountBalance: data.accountBalance,
                    accountBankId: selectedBank.id,
                    accountCurrencyId: currency.id,
                })
            } else {
                if (selectedBankAccount) {
                    updateBankAccountMutation.mutate({
                        id: data.id,
                        accountName: data.accountName,
                        accountNumber: data.accountNumber,
                        accountBalance: data.accountBalance,
                        accountBankId: selectedBank.id,
                        accountCurrencyId:
                        selectedBankAccount.accountCurrency.id,
                    })
                }
            }
        }
        onAccountFormClose()
    }

    const onAccountDeleteConfirmClose = () => {
        setIsAccountConfirmDeleteOpen(false)
        setSelectedBank(undefined)
        setSelectedBankAccount(undefined)
    }

    const onAccountDelete = async () => {
        if (selectedBankAccount) {
            deleteBankAccountMutation.mutate(selectedBankAccount.id)
        }
        onAccountDeleteConfirmClose()
    }

    if (!bankAccountList) {
        return <Loading loading={true} type="cover" className="w-full h-80" />
    }

    if (bankAccountList.length === 0) {
        return (
            <Container data-tn="bank-accounts-page">
                <div className="lg:flex items-center justify-between mb-4 my-2">
                    <h2>{t('pages.bankAccounts.header')}</h2>
                </div>
                <EmptyState
                    className="mt-4"
                    title={t('pages.banks.emptyState.title') || ''}
                    description={t('pages.banks.emptyState.description') || ''}
                    data-tn="empty-state-no-banks"
                >
                    <Button
                        variant="twoTone"
                        size="lg"
                        className="mt-4 w-full md:w-96"
                        icon={<HiPlus />}
                        data-tn="add-bank-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.banks.newBankAction')}
                    </Button>
                    <ModalForm
                        isOpen={isFormOpen}
                        entity={
                            selectedBank || {
                                name: '',
                            }
                        }
                        title={
                            selectedBank
                                ? t('pages.banks.form.editTitle')
                                : t('pages.banks.form.newTitle')
                        }
                        validationSchema={Yup.object().shape({
                            name: Yup.string().required(
                                t('validations.required') || '',
                            ),
                        })}
                        fields={(
                            errors: FormikErrors<any>,
                            touched: FormikTouched<any>,
                        ) => (
                            <>
                                <FormItem
                                    asterisk
                                    label={t('fields.name') || 'Name'}
                                    invalid={
                                        (errors.name && touched.name) as boolean
                                    }
                                    errorMessage={errors.name?.toString()}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder={t('fields.name')}
                                        component={Input}
                                    />
                                </FormItem>
                            </>
                        )}
                        isSaving={
                            createBankMutation.isPending ||
                            updateBankMutation.isPending
                        }
                        onClose={onBankFormClose}
                        onSubmit={(values: any) => {
                            if (!selectedBank) {
                                createBankMutation.mutate(values)
                            } else {
                                updateBankMutation.mutate({
                                    ...selectedBank,
                                    ...values,
                                })
                            }
                        }}
                    />
                </EmptyState>
            </Container>
        )
    }

    return (
        <Container data-tn="bank-accounts-page">
            <div className="lg:flex items-center justify-between mb-4 my-2">
                <h2>{t('pages.bankAccounts.header')}</h2>
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <Button
                        variant="solid"
                        size="sm"
                        className="lg:ml-2 my-2"
                        icon={<HiPlus />}
                        data-tn="add-bank-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.banks.newBankAction')}
                    </Button>
                </div>
            </div>
            <Card bodyClass="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bankAccountList.map((bank: any) => {
                    return (
                        <Loading
                            key={bank.id}
                            loading={
                                isFetchingUserCurrencies ||
                                isFetchingBankAccounts
                            }
                            type="cover"
                        >
                            <Card
                                bordered
                                data-tn={`bank-${bank.id}-card`}
                                header={
                                    <div className="flex inline-flex items-center w-full">
                                        <div className="flex inline-flex items-center w-full">
                                            <Avatar
                                                src={bank.icon && bank.icon}
                                                icon={
                                                    !bank.icon && <HiLibrary />
                                                }
                                                className={`mr-2 ${bgTheme} dark:${bgTheme}`}
                                                size={32}
                                            />
                                            <span
                                                className={`font-bold text-lg ${textTheme} dark:${textTheme}`}
                                            >
                                                {bank.name}
                                            </span>
                                        </div>
                                        <Dropdown
                                            placement="middle-end-top"
                                            renderTitle={
                                                <EllipsisButton data-tn="dropdown-bank-btn" />
                                            }
                                        >
                                            <Dropdown.Item
                                                eventKey="edit"
                                                data-tn="edit-bank-btn"
                                                onClick={() => {
                                                    setSelectedBank(bank)
                                                    setIsFormOpen(true)
                                                }}
                                            >
                                                <IconText
                                                    className="text-sm font-semibold w-full"
                                                    icon={
                                                        <HiOutlinePencilAlt />
                                                    }
                                                >
                                                    {t('actions.edit')}
                                                </IconText>
                                            </Dropdown.Item>
                                            <Dropdown.Item
                                                eventKey="delete"
                                                data-tn="delete-bank-btn"
                                                disabled={bank.bankAccounts.length}
                                                onClick={() => {
                                                    if (!bank.bankAccounts.length) {
                                                        setSelectedBank(bank)
                                                        setIsDeleteOpen(true)
                                                    }
                                                }}
                                            >
                                                {bank.bankAccounts.length ? (
                                                    <Tooltip
                                                        title={
                                                            <IconText
                                                                className="text-yellow-400"
                                                                icon={
                                                                    <PiWarningOctagonBold
                                                                        size={
                                                                            64
                                                                        }
                                                                    />
                                                                }
                                                            >
                                                                {t(
                                                                    'pages.banks.tooltips.warnHasAccounts',
                                                                )}
                                                            </IconText>
                                                        }
                                                        placement="left"
                                                    >
                                                        <IconText
                                                            className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                                            icon={
                                                                <HiOutlineTrash />
                                                            }
                                                        >
                                                            {t(
                                                                'actions.delete',
                                                            )}
                                                        </IconText>
                                                    </Tooltip>
                                                ) : (
                                                    <IconText
                                                        className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                                        icon={
                                                            <HiOutlineTrash />
                                                        }
                                                    >
                                                        {t(
                                                            'actions.delete',
                                                        )}
                                                    </IconText>
                                                )}
                                            </Dropdown.Item>
                                        </Dropdown>
                                    </div>
                                }
                                className="flex flex-col justify-between"
                                footerClass=""
                                footer={
                                    <Button
                                        variant="twoTone"
                                        block={true}
                                        icon={<HiPlus />}
                                        data-tn="add-bank-account-btn"
                                        color={`${themeColor}`}
                                        onClick={() => {
                                            setSelectedBank(bank)
                                            setIsAccountFormOpen(true)
                                        }}
                                    >
                                        {t(
                                            'pages.bankAccounts.addAccountButton',
                                        )}
                                    </Button>
                                }
                            >
                                {bank.bankAccounts.length === 0 ? (
                                    <EmptyState
                                        bordered
                                        description={t(
                                            'pages.bankAccounts.emptyState.noAccounts.description',
                                        )}
                                        iconSize={0}
                                    />
                                ) : (
                                    <>
                                        {bank.bankAccounts.map((a: any) => (
                                            <Card
                                                key={a.id}
                                                bordered
                                                data-tn={`bank-account-${a.id}`}
                                                className="my-2 w-full relative"
                                            >
                                                <Dropdown
                                                    className="absolute right-4 top-2"
                                                    placement="middle-end-top"
                                                    renderTitle={
                                                        <EllipsisButton data-tn="dropdown-bank-account-btn" />
                                                    }
                                                >
                                                    <Dropdown.Item
                                                        eventKey="edit"
                                                        data-tn="edit-bank-account-btn"
                                                        onClick={() => {
                                                            setSelectedBank(
                                                                bank,
                                                            )
                                                            setSelectedBankAccount(
                                                                a,
                                                            )
                                                            setIsAccountFormOpen(
                                                                true,
                                                            )
                                                        }}
                                                    >
                                                        <IconText
                                                            className="text-sm font-semibold w-full"
                                                            icon={
                                                                <HiOutlinePencilAlt />
                                                            }
                                                        >
                                                            {t('actions.edit')}
                                                        </IconText>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item
                                                        eventKey="delete"
                                                        data-tn="delete-bank-account-btn"
                                                        disabled={
                                                            a.savings.length
                                                        }
                                                        onClick={() => {
                                                            if (!a.savings.length) {
                                                                setSelectedBank(
                                                                    bank,
                                                                )
                                                                setSelectedBankAccount(
                                                                    a,
                                                                )
                                                                setIsAccountConfirmDeleteOpen(
                                                                    true,
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {a.savings.length ? (
                                                            <Tooltip
                                                                title={
                                                                    <IconText
                                                                        className="text-yellow-400"
                                                                        icon={
                                                                            <PiWarningOctagonBold
                                                                                size={
                                                                                    64
                                                                                }
                                                                            />
                                                                        }
                                                                    >
                                                                        {t(
                                                                            'pages.bankAccounts.tooltips.warnHasSavings',
                                                                        )}
                                                                    </IconText>
                                                                }
                                                                placement="left"
                                                            >
                                                                <IconText
                                                                    className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                                                    icon={
                                                                        <HiOutlineTrash />
                                                                    }
                                                                >
                                                                    {t(
                                                                        'actions.delete',
                                                                    )}
                                                                </IconText>
                                                            </Tooltip>
                                                        ) : (
                                                            <IconText
                                                                className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                                                icon={
                                                                    <HiOutlineTrash />
                                                                }
                                                            >
                                                                {t(
                                                                    'actions.delete',
                                                                )}
                                                            </IconText>
                                                        )}
                                                    </Dropdown.Item>
                                                </Dropdown>
                                                <div className="w-full flex items-center">
                                                    <div
                                                        className="font-light italic text-xs w-full"
                                                        data-tn="bank-account-name"
                                                    >
                                                        {a.accountName ||
                                                            t(
                                                                'pages.bankAccounts.defaultLabel',
                                                            )}
                                                    </div>
                                                </div>
                                                <div className="flex grid grid-cols-2">
                                                    <div className="my-1">
                                                        <span className="font-bold">
                                                            <CopyButton
                                                                data-tn="bank-account-number"
                                                                text={
                                                                    a.accountNumber
                                                                }
                                                            />
                                                        </span>
                                                    </div>
                                                    <div
                                                        className="my-1 text-right"
                                                        data-tn="bank-account-balance"
                                                    >
                                                        {currencyFormat(
                                                            a.accountBalance,
                                                            a.accountCurrency
                                                                .code,
                                                            i18n.language,
                                                            userState.country
                                                                ?.code,
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </>
                                )}
                            </Card>
                        </Loading>
                    )
                })}
            </Card>
            <ModalForm
                isOpen={isAccountFormOpen}
                entity={{
                    ...selectedBankAccount,
                    accountCurrency: selectedBankAccount?.accountCurrency.id,
                }}
                title={`${selectedBank?.name} - ${
                    selectedBankAccount
                        ? t('pages.bankAccounts.form.editTitle')
                        : t('pages.bankAccounts.form.newTitle')
                }`}
                validationSchema={validationSchema}
                fields={(
                    errors: FormikErrors<any>,
                    touched: FormikTouched<any>,
                ) => (
                    <>
                        <FormItem
                            label={t(`fields.label`) || ''}
                            invalid={
                                !!errors.accountName || !!touched.accountName
                            }
                            errorMessage={errors.accountName?.toString()}
                        >
                            <Field
                                type="text"
                                autoComplete="off"
                                name="accountName"
                                placeholder={t(`fields.label`)}
                                component={Input}
                            />
                        </FormItem>
                        <FormItem
                            asterisk
                            label={
                                t(`pages.bankAccounts.fields.accountNumber`) ||
                                ''
                            }
                            invalid={
                                !!errors.accountNumber ||
                                !!touched.accountNumber
                            }
                            errorMessage={errors.accountNumber?.toString()}
                        >
                            <Field
                                type="text"
                                autoComplete="off"
                                name="accountNumber"
                                placeholder={t(
                                    `pages.bankAccounts.fields.accountNumber`,
                                )}
                                component={Input}
                            />
                        </FormItem>
                        <FormItem
                            asterisk
                            label={
                                t(`pages.bankAccounts.fields.accountBalance`) ||
                                ''
                            }
                            invalid={
                                !!errors.accountBalance ||
                                !!touched.accountBalance
                            }
                            errorMessage={errors.accountBalance?.toString()}
                        >
                            <Field
                                type="number"
                                autoComplete="off"
                                name="accountBalance"
                                placeholder={t(
                                    `pages.bankAccounts.fields.accountBalance`,
                                )}
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
                                !!errors.accountCurrency ||
                                !!touched.accountCurrency
                            }
                            errorMessage={errors.accountCurrency?.toString()}
                        >
                            {!selectedBankAccount ? (
                                <Field
                                    type="text"
                                    autoComplete="off"
                                    name="accountCurrency"
                                    placeholder={t('fields.currency')}
                                    options={userCurrencies?.map((c) => ({
                                        value: c.id,
                                        label: `${c.code} - ${t(
                                            `currencies.${c.code}`,
                                        )}`,
                                    }))}
                                    isLoading={!userCurrencies}
                                    className="currency-select"
                                    id="currency-select"
                                    component={SelectFieldItem}
                                />
                            ) : (
                                <Field
                                    disabled
                                    type="text"
                                    autoComplete="off"
                                    name="accountCurrencyName"
                                    value={t(
                                        `currencies.${selectedBankAccount.accountCurrency.code}`,
                                    )}
                                    component={Input}
                                />
                            )}
                        </FormItem>
                    </>
                )}
                isSaving={
                    updateBankAccountMutation.isPending ||
                    createBankAccountMutation.isPending
                }
                onClose={onAccountFormClose}
                onSubmit={onAccountFormSubmit}
            />
            <ConfirmDialog
                isOpen={isAccountConfirmDeleteOpen}
                type="danger"
                title={t('pages.bankAccounts.deleteConfirmation.title')}
                data-tn="confirm-delete-bank-account-dialog"
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                onClose={onAccountDeleteConfirmClose}
                onRequestClose={onAccountDeleteConfirmClose}
                onCancel={onAccountDeleteConfirmClose}
                onConfirm={onAccountDelete}
            >
                <p>
                    {t('pages.bankAccounts.deleteConfirmation.description', {
                        accountNumber: selectedBankAccount?.accountNumber,
                    })}
                </p>
            </ConfirmDialog>
            <ModalForm
                isOpen={isFormOpen}
                entity={
                    selectedBank || {
                        name: '',
                    }
                }
                title={
                    selectedBank
                        ? t('pages.banks.form.editTitle')
                        : t('pages.banks.form.newTitle')
                }
                validationSchema={Yup.object().shape({
                    name: Yup.string().required(
                        t('validations.required') || '',
                    ),
                })}
                fields={(
                    errors: FormikErrors<any>,
                    touched: FormikTouched<any>,
                ) => (
                    <>
                        <FormItem
                            label={t('fields.name') || 'Name'}
                            invalid={(errors.name && touched.name) as boolean}
                            errorMessage={errors.name?.toString()}
                        >
                            <Field
                                type="text"
                                autoComplete="off"
                                name="name"
                                placeholder={t('fields.name')}
                                component={Input}
                            />
                        </FormItem>
                    </>
                )}
                isSaving={
                    createBankMutation.isPending || updateBankMutation.isPending
                }
                onClose={onBankFormClose}
                onSubmit={(values: any) => {
                    if (!selectedBank?.id) {
                        createBankMutation.mutate(values)
                    } else {
                        updateBankMutation.mutate({
                            ...selectedBank,
                            ...values,
                        })
                    }
                }}
            />
            <ConfirmDialog
                isOpen={isDeleteOpen}
                type="danger"
                title={t('pages.banks.deleteConfirmation.title')}
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                data-tn="confirm-delete-dialog"
                onClose={onBankDeleteConfirmClose}
                onRequestClose={onBankDeleteConfirmClose}
                onCancel={onBankDeleteConfirmClose}
                onConfirm={() =>
                    selectedBank && deleteBankMutation.mutate(selectedBank.id)
                }
            >
                <p>
                    {t('pages.banks.deleteConfirmation.description', {
                        name: selectedBank?.name,
                    })}
                </p>
            </ConfirmDialog>
        </Container>
    )
}

export default BankAccounts
