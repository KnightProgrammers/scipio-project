import Steps from '@/components/ui/Steps'
import { useState } from 'react'
import { Button, Card, Checkbox, Select, Spinner } from '@/components/ui'
import {
    Container,
    CustomControl,
    CustomSelectOption,
    Loading,
} from '@/components/shared'
import { useTranslation } from 'react-i18next'
import { apiGetCountryList } from '@/services/CountryServices'
import { langOptions, LanguageOption } from '@/@types/system'
import { AiOutlineStar } from 'react-icons/ai'
import { BiWorld } from 'react-icons/bi'
import { HiOutlineLanguage } from 'react-icons/hi2'
import { MdOutlineRocketLaunch } from 'react-icons/md'
import {
    apiSetUserCurrencies,
    apiUpdateUserProfile,
} from '@/services/AccountServices'
import { setUser, useAppDispatch, useAppSelector } from '@/store'
import i18n from 'i18next'
import { LuCoins } from 'react-icons/lu'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiGetCurrencies } from '@/services/CurrencyServices'

const STEPS = {
    START: 0,
    LANG: 1,
    COUNTRY: 2,
    CURRENCY: 3,
    SAVING: 4,
}

const WelcomeWizard = () => {
    const [step, setStep] = useState(0)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [selectedCountry, setSelectedCountry] = useState<any>({})
    const [newUserData, setNewUserData] = useState<any>(null)
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])

    const user = useAppSelector((state) => state.auth.user)

    const { t } = useTranslation()
    const dispatch = useAppDispatch()

    // Queries
    const { data: currencies, isFetching: isFetchingCurrencies } = useQuery({
        queryKey: ['user-currencies'],
        queryFn: apiGetCurrencies,
    })
    const { data: countries, isFetching: isFetchingCountries } = useQuery({
        queryKey: ['countries'],
        queryFn: apiGetCountryList,
    })

    const updateUserProfileMutation = useMutation({
        mutationFn: apiUpdateUserProfile,
        onSuccess: (userData) => {
            setIsSaving(false)
            setNewUserData(userData)
        },
    })

    const updateUserCurrenciesMutation = useMutation({
        mutationFn: apiSetUserCurrencies,
        onSuccess: () => {
            setIsSaving(false)
            dispatch(setUser(newUserData))
        },
    })

    const onChange = (nextStep: number) => {
        if (nextStep < 0) {
            setStep(0)
        } else if (nextStep > STEPS.SAVING) {
            setStep(STEPS.SAVING)
        } else {
            setStep(nextStep)
        }
    }

    const onNext = async () => {
        if (step === STEPS.COUNTRY && selectedCountry) {
            setIsSaving(true)
            updateUserProfileMutation.mutate({
                name: user.name || '',
                countryName: selectedCountry.value,
                lang: i18n.language,
            })
        }
        if (step === STEPS.CURRENCY && selectedCurrencies.length) {
            setIsSaving(true)
            updateUserCurrenciesMutation.mutate(selectedCurrencies)
        }
        onChange(step + 1)
    }

    return (
        <Container
            className="flex flex-auto flex-col h-[100vh] justify-center items-center"
            data-tn="welcome-wizard-page"
        >
            <Card className="p-4 min-w-[280px]">
                <Steps current={step} className="w-full">
                    <Steps.Item customIcon={<AiOutlineStar />} />
                    <Steps.Item customIcon={<HiOutlineLanguage />} />
                    <Steps.Item customIcon={<BiWorld />} />
                    <Steps.Item customIcon={<LuCoins />} />
                    <Steps.Item
                        customIcon={
                            step === STEPS.SAVING ? (
                                <Spinner />
                            ) : (
                                <MdOutlineRocketLaunch />
                            )
                        }
                    />
                </Steps>
                <div className="mt-6 h-80 rounded flex items-center justify-center">
                    {step === STEPS.START && (
                        <div className="text-center">
                            <h1>{t('pages.welcome.headers.start')}</h1>
                            <img
                                src="/img/others/welcome.png"
                                alt="welcome"
                                data-tn="welcome-img"
                            />
                        </div>
                    )}
                    {step === STEPS.LANG && (
                        <div>
                            <h2 className="mb-4 text-center">
                                {t('pages.welcome.headers.lang')}
                            </h2>
                            <Select<LanguageOption>
                                options={langOptions}
                                id="lang-select"
                                components={{
                                    Option: CustomSelectOption,
                                    Control: CustomControl,
                                }}
                                value={langOptions.filter(
                                    (option) => option.value === i18n.language,
                                )}
                                onChange={(option) =>
                                    !!option &&
                                    i18n.changeLanguage(option.value)
                                }
                            />
                        </div>
                    )}
                    {step === STEPS.COUNTRY && (
                        <div>
                            <h2 className="mb-4 text-center">
                                {t('pages.welcome.headers.country')}
                            </h2>
                            <Select
                                placeholder={t('placeholders.country')}
                                id="country-select"
                                isDisabled={isFetchingCountries}
                                isLoading={isFetchingCountries}
                                defaultInputValue=""
                                options={countries.map(
                                    (c: { name: string }) => ({
                                        label: c.name,
                                        value: c.name,
                                    }),
                                )}
                                onChange={setSelectedCountry}
                            />
                        </div>
                    )}
                    {step === STEPS.CURRENCY &&
                        (!isFetchingCurrencies ? (
                            <Checkbox.Group
                                vertical
                                name="currencies"
                                data-tn="currency-ckb"
                                value={selectedCurrencies}
                                className="max-h-[550px] w-full overflow-y-auto"
                                onChange={(value: any) =>
                                    setSelectedCurrencies(value)
                                }
                            >
                                {currencies?.map((c) => (
                                    <Checkbox
                                        key={c.id}
                                        value={c.id}
                                        data-tn={c.code}
                                    >
                                        {c.code} ({t(`currencies.${c.code}`)})
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        ) : (
                            <Loading loading />
                        ))}
                    {step === STEPS.SAVING && isSaving && (
                        <div>
                            <Loading loading />
                            <p>{t('actions.saving')}</p>
                        </div>
                    )}
                </div>
                <div className="mt-4 text-center">
                    {(step != STEPS.COUNTRY || !!selectedCountry.value) &&
                        (step != STEPS.CURRENCY ||
                            !!selectedCurrencies.length) &&
                        step != STEPS.SAVING && (
                            <Button
                                disabled={
                                    step === STEPS.SAVING ||
                                    (step === STEPS.COUNTRY && !selectedCountry)
                                }
                                variant="solid"
                                className="w-full"
                                data-tn="next-btn"
                                onClick={onNext}
                            >
                                {t('actions.next')}
                            </Button>
                        )}
                </div>
            </Card>
        </Container>
    )
}

export default WelcomeWizard
