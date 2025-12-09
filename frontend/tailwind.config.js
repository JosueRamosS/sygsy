/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neo: {
                    bg: '#f0f0f0',
                    main: '#000000',
                    white: '#ffffff',
                    violet: '#8b5cf6',
                    yellow: '#facc15',
                    pink: '#f472b6',
                    green: '#4ade80',
                    red: '#ef4444',
                    blue: '#60a5fa',
                }
            },
            boxShadow: {
                'neo': '4px 4px 0px 0px rgba(0,0,0,1)',
                'neo-sm': '2px 2px 0px 0px rgba(0,0,0,1)',
                'neo-lg': '6px 6px 0px 0px rgba(0,0,0,1)',
            },
            borderWidth: {
                '3': '3px',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
