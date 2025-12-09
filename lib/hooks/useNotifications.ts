'use client'

import { useEffect } from 'react'

export function useNotifications() {
    useEffect(() => {
        // Request permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const sendNotification = (title: string, body: string) => {
        // Only send if tab is not focused
        if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
            })
        }
    }

    const playSound = () => {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(() => {})
    }

    return { sendNotification, playSound }
}