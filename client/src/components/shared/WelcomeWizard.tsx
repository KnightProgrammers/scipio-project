import Steps from '@/components/ui/Steps'
import { useCallback, useEffect, useState } from 'react'
import { Button, Card, Checkbox, Select, Spinner } from '@/components/ui'
import {
    Container,
    CustomControl,
    CustomSelectOption,
    Loading,
} from '@/components/shared'
import { useTranslation } from 'react-i18next'
import { apiGetCountryList } from '@/services/CountryServices'
import { CountryDataType, langOptions, LanguageOption } from '@/@types/system'
import { AiOutlineStar } from 'react-icons/ai'
import { BiWorld } from 'react-icons/bi'
import { HiOutlineLanguage } from 'react-icons/hi2'
import { MdOutlineRocketLaunch } from 'react-icons/md'
import { apiPathUserProfile } from '@/services/AccountServices'
import { setUser, useAppDispatch } from '@/store'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import i18n from 'i18next'
import { LuCoins } from 'react-icons/lu'
import { useQuery, useQueryClient } from '@tanstack/react-query'
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
    const [loadingCountries, setLoadingCountries] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState<object>({})
    const [countries, setCountries] = useState<CountryDataType[]>([])
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])

    const { t } = useTranslation()
    const dispatch = useAppDispatch()

    // Queries
    const { data: currencies, isFetching: isFetchingCurrencies } = useQuery({
        queryKey: ['user-currencies'],
        queryFn: apiGetCurrencies,
    })

    const errorHandler = useCallback(
        (e: object) => {
            toast.push(
                <Notification title={t('error.generic') || ''} type="danger" />,
                {
                    placement: 'top-center',
                },
            )
            console.error(e)
        },
        [t],
    )

    useEffect(() => {
        if (!countries.length && !loadingCountries) {
            setLoadingCountries(true)
            apiGetCountryList()
                .then(({ data }) => {
                    setCountries(data)
                    setLoadingCountries(false)
                })
                .catch(errorHandler)
        }
    }, [countries.length, loadingCountries, errorHandler])

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
        if (
            step === STEPS.CURRENCY &&
            selectedCountry &&
            selectedCurrencies.length
        ) {
            setIsSaving(true)
            try {
                const user = await apiPathUserProfile(
                    selectedCountry.value,
                    i18n.language,
                    selectedCurrencies,
                )
                dispatch(setUser(user))
            } catch (e) {
                errorHandler(e)
            }
        }
        onChange(step + 1)
    }

    return (
        <Container className="flex flex-auto flex-col h-[100vh] justify-center items-center">
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
                            <img src="/img/others/welcome.png" alt="welcome" />
                        </div>
                    )}
                    {step === STEPS.LANG && (
                        <div>
                            <h2 className="mb-4 text-center">
                                {t('pages.welcome.headers.lang')}
                            </h2>
                            <Select<LanguageOption>
                                options={langOptions}
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
                                isDisabled={loadingCountries}
                                isLoading={loadingCountries}
                                defaultInputValue=""
                                options={countries.map(({ name }) => ({
                                    label: name,
                                    value: name,
                                }))}
                                onChange={setSelectedCountry}
                            />
                        </div>
                    )}
                    {step === STEPS.CURRENCY &&
                        (!isFetchingCurrencies ? (
                            <div>
                                <Checkbox.Group
                                    vertical
                                    name="currencies"
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
                                            {c.code} (
                                            {t(`currencies.${c.code}`)})
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            </div>
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
                        (step != STEPS.CURRENCY || !!selectedCurrencies.length) &&
                        step != STEPS.SAVING && (
                            <Button
                                disabled={
                                    step === STEPS.SAVING ||
                                    (step === STEPS.COUNTRY && !selectedCountry)
                                }
                                variant="solid"
                                className="w-full"
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
