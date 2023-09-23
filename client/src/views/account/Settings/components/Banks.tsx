import Table from '@/components/ui/Table'
import {
    Avatar,
    Button,
    Card,
    Dialog,
    FormContainer,
    FormItem,
    Input,
} from '@/components/ui'
import { useTranslation } from 'react-i18next'
import {
    HiLibrary,
    HiOutlineExclamation,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiPlus,
} from 'react-icons/hi'
import { MouseEvent, useCallback, useEffect, useState } from 'react'
import { BankDataType } from '@/@types/system'
import * as Yup from 'yup'
import { Field, Form, Formik } from 'formik'
import { Loading } from '@/components/shared'
import {
    apiCreateBank,
    apiDeleteBank,
    apiGetBankList,
    apiUpdateBank,
} from '@/services/BankServices'
import EmptyState from '@/components/shared/EmptyState'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import useThemeClass from "@/utils/hooks/useThemeClass";

const { Tr, Td, TBody } = Table

type BankDeleteConfirmationProps = {
    isOpen: boolean
    bank: BankDataType
    onClose: (e: MouseEvent<HTMLSpanElement>) => void
    onConfirmation: () => void
}
const BankDeleteConfirmation = (props: BankDeleteConfirmationProps) => {
    const { isOpen, bank, onClose, onConfirmation } = props
    const [isDeleting, setIsDeleting] = useState<boolean>(false)

    const { t } = useTranslation()

    const onDelete = async () => {
        setIsDeleting(true)
        await apiDeleteBank(bank.id)
        setIsDeleting(false)
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
        onConfirmation()
    }

    return (
        <Dialog
            isOpen={isOpen}
            contentClassName="pb-0 px-0"
            onClose={onClose}
            onRequestClose={onClose}
        >
            <div className="px-6 pb-6 pt-2 flex">
                <div>
                    <Avatar
                        icon={<HiOutlineExclamation />}
                        shape="circle"
                        className="text-red-600 bg-red-100 dark:text-red-400"
                    />
                </div>
                <div className="ml-4 rtl:mr-4">
                    <h5 className="mb-2">
                        {t(
                            'pages.settings.sections.banks.deleteConfirmation.title',
                        )}
                    </h5>
                    <p>
                        {t(
                            'pages.settings.sections.banks.deleteConfirmation.description',
                        )}
                    </p>
                </div>
            </div>
            <div className="text-right px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-bl-lg rounded-br-lg">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    disabled={isDeleting}
                    onClick={onClose}
                >
                    {t('actions.cancel')}
                </Button>
                <Button
                    variant="solid"
                    color="red"
                    disabled={isDeleting}
                    onClick={onDelete}
                >
                    {t('actions.delete')}
                </Button>
            </div>
        </Dialog>
    )
}

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
    const {textTheme} = useThemeClass()

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
                                    <Td>
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
                                    <Td className="w-32 text-right">
                                        <Button
                                            size="sm"
                                            shape="circle"
                                            variant="plain"
                                            title={t('actions.edit') || ''}
                                            icon={<HiOutlinePencilAlt />}
                                            onClick={() => onEdit(bank)}
                                        />
                                        <Button
                                            className="ml-2 hover:text-red-600"
                                            size="sm"
                                            shape="circle"
                                            variant="plain"
                                            color="red"
                                            title={t('actions.delete') || ''}
                                            icon={<HiOutlineTrash />}
                                            onClick={() => onDelete(bank)}
                                        />
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
            {!!selectedBank && (
                <BankDeleteConfirmation
                    isOpen={isDeleteOpen}
                    bank={selectedBank}
                    onClose={onBankDeleteConfirmClose}
                    onConfirmation={() => {
                        onBankDeleteConfirmClose()
                        loadBanks()
                    }}
                />
            )}
        </div>
    )
}

export default Banks
