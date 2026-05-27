import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setError(error.message); setLoading(false) }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center',
            justifyContent: 'center', background: 'var(--bg)', padding: 20
        }}>
            <div style={{
                background: 'var(--surface)', borderRadius: 20,
                padding: '48px 40px', width: '100%', maxWidth: 420,
                boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                border: '1px solid var(--border)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📝</div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>Вхід</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Раді бачити тебе знову</p>
                </div>

                <form onSubmit={handleLogin}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>
                        EMAIL
                    </label>
                    <input
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        style={{
                            display: 'block', width: '100%', marginBottom: 16,
                            padding: '12px 16px', border: '1.5px solid var(--border)',
                            borderRadius: 'var(--radius)', fontSize: 15, outline: 'none',
                            background: 'var(--bg)', transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />

                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>
                        ПАРОЛЬ
                    </label>
                    <input
                        placeholder="••••••••"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            display: 'block', width: '100%', marginBottom: 24,
                            padding: '12px 16px', border: '1.5px solid var(--border)',
                            borderRadius: 'var(--radius)', fontSize: 15, outline: 'none',
                            background: 'var(--bg)', transition: 'border-color 0.2s'
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />

                    {error && (
                        <div style={{
                            background: '#fff0f0', border: '1px solid #ffd0d0',
                            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                            fontSize: 13, color: 'var(--danger)'
                        }}>{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%', padding: '14px',
                            background: 'var(--text)', color: 'white',
                            border: 'none', borderRadius: 'var(--radius)',
                            fontSize: 15, fontWeight: 500,
                            opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s'
                        }}
                    >
                        {loading ? 'Входимо...' : 'Увійти'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
                    Немає акаунту?{' '}
                    <Link to="/register" style={{ color: 'var(--accent-dark)', fontWeight: 500, textDecoration: 'none' }}>
                        Реєстрація
                    </Link>
                </p>
            </div>
        </div>
    )
}
