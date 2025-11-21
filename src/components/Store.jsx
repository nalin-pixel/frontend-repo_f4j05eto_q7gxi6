import { useEffect, useState } from 'react'

export default function Store() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch(`${baseUrl}/api/miniapps`)
        const data = await res.json()
        if (data.ok) setApps(data.items)
        else setError('Failed to load apps')
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-xl font-semibold">Mini App Store</h3>
        <a href="https://forms.gle/" target="_blank" className="text-sm text-blue-300 underline">Submit your app</a>
      </div>
      {loading && <div className="text-blue-200">Loading...</div>}
      {error && <div className="text-rose-300">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map(app => (
          <a key={app.id} href={app.url} target="_blank" className="bg-slate-900/60 border border-blue-500/20 rounded-lg p-4 hover:border-blue-400/50 transition">
            <div className="flex items-center gap-3">
              {app.icon ? (
                <img src={app.icon} alt={app.name} className="w-10 h-10 rounded" />
              ) : (
                <div className="w-10 h-10 rounded bg-blue-500/30" />
              )}
              <div>
                <div className="text-white font-medium">{app.name}</div>
                <div className="text-blue-300/80 text-sm">{app.description}</div>
                {app.tags?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {app.tags.map(t => <span key={t} className="text-xs bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">{t}</span>)}
                  </div>
                ) : null}
              </div>
            </div>
          </a>
        ))}
        {!loading && !apps.length && !error && (
          <div className="text-blue-200">No apps yet. Be the first to submit one!</div>
        )}
      </div>
    </div>
  )
}
