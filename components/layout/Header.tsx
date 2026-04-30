'use client'

import Link from 'next/link'

export default function Header() {
    return (
        <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">⚽</div>
                <span className="font-semibold text-white text-lg">Ethio Unity</span>
            </Link>
            <nav className="flex items-center gap-4">
                <Link
                    href="/"
                    className="text-sm font-semibold text-green-300 hover:text-white"
                >
                    Website Home
                </Link>
                <a
                    href="https://www.fassiltsegaye.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden text-sm text-gray-400 hover:text-white sm:inline"
                >
                    About Developer
                </a>
            </nav>
        </header>
    )
}
