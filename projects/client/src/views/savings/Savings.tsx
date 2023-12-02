import {
    Alert,
    Avatar,
    Button,
    Card,
    Checkbox,
    Dialog,
    Drawer,
    Dropdown,
    FormItem,
    Input,
    ModalForm,
    Progress,
    Segment,
} from '@/components/ui'
import {
    HiCheckCircle,
    HiLibrary,
    HiOutlinePencilAlt,
    HiOutlineTrash,
    HiPlus,
    HiXCircle,
} from 'react-icons/hi'
import {
    AdaptableCard,
    ConfirmDialog,
    Container,
    EllipsisButton,
    IconText,
    Loading,
    SegmentItemOption,
} from '@/components/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
    apiCreateSaving,
    apiDeleteSaving,
    apiGetSavingList,
    apiUpdateSaving,
} from '@/services/SavingService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import currencyFormat from '@/utils/currencyFormat'
import { useAppSelector } from '@/store'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { TbPigMoney } from 'react-icons/tb'
import { SlWallet } from 'react-icons/sl'
import { LuFilter, LuTimer } from 'react-icons/lu'
import { DateTime } from 'luxon'
import { HiFire } from 'react-icons/hi2'
import EmptyState from '@/components/shared/EmptyState'
import { Field, FieldProps, FormikErrors, FormikTouched } from 'formik'
import * as Yup from 'yup'
import DatePicker from '../../components/ui/DatePicker'
import { MdOutlineAttachMoney } from 'react-icons/md'
import { SelectFieldItem } from '@/components/ui/Form'
import { apiGetUserBankAccountList } from '@/services/BankAccountService'
import { BiSearch } from 'react-icons/bi'

const SAVING_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'NOT_CONCLUDED']

const BankTag = (props: { saving: any }) => {
    const { saving } = props
    const { currency, bankAccount } = saving
    const { bank, accountNumber } = bankAccount

    const { bgTheme } = useThemeClass()
    return (
        <>
            <Avatar
                src={bank.icon && bank.icon}
                icon={!bank.icon && <HiLibrary />}
                className={`mr-1 ${bgTheme} dark:${bgTheme}`}
                size={20}
                shape="circle"
            />
            <span className="font-light">
                {`${bank.name} - ${accountNumber} (${currency.code})`}
            </span>
        </>
    )
}

const isSavingExpire = (saving: any) => {
    return (
        saving.status === 'IN_PROGRESS' &&
        DateTime.fromISO(saving.targetDate).diffNow('days').days < 0
    )
}

const SavingExpiration = (props: { saving: any }) => {
    const { saving } = props
    const { status, targetDate } = saving

    const { t } = useTranslation()

    if (status === 'COMPLETED') {
        return (
            <Alert
                showIcon
                type="success"
                className="mt-2"
                customIcon={<HiCheckCircle />}
            >
                {t('pages.savings.labels.completed')}
            </Alert>
        )
    }

    if (status === 'NOT_CONCLUDED') {
        return (
            <Alert
                showIcon
                type="danger"
                className="mt-2"
                customIcon={<HiXCircle />}
            >
                {t('pages.savings.labels.noCompleted')}
            </Alert>
        )
    }

    if (isSavingExpire(saving)) {
        return (
            <Alert
                showIcon
                type="danger"
                className="mt-2"
                customIcon={<HiFire />}
            >
                <b>{t('pages.savings.labels.expiredOn')}:</b>{' '}
                {DateTime.fromISO(targetDate).toFormat('dd/MM/yyyy')}
            </Alert>
        )
    }

    return (
        <Alert showIcon type="info" className="mt-2" customIcon={<LuTimer />}>
            <b>{t('pages.savings.labels.expiration')}:</b>{' '}
            {DateTime.fromISO(targetDate).toFormat('dd/MM/yyyy')}
        </Alert>
    )
}

function SavingStatus(props: { saving: any }) {
    const { saving } = props
    const { status, bankAccount, targetAmount } = saving

    const percentage: number = Math.round(
        (bankAccount.balance / targetAmount) * 100,
    )

    if (status === 'COMPLETED' || percentage >= 100) {
        return (
            <Progress
                color="green-500"
                className="mt-2"
                percent={100}
                customInfo={
                    <HiCheckCircle className="text-emerald-500 text-xl" />
                }
            />
        )
    }
    if (status === 'NOT_CONCLUDED') {
        return (
            <Progress
                color="red-500"
                className="mt-2"
                percent={100}
                customInfo={<HiXCircle className="text-red-500 text-xl" />}
            />
        )
    }
    return <Progress className="mt-2" percent={percentage} />
}

const UpdateSavingStatusModal = (props: {
    isOpen: boolean
    saving: any
    onClose: () => void
    onSave: (data: any) => void
}) => {
    const { isOpen, saving, onClose, onSave } = props

    const [newStatus, setNewStatus] = useState<string>(saving.status)

    const { t } = useTranslation()

    const submitStatus = () => {
        onSave({
            ...saving,
            status: newStatus,
        })
    }

    return (
        <Dialog
            isOpen={isOpen}
            width={400}
            onClose={onClose}
            onRequestClose={onClose}
        >
            <h5 className="mb-4">
                {t('pages.savings.changeStatus.title')} - {saving.name}
            </h5>
            <p>{t('pages.savings.changeStatus.description')}</p>
            <Segment
                value={newStatus}
                selectionType="single"
                className="mt-2"
                onChange={(val) => setNewStatus(val[0] as string)}
            >
                <div className="flex flex-col items-center gap-4 w-full">
                    {SAVING_STATUSES.map((savingStatus: string) => (
                        <Segment.Item
                            key={savingStatus}
                            value={savingStatus}
                            disabled={saving.status === savingStatus}
                        >
                            {({ active, onSegmentItemClick, disabled }) => {
                                return (
                                    <SegmentItemOption
                                        hoverable
                                        active={active}
                                        disabled={disabled}
                                        className="bg-white dark:bg-gray-800 w-full"
                                        onSegmentItemClick={onSegmentItemClick}
                                    >
                                        <span className="font-bold">
                                            {t(`savingStatus.${savingStatus}`)}
                                        </span>
                                    </SegmentItemOption>
                                )
                            }}
                        </Segment.Item>
                    ))}
                </div>
            </Segment>
            <div className="mt-4 grid grid-cols-2 gap-4">
                <Button variant="plain" onClick={onClose}>
                    {t('actions.cancel')}
                </Button>
                <Button variant="solid" onClick={submitStatus}>
                    {t('actions.save')}
                </Button>
            </div>
        </Dialog>
    )
}

const SavingForm = (props: {
    isOpen: boolean
    saving: any
    isSaving: boolean
    bankAccounts: any[]
    onFormClose: () => void
    onFormSubmit: (data: any) => void
}) => {
    const {
        isOpen,
        saving,
        isSaving,
        bankAccounts,
        onFormClose,
        onFormSubmit,
    } = props

    const { t, i18n } = useTranslation()

    const validationSchema = Yup.object().shape({
        name: Yup.string().required(t('validations.required') || ''),
        targetDate: Yup.string().required(t('validations.required') || ''),
        targetAmount: Yup.string().required(t('validations.required') || ''),
        bankAccountId: Yup.string().required(t('validations.required') || ''),
    })

    return (
        <ModalForm
            isOpen={isOpen}
            entity={
                saving || {
                    targetDate: DateTime.now().toISO(),
                }
            }
            title={
                saving
                    ? t('pages.savings.form.editTitle')
                    : t('pages.savings.form.newTitle')
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
                        label={t(`fields.targetDate`) || ''}
                        invalid={!!errors.targetDate || !!touched.targetDate}
                        errorMessage={errors.targetDate?.toString()}
                    >
                        <Field name="targetDate" placeholder="DD/MM/YYYY">
                            {({ field, form }: FieldProps) => (
                                <DatePicker
                                    inputtable
                                    inputtableBlurClose={false}
                                    inputFormat="DD/MM/YYYY"
                                    defaultValue={new Date()}
                                    locale={i18n.language}
                                    clearable={false}
                                    data-tn="target-date-input"
                                    onChange={(value: Date | null) => {
                                        const d = value
                                            ? DateTime.fromJSDate(value)
                                            : DateTime.now()
                                        form.setFieldValue(
                                            field.name,
                                            d.toISO(),
                                        )
                                    }}
                                />
                            )}
                        </Field>
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t(`fields.amount`) || ''}
                        invalid={
                            !!errors.targetAmount || !!touched.targetAmount
                        }
                        errorMessage={errors.targetAmount?.toString()}
                    >
                        <Field
                            type="number"
                            autoComplete="off"
                            name="targetAmount"
                            placeholder={t(`fields.amount`)}
                            component={Input}
                            prefix={
                                <MdOutlineAttachMoney className="text-xl" />
                            }
                        />
                    </FormItem>
                    <FormItem
                        asterisk
                        label={t('fields.bankAccount') || ''}
                        invalid={
                            !!errors.bankAccountId || !!touched.bankAccountId
                        }
                        errorMessage={errors.bankAccountId?.toString()}
                    >
                        <Field
                            type="text"
                            autoComplete="off"
                            name="bankAccountId"
                            placeholder={t('fields.bankAccount')}
                            options={bankAccounts.map((ba: any) => ({
                                value: ba.id,
                                label: `${ba.bank.name} - ${
                                    ba.label ? `${ba.label}/` : ''
                                }${ba.accountNumber} (${ba.currency.code})`,
                            }))}
                            className="bank-account-select"
                            id="bank-account-select"
                            component={SelectFieldItem}
                        />
                    </FormItem>
                </>
            )}
            isSaving={isSaving}
            onClose={onFormClose}
            onSubmit={onFormSubmit}
        />
    )
}

const SavingFilter = (props: {
    defaultValue: any
    onFilter: (activeFilters: any) => void
}) => {
    const { defaultValue, onFilter } = props

    const [isOpen, setIsOpen] = useState(false)
    const [statuses, setStatuses] = useState<string[]>(defaultValue.statuses)

    const { t } = useTranslation()

    const onDrawerClose = () => {
        setIsOpen(false)
    }

    return (
        <>
            <Button
                variant="default"
                size="sm"
                data-tn="open-saving-filter-btn"
                className="p-2 ml-2"
                icon={<LuFilter />}
                onClick={() => setIsOpen(true)}
            />
            <Drawer
                title={
                    <div>
                        <h4 className="mb-2">
                            {t('pages.savings.filterTitle')}
                        </h4>
                    </div>
                }
                isOpen={isOpen}
                placement="right"
                headerClass="!items-start !bg-gray-100 dark:!bg-gray-700"
                footer={
                    <div className="text-right w-full grid grid-cols-2">
                        <Button
                            size="sm"
                            className="mr-1"
                            onClick={() => onDrawerClose()}
                        >
                            {t('actions.cancel')}
                        </Button>
                        <Button
                            size="sm"
                            className="ml-1"
                            variant="solid"
                            data-tn="apply-saving-filter-btn"
                            onClick={() => {
                                onFilter({ statuses })
                                onDrawerClose()
                            }}
                        >
                            {t('actions.filter')}
                        </Button>
                    </div>
                }
                onClose={() => setIsOpen(false)}
                onRequestClose={() => setIsOpen(false)}
            >
                <AdaptableCard bordered className="mt-2">
                    <p className="mb-2 font-bold">
                        {t('fields.savingStatus')}{' '}
                    </p>
                    <Segment
                        value={statuses}
                        selectionType="multiple"
                        onChange={(val) => setStatuses(val as string[])}
                    >
                        <div className="flex flex-col gap-2 w-full py-2">
                            {SAVING_STATUSES.map((item: string) => (
                                <Segment.Item key={item} value={item}>
                                    {({ active, onSegmentItemClick }) => {
                                        return (
                                            <SegmentItemOption
                                                hoverable
                                                active={active}
                                                className="w-full py-2"
                                                customCheck={<></>}
                                                data-tn={`saving-status-filter-${item.toLowerCase()}-opt`}
                                                onSegmentItemClick={
                                                    onSegmentItemClick
                                                }
                                            >
                                                <Checkbox
                                                    readOnly
                                                    checked={active}
                                                />
                                                <span className="text-sm">
                                                    {t(`savingStatus.${item}`)}
                                                </span>
                                            </SegmentItemOption>
                                        )
                                    }}
                                </Segment.Item>
                            ))}
                        </div>
                    </Segment>
                </AdaptableCard>
            </Drawer>
        </>
    )
}

const Savings = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false)
    const [selectedSaving, setSelectedSaving] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)
    const [filters, setFilters] = useState({
        statuses: ['IN_PROGRESS'],
    })
    const [searchByName, setSearchByName] = useState<string>('')

    const userState = useAppSelector((state) => state.auth.user)

    const { t, i18n } = useTranslation()

    const { bgTheme, textTheme } = useThemeClass()

    const {
        data: savings,
        isFetching: isLoadingSavings,
        refetch: refetchSavings,
    } = useQuery({
        queryKey: ['user-savings'],
        queryFn: async () => {
            return apiGetSavingList(filters)
        },
    })

    const {
        data: bankAccounts,
        isFetching: isLoadingBankAccounts,
        refetch: refetchBankAccounts,
    } = useQuery({
        queryKey: ['user-bank-accounts-by-savings'],
        queryFn: apiGetUserBankAccountList,
    })

    const onFormClose = () => {
        setIsFormOpen(false)
        setSelectedSaving(undefined)
    }

    const onMutationError = () => {
        toast.push(
            <Notification title={t('error.generic') || ''} type="danger" />,
            {
                placement: 'top-center',
            },
        )
    }
    const createSavingMutation = useMutation({
        mutationFn: apiCreateSaving,
        onSettled: async (data: any, error: Error | null) => {
            if (data.errors || error) {
                onMutationError()
            } else {
                await onMutationSuccess(t('notifications.saving.created') || '')
                onFormClose()
            }
        },
    })

    const updateSavingMutation = useMutation({
        mutationFn: apiUpdateSaving,
        onSettled: async (data: any, error: Error | null) => {
            if (data.errors || error) {
                onMutationError()
            } else {
                await onMutationSuccess(t('notifications.saving.updated') || '')
                onFormClose()
            }
        },
    })

    const deleteSavingMutation = useMutation({
        mutationFn: apiDeleteSaving,
        onSettled: async (data: any, error: Error | null) => {
            if (data.errors || error) {
                onMutationError()
            } else {
                await onMutationSuccess(t('notifications.saving.deleted') || '')
                onDeleteConfirmClose()
            }
        },
    })

    const onMutationSuccess = async (title: string) => {
        refetchSavings()
        refetchBankAccounts()
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const onDeleteConfirmClose = () => {
        setIsConfirmDeleteOpen(false)
        setSelectedSaving(undefined)
    }

    const onDelete = () => {
        deleteSavingMutation.mutate(selectedSaving.id)
    }

    const onFormSubmit = (newData: any) => {
        if (!selectedSaving?.id) {
            createSavingMutation.mutate(newData)
        } else {
            updateSavingMutation.mutate(newData)
        }
    }

    const onFilterChange = (newFilters: any) => {
        setFilters(() => {
            setTimeout(() => {
                refetchSavings()
            }, 100)
            return newFilters
        })
    }

    if (
        !savings ||
        isLoadingSavings ||
        !bankAccounts ||
        isLoadingBankAccounts
    ) {
        return (
            <div className="flex h-full mx-auto w-0" data-tn="savings-page">
                <Loading loading />
            </div>
        )
    }

    const filteredSavings = savings.filter((s: any) =>
        s.name.toLowerCase().includes(searchByName.toLowerCase()),
    )

    if (filteredSavings.length === 0) {
        return (
            <Container data-tn="savings-page">
                <div className="md:flex items-center justify-between mb-4">
                    <h2 className="my-2">{t('pages.savings.header')}</h2>
                    <div className="flex lg:items-center my-2">
                        <Input
                            value={searchByName}
                            placeholder={t('placeholders.searchByName')}
                            size="sm"
                            data-tn="search-saving-by-name"
                            prefix={<BiSearch className="text-md" />}
                            onChange={(e) => setSearchByName(e.target.value)}
                        />
                        <SavingFilter
                            defaultValue={filters}
                            onFilter={onFilterChange}
                        />
                    </div>
                </div>
                <EmptyState
                    title={t('pages.savings.emptyState.title')}
                    description={t('pages.savings.emptyState.description')}
                    data-tn="empty-state-no-savings"
                    bySearch={!!searchByName.length}
                >
                    <Button
                        variant="twoTone"
                        size="lg"
                        className="mt-4"
                        style={{ width: '300px' }}
                        icon={<HiPlus />}
                        data-tn="add-saving-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.savings.addSavingButton')}
                    </Button>
                </EmptyState>
                <SavingForm
                    isOpen={isFormOpen}
                    saving={selectedSaving}
                    isSaving={
                        createSavingMutation.isPending ||
                        updateSavingMutation.isPending
                    }
                    bankAccounts={bankAccounts}
                    onFormSubmit={onFormSubmit}
                    onFormClose={onFormClose}
                />
            </Container>
        )
    }

    return (
        <Container data-tn="savings-page">
            <div className="lg:flex items-center justify-between mb-4 my-2">
                <h2>{t('pages.savings.header')}</h2>
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <div className="flex my-2">
                        <Input
                            value={searchByName}
                            placeholder={t('placeholders.searchByName')}
                            size="sm"
                            data-tn="search-saving-by-name"
                            prefix={<BiSearch className="text-md" />}
                            onChange={(e) => setSearchByName(e.target.value)}
                        />
                        <SavingFilter
                            defaultValue={filters}
                            onFilter={onFilterChange}
                        />
                    </div>
                    <Button
                        variant="solid"
                        size="sm"
                        className="lg:ml-2 my-2"
                        icon={<HiPlus />}
                        data-tn="add-saving-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.savings.addSavingButton')}
                    </Button>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSavings.map((s: any) => (
                    <Card
                        key={s.id}
                        clickable
                        bodyClass="flex flex-col justify-between h-full"
                        data-tn={`saving-card-${s.id}`}
                        header={
                            <div className="flex justify-between">
                                <div className="grid grid-flow-col items-center">
                                    <TbPigMoney
                                        className={`mr-2 ${textTheme} w-8`}
                                        size={28}
                                    />
                                    <h6>{s.name}</h6>
                                </div>
                                <Dropdown
                                    placement="bottom-end"
                                    renderTitle={
                                        <EllipsisButton data-tn="dropdown-saving-btn" />
                                    }
                                >
                                    <Dropdown.Item
                                        eventKey="edit"
                                        data-tn="change-status-saving-btn"
                                        onClick={() => {
                                            setSelectedSaving(s)
                                            setIsChangeStatusOpen(true)
                                        }}
                                    >
                                        <IconText
                                            className="text-sm font-semibold w-full"
                                            icon={<HiOutlinePencilAlt />}
                                        >
                                            {t('actions.changeStatus')}
                                        </IconText>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        eventKey="edit"
                                        data-tn="edit-saving-btn"
                                        onClick={() => {
                                            setSelectedSaving(s)
                                            setIsFormOpen(true)
                                        }}
                                    >
                                        <IconText
                                            className="text-sm font-semibold w-full"
                                            icon={<HiOutlinePencilAlt />}
                                        >
                                            {t('actions.edit')}
                                        </IconText>
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        eventKey="delete"
                                        data-tn="delete-saving-btn"
                                        onClick={() => {
                                            setSelectedSaving(s)
                                            setIsConfirmDeleteOpen(true)
                                        }}
                                    >
                                        <IconText
                                            className="text-red-400 hover:text-red-600 text-sm font-semibold w-full"
                                            icon={<HiOutlineTrash />}
                                        >
                                            {t('actions.delete')}
                                        </IconText>
                                    </Dropdown.Item>
                                </Dropdown>
                            </div>
                        }
                    >
                        <div
                            onClick={() => {
                                setSelectedSaving(s)
                                setIsChangeStatusOpen(true)
                            }}
                        >
                            <div
                                className={`${bgTheme} text-white dark:text-white p-2 rounded-lg`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="py-4 px-2">
                                        <p className="font-light">
                                            {t('pages.savings.labels.goal')}:
                                        </p>
                                        <p className="text-2xl font-bold mt-2">
                                            {currencyFormat(
                                                s.targetAmount,
                                                s.currency.code,
                                                i18n.language,
                                                userState.country?.code,
                                            )}
                                        </p>
                                    </div>
                                    <SlWallet size={48} className="mr-2" />
                                </div>
                            </div>
                            {!['NOT_CONCLUDED', 'COMPLETED'].includes(
                                s.status,
                            ) ? (
                                <p className="mt-2">
                                    {t('pages.savings.labels.saved')}:
                                    <b className="ml-2">
                                        {currencyFormat(
                                            s.bankAccount.balance,
                                            s.currency.code,
                                            i18n.language,
                                            userState.country?.code,
                                        )}
                                    </b>
                                </p>
                            ) : (
                                <p className="mt-2 h-5"></p>
                            )}
                            <SavingStatus saving={s} />
                            <SavingExpiration saving={s} />
                            <div className="flex items-center mt-4">
                                <BankTag saving={s} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
            <ConfirmDialog
                isOpen={isConfirmDeleteOpen}
                type="danger"
                title={t('pages.savings.deleteConfirmation.title')}
                data-tn="confirm-saving-account-dialog"
                confirmButtonColor="red-600"
                confirmText={t('actions.delete')}
                cancelText={t('actions.cancel')}
                onClose={onDeleteConfirmClose}
                onRequestClose={onDeleteConfirmClose}
                onCancel={onDeleteConfirmClose}
                onConfirm={onDelete}
            >
                <p>
                    {t('pages.savings.deleteConfirmation.description', {
                        name: selectedSaving?.name,
                    })}
                </p>
            </ConfirmDialog>
            {!!selectedSaving && (
                <UpdateSavingStatusModal
                    isOpen={isChangeStatusOpen}
                    saving={selectedSaving}
                    onClose={() => {
                        setIsChangeStatusOpen(false)
                        setSelectedSaving(undefined)
                    }}
                    onSave={(newData: any) => {
                        setIsChangeStatusOpen(false)
                        setSelectedSaving(undefined)
                        updateSavingMutation.mutate(newData)
                    }}
                />
            )}
            <SavingForm
                isOpen={isFormOpen}
                saving={selectedSaving}
                isSaving={
                    createSavingMutation.isPending ||
                    updateSavingMutation.isPending
                }
                bankAccounts={bankAccounts}
                onFormSubmit={onFormSubmit}
                onFormClose={onFormClose}
            />
        </Container>
    )
}

export default Savings
