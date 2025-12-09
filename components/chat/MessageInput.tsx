'use client'

import { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'

export default function MessageInput({ onSend, channelName }: { onSend: (content: string) => Promise<any>; channelName: string }) {
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const handleSend = async () => {
        if (!message.trim()) return
        setSending(true)
        await onSend(message.trim())
        setMessage('')
        setSending(false)
    }

    return (
        <div className="p-4 border-t border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2 bg-gray-700 rounded-xl px-3 py-2">
                <button className="text-gray-400 hover:text-white p-1"><Paperclip size={20} /></button>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={`Message #${channelName}`}
                    className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400 text-white"
                />
                <button className="text-gray-400 hover:text-white p-1"><Smile size={20} /></button>
                <button onClick={handleSend} disabled={sending || !message.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg p-2 text-white">
                    <Send size={18} />
                </button>
            </div>
        </div>
    )
}