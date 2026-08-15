import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate('/customers');
    } catch {
      setError('Usuário ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-main)' }}>

      {/* Painel esquerdo — marca */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white relative overflow-hidden"
        style={{ background: 'var(--brand-green)' }}>

        {/* Textura de fundo */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, #F7B52C 1px, transparent 1px), radial-gradient(circle at 80% 80%, #E86725 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'var(--brand-orange)' }}>
              🐾
            </div>
            <span className="font-black text-3xl tracking-tight" style={{ fontFamily: 'Nunito, sans-serif' }}>
              Com<span style={{ color: 'var(--brand-yellow)' }}>Pet</span>
            </span>
          </div>
          <p className="text-white/50 text-sm font-medium tracking-widest uppercase">Petshop</p>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-black leading-tight mb-4" style={{ fontFamily: 'Nunito, sans-serif' }}>
            Gerencie seu<br />
            <span style={{ color: 'var(--brand-yellow)' }}>petshop</span><br />
            com facilidade
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-sm">
            A gente entende o que não se fala.
          </p>
        </div>

        <div className="relative flex gap-6">
          {[['🐕', 'Cães'], ['🐈', 'Gatos'], ['🐾', 'Todos os pets']].map(([emoji, label]) => (
            <div key={label} className="flex items-center gap-2 text-sm text-white/60">
              <span>{emoji}</span> {label}
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--brand-orange)' }}>
              🐾
            </div>
            <span className="font-black text-2xl" style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--brand-green)' }}>
              Com<span style={{ color: 'var(--brand-orange)' }}>Pet</span>
            </span>
          </div>

          <h1 className="text-2xl font-black mb-1" style={{ fontFamily: 'Nunito, sans-serif', color: 'var(--brand-green)' }}>
            Bem-vindo de volta
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Entre com suas credenciais para acessar o sistema
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--brand-green)' }}>
                Usuário
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '2px solid var(--border)',
                  background: 'var(--bg-white)',
                  color: 'var(--text-main)',
                  fontFamily: 'Nunito Sans, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--brand-green)' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={{
                  border: '2px solid var(--border)',
                  background: 'var(--bg-white)',
                  color: 'var(--text-main)',
                  fontFamily: 'Nunito Sans, sans-serif',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--brand-orange)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div className="text-sm px-4 py-3 rounded-xl"
                style={{ background: '#FEE2E2', color: '#991B1B' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all mt-2"
              style={{
                background: loading ? 'var(--brand-orange-light)' : 'var(--brand-orange)',
                fontFamily: 'Nunito, sans-serif',
                boxShadow: '0 4px 14px rgba(232,103,37,0.35)',
              }}
              onMouseEnter={e => !loading && ((e.target as HTMLElement).style.background = 'var(--brand-orange-dark)')}
              onMouseLeave={e => !loading && ((e.target as HTMLElement).style.background = 'var(--brand-orange)')}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}