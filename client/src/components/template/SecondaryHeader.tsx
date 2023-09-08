import classNames from 'classnames'
import HorizontalMenuContent from '@/components/template/HorizontalMenuContent'
import useResponsive from '@/utils/hooks/useResponsive'
import { useAppSelector } from '@/store'
import type { CommonProps } from '@/@types/common'

interface SecondaryHeaderProps extends CommonProps {
    contained: boolean
}

const SecondaryHeader = (props: SecondaryHeaderProps) => {
    const { className, contained } = props

    const mode = useAppSelector((state) => state.theme.mode)

    const { larger } = useResponsive()

    return (
        <>
            {larger.md && (
                <div
                    className={classNames(
                        'h-16 flex items-center',
                        `secondary-header-${mode}`,
                        className
                    )}
                >
                    <div
                        className={classNames(
                            'flex items-center px-4',
                            contained && 'container mx-auto'
                        )}
                    >
                        <HorizontalMenuContent manuVariant={mode} />
                    </div>
                </div>
            )}
        </>
    )
}

export default SecondaryHeader
