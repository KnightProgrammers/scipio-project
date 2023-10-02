import { Form, Formik } from 'formik'
import {
    Button,
    Checkbox,
    FormContainer,
    FormItem,
    Skeleton,
} from '@/components/ui'
import { Divider } from '@/components/shared'
import { useTranslation } from 'react-i18next'
import { useCallback, useEffect, useState } from 'react'
import { CurrencyDataType } from '@/@types/system'
import {
    apiGetUserCurrencies,
    apiSetUserCurrencies,
} from '@/services/AccountServices'
import { apiGetCurrencies } from '@/services/CurrencyServices'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const Currency = () => {
    const { t } = useTranslation()
    const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false)
    const [isLoadingUserCurrencies, setIsLoadingUserCurrencies] =
        useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currencies, setCurrencies] = useState<CurrencyDataType[]>()
    const [userCurrencies, setUserCurrencies] = useState<CurrencyDataType[]>()
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])

    const errorHandler = useCallback(
        (e: unknown) => {
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

    const isLoading = !userCurrencies && !currencies

    useEffect(() => {
        setIsLoadingUserCurrencies(true)
        if (!userCurrencies && !isLoadingUserCurrencies) {
            apiGetUserCurrencies()
                .then((data) => {
                    setUserCurrencies(data)
                    setSelectedCurrencies(data.map(({ id }) => id))
                    setIsLoadingUserCurrencies(false)
                })
                .catch(errorHandler)
        }
        setIsLoadingCurrencies(true)
        if (!currencies && !isLoadingCurrencies) {
            apiGetCurrencies()
                .then((data) => {
                    setCurrencies(data)
                    setIsLoadingCurrencies(false)
                })
                .catch(errorHandler)
        }
    }, [
        errorHandler,
        isLoadingUserCurrencies,
        isLoadingCurrencies,
        currencies,
        userCurrencies,
    ])

    return (
        <div data-tn="account-currencies-page">
            <h5>{t('pages.settings.sections.currency.title')}</h5>
            <p>{t('pages.settings.sections.currency.desc')}</p>
            {isLoading && (
                <>
                    {[0, 1, 2, 3, 4, 5].map((_, index) => (
                        <Skeleton key={index} className="my-2" height={35} />
                    ))}
                </>
            )}
            {!isLoading && (
                <Formik
                    initialValues={{}}
                    onSubmit={async () => {
                        setIsSubmitting(true)
                        try {
                            await apiSetUserCurrencies(selectedCurrencies)
                        } catch (e) {
                            errorHandler(e)
                        }
                        setIsSubmitting(false)
                    }}
                >
                    <Form>
                        <FormContainer layout="vertical">
                            <FormItem className="py-8">
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
                            </FormItem>
                            <Divider className="my-4" />
                            <FormItem className="mt-4 ltr:text-right">
                                <Button
                                    variant="solid"
                                    loading={isSubmitting}
                                    type="submit"
                                    disabled={selectedCurrencies.length === 0}
                                >
                                    {isSubmitting
                                        ? t('actions.saving')
                                        : t('actions.save')}
                                </Button>
                            </FormItem>
                        </FormContainer>
                    </Form>
                </Formik>
            )}
        </div>
    )
}

export default Currency
