import { Container, IconText, Loading } from '@/components/shared'
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
import { useEffect, useState } from 'react'
import {
    BankAccountDataType,
    BankDataType,
    CurrencyDataType,
} from '@/@types/system'
import {
    apiGetBankAccountList,
    apiCreateBankAccount,
} from '@/services/BankAccountServices'
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
import { apiGetUserCurrencies } from '@/services/AccountServices'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { SelectFieldItem } from '@/components/ui/Form'
import * as Yup from 'yup'
import { useAppSelector } from '@/store'

export type ListItemData = {
    id: string
    accountName: string
    accountNumber: string
    accountBalance: number
    accountCurrency: {
        name: string
        code: string
        symbol: string
    }
}

type ListItemProps = {
    data: ListItemData
    cardBorder?: boolean
}

const ListItem = ({ data, cardBorder = false }: ListItemProps) => {
    const { accountNumber, accountBalance, accountCurrency } = data

    return (
        <Card bordered={cardBorder} className="my-2">
            <div className="flex grid grid-cols-2">
                <div className="my-1">
                    <span className="font-bold"> {accountNumber} </span>
                </div>
                <div className="my-1 text-right">
                    {currencyFormat(accountBalance, accountCurrency.code)}
                </div>
            </div>
        </Card>
    )
}

const BankAccounts = () => {
    const [selectedBankAccount, setSelectedBankAccount] = useState<
        BankAccountDataType | undefined
    >(undefined)
    const [selectedBank, setSelectedBank] = useState<BankDataType | undefined>(
        undefined,
    )
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [isLoadingBankAccounts, setIsLoadingBankAccounts] =
        useState<boolean>(false)
    const [bankAccountList, setBankAccountList] = useState<any[] | undefined>(
        undefined,
    )
    const [userCurrencies, setUserCurrencies] = useState<
        CurrencyDataType[] | undefined
    >(undefined)

    const userState = useAppSelector((state) => state.auth.user)

    const { t, i18n } = useTranslation()
    const { themeColor } = useConfig()
    const { textTheme, bgTheme } = useThemeClass()
    const navigate = useNavigate()

    const validationSchema = Yup.object().shape({
        accountNumber: Yup.string().required(t('validations.required') || ''),
        accountBalance: Yup.string().required(t('validations.required') || ''),
        accountCurrency: Yup.string().required(t('validations.required') || ''),
    })

    const errorHandler = (e: unknown) => {
        toast.push(
            <Notification title={t('error.generic') || ''} type="danger" />,
            {
                placement: 'top-center',
            },
        )
        console.error(e)
    }

    const loadBankAccounts = () => {
        setIsLoadingBankAccounts(true)
        apiGetBankAccountList()
            .then((data) => {
                setIsLoadingBankAccounts(false)
                setBankAccountList(data)
            })
            .catch(() => {
                setIsLoadingBankAccounts(false)
            })
    }

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedBank(undefined)
        setSelectedBankAccount(undefined)
        setIsSaving(false)
    }

    const onFormSubmit = async (data: any) => {
        setIsSaving(true)
        console.log(data)
        const currency = userCurrencies?.find(
            (c) => c.id === data.accountCurrency,
        )
        if (!!selectedBank && !!currency) {
            try {
                if (!data.id) {
                    await apiCreateBankAccount({
                        accountName: data.accountName,
                        accountNumber: data.accountNumber,
                        accountBalance: data.accountBalance,
                        accountBankId: selectedBank.id,
                        accountCurrency: currency,
                    })
                } else {
                    console.log(data)
                }
                loadBankAccounts()
            } catch (e: unknown) {
                errorHandler(e)
            }
        }
        onFormClose()
    }

    useEffect(() => {
        if (userCurrencies === undefined) {
            apiGetUserCurrencies()
                .then((data) => {
                    setUserCurrencies(data)
                })
                .catch(errorHandler)
        }
    }, [setUserCurrencies])

    useEffect(() => {
        if (bankAccountList === undefined && !isLoadingBankAccounts) {
            loadBankAccounts()
        }
    }, [bankAccountList])

    if (bankAccountList === undefined) {
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
        <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccountList.map((bank) => {
                return (
                    <Card
                        key={bank.name}
                        headerBorder={false}
                        headerClass={`${bgTheme} rounded-lg rounded-br-none rounded-bl-none`}
                        header={
                            <div
                                className="flex inline-flex items-center w-full"
                                style={{ overflow: 'hidden' }}
                            >
                                <Avatar
                                    src={bank.icon && bank.icon}
                                    icon={!bank.icon && <HiLibrary />}
                                    className={`mr-2 ${bgTheme} dark:${bgTheme} text-white`}
                                    size={32}
                                />
                                <span className="font-bold text-lg text-white">
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
                        {bank.accounts.length === 0 ? (
                            <EmptyState
                                description={t(
                                    'pages.bankAccounts.emptyState.noAccounts.description',
                                )}
                                iconSize={0}
                            />
                        ) : (
                            <>
                                {bank.accounts.map((a: BankAccountDataType) => (
                                    <Dropdown
                                        placement="bottom-center"
                                        style={{ width: '100%' }}
                                        renderTitle={
                                            <Card
                                                key={a.id}
                                                bordered
                                                className="my-2 w-full cursor-pointer"
                                            >
                                                <div className="w-full flex items-center">
                                                    <div className="font-light italic text-xs w-full">
                                                        {a.accountName}
                                                    </div>
                                                </div>
                                                <div className="flex grid grid-cols-2">
                                                    <div className="my-1">
                                                        <span className="font-bold">
                                                            {a.accountNumber}
                                                        </span>
                                                    </div>
                                                    <div className="my-1 text-right">
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
                                        }
                                    >
                                        <Dropdown.Item
                                            eventKey="edit"
                                            onClick={() => {
                                                setSelectedBank(bank)
                                                setSelectedBankAccount(a)
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
                                        <Dropdown.Item eventKey="delete">
                                            <IconText
                                                className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                                icon={<HiOutlineTrash />}
                                            >
                                                {t('actions.delete')}
                                            </IconText>
                                        </Dropdown.Item>
                                    </Dropdown>
                                ))}
                            </>
                        )}
                    </Card>
                )
            })}
            <ModalForm
                isOpen={isFormOpen}
                entity={{
                    ...selectedBankAccount,
                    accountCurrency: selectedBankAccount?.accountCurrency?.id,
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
                            label={t(`fields.name`) || ''}
                            invalid={
                                !!errors.accountName || !!touched.accountName
                            }
                            errorMessage={errors.accountName?.toString()}
                        >
                            <Field
                                type="text"
                                autoComplete="off"
                                name="accountName"
                                placeholder={t(`fields.name`)}
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
                            <Field
                                value
                                type="text"
                                autoComplete="off"
                                name="accountCurrency"
                                placeholder={t('fields.currency')}
                                options={userCurrencies?.map((c) => ({
                                    value: c.id,
                                    label: t(`currencies.${c.code}`),
                                }))}
                                isLoading={!userCurrencies}
                                component={SelectFieldItem}
                            />
                        </FormItem>
                    </>
                )}
                isSaving={isSaving}
                onClose={onFormClose}
                onSubmit={onFormSubmit}
            />
        </Container>
    )
}

export default BankAccounts
