import { Button, Card, Dropdown, Progress } from "@/components/ui";
import { HiCheckCircle, HiOutlinePencilAlt, HiOutlineTrash, HiPlus, HiXCircle } from "react-icons/hi";
import { ConfirmDialog, Container, EllipsisButton, IconText, Loading } from "@/components/shared";
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const Savings = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedSaving, setSelectedSaving] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)

    const { t } = useTranslation()

    const onDeleteConfirmClose = () => {

    }

    const onDelete = () => {

    }

    const loading = false

    if (loading) {
        return (
            <div className="flex h-full mx-auto w-0" data-tn="savings-page">
                <Loading loading />
            </div>
        )
    }

    const savings: any[] = [{}, {}, {}]

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
                {savings.map((s: any, index: number) => (
                    <Card key={index} bodyClass="flex flex-col justify-between h-full">
                        <div className="flex justify-between">
                            <h6>Saving #{index + 1}</h6>
                            <Dropdown
                                placement="bottom-end"
                                renderTitle={
                                    <EllipsisButton data-tn="dropdown-bank-account-btn" />
                                }
                            >
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
                                        icon={
                                            <HiOutlinePencilAlt />
                                        }
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
                                        icon={
                                            <HiOutlineTrash />
                                        }
                                    >
                                        {t('actions.delete')}
                                    </IconText>
                                </Dropdown.Item>
                            </Dropdown>
                        </div>
                        <p className="mt-4">
                            It is not about bits, bytes and protocols, but profits, losses and margins.
                        </p>
                        <div className="mt-4">
                            <Progress
                                color="green-500"
                                percent={Math.round(Math.random() * 100)}
                                customInfo={
                                    (Math.round(Math.random()))
                                        ? <HiCheckCircle className="text-emerald-500 text-xl" />
                                        : <HiXCircle className="text-red-500 text-xl" />
                                }
                            />
                            <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center rounded-full font-semibold text-xs">
                                    <div className="flex items-center px-2 py-1 border border-gray-300 rounded-full">

                                        <span className="ml-1 rtl:mr-1 whitespace-nowrap">27 / 32</span>
                                    </div>
                                </div>
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
        </Container>
    )
}

export default Savings
