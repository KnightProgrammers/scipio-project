import Table from '@/components/ui/Table'
import {
    Avatar,
    Button,
    Card,
    Dialog,
    FormContainer,
    FormItem,
    Input,
    Tag,
    Tooltip,
} from '@/components/ui'
import { useTranslation } from 'react-i18next'
import {
    HiLibrary,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import { MouseEvent, useCallback, useEffect, useState } from 'react'
import { BankDataType } from '@/@types/system'
import * as Yup from 'yup'
import { Field, Form, Formik } from 'formik'
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

const { Tr, Td, TBody } = Table

type BankFormProps = {
    isOpen: boolean
    bank: BankDataType | undefined
    onClose: (e: MouseEvent<HTMLSpanElement>) => void
    onSave: () => void
}

const BankForm = (props: BankFormProps) => {
    const { isOpen, bank, onClose, onSave } = props
    const [isSaving, setIsSaving] = useState(false)

    const { t } = useTranslation()

    const BankFormTitle = () => {
        let title: string = t('pages.settings.sections.banks.form.newTitle')
        if (bank) {
            title = `${t('pages.settings.sections.banks.form.editTitle')} - ${
                bank.name
            }`
        }

        return <h5 className="mb-4">{title}</h5>
    }

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(t('validations.required') || ''),
    })

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

    return (
        <Dialog isOpen={isOpen} onClose={onClose} onRequestClose={onClose}>
            <BankFormTitle />
            {isSaving ? (
                <div className="py-8">
                    <Loading loading={true} type="cover" />
                </div>
            ) : (
                <Formik
                    initialValues={
                        bank || {
                            name: '',
                        }
                    }
                    validationSchema={validationSchema}
                    onSubmit={async (values) => {
                        setIsSaving(true)
                        try {
                            if (!bank?.id) {
                                await apiCreateBank(values)
                            } else {
                                await apiUpdateBank({
                                    ...bank,
                                    ...values,
                                })
                            }
                        } catch (e: unknown) {
                            errorHandler(e)
                        }
                        onSave()
                    }}
                >
                    {({ touched, errors, isSubmitting }) => (
                        <Form>
                            <FormContainer>
                                <FormItem
                                    label={t('fields.name') || 'Name'}
                                    invalid={errors.name && touched.name}
                                    errorMessage={errors.name}
                                >
                                    <Field
                                        type="text"
                                        autoComplete="off"
                                        name="name"
                                        placeholder={t('fields.name')}
                                        component={Input}
                                    />
                                </FormItem>
                            </FormContainer>
                            <div className="text-right mt-6">
                                <Button
                                    className="ltr:mr-2 rtl:ml-2"
                                    variant="plain"
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={onClose}
                                >
                                    {t('actions.cancel')}
                                </Button>
                                <Button
                                    variant="solid"
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {t('actions.save')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </Dialog>
    )
}

const Banks = () => {
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)
    const [selectedBank, setSelectedBank] = useState<BankDataType | undefined>(
        undefined,
    )
    const [isLoadingBanks, setIsLoadingBanks] = useState<boolean>(false)
    const [bankList, setBankList] = useState<BankDataType[] | undefined>(
        undefined,
    )

    const { t } = useTranslation()
    const { textTheme } = useThemeClass()

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

    const openDrawer = () => {
        setIsFormOpen(true)
    }

    const onBankFormClose = () => {
        setSelectedBank(undefined)
        setIsFormOpen(false)
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

    const onDeleteConfirm = async () => {
        if (selectedBank) {
            setIsLoadingBanks(true)
            try {
                await apiDeleteBank(selectedBank.id)
                toast.push(
                    <Notification
                        title={
                            t(
                                'pages.settings.sections.banks.notifications.confirmDelete',
                            ) || ''
                        }
                        type="success"
                    />,
                    {
                        placement: 'top-center',
                    },
                )
                loadBanks()
            } catch (e) {
                errorHandler(e)
                setIsLoadingBanks(false)
            }
            onBankDeleteConfirmClose()
        }
    }

    const loadBanks = () => {
        setIsLoadingBanks(true)
        apiGetBankList()
            .then((data) => {
                setIsLoadingBanks(false)
                setBankList(data)
            })
            .catch(() => {
                setIsLoadingBanks(false)
            })
    }

    useEffect(() => {
        if (bankList === undefined) {
            loadBanks()
        }
    }, [bankList])

    if (isLoadingBanks) {
        return <Loading loading={true} type="cover" className="w-full h-80" />
    }

    return (
        <div>
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
                                            />
                                            <span className="font-bold text-lg">
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
                                            <Tag>{bank.accountsCount}</Tag>
                                        </Tooltip>
                                        <Tooltip title={t('actions.edit')}>
                                            <Button
                                                size="sm"
                                                shape="circle"
                                                variant="plain"
                                                icon={<HiOutlinePencilAlt />}
                                                onClick={() => onEdit(bank)}
                                            />
                                        </Tooltip>
                                        <Tooltip
                                            title={
                                                !!bank.accountsCount &&
                                                bank.accountsCount > 0
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
                                                disabled={
                                                    !!bank.accountsCount &&
                                                    bank.accountsCount > 0
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
                onClick={openDrawer}
            >
                {t('pages.settings.sections.banks.newBankAction')}
            </Button>
            <BankForm
                isOpen={isFormOpen}
                bank={selectedBank}
                onClose={onBankFormClose}
                onSave={() => {
                    onBankFormClose()
                    loadBanks()
                }}
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
