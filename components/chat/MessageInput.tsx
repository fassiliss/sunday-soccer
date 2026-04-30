'use client'

import { useState, useRef } from 'react'
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const QUICK_MESSAGES = ["I'm in", 'Running late', 'Need a ride', 'Need a sub', 'Who has jerseys?']

interface MessageInputProps {
    onSend: (content: string) => Promise<unknown>
    channelName: string
    channelId: string
}

export default function MessageInput({ onSend, channelName, channelId }: MessageInputProps) {
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setSelectedFile(file)

        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => setPreview(e.target?.result as string)
            reader.readAsDataURL(file)
        } else {
            setPreview(null)
        }
    }

    const clearFile = () => {
        setSelectedFile(null)
        setPreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleQuickSend = async (content: string) => {
        if (sending) return
        setSending(true)
        try {
            await onSend(content)
        } catch (error) {
            console.error('Error sending quick message:', error)
        }
        setSending(false)
    }

    const handleSend = async () => {
        if (!message.trim() && !selectedFile) return
        setSending(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            let imageUrl = null

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop()
                const fileName = `${channelId}/${Date.now()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('attachments')
                    .upload(fileName, selectedFile)

                if (!uploadError) {
                    const { data: { publicUrl } } = supabase.storage
                        .from('attachments')
                        .getPublicUrl(fileName)
                    imageUrl = publicUrl
                }
            }

            const content = imageUrl
                ? (message.trim() ? `${message.trim()}\n${imageUrl}` : imageUrl)
                : message.trim()

            if (content) {
                await onSend(content)
            }

            setMessage('')
            clearFile()
        } catch (error) {
            console.error('Error sending:', error)
        }

        setSending(false)
    }

    return (
        <div className="shrink-0 border-t border-white/10 bg-[#08110f]/95 px-3 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-xl sm:px-5 sm:pb-4">
            {/* File Preview */}
            {selectedFile && (
                <div className="mb-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 p-2">
                    {preview ? (
                        <img src={preview} alt="Preview" className="h-12 w-12 rounded-xl object-cover" />
                    ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                            <ImageIcon size={20} className="text-slate-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{selectedFile.name}</p>
                        <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={clearFile} className="shrink-0 rounded-full p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-300" aria-label="Remove attachment">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
                {QUICK_MESSAGES.map((quick) => (
                    <button
                        key={quick}
                        type="button"
                        onClick={() => handleQuickSend(quick)}
                        disabled={sending}
                        className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-xs font-bold text-slate-100 transition hover:bg-white/12 disabled:opacity-50"
                    >
                        {quick}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-2 rounded-[1.4rem] border border-white/10 bg-white px-2 py-2 shadow-xl shadow-black/20 sm:px-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label="Attach image"
                >
                    <ImageIcon size={19} />
                </button>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={`Message #${channelName}`}
                    className="min-w-0 flex-1 bg-transparent text-[16px] text-slate-950 outline-none placeholder:text-slate-400 sm:text-sm"
                />
                <button className="hidden h-10 w-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 sm:grid" aria-label="Add reaction">
                    <Smile size={18} />
                </button>
                <button
                    onClick={handleSend}
                    disabled={sending || (!message.trim() && !selectedFile)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-400 text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-40"
                    aria-label="Send message"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}
