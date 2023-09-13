import SignInForm from './SignInForm'
import { useTranslation } from 'react-i18next'

const SignIn = () => {
    const { t } = useTranslation()
    return (
        <>
            <div className="mb-8">
                <h3 className="mb-1">{t('auth.signIn.title')}</h3>
                <p>{t('auth.signIn.subtitle')}</p>
            </div>
            <SignInForm />
        </>
    )
}

export default SignIn
