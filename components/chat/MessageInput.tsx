'use client'

import { useState, useRef } from 'react'
import { Send, Image, Smile, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface MessageInputProps {
    onSend: (content: string) => Promise<any>
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
        <div className="p-2 sm:p-4 border-t border-gray-700 bg-gray-800 shrink-0">
            {/* File Preview */}
            {selectedFile && (
                <div className="mb-2 p-2 bg-gray-700 rounded-lg flex items-center gap-2">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                    ) : (
                        <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
                            <Image size={20} className="text-gray-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-white truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={clearFile} className="text-gray-400 hover:text-red-400 shrink-0">
                        <X size={18} />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-1 sm:gap-2 bg-gray-700 rounded-xl px-2 sm:px-3 py-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-white p-1 shrink-0"
                >
                    <Image size={18} />
                </button>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={`Message #${channelName}`}
                    className="flex-1 min-w-0 bg-transparent outline-none text-sm placeholder-gray-400 text-white"
                />
                <button className="text-gray-400 hover:text-white p-1 shrink-0 hidden sm:block">
                    <Smile size={18} />
                </button>
                <button
                    onClick={handleSend}
                    disabled={sending || (!message.trim() && !selectedFile)}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg p-2 text-white shrink-0"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}