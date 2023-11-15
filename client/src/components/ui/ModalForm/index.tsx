import { Button, Dialog, FormContainer } from '@/components/ui'
import { Divider, Loading } from '@/components/shared'
import { Form, Formik, FormikErrors, FormikTouched, FormikValues } from 'formik'
import { useTranslation } from 'react-i18next'
import useThemeClass from '@/utils/hooks/useThemeClass'

type ModalFormProps = {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: unknown) => void
    entity: FormikValues
    fields: (
        errors: FormikErrors<unknown>,
        touched: FormikTouched<unknown>,
    ) => JSX.Element
    title: string
    isSaving: boolean
    validationSchema?: unknown | (() => unknown)
}

const ModalForm = (props: ModalFormProps) => {
    const {
        isOpen,
        title,
        entity,
        validationSchema,
        fields,
        onSubmit,
        onClose,
        isSaving = false,
    } = props

    const { t } = useTranslation()
    const { textTheme } = useThemeClass()

    return (
        <Dialog
            isOpen={isOpen}
            contentClassName="pb-0 px-0"
            preventScroll={false}
            onClose={onClose}
            onRequestClose={onClose}
        >
            <h5 className={`mb-4 px-4 ${textTheme} dark:${textTheme}`}>
                {title}
            </h5>
            <Divider />
            {isSaving ? (
                <div className="py-8">
                    <Loading loading={true} type="cover" />
                    <p className="text-center mt-8">{t('actions.saving')}...</p>
                </div>
            ) : (
                <Formik
                    initialValues={entity}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ touched, errors, submitForm }) => (
                        <Form className="mt-4">
                            <FormContainer className="px-4">
                                {fields(errors, touched)}
                            </FormContainer>
                            <div className="sm:flex gap-2 pb-4 px-4">
                                <Button
                                    className="w-full justify-center mb-2"
                                    variant="default"
                                    type="button"
                                    data-tn="modal-form-cancel-btn"
                                    disabled={isSaving}
                                    onClick={onClose}
                                >
                                    {t('actions.cancel')}
                                </Button>
                                <Button
                                    variant="solid"
                                    type="button"
                                    className="w-full justify-center mb-2"
                                    data-tn="modal-form-save-btn"
                                    disabled={isSaving}
                                    loading={isSaving}
                                    onClick={submitForm}
                                >
                                    {isSaving
                                        ? t('actions.saving')
                                        : t('actions.save')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            )}
        </Dialog>
    )
}

export default ModalForm
