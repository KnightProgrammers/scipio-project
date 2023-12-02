import { createSlice } from '@reduxjs/toolkit'
import appConfig from '@/configs/app.config'

export type DarkModeState = {
    isEnabled: boolean
}

const initialState: DarkModeState = {
    isEnabled: appConfig.darkMode,
}

export const darkModeSlice = createSlice({
    name: 'darkMode',
    initialState,
    reducers: {
        setDarkMode: (state, action) => {
            state.isEnabled = action.payload
        },
    },
})

export const { setDarkMode } = darkModeSlice.actions

export default darkModeSlice.reducer
