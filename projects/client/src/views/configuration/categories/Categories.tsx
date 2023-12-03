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
import { HiOutlinePencilAlt, HiOutlineTrash, HiPlus } from 'react-icons/hi'
import EmptyState from '@/components/shared/EmptyState'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
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

const { Tr, Td, Th, TBody, THead } = Table

const Categories = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)

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

    if (categories.length === 0) {
        return (
            <Container data-tn="categories-page">
                <div className="lg:flex items-center justify-between mb-4">
                    <h2>{t('pages.categories.header')}</h2>
                </div>
                <CategoryForm />
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
                            {categories.map((c, index) => (
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
