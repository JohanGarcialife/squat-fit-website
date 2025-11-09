import React from 'react'

export default function VideoPresentation() {
    const videoUrl = 'https://www.youtube.com/watch?v=826CVoKW7Xo'; // Ruta a tu archivo de video
  const posterUrl = 'https://i.ytimg.com/vi/EGOeTlhtckw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD9j-MqtETJO_vq6jh3Fx7VbSYIWw'; // Ruta a la imagen de vista previa (la que me mostraste)
  
 return (
    <div className="w-full max-w-2xl mx-auto my-10 text-center">
      {/* Título del componente */}
      <h2 className="text-6xl font-bold text-indigo-700 mb-10">
        Cómo es por dentro
      </h2>

      {/* Contenedor del video */}
      <div className="overflow-hidden rounded-lg shadow-lg">
        <video
          className="w-full h-auto"
          controls // Muestra los controles nativos del navegador (play, pausa, volumen, etc.)
          poster={posterUrl} // Muestra esta imagen antes de que el video comience
          // preload="metadata" // Opcional: solo carga la información básica del video al inicio
        >
          <source src={videoUrl} type="video/mp4" />
          Tu navegador no soporta la etiqueta de video.
        </video>
      </div>
    </div>
  );
};

