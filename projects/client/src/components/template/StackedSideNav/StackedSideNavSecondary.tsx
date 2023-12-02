import Button from '@/components/ui/Button'
import ScrollBar from '@/components/ui/ScrollBar'
import classNames from 'classnames'
import {
    HEADER_HEIGHT_CLASS,
    DIR_LTR,
    DIR_RTL,
} from '@/constants/theme.constant'
import VerticalMenuContent from '@/components/template/VerticalMenuContent'
import { HiOutlineArrowSmLeft, HiOutlineArrowSmRight } from 'react-icons/hi'
import type { NavigationTree } from '@/@types/navigation'
import type { Direction, Mode } from '@/@types/theme'

type StackedSideNavSecondaryProps = {
    className?: string
    title: string
    menu?: NavigationTree[]
    routeKey: string
    onCollapse: () => void
    direction?: Direction
    mode: Mode
}

const StackedSideNavSecondary = (props: StackedSideNavSecondaryProps) => {
    const {
        className,
        title,
        menu,
        routeKey,
        onCollapse,
        direction,
        mode,
        ...rest
    } = props

    const handleCollpase = () => {
        onCollapse()
    }

    return (
        <div className={classNames('h-full', className)} {...rest}>
            <div
                className={`${HEADER_HEIGHT_CLASS} flex items-center justify-between gap-4 pl-6 pr-4`}
            >
                <h5 className="font-bold">{title}</h5>
                <Button
                    shape="circle"
                    variant="plain"
                    size="sm"
                    icon={
                        <>
                            {direction === DIR_LTR && <HiOutlineArrowSmLeft />}
                            {direction === DIR_RTL && <HiOutlineArrowSmRight />}
                        </>
                    }
                    onClick={handleCollpase}
                />
            </div>
            <ScrollBar autoHide direction={direction}>
                <VerticalMenuContent
                    routeKey={routeKey}
                    navigationTree={menu}
                    mode={mode}
                />
            </ScrollBar>
        </div>
    )
}

export default StackedSideNavSecondary
