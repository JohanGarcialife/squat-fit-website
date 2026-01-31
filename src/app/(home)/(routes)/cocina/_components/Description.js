import React from 'react'

export default function Description() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Este libro es para ti si... */}
          <div className="bg-[rgba(57,50,192,0.5)] rounded-[40px] p-10 md:p-12">
            <h2 className="text-3xl md:text-7xl font-bold text-white mb-8">
              Este libro es para ti si...
            </h2>
            <ul className="space-y-4 text-white">
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Quieres comer bien sin obsesionarte</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Buscas recetas ricas y fáciles</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Te va la dieta flexible</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Necesitas más constancia sin aburrirte</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Quieres cenas, desayunos y postres que puedas repetir</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Valoras recetas rápidas para el día a día</span>
              </li>
            </ul>
          </div>

          {/* No es para ti si... */}
          <div className="bg-orange-100 rounded-[40px] p-10 md:p-12">
            <h2 className="text-3xl md:text-7xl font-bold text-black mb-8">
              No es para ti si...
            </h2>
            <ul className="space-y-4 text-black mb-8">
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Quieres una dieta rígida y cerrada</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Esperas resultados sin hábitos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">No quieres cocinar nada</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl mt-1">•</span>
                <span className="text-2xl">Prefieres recetas complicadas antes que prácticas</span>
              </li>
            </ul>
            <p className="text-black font-bold text-center text-2xl md:text-2xl leading-relaxed">
              Si sientes que el problema no es "saber qué hacer" sino "mantenerlo sin aburrirte" aquí tienes tu solución práctica.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
