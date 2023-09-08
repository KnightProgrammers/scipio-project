import { Container } from '@/components/shared'
import { Avatar, Card } from '@/components/ui'
import currencyFormat from '@/utils/currencyFormat'
import { useConfig } from '@/components/ui/ConfigProvider'

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
    const { themeColor, primaryColorLevel } = useConfig()

    return (
        <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {DATA.map((bank) => {
                return (
                    <Card
                        key={bank.name}
                        headerBorder={false}
                        headerClass={`bg-${themeColor}-${primaryColorLevel}`}
                        style={{ overflow: 'hidden' }}
                        header={
                            <div className="flex inline-flex items-center">
                                <Avatar
                                    src={bank.icon}
                                    className="mr-2"
                                    size={32}
                                />
                                <span className="font-bold text-lg text-white">
                                    {bank.name}
                                </span>
                            </div>
                        }
                        className="m-2"
                    >
                        {bank.accounts.map((account, index) => (
                            <ListItem key={index} cardBorder data={account} />
                        ))}
                    </Card>
                )
            })}
        </Container>
    )
}

export default BankAccounts
