import { useState, type FormEvent } from 'react'
import { Modal } from '../../shared/Modal'
import { useIsAdmin, useLogin, useLogout } from './auth.api'

export function AuthControl() {
  const isAdmin = useIsAdmin()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const login = useLogin()
  const logout = useLogout()

  const close = () => {
    setOpen(false)
    setPassword('')
    login.reset()
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    login.mutate(password, { onSuccess: close })
  }

  if (isAdmin) {
    return (
      <button type="button" className="auth-btn" onClick={() => logout.mutate()}>
        DÉCONNEXION
      </button>
    )
  }

  return (
    <>
      <button type="button" className="auth-btn" onClick={() => setOpen(true)}>
        ADMIN
      </button>
      {open && (
        <Modal title="CONNEXION" zIndex={130} onClose={close} className="action-modal-content">
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label" htmlFor="adminPassword">
                MOT DE PASSE
              </label>
              <input
                id="adminPassword"
                type="password"
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {login.isError && (
              <p className="form-error" role="alert">
                {login.error.message}
              </p>
            )}
            <button type="submit" className="btn-submit" disabled={login.isPending}>
              {login.isPending ? 'CONNEXION...' : 'SE CONNECTER'}
            </button>
          </form>
        </Modal>
      )}
    </>
  )
}
