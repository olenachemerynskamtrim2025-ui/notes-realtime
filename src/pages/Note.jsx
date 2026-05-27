import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Note() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [note, setNote] = useState(null)
    const [content, setContent] = useState('')
    const [title, setTitle] = useState('')
    const [onlineUsers, setOnlineUsers] = useState([])
    const [shareEmail, setShareEmail] = useState('')
    const [shareRole, setShareRole] = useState('viewer')
    const [shareMsg, setShareMsg] = useState('')
    const [myRole, setMyRole] = useState(null) // 'owner' | 'editor' | 'viewer'
    const channelRef = useRef(null)
    const isRemoteUpdate = useRef(false)
    const saveTimer = useRef(null)

    useEffect(() => {
        loadNote()
        setupRealtime()
        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current)
        }
    }, [id])

    const loadNote = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        const { data } = await supabase.from('notes').select('*').eq('id', id).single()
        if (data) {
            setNote(data)
            setTitle(data.title)
            setContent(data.content || '')

            // Визначаємо роль
            if (data.owner_id === user.id) {
                setMyRole('owner')
            } else {
                const { data: access } = await supabase
                    .from('note_access')
                    .select('role')
                    .eq('note_id', id)
                    .eq('user_id', user.id)
                    .single()
                setMyRole(access?.role || 'viewer')
            }
        }
    }

    const setupRealtime = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        const channel = supabase.channel(`note-${id}`)

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                const users = Object.values(state).map(u => u[0]?.email).filter(Boolean)
                setOnlineUsers(users)
            })
            .on('broadcast', { event: 'note-update' }, ({ payload }) => {
                isRemoteUpdate.current = true
                if (payload.content !== undefined) setContent(payload.content)
                if (payload.title !== undefined) setTitle(payload.title)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ email: user.email })
                }
            })

        channelRef.current = channel
    }

    const canEdit = myRole === 'owner' || myRole === 'editor'

    const handleContentChange = (e) => {
        if (!canEdit) return
        const value = e.target.value
        if (isRemoteUpdate.current) {
            isRemoteUpdate.current = false
            return
        }
        setContent(value)
        channelRef.current?.send({
            type: 'broadcast',
            event: 'note-update',
            payload: { content: value }
        })
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(async () => {
            const { error } = await supabase
                .from('notes')
                .update({ content: value, updated_at: new Date() })
                .eq('id', id)
                .select()
            if (error) console.log('content update error:', error)
        }, 500)
    }

    const handleTitleChange = (e) => {
        if (!canEdit) return
        const value = e.target.value
        setTitle(value)
        channelRef.current?.send({
            type: 'broadcast',
            event: 'note-update',
            payload: { title: value }
        })
        clearTimeout(saveTimer.current)
        saveTimer.current = setTimeout(async () => {
            const { error } = await supabase
                .from('notes')
                .update({ title: value, updated_at: new Date() })
                .eq('id', id)
                .select()
            if (error) console.log('title update error:', error)
        }, 500)
    }

    const handleShare = async () => {
        setShareMsg('')
        const { data: userId, error } = await supabase
            .rpc('get_user_id_by_email', { email_input: shareEmail })

        if (error || !userId) {
            setShareMsg('Користувача не знайдено')
            return
        }

        const { error: insertError } = await supabase.from('note_access').upsert({
            note_id: id,
            user_id: userId,
            role: shareRole
        })

        if (insertError) {
            setShareMsg('Помилка: ' + insertError.message)
            return
        }

        setShareMsg('Доступ надано!')
        setShareEmail('')
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        alert('Посилання скопійовано!')
    }

    if (!note) return <div style={{ padding: 40 }}>Завантаження...</div>

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Header */}
            <div style={{
                background: 'var(--surface)', borderBottom: '1px solid var(--border)',
                padding: '0 40px', position: 'sticky', top: 0, zIndex: 10
            }}>
                <div style={{
                    maxWidth: 800, margin: '0 auto', height: 56,
                    display: 'flex', alignItems: 'center', gap: 16
                }}>
                    <button onClick={() => navigate('/')} style={{
                        background: 'none', border: 'none', fontSize: 20,
                        cursor: 'pointer', padding: 4, color: 'var(--text-muted)'
                    }}>←</button>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Назад до нотаток</span>
                    <div style={{ marginLeft: 'auto' }}>
                        {myRole === 'owner' && <span style={{ background: '#fef3e2', color: '#a8894e', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>👑 Власник</span>}
                        {myRole === 'editor' && <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>✏️ Редактор</span>}
                        {myRole === 'viewer' && <span style={{ background: '#fff3e0', color: '#e65100', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>👁️ Перегляд</span>}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
                <input
                    value={title}
                    onChange={handleTitleChange}
                    disabled={!canEdit}
                    style={{
                        fontSize: 32, fontWeight: 600, border: 'none',
                        width: '100%', marginBottom: 24, padding: '4px 0',
                        outline: 'none', background: 'transparent',
                        fontFamily: 'Playfair Display, serif',
                        color: 'var(--text)',
                        borderBottom: canEdit ? '2px solid var(--border)' : 'none'
                    }}
                />

                {/* Онлайн */}
                <div style={{
                    marginBottom: 20, padding: '10px 16px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: 8
                }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--green)', display: 'inline-block' }}></span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Онлайн: <strong style={{ color: 'var(--text)' }}>{onlineUsers.join(', ') || 'тільки ти'}</strong>
          </span>
                </div>

                <textarea
                    value={content}
                    onChange={handleContentChange}
                    disabled={!canEdit}
                    placeholder={canEdit ? 'Починай писати...' : 'Тільки перегляд'}
                    style={{
                        width: '100%', height: 360, padding: '20px',
                        fontSize: 16, lineHeight: 1.7,
                        border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius)', resize: 'vertical',
                        fontFamily: 'DM Sans, sans-serif', outline: 'none',
                        boxSizing: 'border-box',
                        background: canEdit ? 'var(--surface)' : 'var(--bg)',
                        color: 'var(--text)',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={e => { if (canEdit) e.target.style.borderColor = 'var(--accent)' }}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />

                {myRole === 'owner' && (
                    <div style={{
                        marginTop: 24, padding: 24,
                        background: 'var(--surface)', border: '1.5px solid var(--border)',
                        borderRadius: 'var(--radius)'
                    }}>
                        <h3 style={{ fontSize: 16, marginBottom: 16 }}>Поділитись нотаткою</h3>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <input
                                placeholder="Email користувача"
                                value={shareEmail}
                                onChange={e => setShareEmail(e.target.value)}
                                style={{
                                    flex: 1, minWidth: 200, padding: '10px 14px',
                                    border: '1.5px solid var(--border)', borderRadius: 8,
                                    fontSize: 14, outline: 'none', background: 'var(--bg)'
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                            <select
                                value={shareRole}
                                onChange={e => setShareRole(e.target.value)}
                                style={{
                                    padding: '10px 14px', border: '1.5px solid var(--border)',
                                    borderRadius: 8, fontSize: 14, background: 'var(--bg)', outline: 'none'
                                }}
                            >
                                <option value="viewer">👁️ Перегляд</option>
                                <option value="editor">✏️ Редагування</option>
                            </select>
                            <button onClick={handleShare} style={{
                                padding: '10px 20px', background: 'var(--text)',
                                color: 'white', border: 'none', borderRadius: 8, fontSize: 14
                            }}>
                                Надати доступ
                            </button>
                            <button onClick={copyLink} style={{
                                padding: '10px 20px', background: 'none',
                                border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14
                            }}>
                                📋 Копіювати посилання
                            </button>
                        </div>
                        {shareMsg && (
                            <p style={{
                                marginTop: 12, fontSize: 13,
                                color: shareMsg.includes('Помилка') ? 'var(--danger)' : 'var(--green)'
                            }}>{shareMsg}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
