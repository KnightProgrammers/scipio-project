import {
    Alert,
    Avatar, Badge,
    Button,
    Card,
    Dropdown,
    Progress
} from "@/components/ui";
import { BsCreditCard2Front } from 'react-icons/bs'
import { EllipsisButton, IconText } from '@/components/shared'
import { HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'
import { HiEye, HiFire } from 'react-icons/hi2'
import currencyFormat from '@/utils/currencyFormat'

type CreditCardType = {
    id: string
    label: string
    cardHolder: string
    lastFourDigits: string
    expiration: string
    billingCycle: string
    creditLimit: {
        amount: number,
        currencyCode: string
    }
    issuer: 'mastercard' | 'visa' | 'other'
    creditUsage?: {
        usageAmount: number
        usagePercentage: number
    }
}

const DATA: CreditCardType[] = [
    {
        id: '1',
        label: 'BBVA Platinum',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '1234',
        expiration: '12/2024',
        issuer: 'mastercard',
        billingCycle: '29/10',
        creditLimit: {
            amount: 210000,
            currencyCode: 'UYU'
        }
    },
    {
        id: '1',
        label: 'ITAU Gold',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '6523',
        expiration: '12/2025',
        issuer: 'visa',
        billingCycle: '10/10',
        creditLimit: {
            amount: 78000,
            currencyCode: 'UYU'
        }
    },
    {
        id: '3',
        label: 'OCA',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '1776',
        expiration: '08/2027',
        issuer: 'mastercard',
        billingCycle: '20/10',
        creditLimit: {
            amount: 16000,
            currencyCode: 'UYU'
        }
    },
]

const CardIcon = (props: { cardIssuer: string }) => {
    switch (props.cardIssuer) {
        case 'mastercard':
            return (
                <Avatar
                    className="bg-transparent dark:bg-transparent"
                    src="/img/card-issuer/mastercard.png"
                    size="md"
                />
            )
        case 'visa':
            return (
                <Avatar
                    className="bg-transparent dark:bg-transparent"
                    src="/img/card-issuer/visa.png"
                    size="md"
                />
            )
        default:
            return <Avatar icon={<BsCreditCard2Front />} size="lg" />
    }
}

const CreditCards = () => {
    const { t, i18n } = useTranslation()

    const progressColor = (actualUsage: number): string => {
        if(actualUsage < 50 ) {
            return 'green-500'
        }
        if(actualUsage < 75 ) {
            return 'yellow-500'
        }
        return 'red-500'
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {DATA.map((c, index) => (
                <Card
                    className="my-4"
                    header={
                        <div className="grid grid-flow-col auto-cols-max gap-4 items-center relative">
                            <CardIcon cardIssuer={c.issuer} />
                            <div className="grid ">
                                <span className="pl-2 text-xs font-light inline-flex">
                                    {c.label.toLocaleUpperCase()}
                                </span>
                                <span className="pl-2 text-lg inline-flex">
                                    **** {c.lastFourDigits}
                                </span>
                            </div>
                            <Dropdown
                                className="absolute right-0 top-0"
                                placement="middle-end-top"
                                renderTitle={
                                    <EllipsisButton data-tn="dropdown-bank-account-btn" />
                                }
                            >
                                <Dropdown.Item
                                    eventKey="edit"
                                    data-tn="edit-bank-account-btn"
                                    onClick={() => {}}
                                >
                                    <IconText
                                        className="text-sm font-semibold w-full"
                                        icon={<HiOutlinePencilAlt />}
                                    >
                                        {t('actions.edit')}
                                    </IconText>
                                </Dropdown.Item>
                                <Dropdown.Item
                                    eventKey="delete"
                                    data-tn="delete-bank-account-btn"
                                    onClick={() => {}}
                                >
                                    <IconText
                                        className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                        icon={<HiOutlineTrash />}
                                    >
                                        {t('actions.delete')}
                                    </IconText>
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                    }
                >
                    <div className="divide-y">
                        <div className="grid grid-cols-2 pb-4 items-center">
                            <div className="flex flex-col">
                                <small className="font-light">Cierre</small>
                                <span className="font-semibold">{c.billingCycle}</span>
                            </div>
                            <div className=" text-right">
                                <Badge content={'Active'} innerClass="bg-emerald-500" className="text-sm"/>
                            </div>
                        </div>
                        <div className="py-4">
                            <div className="block mb-2">
                                <p className="text-gray-500 font-light">
                                    Limite de crédito
                                </p>
                                <p className="text-4xl font-semibold text-center">
                                    {currencyFormat(c.creditLimit.amount, c.creditLimit.currencyCode)}
                                </p>
                            </div>
                            <p className="text-gray-500 font-light hidden">
                                Crédito Usado
                            </p>
                            <div className="hidden">
                                <Progress
                                    percent={c.creditUsage?.usagePercentage}
                                    size="md"
                                    color={progressColor(c.creditUsage?.usagePercentage || 0)}
                                />
                            </div>
                        </div>
                        <div className="py-4 hidden">
                            <Button
                                variant="twoTone"
                                size="sm"
                                block
                                icon={<HiEye />}
                            >
                                Ver Movimientos
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default CreditCards
