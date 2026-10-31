export function StaticBurst({ signal }: { signal: number }) { return signal ? <div key={signal} className="static-burst" aria-hidden="true"><i /><i /><i /></div> : null; }
