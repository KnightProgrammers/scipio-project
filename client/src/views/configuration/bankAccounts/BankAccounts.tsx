import { Container, Loading } from '@/components/shared'
import { Avatar, Button, Card } from "@/components/ui";
import currencyFormat from '@/utils/currencyFormat'
import { useEffect, useState } from 'react'
import { BankAccountDataType } from '@/@types/system'
import { apiGetBankAccountList } from '@/services/BankAccountServices'
import EmptyState from '@/components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import useThemeClass from "@/utils/hooks/useThemeClass";
import { HiLibrary, HiOutlineExternalLink, HiPlus } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

const DATA = [
    {
        icon: '/img/banks/BBVA.png',
        name: 'BBVA',
        accounts: [
            {
                id: '1',
                currency: {
                    name: 'Peso UY',
                    code: 'UYU',
                    symbol: '$',
                },
                number: '23973358',
                balance: 123415,
            },
            {
                id: '2',
                currency: {
                    name: 'Dollar US',
                    symbol: 'u$s',
                    code: 'USD',
                },
                number: '23973359',
                balance: 1251,
            },
        ],
    },
    {
        icon: '/img/banks/Itau.png',
        name: 'Itau',
        accounts: [
            {
                id: '3',
                currency: {
                    name: 'Peso UY',
                    code: 'UYU',
                    symbol: '$',
                },
                number: '23973358',
                balance: 123415,
            },
            {
                id: '4',
                currency: {
                    name: 'Dollar US',
                    code: 'USD',
                    symbol: 'u$s',
                },
                number: '23973359',
                balance: 1251,
            },
        ],
    },
    {
        icon: '/img/banks/OCA.png',
        name: 'OCA',
        accounts: [
            {
                id: '5',
                currency: {
                    name: 'Peso UY',
                    code: 'UYU',
                    symbol: '$',
                },
                number: '23973358',
                balance: 123415,
            },
            {
                id: '6',
                currency: {
                    name: 'Dollar US',
                    code: 'USD',
                    symbol: 'u$s',
                },
                number: '23973359',
                balance: 1251,
            },
        ],
    },
]

export type ListItemData = {
    id: string
    number: string
    balance: number
    currency: {
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
    const { number, balance, currency } = data

    return (
        <Card bordered={cardBorder} className="my-2">
            <div className="flex grid grid-cols-2">
                <div className="my-1">
                    <span className="font-bold"> {number} </span>
                </div>
                <div className="my-1 text-right">
                    {currencyFormat(balance, currency.code)}
                </div>
            </div>
        </Card>
    )
}

const BankAccounts = () => {
    const [selectedBankAccount, setSelectedBankAccount] = useState<
        BankAccountDataType | undefined
    >(undefined)
    const [isLoadingBankAccounts, setIsLoadingBankAccounts] =
        useState<boolean>(false)
    const [bankAccountList, setBankAccountList] = useState<any[] | undefined>(
        undefined,
    )

    const { t } = useTranslation()
    const {textTheme, bgTheme} = useThemeClass()
    const navigate = useNavigate();

    const loadBanks = () => {
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

    useEffect(() => {
        if (bankAccountList === undefined) {
            loadBanks()
        }
    }, [bankAccountList])

    if (bankAccountList === undefined) {
        return <Loading loading={true} type="cover" className="w-full h-80" />
    }

    if (bankAccountList.length === 0) {
        return (
            <EmptyState
                className="mt-4 bg-transparent"
                title={t('pages.bankAccounts.emptyState.title')}
                description={t('pages.bankAccounts.emptyState.description')}
            >
                <Button
                    variant="plain"
                    className={`mt-4 ${textTheme}`}
                    icon={<HiOutlineExternalLink/>}
                    onClick={() => navigate( '/account/settings/banks')}
                >
                    Go to the Banks section
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
                        headerClass={bgTheme}
                        style={{ overflow: 'hidden' }}
                        header={
                            <div className="flex inline-flex items-center w-full">
                                <Avatar
                                    src={bank.icon && bank.icon}
                                    icon={!bank.icon && <HiLibrary />}
                                    className={`mr-2 ${bgTheme} text-white`}
                                    size={32}
                                />
                                <span className="font-bold text-lg text-white">
                                    {bank.name}
                                </span>
                            </div>
                        }
                        className=""
                    >
                        {
                            bank.accounts.length === 0 ?
                                <EmptyState description="Please add an account" iconSize={0}/>
                                :
                                <>{bank.accounts.map((account, index) => (
                                    <ListItem key={index} cardBorder data={account} />
                                ))}</>
                        }

                        <Button
                            variant="default"
                            block={true}
                            icon={<HiPlus />}
                            className="mt-4"
                        >Add an Account</Button>
                    </Card>
                )
            })}
        </Container>
    )
}

export default BankAccounts
