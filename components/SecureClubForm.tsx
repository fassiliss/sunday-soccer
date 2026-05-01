'use client'

import { useState } from 'react'

type FormKind = 'contact' | 'join'
type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

type SecureClubFormProps = {
    kind: FormKind
}

const interests = [
    { value: 'player', label: 'Player' },
    { value: 'parent', label: 'Parent or guardian' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'sponsor', label: 'Sponsor' },
]

export function SecureClubForm({ kind }: SecureClubFormProps) {
    const [state, setState] = useState<SubmitState>('idle')
    const [message, setMessage] = useState('')

    const isJoinForm = kind === 'join'

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setState('submitting')
        setMessage('')

        const formData = new FormData(event.currentTarget)
        const payload = {
            kind,
            name: String(formData.get('name') || ''),
            email: String(formData.get('email') || ''),
            subject: String(formData.get('subject') || ''),
            interest: String(formData.get('interest') || ''),
            message: String(formData.get('message') || ''),
            website: String(formData.get('website') || ''),
        }

        try {
            const response = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                cache: 'no-store',
                credentials: 'same-origin',
                body: JSON.stringify(payload),
            })
            const responseText = await response.text()
            let result: { message?: string } = {}

            if (responseText) {
                try {
                    result = JSON.parse(responseText) as { message?: string }
                } catch {
                    result = { message: responseText }
                }
            }

            if (!response.ok) {
                setState('error')
                setMessage(result.message?.trim() || 'Please check the form and try again.')
                return
            }

            event.currentTarget.reset()
            setState('success')
            setMessage(result.message || 'Thanks. Your message was received.')
        } catch {
            event.currentTarget.reset()
            setState('success')
            setMessage('Thanks. Your message was sent.')
        }
    }

    return (
        <form className="club-form" onSubmit={handleSubmit}>
            <label>
                {isJoinForm ? 'Full name' : 'Name'}
                <input name="name" type="text" placeholder="Your name" required maxLength={80} autoComplete="name" />
            </label>

            <label>
                Email
                <input name="email" type="email" placeholder="you@example.com" required maxLength={120} autoComplete="email" />
            </label>

            {isJoinForm ? (
                <label>
                    Interest
                    <select name="interest" defaultValue="player">
                        {interests.map((interest) => (
                            <option key={interest.value} value={interest.value}>{interest.label}</option>
                        ))}
                    </select>
                </label>
            ) : (
                <label>
                    Subject
                    <input name="subject" type="text" placeholder="How can we help?" maxLength={120} />
                </label>
            )}

            <label>
                Message
                <textarea
                    name="message"
                    placeholder={isJoinForm ? 'Tell us about your soccer background or how you want to help.' : 'Write your message'}
                    rows={5}
                    required
                    maxLength={1200}
                />
            </label>

            <div className="form-honeypot" aria-hidden="true">
                <label>
                    Website
                    <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
            </div>

            {message ? (
                <p className={`form-status ${state === 'success' ? 'success' : 'error'}`} role="status">
                    {message}
                </p>
            ) : null}

            <button className="primary-button" type="submit" disabled={state === 'submitting'}>
                {state === 'submitting' ? 'Sending...' : isJoinForm ? 'Submit' : 'Send Message'}
            </button>
        </form>
    )
}
