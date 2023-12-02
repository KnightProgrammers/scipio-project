import { ReactNode, useCallback } from 'react'
import useDarkMode from '@/utils/hooks/useDarkMode'
import Switcher from '@/components/ui/Switcher'
import { RiMoonClearLine, RiSunLine } from 'react-icons/ri'

const withIcon = (component: ReactNode) => {
    return <div className="text-lg">{component}</div>
}

const ModeSwitcher = () => {
    const [darkModeOn, updateDarkMode] = useDarkMode()

    const onSwitchChange = useCallback(
        (checked: boolean) => {
            updateDarkMode(checked)
        },
        [updateDarkMode],
    )

    return (
        <div>
            <Switcher
                defaultChecked={darkModeOn}
                unCheckedContent={withIcon(<RiSunLine />)}
                checkedContent={withIcon(<RiMoonClearLine />)}
                onChange={(checked) => onSwitchChange(checked)}
            />
        </div>
    )
}

export default ModeSwitcher
