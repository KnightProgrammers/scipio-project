import React from "react";
import Avatar from "../ui/Avatar";
import type { ControlProps } from 'react-select'
import { components } from "react-select";

const { Control } = components

const CustomControl = ({
                         children,
                         ...props
                       }: ControlProps<LanguageOption>) => {
  const selected = props.getValue()[0]
  return (
    <Control {...props}>
      {selected && (
        <Avatar
          className="ltr:ml-4 rtl:mr-4"
          shape="circle"
          size={18}
          src={selected.imgPath}
        />
      )}
      {children}
    </Control>
  )
}

export default CustomControl
