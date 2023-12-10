import { forwardRef } from 'react'
import classNames from 'classnames'
import Tag from '@/components/ui/Tag'
import { HiArrowUp, HiArrowDown } from 'react-icons/hi'
import growShrinkColor from '@/utils/growShrinkColor'
import type { ReactNode } from 'react'

type GrowShrinkTagProps = {
    value?: number | string
    showIcon?: boolean
    valuation: 1 | -1 | 0
    prefix?: ReactNode | string
    suffix?: ReactNode | string
    inverse?: boolean
    className?: string
}

const GrowShrinkTag = forwardRef<HTMLDivElement, GrowShrinkTagProps>(
    (props, ref) => {
        const {
            value = 0,
            valuation,
            className,
            prefix,
            suffix,
            inverse = false,
            showIcon = true,
        } = props

        return (
            <Tag
                ref={ref}
                className={classNames(
                    'gap-1 font-bold border-0',
                    growShrinkColor(valuation, 'text'),
                    growShrinkColor(valuation, 'bg'),
                    className,
                )}
            >
                <span>
                    {showIcon &&
                        valuation > 0 &&
                        (inverse ? <HiArrowDown /> : <HiArrowUp />)}
                    {showIcon &&
                        valuation < 0 &&
                        (inverse ? <HiArrowUp /> : <HiArrowDown />)}
                </span>
                {
                    !!value && <span>
                        {prefix}
                            {value}
                            {suffix}
                    </span>
                }
            </Tag>
        )
    },
)

GrowShrinkTag.displayName = 'GrowShrinkTag'

export default GrowShrinkTag
