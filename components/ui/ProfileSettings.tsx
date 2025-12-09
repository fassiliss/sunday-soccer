'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/lib/types/database'
import { Camera, X, Loader2 } from 'lucide-react'

interface ProfileSettingsProps {
    profile: Profile
    onClose: () => void
    onUpdate: () => void
}

export default function ProfileSettings({ profile, onClose, onUpdate }: ProfileSettingsProps) {
    const [fullName, setFullName] = useState(profile.full_name || '')
    const [phone, setPhone] = useState(profile.phone_number || '')
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${profile.id}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, { upsert: true })

        if (uploadError) {
            alert('Error uploading: ' + uploadError.message)
            setUploading(false)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

        setAvatarUrl(publicUrl + '?t=' + Date.now())
        setUploading(false)
    }

    const handleSave = async () => {
        setSaving(true)
        await (supabase.from('profiles') as any)
            .update({
                full_name: fullName,
                phone_number: phone || null,
                avatar_url: avatarUrl || null,
            })
            .eq('id', profile.id)

        setSaving(false)
        onUpdate()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl text-white">{fullName?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full hover:bg-blue-700"
                        >
                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                        />
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Click camera to upload</p>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-white"
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            value={profile.username}
                            disabled
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2 px-3 text-gray-500"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button onClick={onClose} className="flex-1 bg-gray-700 py-2 rounded-lg text-white hover:bg-gray-600">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex-1 bg-blue-600 py-2 rounded-lg text-white hover:bg-blue-700 flex items-center justify-center gap-2">
                        {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    )
}