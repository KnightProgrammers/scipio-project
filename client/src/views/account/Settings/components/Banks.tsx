import Table from '@/components/ui/Table'
import {
    Avatar,
    Button,
    Card,
    FormItem,
    Input, ModalForm,
    Tag,
    Tooltip
} from "@/components/ui";
import { useTranslation } from 'react-i18next'
import {
    HiLibrary,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import { useState } from 'react'
import { BankDataType } from '@/@types/system'
import * as Yup from 'yup'
import { Field, FormikErrors, FormikTouched } from "formik";
import { ConfirmDialog, Loading } from '@/components/shared'
import {
    apiCreateBank,
    apiDeleteBank,
    apiGetBankList,
    apiUpdateBank,
} from '@/services/BankServices'
import EmptyState from '@/components/shared/EmptyState'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const { Tr, Td, TBody } = Table

const Banks = () => {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
    const [selectedBank, setSelectedBank] = useState<BankDataType | undefined>(
        undefined,
    )

    const { t } = useTranslation()
    const { textTheme } = useThemeClass()

    const queryClient = useQueryClient()

    const { data: bankList, isFetching: isLoadingBanks } = useQuery({
        queryKey: ['user-banks'],
        queryFn: apiGetBankList,
        suspense: true,
    })

    const onMutationSuccess = async (title: string) => {
        await queryClient.invalidateQueries({
            queryKey: ['user-banks'],
        })
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const openDrawer = () => {
        setIsFormOpen(true)
    }

    const onBankFormClose = () => {
        setSelectedBank(undefined)
        setIsFormOpen(false)
        setIsSaving(false)
    }

    const onBankDeleteConfirmClose = () => {
        setSelectedBank(undefined)
        setIsDeleteOpen(false)
    }

    const onEdit = (bank: BankDataType) => {
        setSelectedBank(bank)
        setIsFormOpen(true)
    }

    const onDelete = (bank: BankDataType) => {
        setSelectedBank(bank)
        setIsDeleteOpen(true)
    }

    const createBankMutation = useMutation({
        mutationFn: apiCreateBank,
        onSuccess: async () => {
            await onMutationSuccess(
                t('notifications.bank.created') || '',
            )
        },
        onSettled: onBankFormClose
    })

    const updateBankMutation = useMutation({
        mutationFn: apiUpdateBank,
        onSuccess: async () => {
            await onMutationSuccess(
                t('notifications.bank.updated') || '',
            )
        },
        onSettled: onBankFormClose
    })

    const deleteBankMutation = useMutation({
        mutationFn: apiDeleteBank,
        onSuccess: async () => {
            await onMutationSuccess(
                t('notifications.bank.deleted') || '',
            )
        },
        onSettled: onBankDeleteConfirmClose
    })

    const onDeleteConfirm = async () => {
        if (selectedBank) {
            deleteBankMutation.mutate(selectedBank.id)
        }
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(t('validations.required') || ''),
    })

    const onBankFormSubmit = (values: any) => {
        setIsSaving(true)
        if (!selectedBank?.id) {
            createBankMutation.mutate(values)
        } else {
            updateBankMutation.mutate({
                ...selectedBank,
                ...values,
            })
        }
    }

    if (isLoadingBanks) {
        return <Loading loading={true} type="cover" className="w-full h-80" />
    }

    return (
        <div data-tn="account-banks-page">
            <h5>{t('pages.settings.sections.banks.title')}</h5>
            <p>{t('pages.settings.sections.banks.desc')}</p>
            {bankList?.length === 0 ? (
                <EmptyState
                    className="mt-4"
                    title={t('pages.settings.sections.banks.emptyState.title')}
                    description={t(
                        'pages.settings.sections.banks.emptyState.description',
                    )}
                />
            ) : (
                <Card bordered className="mt-4">
                    <Table>
                        <TBody>
                            {bankList?.map((bank, index) => (
                                <Tr key={index}>
                                    <Td className="w-full">
                                        <div className="flex inline-flex items-center">
                                            <Avatar
                                                src={bank.icon && bank.icon}
                                                icon={
                                                    !bank.icon && <HiLibrary />
                                                }
                                                className="mr-2"
                                                size={32}
                                                data-tn={`icon-bank-lbl-${bank.id}`}
                                            />
                                            <span
                                                className="font-bold text-lg"
                                                data-tn={`name-bank-lbl-${bank.id}`}
                                            >
                                                {bank.name}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td
                                        className="w-44 text-right grid grid-cols-3 justify-center items-center"
                                        style={{ justifyItems: 'center' }}
                                    >
                                        <Tooltip
                                            title={t(
                                                'pages.settings.sections.banks.tooltips.accounts',
                                            )}
                                            placement="left"
                                        >
                                            <Tag>
                                                {bank.bankAccounts.length}
                                            </Tag>
                                        </Tooltip>
                                        <Tooltip title={t('actions.edit')}>
                                            <Button
                                                size="sm"
                                                shape="circle"
                                                variant="plain"
                                                data-tn={`edit-bank-btn-${bank.id}`}
                                                icon={<HiOutlinePencilAlt />}
                                                onClick={() => onEdit(bank)}
                                            />
                                        </Tooltip>
                                        <Tooltip
                                            title={
                                                !!bank.bankAccounts.length &&
                                                bank.bankAccounts.length > 0
                                                    ? t(
                                                          'pages.settings.sections.banks.tooltips.warnHasAccounts',
                                                      )
                                                    : t('actions.delete')
                                            }
                                        >
                                            <Button
                                                className="hover:text-red-600"
                                                size="sm"
                                                shape="circle"
                                                variant="plain"
                                                color="red"
                                                data-tn={`delete-bank-btn-${bank.id}`}
                                                disabled={
                                                    !!bank.bankAccounts
                                                        .length &&
                                                    bank.bankAccounts.length > 0
                                                }
                                                icon={<HiOutlineTrash />}
                                                onClick={() => onDelete(bank)}
                                            />
                                        </Tooltip>
                                    </Td>
                                </Tr>
                            ))}
                        </TBody>
                    </Table>
                </Card>
            )}
            <Button
                className={`mt-4 ${textTheme}`}
                size="sm"
                variant="plain"
                icon={<HiPlus />}
                data-tn="add-bank-btn"
                onClick={openDrawer}
            >
                {t('pages.settings.sections.banks.newBankAction')}
            </Button>
            <ModalForm
                isOpen={isFormOpen}
                entity={selectedBank || {
                    name: '',
                }}
                title={`${selectedBank?.name} - ${
                    selectedBank
                        ? t('pages.settings.sections.banks.form.editTitle')
                        : t('pages.settings.sections.banks.form.newTitle')
                }`}
                validationSchema={validationSchema}
                fields={(
                    errors: FormikErrors<any>,
                    touched: FormikTouched<any>,
                ) => (
                    <>
                        <FormItem
                            label={t('fields.name') || 'Name'}
                            invalid={(errors.name && touched.name) as boolean}
                            errorMessage={errors.name?.toString()}
                        >
                            <Field
                                type="text"
                                autoComplete="off"
                                name="name"
                                placeholder={t('fields.name')}
                                component={Input}
                            />
                        </FormItem>
                    </>
                )}
                isSaving={isSaving}
                onClose={onBankFormClose}
                onSubmit={onBankFormSubmit}
            />
            <ConfirmDialog
                isOpen={isDeleteOpen}
                type="danger"
                title={t(
                    'pages.settings.sections.banks.deleteConfirmation.title',
                )}
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                data-tn="confirm-delete-dialog"
                onClose={onBankDeleteConfirmClose}
                onRequestClose={onBankDeleteConfirmClose}
                onCancel={onBankDeleteConfirmClose}
                onConfirm={onDeleteConfirm}
            >
                <p>
                    {t(
                        'pages.settings.sections.banks.deleteConfirmation.description',
                        {
                            name: selectedBank?.name,
                        },
                    )}
                </p>
            </ConfirmDialog>
        </div>
    )
}

export default Banks
