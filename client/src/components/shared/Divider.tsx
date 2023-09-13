type DividerProps = {
    label?: string
}

const Divider = (props: DividerProps) => {
    const { label } = props
    if (label) {
        return (
            <div className="grid grid-cols-3 gap-4 items-center">
                <div className="border-gray-300 border-t my-2"></div>
                <span className="">{label}</span>
                <div className="border-gray-300 border-t my-2"></div>
            </div>
        )
    } else {
        return <div className="border-gray-300 border-t my-2"></div>
    }
}

export default Divider
