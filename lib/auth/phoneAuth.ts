export const normalizePhone = (value: string) => {
    const trimmed = value.trim()
    if (trimmed.startsWith('+')) {
        return `+${trimmed.slice(1).replace(/\D/g, '')}`
    }

    const digits = trimmed.replace(/\D/g, '')
    return digits.length === 10 ? `+1${digits}` : `+${digits}`
}

export const phoneToAuthEmail = (phone: string) => {
    const digits = normalizePhone(phone).replace(/\D/g, '')
    return `phone-${digits}@eu-soccer.invalid`
}
