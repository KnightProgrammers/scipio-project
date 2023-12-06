import { useState } from 'react'
import { ConfirmDialog, Container, Loading } from '@/components/shared'
import {
    Avatar,
    Badge,
    Button,
    Card,
    FormItem,
    Input,
    ModalForm,
    Select,
    Table,
    Tooltip,
} from '@/components/ui'
import {
    HiCheck,
    HiOutlinePencilAlt,
    HiOutlineSearch,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import EmptyState from '@/components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import { TbCategory2 } from 'react-icons/tb'
import Checkbox from '@/components/ui/Checkbox'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import {
    apiCreateCategory,
    apiDeleteCategory,
    apiGetCategoryList,
    apiUpdateCategory,
} from '@/services/CategoryService'
import {
    components,
    ControlProps,
    OptionProps,
    SingleValue,
} from 'react-select'

const { Control } = components

const { Tr, Td, Th, TBody, THead } = Table

const CategoryTableFilter = (props: {
    value: string
    onChange: (val: string) => void
}) => {
    const { value, onChange } = props

    const { t } = useTranslation()

    const options: Option[] = [
        { label: t('placeholders.all'), value: '', color: 'bg-gray-500' },
        {
            label: t('categoryTypes.NEED'),
            value: 'NEED',
            color: 'bg-indigo-500',
        },
        {
            label: t('categoryTypes.WANT'),
            value: 'WANT',
            color: 'bg-yellow-500',
        },
        {
            label: t('categoryTypes.SAVE'),
            value: 'SAVE',
            color: 'bg-green-500',
        },
    ]

    type Option = {
        value: string
        label: string
        color: string
    }
    const CustomSelectOption = ({
        innerProps,
        label,
        data,
        isSelected,
    }: OptionProps<Option>) => {
        return (
            <div
                className={`flex items-center justify-between p-2 cursor-pointer ${
                    isSelected
                        ? 'bg-gray-100 dark:bg-gray-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
                {...innerProps}
            >
                <div className="flex items-center gap-2">
                    <Badge innerClass={data.color} />
                    <span>{label}</span>
                </div>
                {isSelected && <HiCheck className="text-emerald-500 text-xl" />}
            </div>
        )
    }

    const CustomControl = ({ children, ...props }: ControlProps<Option>) => {
        const selected = props.getValue()[0]
        return (
            <Control {...props}>
                {selected && (
                    <Badge
                        className="ltr:ml-4 rtl:mr-4"
                        innerClass={selected.color}
                    />
                )}
                {children}
            </Control>
        )
    }

    return (
        <Select<Option>
            options={options}
            size="sm"
            className="md:w-64"
            components={{
                Option: CustomSelectOption,
                Control: CustomControl,
            }}
            value={options.filter((option) => option.value === value)}
            onChange={(selected: SingleValue<Option>) =>
                onChange(selected?.value ?? '')
            }
        />
    )
}

const Categories = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)
    const [searchByName, setSearchByName] = useState<string>('')
    const [filterByType, setFilterByType] = useState<string>('')

    const { t } = useTranslation()

    const {
        data: categories,
        isFetching: isLoadingCategories,
        refetch: refetchCategories,
    } = useQuery({
        queryKey: ['user-categories'],
        queryFn: apiGetCategoryList,
    })

    const onMutationSuccess = async (title: string) => {
        refetchCategories()
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedCategory(undefined)
    }

    const onDeleteConfirmClose = () => {
        setIsConfirmDeleteOpen(false)
        setSelectedCategory(undefined)
    }

    const createCategoryMutation = useMutation({
        mutationFn: apiCreateCategory,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.category.created') || '')
        },
        onSettled: onFormClose,
    })

    const updateCategoryMutation = useMutation({
        mutationFn: apiUpdateCategory,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.category.updated') || '')
        },
        onSettled: onFormClose,
    })

    const deleteCategoryMutation = useMutation({
        mutationFn: apiDeleteCategory,
        onSuccess: async () => {
            await onMutationSuccess(t('notifications.category.deleted') || '')
        },
        onSettled: onDeleteConfirmClose,
    })

    const CATEGORY_TYPES: any[] = [
        { label: t('categoryTypes.NEED'), value: 'NEED' },
        { label: t('categoryTypes.WANT'), value: 'WANT' },
        { label: t('categoryTypes.SAVE'), value: 'SAVE' },
    ]

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(t('validations.required') || ''),
        type: Yup.string().required(t('validations.required') || ''),
    })

    const onDelete = async () => {
        if (selectedCategory) {
            deleteCategoryMutation.mutate(selectedCategory.id)
        }
        onDeleteConfirmClose()
    }

    const onFormSubmit = (data: any) => {
        if (selectedCategory) {
            updateCategoryMutation.mutate(data)
        } else {
            createCategoryMutation.mutate(data)
        }
        onFormClose()
    }

    const categoryTypeColor = (type: string) => {
        switch (type) {
            case 'SAVE':
                return 'bg-green-500'
            case 'NEED':
                return 'bg-indigo-500'
            default:
                return 'bg-yellow-500'
        }
    }

    const CategoryForm = () => (
        <ModalForm
            isOpen={isFormOpen}
            entity={
                selectedCategory || {
                    isFixedPayment: false,
                }
            }
            title={
                selectedCategory
                    ? t('pages.categories.form.editTitle')
                    : t('pages.categories.form.newTitle')
            }
            validationSchema={validationSchema}
            fields={(
                errors: FormikErrors<any>,
                touched: FormikTouched<any>,
            ) => (
                <>
                    <FormItem
                        asterisk
                        label={t(`fields.name`) || ''}
                        invalid={!!errors.name || !!touched.name}
                        errorMessage={errors.name?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="name"
                            placeholder={t(`fields.name`)}
                            component={Input}
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t(`fields.type`) || ''}
                        invalid={(errors.type || touched.type) as boolean}
                        errorMessage={errors.type?.toString()}
                    >
                        <Field name="type">
                            {({ field, form }: FieldProps) => (
                                <Select
                                    field={field}
                                    form={form}
                                    placeholder={t(`fields.type`) || ''}
                                    options={CATEGORY_TYPES}
                                    id="type-select"
                                    value={CATEGORY_TYPES.find(
                                        (type: any) =>
                                            type.value === field.value,
                                    )}
                                    onChange={(option) =>
                                        form.setFieldValue(
                                            field.name,
                                            option?.value,
                                        )
                                    }
                                />
                            )}
                        </Field>
                    </FormItem>
                    <FormItem className="mt-4">
                        <Field name="isFixedPayment">
                            {({ field, form }: FieldProps) => (
                                <Checkbox
                                    name="isFixedPayment"
                                    defaultChecked={field.value}
                                    onChange={(value) => {
                                        form.setFieldValue(field.name, value)
                                    }}
                                >
                                    {t(`fields.isFixedPayment`)}
                                </Checkbox>
                            )}
                        </Field>
                    </FormItem>
                </>
            )}
            isSaving={
                createCategoryMutation.isPending ||
                updateCategoryMutation.isPending
            }
            onClose={onFormClose}
            onSubmit={onFormSubmit}
        />
    )

    if (!categories) {
        return (
            <div className="flex h-full mx-auto w-0" data-tn="categories-page">
                <Loading loading />
            </div>
        )
    }

    const filteredCategories: any[] = categories
        .filter((c: any) =>
            c.name.toLowerCase().includes(searchByName.toLowerCase()),
        )
        .filter((c: any) => (filterByType ? c.type === filterByType : true))

    if (filteredCategories.length === 0) {
        return (
            <Container data-tn="categories-page">
                <div className="lg:flex items-center justify-between mb-4">
                    <h2>{t('pages.categories.header')}</h2>
                </div>
                <CategoryForm />
                <div className="grid grid-cols-2 md:flex items-center gap-4 mb-4">
                    <Input
                        value={searchByName}
                        className="md:w-64"
                        size="sm"
                        placeholder="Search"
                        prefix={<HiOutlineSearch className="text-lg" />}
                        onChange={(e: any) => setSearchByName(e.target.value)}
                    />
                    <CategoryTableFilter
                        value={filterByType}
                        onChange={(val: string) => setFilterByType(val)}
                    />
                </div>
                <EmptyState
                    title={t('pages.categories.emptyState.title')}
                    description={t('pages.categories.emptyState.description')}
                    data-tn="empty-state-no-categories"
                >
                    <Button
                        variant="twoTone"
                        className="mt-4 w-full md:w-96"
                        size="lg"
                        icon={<HiPlus />}
                        data-tn="add-category-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.categories.addCategoryButton')}
                    </Button>
                </EmptyState>
            </Container>
        )
    }

    return (
        <Container data-tn="categories-page">
            <div className="lg:flex items-center justify-between mb-4">
                <h2>{t('pages.categories.header')}</h2>
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <Button
                        variant="solid"
                        size="sm"
                        className="mt-4"
                        icon={<HiPlus />}
                        data-tn="add-category-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.categories.addCategoryButton')}
                    </Button>
                </div>
            </div>
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-4 mb-4">
                    <Input
                        value={searchByName}
                        className="md:w-64"
                        size="sm"
                        placeholder="Search"
                        prefix={<HiOutlineSearch className="text-lg" />}
                        onChange={(e: any) => setSearchByName(e.target.value)}
                    />
                    <CategoryTableFilter
                        value={filterByType}
                        onChange={(val: string) => setFilterByType(val)}
                    />
                </div>
                <Loading loading={isLoadingCategories} type="cover">
                    <Table border={1}>
                        <THead>
                            <Tr>
                                <Th>{t(`fields.name`)}</Th>
                                <Th className="text-center">
                                    {t(`fields.isFixedPayment`)}
                                </Th>
                                <Th className="text-center">
                                    {t(`fields.type`)}
                                </Th>
                                <Th></Th>
                            </Tr>
                        </THead>
                        <TBody>
                            {filteredCategories.map((c, index) => (
                                <Tr key={index}>
                                    <Td>
                                        <div className="flex inline-flex items-center">
                                            <Avatar
                                                icon={<TbCategory2 />}
                                                className="mr-2 bg-purple-500 dark:bg-purple-600"
                                                size={32}
                                            />
                                            <span
                                                className="font-bold text-lg"
                                                data-tn={`name-category-lbl-${c.id}`}
                                            >
                                                {c.name}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td>
                                        {c.isFixedPayment
                                            ? t('messages.yes')
                                            : t('messages.no')}
                                    </Td>
                                    <Td>
                                        <Badge
                                            className={categoryTypeColor(
                                                c.type,
                                            )}
                                            content={t(
                                                `categoryTypes.${c.type}`,
                                            ).toUpperCase()}
                                        />
                                    </Td>
                                    <Td
                                        className="w-32 text-right"
                                        style={{ justifyItems: 'center' }}
                                    >
                                        <Tooltip title={t('actions.edit')}>
                                            <Button
                                                size="sm"
                                                shape="circle"
                                                variant="plain"
                                                data-tn={`edit-category-btn-${c.id}`}
                                                icon={<HiOutlinePencilAlt />}
                                                onClick={() => {
                                                    setIsFormOpen(true)
                                                    setSelectedCategory(c)
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title={t('actions.delete')}>
                                            <Button
                                                className="hover:text-red-600"
                                                size="sm"
                                                shape="circle"
                                                variant="plain"
                                                color="red"
                                                data-tn={`delete-category-btn-${c.id}`}
                                                icon={<HiOutlineTrash />}
                                                onClick={() => {
                                                    setIsConfirmDeleteOpen(true)
                                                    setSelectedCategory(c)
                                                }}
                                            />
                                        </Tooltip>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </Loading>
            </Card>
            <CategoryForm />
            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                type="danger"
                title={t('pages.categories.deleteConfirmation.title')}
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                data-tn="confirm-delete-dialog"
                onClose={onDeleteConfirmClose}
                onRequestClose={onDeleteConfirmClose}
                onCancel={onDeleteConfirmClose}
                onConfirm={onDelete}
            >
                <p>
                    {t('pages.categories.deleteConfirmation.description', {
                        name: selectedCategory?.name,
                    })}
                </p>
            </ConfirmDialog>
        </Container>
    )
}

export default Categories
