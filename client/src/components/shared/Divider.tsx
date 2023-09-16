type DividerProps = {
    label?: string
}

const Divider = (props: DividerProps) => {
    const { label } = props
    if (label) {
        return (
            <div className="grid grid-cols-4 gap-4 items-center">
                <div className="border-gray-300 border-t my-2 xs:none"></div>
                <span className="col-span-2">{label}</span>
                <div className="border-gray-300 border-t my-2 xs:none"></div>
            </div>
        )
    } else {
        return <div className="border-gray-300 border-t my-2"></div>
    }
}

export default Divider
