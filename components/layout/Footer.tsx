'use client'

export default function Footer() {
    return (
        <footer className="h-20 bg-gray-800 border-t border-gray-700 flex items-center justify-center px-4">
            <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Ethio Unity. Created by{' '}
                <a
                    href="https://www.fassiltsegaye.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white"
                >
                    fassiltsegaye.com
                </a>
            </p>
        </footer>
    )
}
