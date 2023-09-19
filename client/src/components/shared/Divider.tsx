type DividerProps = {
    label?: string
    className?: string
}

const Divider = (props: DividerProps) => {
    const { label, className } = props
    if (label) {
        return (
            <div className={`grid grid-cols-4 gap-4 items-center ${className}`}>
                <div className="border-gray-300 border-t my-2 xs:none"></div>
                <span className="col-span-2">{label}</span>
                <div className="border-gray-300 border-t my-2 xs:none"></div>
            </div>
        )
    } else {
        return (
            <div className={`border-gray-300 border-t my-2 ${className}`}></div>
        )
    }
}

export default Divider
