/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#4f46e5",
                secondary: "#7c3aed",
                accent: "#22c55e",
                background: "#f8fafc",
                text: "#1e293b",
            }
        },
    },
    plugins: [],
}
