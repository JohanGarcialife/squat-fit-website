import React from 'react'

export default function Description() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Este libro es para ti si... */}
          <div className="bg-secondary/20 rounded-[40px] py-10 px-8 md:p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-7">
              Este libro es para ti si...
            </h2>
            <ul className="space-y-5 text-black text-xl md:text-2xl">
              <li className="flex gap-3"><span aria-hidden="true">✅</span><span>Quieres comer bien sin obsesionarte</span></li>
              <li className="flex gap-3"><span aria-hidden="true">✅</span><span>Buscas recetas ricas y fáciles</span></li>
              <li className="flex gap-3"><span aria-hidden="true">✅</span><span>Te va la dieta flexible</span></li>
              <li className="flex gap-3"><span aria-hidden="true">✅</span><span>Necesitas más constancia sin aburrirte</span></li>
              <li className="flex gap-3"><span aria-hidden="true">✅</span><span>Quieres cenas, desayunos y postres que puedas repetir</span></li>
              <li className="flex gap-3"><span aria-hidden="true">✅</span><span>Valoras recetas rápidas para el día a día</span></li>
            </ul>
          </div>

          {/* No es para ti si... */}
          <div className="bg-primary/20 rounded-[40px] py-10 px-8 md:p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-7">
              No es para ti si...
            </h2>
            <ul className="space-y-5 text-black text-xl md:text-2xl mb-8">
              <li className="flex gap-3"><span aria-hidden="true">❌</span><span>Quieres una dieta rígida y cerrada</span></li>
              <li className="flex gap-3"><span aria-hidden="true">❌</span><span>Esperas resultados sin hábitos</span></li>
              <li className="flex gap-3"><span aria-hidden="true">❌</span><span>No quieres cocinar nada</span></li>
              <li className="flex gap-3"><span aria-hidden="true">❌</span><span>Prefieres recetas complicadas antes que prácticas</span></li>
            </ul>
            <p className="text-black font-bold text-center text-xl md:text-2xl leading-relaxed">
              Si sientes que el problema no es "saber qué hacer" sino "mantenerlo sin aburrirte" aquí tienes tu solución práctica.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
