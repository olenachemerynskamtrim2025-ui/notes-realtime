import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
    const [notes, setNotes] = useState([])
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        const { data } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false })
        setNotes(data || [])
    }

    const createNote = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const { data } = await supabase
            .from('notes')
            .insert({ title: 'Нова нотатка', owner_id: user.id })
            .select().single()
        if (data) navigate(`/note/${data.id}`)
    }

    const deleteNote = async (e, id) => {
        e.stopPropagation()
        await supabase.from('notes').delete().eq('id', id)
        setNotes(notes.filter(n => n.id !== id))
    }

    const logout = () => supabase.auth.signOut()

    const formatDate = (str) => new Date(str).toLocaleDateString('uk-UA', {
        day: 'numeric', month: 'short', year: 'numeric'
    })

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                padding: '0 40px', position: 'sticky', top: 0, zIndex: 10
            }}>
                <div style={{
                    maxWidth: 800, margin: '0 auto', height: 64,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <h1 style={{ fontSize: 22 }}>📝 Notes</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</span>
                        <button onClick={logout} style={{
                            padding: '8px 16px', background: 'none',
                            border: '1.5px solid var(--border)', borderRadius: 8,
                            fontSize: 13, color: 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                                onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
                                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
                        >
                            Вийти
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h2 style={{ fontSize: 32, marginBottom: 4 }}>Мої нотатки</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{notes.length} нотаток</p>
                    </div>
                    <button onClick={createNote} style={{
                        padding: '12px 24px', background: 'var(--text)',
                        color: 'white', border: 'none', borderRadius: 'var(--radius)',
                        fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        + Нова нотатка
                    </button>
                </div>

                {notes.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        color: 'var(--text-muted)'
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>🗒️</div>
                        <p style={{ fontSize: 18, marginBottom: 8 }}>Нотаток поки немає</p>
                        <p style={{ fontSize: 14 }}>Натисни "+ Нова нотатка" щоб почати</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 12 }}>
                        {notes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => navigate(`/note/${note.id}`)}
                                style={{
                                    background: 'var(--surface)', border: '1.5px solid var(--border)',
                                    borderRadius: 'var(--radius)', padding: '20px 24px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    cursor: 'pointer', transition: 'all 0.15s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = 'var(--accent)'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = 'var(--shadow)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'var(--border)'
                                    e.currentTarget.style.transform = 'none'
                                    e.currentTarget.style.boxShadow = 'none'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 4 }}>{note.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(note.created_at)}</div>
                                </div>
                                <button
                                    onClick={e => deleteNote(e, note.id)}
                                    style={{
                                        padding: '6px 12px', background: 'none',
                                        border: '1px solid transparent', borderRadius: 8,
                                        fontSize: 13, color: 'var(--text-muted)', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.target.style.borderColor = 'var(--danger)'; e.target.style.color = 'var(--danger)' }}
                                    onMouseLeave={e => { e.target.style.borderColor = 'transparent'; e.target.style.color = 'var(--text-muted)' }}
                                >
                                    Видалити
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
