import { Link } from 'react-router-dom'
import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

export type HorizontalMenuNavLinkProps = PropsWithChildren<{
    path: string
    isExternalLink?: boolean
    className?: string
    'data-tn'?: string
}>

const HorizontalMenuNavLink = (props: HorizontalMenuNavLinkProps) => {
    const {
        path,
        children,
        isExternalLink,
        className,
    } = props;
    return (
        <Link
            className={classNames('h-full w-full flex items-center', className)}
            data-tn={props['data-tn']}
            to={path}
            target={isExternalLink ? '_blank' : ''}
        >
            <>{children}</>
        </Link>
    )
}

export default HorizontalMenuNavLink
