import HorizontalMenuContent from './HorizontalMenuContent'
import useResponsive from '@/utils/hooks/useResponsive'
import { useAppSelector } from '@/store'

const HorizontalNav = () => {
    const mode = useAppSelector((state) => state.theme.mode)

    const { larger } = useResponsive()

    return <>{larger.md && <HorizontalMenuContent manuVariant={mode} />}</>
}

export default HorizontalNav
