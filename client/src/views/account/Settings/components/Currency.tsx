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
import { useEffect, useState } from 'react'
import {
    apiGetUserCurrencies,
    apiSetUserCurrencies,
} from '@/services/AccountService'
import { apiGetCurrencies } from '@/services/CurrencyService'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'

const Currency = () => {
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([])

    const { t } = useTranslation()

    const {
        data: userCurrencies,
        isFetching: isFetchingUserCurrencies,
        refetch: refetchUserCurrencies,
    } = useQuery({
        queryKey: ['user-currencies'],
        queryFn: apiGetUserCurrencies,
    })

    const { data: currencies, isFetching: isFetchingCurrencies } = useQuery({
        queryKey: ['currencies'],
        queryFn: apiGetCurrencies,
    })

    const setUserCurrenciesMutation = useMutation({
        mutationFn: apiSetUserCurrencies,
        onSuccess: async () => {
            refetchUserCurrencies()
            toast.push(
                <Notification
                    title={t('notifications.profile.updated') || ''}
                    type="success"
                />,
                {
                    placement: 'top-center',
                },
            )
        },
    })

    useEffect(() => {
        if (userCurrencies) {
            setSelectedCurrencies(userCurrencies.map(({ id }) => id))
        }
    }, [userCurrencies])

    const isLoading = isFetchingUserCurrencies || isFetchingCurrencies

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
                    onSubmit={() => {
                        setUserCurrenciesMutation.mutate(selectedCurrencies)
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
                                    loading={
                                        setUserCurrenciesMutation.isLoading
                                    }
                                    type="submit"
                                    disabled={selectedCurrencies.length === 0}
                                >
                                    {setUserCurrenciesMutation.isLoading
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
