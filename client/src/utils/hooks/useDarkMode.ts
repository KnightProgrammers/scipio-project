import { useEffect } from 'react'
import { THEME_ENUM } from '@/constants/theme.constant'
import { setDarkMode, useAppSelector, useAppDispatch, setMode } from '@/store'

function useDarkMode(): [
    darkModeOn: boolean,
    updateDarkMode: (isActive: boolean) => void,
] {
    const isEnabled = useAppSelector((state) => state.darkMode.isEnabled)
    const { MODE_DARK, MODE_LIGHT } = THEME_ENUM

    const dispatch = useAppDispatch()
    const updateDarkMode = (isActive: boolean) => {
        dispatch(setDarkMode(isActive))
    }

    useEffect(() => {
        if (window === undefined) {
            return
        }
        const root = window.document.documentElement
        root.classList.remove(isEnabled ? MODE_LIGHT : MODE_DARK)
        root.classList.add(isEnabled ? MODE_DARK : MODE_LIGHT)
        dispatch(setMode(isEnabled ? MODE_DARK : MODE_LIGHT))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled])

    return [isEnabled, updateDarkMode]
}

export default useDarkMode
