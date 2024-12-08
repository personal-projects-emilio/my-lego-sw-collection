import { type FC, useState } from 'react'
import { Controller, type SubmitHandler, useForm } from 'react-hook-form'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from '@mui/material'
import { useAuth } from 'providers'
import { makeStyles } from 'tss-react/mui'
import { authValidationSchema, type LoginInputs } from 'types/auth'

const useStyles = makeStyles({ name: 'Auth' })((theme) => ({
  container: {
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    boxSizing: 'border-box',
    display: 'grid',
    gap: theme.spacing(2),
  },
  button: {
    justifySelf: 'center',
  },
}))

const Auth: FC = () => {
  const { classes } = useStyles()
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading } = useAuth()
  const { control, handleSubmit } = useForm<LoginInputs>({
    defaultValues: {
      email: '',
      password: '',
    },
    resolver: zodResolver(authValidationSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const onSubmit: SubmitHandler<LoginInputs> = (data) => login(data)

  return (
    <Paper
      className={classes.container}
      component="form"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => {
          return (
            <TextField
              {...field}
              autoComplete="username"
              error={fieldState.invalid}
              fullWidth
              helperText={fieldState.error?.message}
              id="email"
              label="Email"
              placeholder="Email@exemple.com"
              required
            />
          )
        }}
      />
      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => {
          return (
            <TextField
              {...field}
              autoComplete="current-password"
              error={fieldState.invalid}
              fullWidth
              helperText={fieldState.error?.message}
              id="password"
              label="Password"
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              type={showPassword ? 'text' : 'password'}
            />
          )
        }}
      />
      <Button
        className={classes.button}
        color="primary"
        disabled={isLoading}
        type="submit"
        variant="contained"
      >
        Login
      </Button>
    </Paper>
  )
}

export default Auth
