"use client";
import { useState, useEffect } from "react";

export default function SopaDeLetras() {
  const [nivel, setNivel] = useState("facil");
  const [grid, setGrid] = useState([]);
  const [palabras, setPalabras] = useState([]);
  const [palabrasColocadas, setPalabrasColocadas] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [encontradas, setEncontradas] = useState([]);
  const [completado, setCompletado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

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
    
    const colocadas = [];

    palabrasActuales.forEach((palabra) => {
      let colocada = false;
      let intentos = 0;
      
      while (!colocada && intentos < 100) {
        const direccion = Math.floor(Math.random() * 4);
        const fila = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        
        if (puedeColocarPalabra(newGrid, palabra, fila, col, direccion, size)) {
          colocarPalabra(newGrid, palabra, fila, col, direccion);
          colocadas.push({
            palabra,
            posiciones: getPosicionesPalabra(fila, col, palabra.length, direccion)
          });
          colocada = true;
        }
        intentos++;
      }
    });

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
    setPalabrasColocadas(colocadas);
    setEncontradas([]);
    setSeleccion([]);
    setCompletado(false);
    setMostrarModal(false);
  };

  const puedeColocarPalabra = (grid, palabra, fila, col, direccion, size) => {
    const len = palabra.length;
    
    if (direccion === 0 && col + len > size) return false;
    if (direccion === 1 && fila + len > size) return false;
    if (direccion === 2 && (fila + len > size || col + len > size)) return false;
    if (direccion === 3 && (fila + len > size || col - len + 1 < 0)) return false;

    for (let i = 0; i < len; i++) {
      let r = fila, c = col;
      
      if (direccion === 0) c += i;
      else if (direccion === 1) r += i;
      else if (direccion === 2) { r += i; c += i; }
      else if (direccion === 3) { r += i; c -= i; }

      if (grid[r][c] !== "" && grid[r][c] !== palabra[i]) {
        return false;
      }
    }
    return true;
  };

  const colocarPalabra = (grid, palabra, fila, col, direccion) => {
    for (let i = 0; i < palabra.length; i++) {
      let r = fila, c = col;
      
      if (direccion === 0) c += i;
      else if (direccion === 1) r += i;
      else if (direccion === 2) { r += i; c += i; }
      else if (direccion === 3) { r += i; c -= i; }

      grid[r][c] = palabra[i];
    }
  };

  const getPosicionesPalabra = (fila, col, len, direccion) => {
    const posiciones = [];
    for (let i = 0; i < len; i++) {
      let r = fila, c = col;
      
      if (direccion === 0) c += i;
      else if (direccion === 1) r += i;
      else if (direccion === 2) { r += i; c += i; }
      else if (direccion === 3) { r += i; c -= i; }

      posiciones.push({ fila: r, col: c });
    }
    return posiciones;
  };

  const manejarClick = (fila, col) => {
    const yaSeleccionada = seleccion.find(
      (pos) => pos.fila === fila && pos.col === col
    );

    if (yaSeleccionada) {
      setSeleccion([]);
    } else {
      const nuevaSeleccion = [...seleccion, { fila, col }];
      
      if (seleccion.length === 0 || sonAdyacentesEnLinea(seleccion, fila, col)) {
        setSeleccion(nuevaSeleccion);
        verificarPalabra(nuevaSeleccion);
      }
    }
  };

  const sonAdyacentesEnLinea = (seleccion, fila, col) => {
    if (seleccion.length === 0) return true;
    if (seleccion.length === 1) return true;
    
    const primera = seleccion[0];
    const segunda = seleccion[1];
    const deltaFila = segunda.fila - primera.fila;
    const deltaCol = segunda.col - primera.col;
    
    const ultima = seleccion[seleccion.length - 1];
    const nuevaDeltaFila = fila - ultima.fila;
    const nuevaDeltaCol = col - ultima.col;
    
    return nuevaDeltaFila === deltaFila && nuevaDeltaCol === deltaCol;
  };

  const verificarPalabra = (seleccionActual) => {
    const letrasSeleccionadas = seleccionActual.map(
      (pos) => grid[pos.fila][pos.col]
    );
    const palabraFormada = letrasSeleccionadas.join("");
    const palabraReversa = palabraFormada.split("").reverse().join("");

    const encontrada = palabrasColocadas.find((item) => {
      if (item.palabra === palabraFormada || item.palabra === palabraReversa) {
        if (seleccionActual.length === item.palabra.length) {
          return true;
        }
      }
      return false;
    });

    if (encontrada && !encontradas.includes(encontrada.palabra)) {
      setEncontradas([...encontradas, encontrada.palabra]);
      setSeleccion([]);
    }
  };

  useEffect(() => {
    if (encontradas.length === palabras.length && palabras.length > 0) {
      setCompletado(true);
      setTimeout(() => {
        setMostrarModal(true);
      }, 500);
    }
  }, [encontradas, palabras.length]);

  const siguienteNivel = () => {
    setMostrarModal(false);
    if (nivel === "facil") setNivel("medio");
    else if (nivel === "medio") setNivel("dificil");
    else {
      setNivel("facil");
    }
  };

  const estaEnPalabraEncontrada = (fila, col) => {
    return palabrasColocadas.some(item => {
      if (encontradas.includes(item.palabra)) {
        return item.posiciones.some(pos => pos.fila === fila && pos.col === col);
      }
      return false;
    });
  };

  const cellSize = nivel === "facil" ? 45 : nivel === "medio" ? 38 : 32;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "15px",
        backgroundColor: "#f4f6fb",
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <h1
        style={{
          color: "#2c3e50",
          marginBottom: "8px",
          fontSize: "1.8rem",
          marginTop: "10px",
        }}
      >
        🧩 Sopa de Letras
      </h1>
      <h2 style={{ 
        color: "#555", 
        marginTop: "0", 
        fontSize: "1.1rem",
        fontWeight: "normal",
      }}>
        Nivel: <strong>{nivel.toUpperCase()}</strong>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${grid.length}, ${cellSize}px)`,
          justifyContent: "center",
          gap: "3px",
          margin: "15px auto",
          maxWidth: "100%",
          padding: "0 10px",
          opacity: mostrarModal ? 0.3 : 1,
          transition: "opacity 0.3s",
        }}
      >
        {grid.map((fila, i) =>
          fila.map((letra, j) => {
            const estaSeleccionada = seleccion.some(
              (pos) => pos.fila === i && pos.col === j
            );
            const perteneceAEncontrada = estaEnPalabraEncontrada(i, j);

            return (
              <div
                key={`${i}-${j}`}
                onClick={() => !mostrarModal && manejarClick(i, j)}
                onTouchStart={(e) => {
                  if (!mostrarModal) {
                    e.preventDefault();
                    manejarClick(i, j);
                  }
                }}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  lineHeight: `${cellSize}px`,
                  textAlign: "center",
                  border: "2px solid #2c3e50",
                  borderRadius: "6px",
                  cursor: mostrarModal ? "default" : "pointer",
                  backgroundColor: perteneceAEncontrada
                    ? "#9AFF9A"
                    : estaSeleccionada
                    ? "#74b9ff"
                    : "#ffffff",
                  color: "#2d3436",
                  fontWeight: "bold",
                  fontSize: nivel === "facil" ? "18px" : nivel === "medio" ? "16px" : "14px",
                  transition: "background-color 0.2s",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                  pointerEvents: mostrarModal ? "none" : "auto",
                }}
              >
                {letra}
              </div>
            );
          })
        )}
      </div>

      <div style={{ 
        marginBottom: "15px", 
        padding: "0 10px",
        opacity: mostrarModal ? 0.3 : 1,
        transition: "opacity 0.3s",
      }}>
        <h3 style={{ 
          color: "#2c3e50", 
          marginBottom: "10px",
          fontSize: "1.1rem",
        }}>
          Palabras por encontrar:
        </h3>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "center",
          gap: "8px",
        }}>
          {palabras.map((p) => (
            <span
              key={p}
              style={{
                textDecoration: encontradas.includes(p) ? "line-through" : "none",
                color: encontradas.includes(p) ? "#95a5a6" : "#2c3e50",
                fontWeight: "bold",
                fontSize: "1rem",
                padding: "5px 10px",
                backgroundColor: encontradas.includes(p) ? "#e8e8e8" : "#ffffff",
                borderRadius: "5px",
                border: "1px solid #ddd",
              }}
            >
              {p}
            </span>
          ))}
        </div>
        <p style={{ 
          fontSize: "0.95rem", 
          color: "#7f8c8d", 
          marginTop: "12px",
          fontWeight: "500",
        }}>
          Encontradas: {encontradas.length} / {palabras.length}
        </p>
      </div>

      <div style={{ 
        display: "flex", 
        gap: "10px", 
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "0 10px",
        marginTop: "15px",
        opacity: mostrarModal ? 0.3 : 1,
        transition: "opacity 0.3s",
      }}>
        <button
          onClick={generarSopa}
          disabled={mostrarModal}
          onTouchStart={(e) => !mostrarModal && (e.currentTarget.style.transform = "scale(0.95)")}
          onTouchEnd={(e) => !mostrarModal && (e.currentTarget.style.transform = "scale(1)")}
          style={{
            padding: "12px 24px",
            backgroundColor: mostrarModal ? "#999" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: mostrarModal ? "default" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            WebkitTapHighlightColor: "transparent",
            transition: "transform 0.1s",
            pointerEvents: mostrarModal ? "none" : "auto",
          }}
        >
          🔄 Nueva sopa
        </button>

        <a
          href="/"
          onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.95)"}
          onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}
          style={{
            padding: "12px 24px",
            backgroundColor: "#ffffff",
            color: "#0984e3",
            border: "2px solid #0984e3",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
            fontSize: "14px",
            display: "inline-block",
            WebkitTapHighlightColor: "transparent",
            transition: "transform 0.1s",
          }}
        >
          ← Menú
        </a>
      </div>

      {/* Modal centrado */}
      {mostrarModal && (
        <>
          {/* Overlay oscuro */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999,
              animation: "fadeIn 0.3s ease-in-out",
            }}
            onClick={() => setMostrarModal(false)}
          />
          
          {/* Modal */}
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#d4edda",
              padding: "30px 40px",
              borderRadius: "15px",
              border: "3px solid #28a745",
              zIndex: 1000,
              minWidth: "280px",
              maxWidth: "90%",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              animation: "slideIn 0.4s ease-out",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>🎉</div>
              <h2 style={{ 
                color: "#155724", 
                margin: "0 0 10px 0",
                fontSize: "1.6rem",
              }}>
                ¡Nivel completado!
              </h2>
              <p style={{
                color: "#155724",
                fontSize: "1rem",
                marginBottom: "20px",
              }}>
                Encontradas: {encontradas.length} / {palabras.length}
              </p>
              <button
                onClick={siguienteNivel}
                onTouchStart={(e) => e.currentTarget.style.transform = "scale(0.95)"}
                onTouchEnd={(e) => e.currentTarget.style.transform = "scale(1)"}
                style={{
                  padding: "14px 32px",
                  backgroundColor: "#0984e3",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold",
                  WebkitTapHighlightColor: "transparent",
                  transition: "transform 0.1s",
                  width: "100%",
                }}
              >
                {nivel === "dificil" ? "🔄 Reiniciar" : "Siguiente nivel →"}
              </button>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            
            @keyframes slideIn {
              from {
                transform: translate(-50%, -60%);
                opacity: 0;
              }
              to {
                transform: translate(-50%, -50%);
                opacity: 1;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}