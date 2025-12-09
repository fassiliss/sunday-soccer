export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    full_name: string | null
                    avatar_url: string | null
                    status: 'online' | 'offline' | 'away'
                    last_seen: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    username: string
                    full_name?: string | null
                    avatar_url?: string | null
                    status?: 'online' | 'offline' | 'away'
                }
                Update: {
                    username?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    status?: 'online' | 'offline' | 'away'
                }
            }
            channels: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    type: 'group' | 'direct' | 'announcement'
                    is_private: boolean
                    created_at: string
                }
                Insert: {
                    name: string
                    description?: string | null
                    type?: 'group' | 'direct' | 'announcement'
                    is_private?: boolean
                }
                Update: {
                    name?: string
                    description?: string | null
                }
            }
            messages: {
                Row: {
                    id: string
                    channel_id: string
                    user_id: string | null
                    content: string | null
                    type: 'text' | 'image' | 'file' | 'system'
                    is_edited: boolean
                    is_deleted: boolean
                    created_at: string
                }
                Insert: {
                    channel_id: string
                    user_id?: string | null
                    content?: string | null
                    type?: 'text' | 'image' | 'file' | 'system'
                }
                Update: {
                    content?: string | null
                    is_edited?: boolean
                    is_deleted?: boolean
                }
            }
            attachments: {
                Row: {
                    id: string
                    message_id: string
                    file_name: string
                    file_type: 'image' | 'video' | 'document' | 'audio'
                    file_size: number | null
                    file_url: string
                    created_at: string
                }
                Insert: {
                    message_id: string
                    file_name: string
                    file_type: 'image' | 'video' | 'document' | 'audio'
                    file_size?: number | null
                    file_url: string
                }
                Update: {}
            }
            reactions: {
                Row: {
                    id: string
                    message_id: string
                    user_id: string
                    emoji: string
                    created_at: string
                }
                Insert: {
                    message_id: string
                    user_id: string
                    emoji: string
                }
                Update: {}
            }
        }
    }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Channel = Database['public']['Tables']['channels']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Attachment = Database['public']['Tables']['attachments']['Row']
export type Reaction = Database['public']['Tables']['reactions']['Row']

export type MessageWithRelations = Message & {
    user: Profile | null
    attachments: Attachment[]
    reactions: Reaction[]
}