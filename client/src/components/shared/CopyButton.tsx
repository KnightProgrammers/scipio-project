import { BiCopy } from 'react-icons/bi'
import { IconText } from '@/components/shared'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { useTranslation } from 'react-i18next'

const CopyButton = (props: { text: string }) => {
    const { text } = props
    const { t } = useTranslation()

    const onCopy = () => {
        navigator.clipboard.writeText(text)
        toast.push(
            <Notification
                title={t('notifications.textCopied') || ''}
                type="success"
            />,
            {
                placement: 'top-center',
            },
        )
    }

    return (
        <IconText icon={<BiCopy className="cursor-pointer" onClick={onCopy} />}>
            {text}
        </IconText>
    )
}

export default CopyButton
