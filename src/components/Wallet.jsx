import { useEffect, useState, createContext, useContext } from 'react'

const RPC_ENDPOINTS = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  devnet: 'https://api.devnet.solana.com',
  testnet: 'https://api.testnet.solana.com',
}

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [provider, setProvider] = useState(null)
  const [publicKey, setPublicKey] = useState(null)
  const [network, setNetwork] = useState('mainnet-beta')

  useEffect(() => {
    const detect = () => {
      const anyWindow = window
      if (anyWindow?.solana?.isPhantom) return anyWindow.solana
      if (anyWindow?.solana) return anyWindow.solana
      return null
    }
    const p = detect()
    setProvider(p)

    // auto-connect if already trusted
    if (p?.isPhantom) {
      p.connect({ onlyIfTrusted: true }).then(({ publicKey }) => {
        if (publicKey) setPublicKey(publicKey.toBase58())
      }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!provider) return
    const handleConnect = ({ publicKey }) => setPublicKey(publicKey?.toBase58())
    const handleDisconnect = () => setPublicKey(null)
    provider.on('connect', handleConnect)
    provider.on('disconnect', handleDisconnect)
    return () => {
      try {
        provider?.removeListener('connect', handleConnect)
        provider?.removeListener('disconnect', handleDisconnect)
      } catch {}
    }
  }, [provider])

  const connect = async () => {
    if (!provider) throw new Error('No Solana wallet found. Install Phantom to continue.')
    const res = await provider.connect()
    setPublicKey(res.publicKey.toBase58())
  }

  const disconnect = async () => {
    if (!provider) return
    await provider.disconnect()
    setPublicKey(null)
  }

  return (
    <WalletContext.Provider value={{ provider, publicKey, connect, disconnect, network, setNetwork, rpc: RPC_ENDPOINTS[network] }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}

export function WalletPanel() {
  const { provider, publicKey, connect, disconnect, network, setNetwork } = useWallet()
  return (
    <div className="w-full bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <div className="text-sm text-blue-200/80">Network</div>
        <select value={network} onChange={(e)=>setNetwork(e.target.value)} className="mt-1 bg-slate-900 text-blue-100 px-3 py-2 rounded border border-blue-500/30">
          <option value="mainnet-beta">Mainnet</option>
          <option value="devnet">Devnet</option>
          <option value="testnet">Testnet</option>
        </select>
      </div>
      <div className="flex-1 text-center">
        {publicKey ? (
          <div className="text-blue-100 text-sm truncate">{publicKey}</div>
        ) : (
          <div className="text-blue-300/70 text-sm">No wallet connected</div>
        )}
      </div>
      <div>
        {publicKey ? (
          <button onClick={disconnect} className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded">Disconnect</button>
        ) : (
          <button onClick={connect} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Connect Wallet</button>
        )}
      </div>
      {!provider && (
        <a href="https://phantom.app/" target="_blank" className="ml-2 text-blue-300 underline text-sm">Get Phantom</a>
      )}
    </div>
  )
}
