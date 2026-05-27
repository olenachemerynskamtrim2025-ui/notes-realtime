import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) setMessage(error.message)
        else setMessage('✉️ Перевір пошту для підтвердження!')
        setLoading(false)
    }

    const inputStyle = {
        display: 'block', width: '100%', marginBottom: 16,
        padding: '12px 16px', border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)', fontSize: 15, outline: 'none',
        background: 'var(--bg)', transition: 'border-color 0.2s'
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
                    <div style={{ fontSize: 36, marginBottom: 8 }}>✨</div>
                    <h1 style={{ fontSize: 28, marginBottom: 6 }}>Реєстрація</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Створи свій акаунт</p>
                </div>

                <form onSubmit={handleRegister}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>EMAIL</label>
                    <input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
                           onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                           onBlur={e => e.target.style.borderColor = 'var(--border)'} />

                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--text-muted)' }}>ПАРОЛЬ</label>
                    <input placeholder="••••••••" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: 24 }}
                           onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                           onBlur={e => e.target.style.borderColor = 'var(--border)'} />

                    {message && (
                        <div style={{
                            background: message.includes('✉️') ? '#f0fff4' : '#fff0f0',
                            border: `1px solid ${message.includes('✉️') ? '#c0e8d0' : '#ffd0d0'}`,
                            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                            fontSize: 13, color: message.includes('✉️') ? 'var(--green)' : 'var(--danger)'
                        }}>{message}</div>
                    )}

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '14px',
                        background: 'var(--text)', color: 'white',
                        border: 'none', borderRadius: 'var(--radius)',
                        fontSize: 15, fontWeight: 500,
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Створюємо...' : 'Зареєструватись'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }}>
                    Вже є акаунт?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-dark)', fontWeight: 500, textDecoration: 'none' }}>Вхід</Link>
                </p>
            </div>
        </div>
    )
}
