import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    id?: string
    avatar?: string
    name?: string
    email?: string
    lang?: string
}

const initialState: UserState = {
    id: '',
    avatar: '',
    name: '',
    email: '',
    lang: '',
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.id = action.payload?.id
            state.avatar = action.payload?.avatar
            state.email = action.payload?.email
            state.name = action.payload?.name
            state.lang = action.payload?.lang
        },
    },
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
