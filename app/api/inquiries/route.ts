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

    if (message.length < 10) {
        return NextResponse.json({ message: 'Please enter a longer message.' }, { status: 400 })
    }

    if (!allowedInterests.has(interest)) {
        return NextResponse.json({ message: 'Please choose a valid interest.' }, { status: 400 })
    }

    // Validation boundary: keep this endpoint safe by never returning raw submitted fields.
    // Add persistence or email delivery here when the club chooses a provider.
    return NextResponse.json({
        message: kind === 'join'
            ? 'Thanks. Your interest was received.'
            : 'Thanks. Your message was received.',
    })
}
