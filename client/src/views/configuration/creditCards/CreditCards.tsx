type CreditCardType = {
    bank: string
    cardHolder: string
    lastFourDigits: string
    issuer: 'mastercard' | 'visa'
}

const DATA: CreditCardType[] = [
    {
        bank: 'BBVA',
        cardHolder: 'Javier Caballero',
        lastFourDigits: '1234',
        issuer: 'visa',
    },
]

const CreditCards = () => {
    return (
        <div>
            {DATA.map((c, index) => (
                <p key={index}>
                    {c.bank} - {c.lastFourDigits}
                </p>
            ))}
        </div>
    )
}

export default CreditCards
