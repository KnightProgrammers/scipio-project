import SignUpForm from './SignUpForm'
import { useTranslation } from 'react-i18next'

const SignUp = () => {
    const { t } = useTranslation()

    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">{t('auth.signUp.title')}</h3>
                <p>{t('auth.signUp.subtitle')}</p>
            </div>
            <SignUpForm />
        </>
    )
}

export default SignUp
