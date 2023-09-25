import React, { useState } from 'react'
import { FieldProps } from 'formik'
import { SelectOption } from '@/@types/common'
import { Select } from '@/components/ui'

interface SelectFieldItemProps extends SelectOption, FieldProps {}

function SelectFieldItem(props: SelectFieldItemProps) {
    const fieldName = props.field.name

    const defaultValue =
        props.options.find((o: unknown) => o.value === props.field.value) ||
        null

    const [value, setValue] = useState<SelectOption | SelectOption[] | null>(
        defaultValue,
    )

    return (
        <Select
            {...props}
            value={value}
            onChange={(option: SelectOption | SelectOption[] | null) => {
                props.form.setFieldValue(
                    fieldName,
                    !option
                        ? ''
                        : Array.isArray(option)
                        ? option.map((o) => o.value).join(',')
                        : option.value,
                )
                setValue(option ? option : null)
            }}
            onBlur={props.field.onBlur}
        />
    )
}

export default SelectFieldItem
