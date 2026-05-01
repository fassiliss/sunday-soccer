import { NextRequest, NextResponse } from 'next/server'

type InquiryPayload = {
    kind?: unknown
    name?: unknown
    email?: unknown
    subject?: unknown
    interest?: unknown
    message?: unknown
    website?: unknown
}

const allowedKinds = new Set(['contact', 'join'])
const allowedInterests = new Set(['player', 'parent', 'volunteer', 'sponsor', ''])
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const toEmail = process.env.INQUIRY_TO_EMAIL || 'ethiounitysmyrna@gmail.com'
const fromEmail = process.env.INQUIRY_FROM_EMAIL || 'Ethio Unity <onboarding@resend.dev>'

const clean = (value: unknown, maxLength: number) => {
    if (typeof value !== 'string') return ''
    return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

const getClientKey = (request: NextRequest) => {
    const forwardedFor = request.headers.get('x-forwarded-for')
    return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}

const isRateLimited = (key: string) => {
    const now = Date.now()
    const current = rateLimit.get(key)

    if (!current || current.resetAt < now) {
        rateLimit.set(key, { count: 1, resetAt: now + 60_000 })
        return false
    }

    current.count += 1
    return current.count > 5
}

const escapeHtml = (value: string) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const sendInquiryEmail = async ({
    kind,
    name,
    email,
    subject,
    interest,
    message,
}: {
    kind: string
    name: string
    email: string
    subject: string
    interest: string
    message: string
}) => {
    if (!process.env.RESEND_API_KEY) {
        return { ok: false, message: 'Email is not configured yet. Please add RESEND_API_KEY in Vercel.' }
    }

    const title = kind === 'join' ? 'New Ethio Unity join inquiry' : `New Ethio Unity message${subject ? `: ${subject}` : ''}`
    const rows = [
        ['Form', kind === 'join' ? 'Join Us' : 'Contact'],
        ['Name', name],
        ['Email', email],
        ...(subject ? [['Subject', subject]] : []),
        ...(interest ? [['Interest', interest]] : []),
        ['Message', message],
    ]

    const text = rows.map(([label, value]) => `${label}: ${value}`).join('\n\n')
    const htmlRows = rows
        .map(([label, value]) => `
            <tr>
                <td style="padding:8px 12px;border:1px solid #dfe5e9;font-weight:700;">${escapeHtml(label)}</td>
                <td style="padding:8px 12px;border:1px solid #dfe5e9;">${escapeHtml(value).replace(/\n/g, '<br />')}</td>
            </tr>
        `)
        .join('')

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            reply_to: email,
            subject: title,
            text,
            html: `
                <div style="font-family:Arial,sans-serif;color:#101315;">
                    <h1 style="font-size:22px;">${escapeHtml(title)}</h1>
                    <table style="border-collapse:collapse;width:100%;max-width:720px;">${htmlRows}</table>
                </div>
            `,
        }),
    })

    if (!response.ok) {
        return { ok: false, message: 'Email delivery failed. Please check the email provider settings.' }
    }

    return { ok: true, message: 'Thanks. Your message was sent.' }
}

export async function POST(request: NextRequest) {
    if (!request.headers.get('content-type')?.includes('application/json')) {
        return NextResponse.json({ message: 'Invalid request.' }, { status: 415 })
    }

    if (isRateLimited(getClientKey(request))) {
        return NextResponse.json({ message: 'Too many attempts. Please wait a minute and try again.' }, { status: 429 })
    }

    let payload: InquiryPayload

    try {
        payload = await request.json() as InquiryPayload
    } catch {
        return NextResponse.json({ message: 'Invalid form data.' }, { status: 400 })
    }

    if (clean(payload.website, 120)) {
        return NextResponse.json({ message: 'Thanks. Your message was received.' })
    }

    const kind = clean(payload.kind, 20)
    const name = clean(payload.name, 80)
    const email = clean(payload.email, 120).toLowerCase()
    const subject = clean(payload.subject, 120)
    const interest = clean(payload.interest, 40)
    const message = clean(payload.message, 1200)

    if (!allowedKinds.has(kind)) {
        return NextResponse.json({ message: 'Invalid form type.' }, { status: 400 })
    }

    if (name.length < 2) {
        return NextResponse.json({ message: 'Please enter your name.' }, { status: 400 })
    }

    if (!emailPattern.test(email)) {
        return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 })
    }

    if (message.length < 5) {
        return NextResponse.json({ message: 'Please enter a longer message.' }, { status: 400 })
    }

    if (!allowedInterests.has(interest)) {
        return NextResponse.json({ message: 'Please choose a valid interest.' }, { status: 400 })
    }

    const result = await sendInquiryEmail({ kind, name, email, subject, interest, message })

    if (!result.ok) {
        return NextResponse.json({ message: result.message }, { status: 503 })
    }

    return NextResponse.json({
        message: kind === 'join'
            ? 'Thanks. Your interest was sent.'
            : result.message,
    })
}
