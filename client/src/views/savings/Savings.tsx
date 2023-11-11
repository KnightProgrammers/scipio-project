import { Button } from "@/components/ui";
import { HiPlus } from "react-icons/hi";
import { Container, Loading } from "@/components/shared";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const Savings = () => {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedSaving, setSelectedSaving] = useState<any | undefined>(
        undefined,
    )
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] =
        useState<boolean>(false)

    const { t } = useTranslation()

    const loading = false;

    if (loading) {
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
        </Container>
    )
}

export default Savings
