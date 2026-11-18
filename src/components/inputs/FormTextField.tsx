import {
  type Control,
  type FieldPath,
  type FieldValues,
  useController,
  type UseControllerProps,
} from 'react-hook-form'

import { TextField, type TextFieldProps } from '@mui/material'

type FormTextFieldProps<Form extends FieldValues, Output> = Omit<
  TextFieldProps,
  'error' | 'name' | 'onChange' | 'value'
> & {
  control: Control<Form, unknown, Output>
  name: FieldPath<Form>
  parse?: (value: string) => unknown
  rules?: UseControllerProps<Form, FieldPath<Form>, Output>['rules']
}

const FormTextField = <Form extends FieldValues, Output = Form>({
  control,
  name,
  parse,
  rules,
  helperText,
  onBlur,
  ...props
}: FormTextFieldProps<Form, Output>) => {
  const { field, fieldState } = useController({ control, name, rules })
  return (
    <TextField
      {...field}
      {...props}
      error={fieldState.invalid}
      helperText={fieldState.error?.message ?? helperText}
      onBlur={(event) => {
        field.onBlur()
        onBlur?.(event)
      }}
      onChange={({ target: { value } }) =>
        field.onChange(parse ? parse(value) : value)
      }
      value={Number.isNaN(field.value) ? '' : (field.value ?? '')}
    />
  )
}

export default FormTextField
