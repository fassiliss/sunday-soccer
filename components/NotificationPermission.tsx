'use client'

import { useEffect } from 'react'

export default function NotificationPermission() {
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    return null
}