"use client";
import { useState, useEffect } from "react";

export default function SopaDeLetras() {
  const [nivel, setNivel] = useState<"facil" | "medio" | "dificil">("facil");
  const [grid, setGrid] = useState<string[][]>([]);
  const [palabras, setPalabras] = useState<string[]>([]);
  const [seleccion, setSeleccion] = useState<{ fila: number; col: number }[]>([]);
  const [encontradas, setEncontradas] = useState<string[]>([]);
  const [completado, setCompletado] = useState(false);

  const listaPalabras = {
    facil: ["HTML", "CSS", "JS", "WEB", "TAG"],
    medio: ["REACT", "ANGULAR", "SERVER", "BROWSER", "API"],
    dificil: ["ASYNC", "FRAMEWORK", "COMPONENT", "BACKEND", "FRONTEND"],
  };

  useEffect(() => {
    generarSopa();
  }, [nivel]);

  const generarSopa = () => {
    const size = nivel === "facil" ? 8 : nivel === "medio" ? 10 : 12;
    const palabrasActuales = listaPalabras[nivel];
    const newGrid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(""));

    // Colocar palabras horizontalmente
    palabrasActuales.forEach((palabra) => {
      const fila = Math.floor(Math.random() * size);
      const maxCol = size - palabra.length;
      const col = Math.floor(Math.random() * (maxCol + 1));

      for (let i = 0; i < palabra.length; i++) {
        const letraExistente = newGrid[fila][col + i];
        if (letraExistente === "" || letraExistente === palabra[i]) {
          newGrid[fila][col + i] = palabra[i];
        } else {
          let nuevaFila = (fila + 1) % size;
          newGrid[nuevaFila][col + i] = palabra[i];
        }
      }
    });

    // Rellenar vacíos
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (newGrid[i][j] === "") {
          newGrid[i][j] = letras[Math.floor(Math.random() * letras.length)];
        }
      }
    }

    setGrid(newGrid);
    setPalabras(palabrasActuales);
    setEncontradas([]);
    setSeleccion([]);
    setCompletado(false);
  };

  const manejarClick = (fila: number, col: number) => {
    const seleccionada = seleccion.find(
      (pos) => pos.fila === fila && pos.col === col
    );

    if (seleccionada) {
      setSeleccion(seleccion.filter((pos) => !(pos.fila === fila && pos.col === col)));
    } else {
      const nuevaSeleccion = [...seleccion, { fila, col }];
      setSeleccion(nuevaSeleccion);
      verificarPalabra(nuevaSeleccion);
    }
  };

  const verificarPalabra = (seleccionActual: { fila: number; col: number }[]) => {
    const letrasSeleccionadas = seleccionActual.map(
      (pos) => grid[pos.fila][pos.col]
    );
    const palabraFormada = letrasSeleccionadas.join("");

    const encontrada = palabras.find(
      (p) => p === palabraFormada || p === palabraFormada.split("").reverse().join("")
    );

    if (encontrada && !encontradas.includes(encontrada)) {
      setEncontradas([...encontradas, encontrada]);
      setSeleccion([]);
    }
  };

  useEffect(() => {
    if (encontradas.length === palabras.length && palabras.length > 0) {
      setCompletado(true);
    }
  }, [encontradas]);

  const siguienteNivel = () => {
    if (nivel === "facil") setNivel("medio");
    else if (nivel === "medio") setNivel("dificil");
    else alert("🎉 ¡Has completado todos los niveles!");
  };

  return (
    <div
      style={{
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f4f6fb",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          fontFamily: "Segoe UI, sans-serif",
          color: "#2c3e50",
          marginBottom: "20px",
        }}
      >
        🧩 Sopa de Letras - Nivel {nivel.toUpperCase()}
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.length}, 40px)`,
          justifyContent: "center",
          gap: "4px",
          margin: "20px auto",
        }}
      >
        {grid.map((fila, i) =>
          fila.map((letra, j) => {
            const estaSeleccionada = seleccion.some(
              (pos) => pos.fila === i && pos.col === j
            );
            const perteneceAEncontrada = encontradas.some((palabra) =>
              palabra.includes(letra)
            );

            return (
              <div
                key={`${i}-${j}`}
                onClick={() => manejarClick(i, j)}
                style={{
                  width: "40px",
                  height: "40px",
                  lineHeight: "40px",
                  textAlign: "center",
                  border: "2px solid #2c3e50",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: perteneceAEncontrada
                    ? "#9AFF9A"
                    : estaSeleccionada
                    ? "#74b9ff"
                    : "#ffffff",
                  color: "#2d3436",
                  fontWeight: "bold",
                  fontSize: "18px",
                  transition: "0.2s",
                }}
              >
                {letra}
              </div>
            );
          })
        )}
      </div>

      <h3 style={{ color: "#2c3e50" }}>Palabras por encontrar:</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {palabras.map((p) => (
          <li
            key={p}
            style={{
              textDecoration: encontradas.includes(p) ? "line-through" : "none",
              color: encontradas.includes(p) ? "gray" : "black",
              display: "inline",
              margin: "0 10px",
              fontWeight: "bold",
            }}
          >
            {p}
          </li>
        ))}
      </ul>

      {completado && (
        <button
          onClick={siguienteNivel}
          style={{
            marginTop: "20px",
            padding: "10px 25px",
            backgroundColor: "#0984e3",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Siguiente nivel →
        </button>
      )}

      <div style={{ marginTop: "20px" }}>
        <a
          href="/"
          style={{
            color: "#0984e3",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Volver al menú principal
        </a>
      </div>
    </div>
  );
}
