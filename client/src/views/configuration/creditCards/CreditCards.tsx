import { Alert, Avatar, Button, Card, Dropdown, Progress } from "@/components/ui";
import { BsCreditCard2Front } from 'react-icons/bs'
import { EllipsisButton, IconText } from "@/components/shared";
import { HiOutlinePencilAlt, HiOutlineTrash } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import { HiEye, HiFire } from "react-icons/hi2";

type CreditCardType = {
    id: string
    provider: string
    type: string
    cardHolder: string
    lastFourDigits: string
    expiration: string
    issuer: 'mastercard' | 'visa' | 'other'
}

const DATA: CreditCardType[] = [
    {
        id: '1',
        provider: 'BBVA',
        type: 'Platinum',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '1234',
        expiration: '12/2024',
        issuer: 'mastercard',
    },
    {
        id: '1',
        provider: 'ITAU',
        type: 'Gold',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '6523',
        expiration: '12/2025',
        issuer: 'visa',
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
    return (
        <div>
            {DATA.map((c, index) => (
                <Card
                    className="my-4"
                    header={
                        <div className="grid grid-flow-col auto-cols-max gap-4 items-center relative">
                            <CardIcon cardIssuer={c.issuer} />
                            <span className="pl-2 text-xl inline-flex">
                                 <span className="hidden md:block mr-1">{c.issuer.toLocaleUpperCase()} -</span>****{' '}
                                {c.lastFourDigits}
                            </span>
                            <Dropdown
                                className="absolute right-2 top-1"
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
                <div className="grid md:grid-cols-2 md:divide-x">
                    <div className="px-2">
                        <div className="block mb-2">
                            <p className="text-gray-500 font-light">Limite de crédito:</p>
                            <span className="text-4xl font-bold"><small>$</small> 78.000</span>
                        </div>
                        <Alert showIcon className="mb-4" type="info" customIcon={<HiFire />}>
                            Usaste el 40% de tu límite
                        </Alert>
                        <Progress percent={40} size="md"/>
                    </div>
                    <div className="px-2">
                        <Button variant="twoTone" size="sm" block className="w-full md:w-auto" icon={<HiEye/>}>Ver Movimientos</Button>
                    </div>
                </div>
                </Card>
            ))}
        </div>
    )
}

export default CreditCards
