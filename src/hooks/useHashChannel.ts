import { useEffect } from 'react';
import { monitor } from '../store/useMonitor';
export function useHashChannel() {
  useEffect(() => {
    window.addEventListener('hashchange', monitor.syncHash);
    window.addEventListener('popstate', monitor.syncHash);
    return () => { window.removeEventListener('hashchange', monitor.syncHash); window.removeEventListener('popstate', monitor.syncHash); };
  }, []);
}
