import { WalletProvider, WalletPanel } from './components/Wallet'
import Transfer from './components/Transfer'
import Store from './components/Store'

function App() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]"></div>

        <div className="relative min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-3">
              <img src="/flame-icon.svg" alt="ViralCoin" className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">ViralCoin Mini Apps</h1>
            </div>
            <p className="text-blue-200/80 mt-2">Transfer funds from your Solana wallet and discover mini apps built by the community.</p>
          </header>

          <div className="space-y-6">
            <WalletPanel />
            <Transfer />
            <Store />
          </div>

          <footer className="mt-10 text-center text-blue-300/60 text-sm">
            Built for viralcoin.ai • Use at your own risk. Always verify addresses.
          </footer>
        </div>
      </div>
    </WalletProvider>
  )
}

export default App
