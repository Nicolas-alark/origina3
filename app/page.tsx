"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 p-8">
      <h1 className="text-4xl font-bold mb-8 text-blue-700">🚀 Proyecto de Desarrollo Web</h1>
      <p className="mb-6 text-lg text-gray-600">Selecciona una de las actividades:</p>

      <nav className="flex flex-col gap-4 w-full max-w-xs">
        <Link
          href="/sopa_letras"
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg text-center transition"
        >
          🧩 Sopa de Letras
        </Link>

        <Link
          href="/pagina2"
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg text-center transition"
        >
          🎮 Página 2
        </Link>

        <Link
          href="/pagina3"
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg text-center transition"
        >
          ⚙️ Página 3
        </Link>
      </nav>
    </main>
  );
}
