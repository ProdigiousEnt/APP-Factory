/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'ios-blue': '#007AFF',
                'ios-gray': '#8E8E93',
                'ios-light-gray': '#F2F2F7',
            },
        },
    },
    plugins: [],
}
