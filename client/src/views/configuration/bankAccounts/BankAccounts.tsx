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
    HiOutlineExternalLink,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { useConfig } from '@/components/ui/ConfigProvider'
import { Field, FormikErrors, FormikTouched } from 'formik'
import { apiGetUserCurrencies } from '@/services/AccountService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { SelectFieldItem } from '@/components/ui/Form'
import * as Yup from 'yup'
import { useAppSelector } from '@/store'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MdOutlineAttachMoney } from 'react-icons/md'

const BankAccounts = () => {
    const [selectedBankAccount, setSelectedBankAccount] = useState<
        BankAccountDataType | undefined
    >(undefined)
    const [selectedBank, setSelectedBank] = useState<BankDataType | undefined>(
        undefined,
    )
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)

    const userState = useAppSelector((state) => state.auth.user)

    const { data: userCurrencies, isFetching: isFetchingUserCurrencies } =
        useQuery({
            queryKey: ['user-currencies'],
            queryFn: apiGetUserCurrencies,
            suspense: true,
        })

    const {
        data: bankAccountList,
        isFetching: isFetchingBankAccounts,
        refetch: refetchBankAcounts,
    } = useQuery({
        queryKey: ['user-bank-accounts'],
        queryFn: apiGetBankAccountList,
        suspense: true,
    })

    const onMutationSuccess = async (title: string) => {
        refetchBankAcounts()
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
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

    const { t, i18n } = useTranslation()
    const { themeColor } = useConfig()
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const validationSchema = Yup.object().shape({
        accountNumber: Yup.string().required(t('validations.required') || ''),
        accountBalance: Yup.string().required(t('validations.required') || ''),
        accountCurrency: Yup.string().required(t('validations.required') || ''),
    })

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedBank(undefined)
        setSelectedBankAccount(undefined)
        setIsSaving(false)
    }

    const onFormSubmit = async (data: any) => {
        setIsSaving(true)
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
        onFormClose()
    }

    const onDeleteConfirmClose = () => {
        setIsConfirmDeleteOpen(false)
        setSelectedBank(undefined)
        setSelectedBankAccount(undefined)
    }

    const onDelete = async () => {
        if (selectedBankAccount) {
            deleteBankAccountMutation.mutate(selectedBankAccount.id)
        }
        onDeleteConfirmClose()
    }

    if (
        !bankAccountList ||
        isFetchingUserCurrencies ||
        isFetchingBankAccounts
    ) {
        return <Loading loading={true} type="cover" className="w-full h-80" />
    }

    if (bankAccountList.length === 0) {
        return (
            <EmptyState
                className="mt-4 bg-transparent"
                title={t('pages.bankAccounts.emptyState.noBanks.title') || ''}
                description={
                    t('pages.bankAccounts.emptyState.noBanks.description') || ''
                }
                data-tn="empty-state-no-banks"
            >
                <Button
                    variant="plain"
                    className={`mt-4 ${textTheme}`}
                    icon={<HiOutlineExternalLink />}
                    onClick={() => navigate('/account/settings/banks')}
                >
                    {t('pages.bankAccounts.goToBanksSection')}
                </Button>
            </EmptyState>
        )
    }

    return (
        <Container
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            data-tn="bank-accounts-page"
        >
            {bankAccountList.map((bank: any) => {
                return (
                    <Card
                        key={bank.name}
                        data-tn={`bank-${bank.id}-card`}
                        header={
                            <div
                                className="flex inline-flex items-center w-full"
                                style={{ overflow: 'hidden' }}
                            >
                                <Avatar
                                    src={bank.icon && bank.icon}
                                    icon={!bank.icon && <HiLibrary />}
                                    className={`mr-2 ${textTheme} dark:${textTheme}`}
                                    size={32}
                                />
                                <span
                                    className={`font-bold text-lg ${textTheme} dark:${textTheme}`}
                                >
                                    {bank.name}
                                </span>
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
                                    setIsFormOpen(true)
                                }}
                            >
                                {t('pages.bankAccounts.addAccountButton')}
                            </Button>
                        }
                    >
                        {bank.bankAccounts.length === 0 ? (
                            <EmptyState
                                description={t(
                                    'pages.bankAccounts.emptyState.noAccounts.description',
                                )}
                                iconSize={0}
                            />
                        ) : (
                            <>
                                {bank.bankAccounts.map(
                                    (a: BankAccountDataType) => (
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
                                                        setSelectedBank(bank)
                                                        setSelectedBankAccount(
                                                            a,
                                                        )
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
                                                    data-tn="delete-bank-account-btn"
                                                    onClick={() => {
                                                        setSelectedBank(bank)
                                                        setSelectedBankAccount(
                                                            a,
                                                        )
                                                        setIsConfirmDeleteOpen(
                                                            true,
                                                        )
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
                                                        a.accountCurrency.code,
                                                        i18n.language,
                                                        userState.country?.code,
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ),
                                )}
                            </>
                        )}
                    </Card>
                )
            })}
            <ModalForm
                isOpen={isFormOpen}
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
                isSaving={isSaving}
                onClose={onFormClose}
                onSubmit={onFormSubmit}
            />
            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                type="danger"
                title={t('pages.bankAccounts.deleteConfirmation.title')}
                data-tn="confirm-delete-bank-account-dialog"
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                onClose={onDeleteConfirmClose}
                onRequestClose={onDeleteConfirmClose}
                onCancel={onDeleteConfirmClose}
                onConfirm={onDelete}
            >
                <p>
                    {t('pages.bankAccounts.deleteConfirmation.description', {
                        accountNumber: selectedBankAccount?.accountNumber,
                    })}
                </p>
            </ConfirmDialog>
        </Container>
    )
}

export default BankAccounts
