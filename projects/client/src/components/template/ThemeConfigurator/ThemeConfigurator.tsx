import ModeSwitcher from './ModeSwitcher'
import LayoutSwitcher from './LayoutSwitcher'
import ThemeSwitcher from './ThemeSwitcher'
import NavModeSwitcher from './NavModeSwitcher'

const ThemeConfigurator = () => {
    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col gap-y-10 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h6>Dark Mode</h6>
                        <span>Switch theme to dark mode</span>
                    </div>
                    <ModeSwitcher />
                </div>
                <div>
                    <h6 className="mb-3">Nav Mode</h6>
                    <NavModeSwitcher />
                </div>
                <div>
                    <h6 className="mb-3">Theme</h6>
                    <ThemeSwitcher />
                </div>
                <div>
                    <h6 className="mb-3">Layout</h6>
                    <LayoutSwitcher />
                </div>
            </div>
        </div>
    )
}

export default ThemeConfigurator
