import {
    HiBriefcase,
    HiOutlineCreditCard,
    HiOutlineHome,
    HiLibrary,
    HiOutlineAdjustments,
} from 'react-icons/hi'
import { FaCashRegister } from 'react-icons/fa'
import { TbPigMoney, TbCategory2 } from 'react-icons/tb'
import { RiHandCoinLine } from 'react-icons/ri'
import { MdAutoGraph } from 'react-icons/md'

export type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
    home: <HiOutlineHome />,
    expenses: <FaCashRegister />,
    savings: <TbPigMoney />,
    budgets: <MdAutoGraph />,
    configuration: <HiOutlineAdjustments />,
    creditCards: <HiOutlineCreditCard />,
    bankAccounts: <HiLibrary />,
    jobs: <HiBriefcase />,
    incomes: <RiHandCoinLine />,
    categories: <TbCategory2 />,
}

export default navigationIcon
