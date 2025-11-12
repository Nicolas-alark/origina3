"use client";
import { useState, useEffect, useCallback } from "react";

export default function Juego2048() {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Inicializar juego
  useEffect(() => {
    const saved = localStorage.getItem("2048-best");
    if (saved) setBestScore(parseInt(saved));
    iniciarJuego();
  }, []);

  const iniciarJuego = () => {
    const newGrid = Array(4).fill(null).map(() => Array(4).fill(0));
    agregarNuevoNumero(newGrid);
    agregarNuevoNumero(newGrid);
    setGrid(newGrid);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const agregarNuevoNumero = (gridActual) => {
    const emptyCells = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (gridActual[i][j] === 0) {
          emptyCells.push({ i, j });
        }
      }
    }

    if (emptyCells.length > 0) {
      const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      gridActual[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const moverIzquierda = (gridActual) => {
    let moved = false;
    let newScore = score;

    for (let i = 0; i < 4; i++) {
      let row = gridActual[i].filter(val => val !== 0);
      
      for (let j = 0; j < row.length - 1; j++) {
        if (row[j] === row[j + 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j + 1, 1);
          
          if (row[j] === 2048 && !won) {
            setWon(true);
          }
        }
      }
      
      while (row.length < 4) {
        row.push(0);
      }
      
      for (let j = 0; j < 4; j++) {
        if (gridActual[i][j] !== row[j]) {
          moved = true;
        }
        gridActual[i][j] = row[j];
      }
    }

    return { moved, newScore };
  };

  const moverDerecha = (gridActual) => {
    let moved = false;
    let newScore = score;

    for (let i = 0; i < 4; i++) {
      let row = gridActual[i].filter(val => val !== 0);
      
      for (let j = row.length - 1; j > 0; j--) {
        if (row[j] === row[j - 1]) {
          row[j] *= 2;
          newScore += row[j];
          row.splice(j - 1, 1);
          
          if (row[j] === 2048 && !won) {
            setWon(true);
          }
          j--;
        }
      }
      
      while (row.length < 4) {
        row.unshift(0);
      }
      
      for (let j = 0; j < 4; j++) {
        if (gridActual[i][j] !== row[j]) {
          moved = true;
        }
        gridActual[i][j] = row[j];
      }
    }

    return { moved, newScore };
  };

  const transponer = (gridActual) => {
    return gridActual[0].map((_, i) => gridActual.map(row => row[i]));
  };

  const moverArriba = (gridActual) => {
    let transposed = transponer(gridActual);
    const { moved, newScore } = moverIzquierda(transposed);
    const result = transponer(transposed);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        gridActual[i][j] = result[i][j];
      }
    }
    
    return { moved, newScore };
  };

  const moverAbajo = (gridActual) => {
    let transposed = transponer(gridActual);
    const { moved, newScore } = moverDerecha(transposed);
    const result = transponer(transposed);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        gridActual[i][j] = result[i][j];
      }
    }
    
    return { moved, newScore };
  };

  const verificarGameOver = (gridActual) => {
    // Verificar si hay celdas vacías
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (gridActual[i][j] === 0) return false;
      }
    }

    // Verificar movimientos horizontales posibles
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) {
        if (gridActual[i][j] === gridActual[i][j + 1]) return false;
      }
    }

    // Verificar movimientos verticales posibles
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        if (gridActual[i][j] === gridActual[i + 1][j]) return false;
      }
    }

    return true;
  };

  const mover = useCallback((direccion) => {
    if (gameOver) return;

    const newGrid = grid.map(row => [...row]);
    let result;

    switch (direccion) {
      case "izquierda":
        result = moverIzquierda(newGrid);
        break;
      case "derecha":
        result = moverDerecha(newGrid);
        break;
      case "arriba":
        result = moverArriba(newGrid);
        break;
      case "abajo":
        result = moverAbajo(newGrid);
        break;
      default:
        return;
    }

    if (result.moved) {
      agregarNuevoNumero(newGrid);
      setGrid(newGrid);
      setScore(result.newScore);

      if (result.newScore > bestScore) {
        setBestScore(result.newScore);
        localStorage.setItem("2048-best", result.newScore.toString());
      }

      if (verificarGameOver(newGrid)) {
        setGameOver(true);
      }
    }
  }, [grid, gameOver, score, bestScore, won]);

  // Controles de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case "ArrowLeft":
          mover("izquierda");
          break;
        case "ArrowRight":
          mover("derecha");
          break;
        case "ArrowUp":
          mover("arriba");
          break;
        case "ArrowDown":
          mover("abajo");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mover]);

  // Controles táctiles
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipe = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) > minSwipe) {
        mover(deltaX > 0 ? "derecha" : "izquierda");
      }
    } else {
      if (Math.abs(deltaY) > minSwipe) {
        mover(deltaY > 0 ? "abajo" : "arriba");
      }
    }
  };

  const getTileColor = (value) => {
    const colors = {
      0: "#cdc1b4",
      2: "#eee4da",
      4: "#ede0c8",
      8: "#f2b179",
      16: "#f59563",
      32: "#f67c5f",
      64: "#f65e3b",
      128: "#edcf72",
      256: "#edcc61",
      512: "#edc850",
      1024: "#edc53f",
      2048: "#edc22e",
    };
    return colors[value] || "#3c3a32";
  };

  const getTileTextColor = (value) => {
    return value <= 4 ? "#776e65" : "#f9f6f2";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#faf8ef",
        padding: "20px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        WebkitTapHighlightColor: "transparent",
        touchAction: "none",
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: "500px", width: "100%", marginBottom: "20px" }}>
        <h1 style={{
          fontSize: "3rem",
          fontWeight: "bold",
          color: "#776e65",
          margin: "0 0 10px 0",
          textAlign: "center",
        }}>
          2048
        </h1>

        {/* Score panel */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "10px",
          marginBottom: "20px",
        }}>
          <div style={{
            backgroundColor: "#bbada0",
            padding: "15px",
            borderRadius: "8px",
            flex: 1,
            textAlign: "center",
          }}>
            <div style={{ color: "#eee4da", fontSize: "0.8rem", fontWeight: "bold" }}>
              PUNTOS
            </div>
            <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "bold" }}>
              {score}
            </div>
          </div>

          <div style={{
            backgroundColor: "#bbada0",
            padding: "15px",
            borderRadius: "8px",
            flex: 1,
            textAlign: "center",
          }}>
            <div style={{ color: "#eee4da", fontSize: "0.8rem", fontWeight: "bold" }}>
              MEJOR
            </div>
            <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "bold" }}>
              {bestScore}
            </div>
          </div>
        </div>

        {/* Instrucciones */}
        <p style={{
          textAlign: "center",
          color: "#776e65",
          fontSize: "0.9rem",
          margin: "0 0 15px 0",
        }}>
          Desliza para mover las fichas. ¡Combina números iguales para llegar a 2048!
        </p>
      </div>

      {/* Game Grid */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          backgroundColor: "#bbada0",
          padding: "10px",
          borderRadius: "10px",
          maxWidth: "500px",
          width: "100%",
          aspectRatio: "1",
          position: "relative",
        }}
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
          height: "100%",
        }}>
          {grid.map((row, i) =>
            row.map((value, j) => (
              <div
                key={`${i}-${j}`}
                style={{
                  backgroundColor: getTileColor(value),
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: value >= 1000 ? "2rem" : value >= 100 ? "2.5rem" : "3rem",
                  fontWeight: "bold",
                  color: getTileTextColor(value),
                  transition: "all 0.15s ease-in-out",
                  userSelect: "none",
                }}
              >
                {value !== 0 && value}
              </div>
            ))
          )}
        </div>

        {/* Modal Game Over */}
        {gameOver && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(238, 228, 218, 0.73)",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}>
            <div style={{
              fontSize: "3rem",
              marginBottom: "10px",
            }}>😢</div>
            <div style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#776e65",
              marginBottom: "20px",
            }}>
              ¡Juego terminado!
            </div>
            <button
              onClick={iniciarJuego}
              style={{
                padding: "15px 40px",
                backgroundColor: "#8f7a66",
                color: "#f9f6f2",
                border: "none",
                borderRadius: "8px",
                fontSize: "1.2rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Modal Victoria */}
        {won && !gameOver && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(237, 194, 46, 0.5)",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}>
            <div style={{
              fontSize: "3rem",
              marginBottom: "10px",
            }}>🎉</div>
            <div style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#f9f6f2",
              marginBottom: "20px",
            }}>
              ¡Ganaste!
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setWon(false)}
                style={{
                  padding: "15px 30px",
                  backgroundColor: "#8f7a66",
                  color: "#f9f6f2",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Continuar
              </button>
              <button
                onClick={iniciarJuego}
                style={{
                  padding: "15px 30px",
                  backgroundColor: "#8f7a66",
                  color: "#f9f6f2",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Nuevo juego
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Botones de control */}
      <div style={{
        maxWidth: "500px",
        width: "100%",
        marginTop: "20px",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        flexWrap: "wrap",
      }}>
        <button
          onClick={iniciarJuego}
          style={{
            padding: "12px 30px",
            backgroundColor: "#8f7a66",
            color: "#f9f6f2",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          🔄 Nuevo juego
        </button>

        <a
          href="/"
          style={{
            padding: "12px 30px",
            backgroundColor: "#ffffff",
            color: "#8f7a66",
            border: "2px solid #8f7a66",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "bold",
            display: "inline-block",
          }}
        >
          ← Menú
        </a>
      </div>

      {/* Controles visuales para móvil */}
      <div style={{
        maxWidth: "500px",
        width: "100%",
        marginTop: "30px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "10px",
      }}>
        <div></div>
        <button
          onClick={() => mover("arriba")}
          style={{
            padding: "20px",
            backgroundColor: "#8f7a66",
            color: "#f9f6f2",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ↑
        </button>
        <div></div>
        
        <button
          onClick={() => mover("izquierda")}
          style={{
            padding: "20px",
            backgroundColor: "#8f7a66",
            color: "#f9f6f2",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ←
        </button>
        <button
          onClick={() => mover("abajo")}
          style={{
            padding: "20px",
            backgroundColor: "#8f7a66",
            color: "#f9f6f2",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ↓
        </button>
        <button
          onClick={() => mover("derecha")}
          style={{
            padding: "20px",
            backgroundColor: "#8f7a66",
            color: "#f9f6f2",
            border: "none",
            borderRadius: "8px",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          →
        </button>
      </div>
    </div>
  );
}