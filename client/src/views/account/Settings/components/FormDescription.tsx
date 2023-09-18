import type { ComponentPropsWithoutRef } from 'react'

interface FormDescriptionProps extends ComponentPropsWithoutRef<'div'> {
    title: string
    desc: string
}

const FormDescription = ({ title, desc, ...rest }: FormDescriptionProps) => {
    return (
        <div {...rest}>
            <h5>{title}</h5>
            <p>{desc}</p>
        </div>
    )
}

export default FormDescription
