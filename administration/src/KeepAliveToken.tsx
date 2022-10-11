import { Button, Classes, Dialog } from '@blueprintjs/core'
import React, { ReactNode, useContext, useEffect, useState } from 'react'
import { AuthContext, AuthData } from './AuthProvider'
import { useAppToaster } from './components/AppToaster'
import { SignInPayload, useSignInMutation } from './generated/graphql'
import PasswordInput from './components/PasswordInput'
import { ProjectConfigContext } from './project-configs/ProjectConfigContext'

interface Props {
  authData: AuthData
  children: ReactNode
  onSignIn: (payload: SignInPayload) => void
  onSignOut: () => void
}

const computeSecondsLeft = (authData: AuthData) => Math.round((authData.expiry.valueOf() - Date.now()) / 1000)

const KeepAliveToken = (props: Props) => {
  const projectId = useContext(ProjectConfigContext).projectId
  const email = useContext(AuthContext).data!.administrator.email
  const [secondsLeft, setSecondsLeft] = useState(computeSecondsLeft(props.authData))
  useEffect(() => {
    setSecondsLeft(computeSecondsLeft(props.authData))
    const interval = setInterval(() => {
      const timeLeft = computeSecondsLeft(props.authData)
      setSecondsLeft(Math.max(timeLeft, 0))
      if (timeLeft <= 0) {
        props.onSignOut()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [props.authData, props.onSignOut])
  const appToaster = useAppToaster()

  const [password, setPassword] = useState('')

  const [signIn, mutationState] = useSignInMutation({
    onCompleted: payload => {
      appToaster?.show({ intent: 'success', message: 'Login-Zeitraum verlängert.' })
      props.onSignIn(payload.signInPayload)
      setPassword('')
    },
    onError: () => appToaster?.show({ intent: 'danger', message: 'Etwas ist schief gelaufen.' }),
  })
  const extendLogin = () => signIn({ variables: { project: projectId, authData: { email, password } } })

  return (
    <>
      {props.children}
      <Dialog
        isOpen={secondsLeft <= 180}
        title={'Ihr Login-Zeitraum läuft ab!'}
        icon={'warning-sign'}
        isCloseButtonShown={false}>
        <form onSubmit={extendLogin}>
          <div className={Classes.DIALOG_BODY}>
            <p>Ihr Login-Zeitraum läuft in {secondsLeft} Sekunden ab. Danach werden Sie automatisch ausgeloggt.</p>
            <p>Geben Sie Ihr Passwort ein, um den Login-Zeitraum zu verlängern.</p>
            <PasswordInput label='' placeholder={'Passwort'} setValue={setPassword} value={password} />
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button onClick={props.onSignOut} loading={mutationState.loading}>
                Ausloggen
              </Button>
              <Button
                intent={'primary'}
                type='submit'
                loading={mutationState.loading}
                text='Login-Zeitraum verlängern'
              />
            </div>
          </div>
        </form>
      </Dialog>
    </>
  )
}

export default KeepAliveToken
