import { useToast } from './toast'

export function ToastHost() {
  const message = useToast()
  if (!message) return null
  return (
    <div className="toast" role="alert">
      {message}
    </div>
  )
}
