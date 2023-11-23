import { Container } from '@/components/shared'
import EmptyState from '@/components/shared/EmptyState'
import { Button, Select, Table } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { HiOutlineRocketLaunch } from 'react-icons/hi2'
import { useState } from 'react'
import { BiSave, BiTrash } from 'react-icons/bi'
import { FormItem } from '@/components/ui/Form'
import TFoot from '@/components/ui/Table/TFoot'

const { Tr, Th, Td, THead, TBody } = Table

const CategoryCell = (props: { category: any; categoryList: any[] }) => {
    const { category, categoryList } = props

    const [isSelected, setIsSelected] = useState(false)

    const [value, setValue] = useState({
        value: category,
        label: category,
    })

    const { t } = useTranslation()

    const onValueChange = (newValue: any) => {
        setValue(newValue)
        setIsSelected(false)
    }

    if (isSelected) {
        return (
            <Td>
                <Select
                    placeholder={t('placeholders.category')}
                    id="category-select"
                    value={value}
                    defaultValue={value}
                    defaultInputValue=""
                    isDisabled={false}
                    isLoading={false}
                    options={categoryList.map((c: string) => ({
                        label: c,
                        value: c,
                    }))}
                    onChange={(newValue) => onValueChange(newValue as any)}
                />
            </Td>
        )
    }

    return <Td onClick={() => setIsSelected(true)}>{category}</Td>
}

const Budgets = () => {
    const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
        'USD',
    ])
    const { t } = useTranslation()

    const budget = {}

    const items = [
        {
            category: 'Category #1',
        },
        {
            category: 'Category #2',
        },
        {
            category: 'Category #3',
        },
    ]

    const categoryList = ['Category #1', 'Category #2', 'Category #3']

    const userCurrencies = [
        {
            name: 'USD',
        },
        {
            name: 'UYU',
        },
    ]

    if (!budget) {
        return (
            <Container data-tn="budgets-page">
                <div className="flex flex-col md:flex-row justify-between mb-4">
                    <h2 className="mb-2">{t('pages.budgets.header')}</h2>
                </div>
                <EmptyState
                    title={t('pages.budgets.emptyState.title')}
                    description={t('pages.budgets.emptyState.description')}
                >
                    <Button
                        icon={<HiOutlineRocketLaunch />}
                        data-tn="budget-start"
                    >
                        {t('actions.start')}
                    </Button>
                </EmptyState>
            </Container>
        )
    }

    return (
        <Container data-tn="budgets-page">
            <div className="flex flex-col md:flex-row justify-between mb-4 relative">
                <h2 className="mb-2">{t('pages.budgets.header')}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2"></div>
                <FormItem layout="horizontal" label="Currencies">
                    <Select
                        placeholder={t('placeholders.currency')}
                        id="currency-select"
                        defaultValue={selectedCurrencies.map((c: string) => ({
                            label: c,
                            value: c,
                        }))}
                        isDisabled={false}
                        isClearable={false}
                        isLoading={false}
                        size="sm"
                        isMulti={true}
                        defaultInputValue=""
                        options={userCurrencies.map((c: { name: string }) => ({
                            label: c.name,
                            value: c.name,
                        }))}
                        onChange={(newValue: any[]) => {
                            setSelectedCurrencies(
                                newValue.map((nv: any) => nv.value),
                            )
                        }}
                    />
                </FormItem>
            </div>
            <div>
                <Table className="w-full h-full">
                    <THead>
                        <Tr>
                            <Th>Category</Th>
                            {selectedCurrencies.map((c: string) => (
                                <Th key={`currency-colum-${c}`}>{c}</Th>
                            ))}
                            <Th></Th>
                        </Tr>
                    </THead>
                    <TBody>
                        {items.map((item: any) => (
                            <Tr key={item.category}>
                                <CategoryCell
                                    category={item.category}
                                    categoryList={categoryList}
                                />
                                {selectedCurrencies.map((c: string) => (
                                    <Td key={`${item.category}-currency-${c}`}>
                                        1235
                                    </Td>
                                ))}
                                <Td width={120}>
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        icon={<BiSave />}
                                    />
                                    <Button
                                        variant="plain"
                                        size="sm"
                                        icon={<BiTrash />}
                                    />
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                    <TFoot>
                        <Tr style={{ borderTop: 'solid 2px' }}>
                            <Td>
                                <b>Total:</b>
                            </Td>
                            {selectedCurrencies.map((c: string) => (
                                <Td key={`currency-colum-${c}`}>1234</Td>
                            ))}
                            <Td></Td>
                        </Tr>
                    </TFoot>
                </Table>
            </div>
        </Container>
    )
}

export default Budgets
