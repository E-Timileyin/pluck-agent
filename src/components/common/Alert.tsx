import type { PropsWithChildren } from 'hono/jsx';
import './Alert.css';

export function Alert({ tone = 'info', children }: PropsWithChildren<{ tone?: 'error' | 'info' }>) {
  return (
    <p class={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      {children}
    </p>
  );
}

export default Alert;
