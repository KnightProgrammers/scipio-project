import { Suspense } from 'react'
import classNames from 'classnames'
import Container from '@/components/shared/Container'
import {
    PAGE_CONTAINER_GUTTER_X,
    PAGE_CONTAINER_GUTTER_Y,
} from '@/constants/theme.constant'
import type { CommonProps } from '@/@types/common'
import type { Meta } from '@/@types/routes'
import type { ElementType, ComponentPropsWithRef } from 'react'
import { useTranslation } from 'react-i18next'

export interface PageContainerProps extends CommonProps, Meta {
    contained?: boolean
}

const CustomHeader = <T extends ElementType>({
    header,
    ...props
}: {
    header: T
} & ComponentPropsWithRef<T>) => {
    const Header = header
    return <Header {...props} />
}

const PageContainer = (props: PageContainerProps) => {
    const {
        pageContainerType = 'default',
        children,
        header,
        contained = false,
        extraHeader,
    } = props

    const { t } = useTranslation()

    return (
        <div className="flex flex-auto flex-col justify-between overflow-hidden">
            <main className="h-[100vh] mb-8 overflow-y-auto">
                <div
                    className={classNames(
                        'page-container relative h-full flex flex-auto flex-col',
                        pageContainerType !== 'gutterless' &&
                            `${PAGE_CONTAINER_GUTTER_X} ${PAGE_CONTAINER_GUTTER_Y}`,
                        pageContainerType === 'contained' &&
                            'container mx-auto',
                    )}
                >
                    {(header || extraHeader) && (
                        <div
                            className={classNames(
                                contained &&
                                    'flex flex-auto flex-col h-[100vh] min-h-screen min-w-0 overflow-hidden relative w-full',
                            )}
                        >
                            <div>
                                {header && typeof header === 'string' && (
                                    <h3>{t(header)}</h3>
                                )}
                                <Suspense fallback={<div></div>}>
                                    {header && typeof header !== 'string' && (
                                        <CustomHeader header={header} />
                                    )}
                                </Suspense>
                            </div>
                            <Suspense fallback={<div></div>}>
                                {extraHeader &&
                                    typeof extraHeader !== 'string' && (
                                        <CustomHeader header={extraHeader} />
                                    )}
                            </Suspense>
                        </div>
                    )}
                    {pageContainerType === 'contained' ? (
                        <Container className="h-full">
                            <>{children}</>
                        </Container>
                    ) : (
                        <>{children}</>
                    )}
                </div>
            </main>
        </div>
    )
}

export default PageContainer
