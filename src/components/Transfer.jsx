import { useState } from 'react'
import { useWallet } from './Wallet'

export default function Transfer() {
  const { provider, publicKey, network } = useWallet()
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const send = async () => {
    try {
      if (!provider) throw new Error('Wallet not available')
      if (!publicKey) throw new Error('Connect your wallet')
      const lamports = Math.round(parseFloat(amount) * 1_000_000_000)
      if (!to || !lamports || lamports <= 0) throw new Error('Enter a valid recipient and amount')

      setLoading(true)
      setResult(null)

      // Build and sign transaction via wallet provider
      // We use the wallet's signAndSendTransaction method (supported by Phantom)
      const { Connection, SystemProgram, Transaction, PublicKey, clusterApiUrl } = await import('@solana/web3.js')
      const rpc = network === 'mainnet-beta' ? 'https://api.mainnet-beta.solana.com' : clusterApiUrl(network)
      const connection = new Connection(rpc, 'confirmed')
      const fromPubkey = new PublicKey(publicKey)
      const toPubkey = new PublicKey(to)

      const tx = new Transaction().add(
        SystemProgram.transfer({ fromPubkey, toPubkey, lamports })
      )
      tx.feePayer = fromPubkey
      const { blockhash } = await connection.getLatestBlockhash()
      tx.recentBlockhash = blockhash

      const signed = await provider.signAndSendTransaction(tx)
      const signature = signed.signature || signed

      // Optionally confirm
      await connection.confirmTransaction(signature, 'confirmed')

      setResult({ ok: true, signature })

      // Log to backend
      try {
        await fetch(`${baseUrl}/api/transfers/log`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from_pubkey: publicKey, to_pubkey: to, amount_sol: parseFloat(amount), signature, network })
        })
      } catch {}

    } catch (e) {
      setResult({ ok: false, error: e.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-6 space-y-4">
      <h3 className="text-white text-xl font-semibold">Quick Transfer</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-blue-200/80 text-sm">Recipient Address</label>
          <input value={to} onChange={e=>setTo(e.target.value)} placeholder="Enter Solana address" className="mt-1 w-full bg-slate-900 text-blue-100 px-3 py-2 rounded border border-blue-500/30" />
        </div>
        <div>
          <label className="text-blue-200/80 text-sm">Amount (SOL)</label>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" className="mt-1 w-full bg-slate-900 text-blue-100 px-3 py-2 rounded border border-blue-500/30" />
        </div>
      </div>
      <button disabled={loading} onClick={send} className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded">
        {loading ? 'Sending...' : 'Send SOL'}
      </button>
      {result && (
        <div className="text-sm text-blue-200/90">
          {result.ok ? (
            <div>
              Sent! Signature: <a className="underline" target="_blank" href={`https://solscan.io/tx/${result.signature}${network!=='mainnet-beta'?`?cluster=${network}`:''}`}>{result.signature}</a>
            </div>
          ) : (
            <div className="text-rose-300">Error: {result.error}</div>
          )}
        </div>
      )}
    </div>
  )
}
