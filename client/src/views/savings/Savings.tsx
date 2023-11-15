import {
    Alert,
    Avatar,
    Button,
    Card,
    Dialog,
    Dropdown,
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
    ConfirmDialog,
    Container,
    EllipsisButton,
    IconText,
    Loading,
    SegmentItemOption,
} from '@/components/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { apiGetSavingList } from '@/services/SavingService'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import currencyFormat from '@/utils/currencyFormat'
import { useAppSelector } from '@/store'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { TbPigMoney } from 'react-icons/tb'
import { SlWallet } from 'react-icons/sl'
import { LuTimer } from 'react-icons/lu'
import { DateTime } from 'luxon'
import { HiFire } from 'react-icons/hi2'

const BankTag = (props: { saving: any }) => {
    const { saving } = props
    const { currency, bankAccount } = saving
    const { bank, accountNumber } = bankAccount

    const { bgTheme } = useThemeClass()
    return (
        <div>
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
        </div>
    )
}

const SavingExpiration = (props: { saving: any }) => {
    const { saving } = props
    const { status, targetDate } = saving

    if (status === 'COMPLETED') {
        return (
            <Alert
                showIcon
                type="success"
                className="mt-2"
                customIcon={<HiCheckCircle />}
            >
                Completado
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
                No Completado
            </Alert>
        )
    }

    if (status === 'EXPIRED') {
        return (
            <Alert
                showIcon
                type="danger"
                className="mt-2"
                customIcon={<HiFire />}
            >
                <b>Expired on:</b>{' '}
                {DateTime.fromISO(targetDate).toFormat('dd/MM/yyyy')}
            </Alert>
        )
    }

    return (
        <Alert showIcon type="info" className="mt-2" customIcon={<LuTimer />}>
            <b>Expiration:</b>{' '}
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
    onSave: () => void
}) => {
    const { isOpen, saving, onClose, onSave } = props

    const [newStatus, setNewStatus] = useState<string>(saving.status)

    const SAVING_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'NOT_CONCLUDED']

    return (
        <Dialog
            isOpen={isOpen}
            width={400}
            onClose={onClose}
            onRequestClose={onClose}
        >
            <h5 className="mb-4">Change Status - {saving.name}</h5>
            <p>Select the new status</p>
            <Segment
                value={newStatus}
                selectionType="single"
                className="mt-2"
                onChange={(val) => setNewStatus(val as string)}
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
                                            {savingStatus}
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
                    Cancel
                </Button>
                <Button variant="solid" onClick={onSave}>
                    Save
                </Button>
            </div>
        </Dialog>
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

    const userState = useAppSelector((state) => state.auth.user)

    const { t, i18n } = useTranslation()

    const { bgTheme, textTheme } = useThemeClass()

    const {
        data: savings,
        isFetching: isLoadingSavings,
        refetch: refetchSavings,
    } = useQuery({
        queryKey: ['user-savings'],
        queryFn: apiGetSavingList,
    })

    const onMutationSuccess = async (title: string) => {
        refetchSavings()
        toast.push(<Notification title={title} type="success" />, {
            placement: 'top-center',
        })
    }

    const onDeleteConfirmClose = () => {}

    const onDelete = () => {}

    if (!savings || isLoadingSavings) {
        return (
            <div className="flex h-full mx-auto w-0" data-tn="savings-page">
                <Loading loading />
            </div>
        )
    }

    return (
        <Container data-tn="savings-page">
            <div className="lg:flex items-center justify-between mb-4">
                <h2>{t('pages.savings.header')}</h2>
                <div className="flex flex-col lg:flex-row lg:items-center">
                    <Button
                        variant="solid"
                        size="sm"
                        className="mt-4"
                        icon={<HiPlus />}
                        data-tn="add-category-btn"
                        onClick={() => setIsFormOpen(true)}
                    >
                        {t('pages.savings.addSavingButton')}
                    </Button>
                </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {savings.map((s: any) => (
                    <Card
                        key={s.id}
                        clickable
                        bodyClass="flex flex-col justify-between h-full"
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
                                        <EllipsisButton data-tn="dropdown-bank-account-btn" />
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
                                        <p className="font-light">Goal:</p>
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
                                    Saved:
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
                            <div className="flex flex-col justify-between mt-4">
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
                        saving: selectedSaving?.name,
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
                    onSave={() => {
                        setIsChangeStatusOpen(false)
                        setSelectedSaving(undefined)
                    }}
                />
            )}
        </Container>
    )
}

export default Savings
