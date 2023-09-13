import ConfigProvider from '@/components/ui/ConfigProvider'
import type { CommonProps } from '@/@types/common'
import { themeConfig } from '@/configs/theme.config'
import { useAppSelector } from '@/store'
import { THEME_ENUM } from '@/constants/theme.constant'
import useDarkMode from '@/utils/hooks/useDarkMode'

const Theme = (props: CommonProps) => {
    useDarkMode()
    const theme = useAppSelector((state) => state.theme)
    const darkModeOn = useAppSelector((state) => state.darkMode.isEnabled)
    const locale = useAppSelector((state) => state.locale.currentLang)

    const currentTheme = {
        ...themeConfig,
        ...theme,
        mode: darkModeOn ? THEME_ENUM.MODE_DARK : THEME_ENUM.MODE_LIGHT,
        navMode: darkModeOn ? THEME_ENUM.NAV_MODE_DARK : THEME_ENUM.MODE_LIGHT,
        ...{ locale },
    }

    return (
        <ConfigProvider value={currentTheme}>{props.children}</ConfigProvider>
    )
}

export default Theme
