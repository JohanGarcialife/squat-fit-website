'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'

export default function Gallery() {
  const [galeria, setGaleria] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  useEffect(() => {
    const source = axios.CancelToken.source()
    async function fetchRecipes() {
      try {
        const base = process.env.NEXT_PUBLIC_API_URL || ''
        const res = await axios.get(`${base}/api/v1/recipe/partial-system`, {
          cancelToken: source.token,
        })
        setGaleria(res.data || [])
      } catch (err) {
        if (!axios.isCancel(err)) setError(err.message || 'Error fetching recipes')
      } finally {
        setLoading(false)
      }
    }
    fetchRecipes()
    return () => source.cancel('Component unmounted')
  }, [])

  return (
    <div className='py-16 px-4 sm:px-8 md:px-20 flex flex-col items-center gap-6 max-w-screen-xl mx-auto'>
      <h2 className='text-primary font-bold text-4xl sm:text-5xl md:text-6xl'>Recetas</h2>

      {loading && <p>Cargando recetas...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full'>
        {galeria.length > 0
          ? galeria.slice(0, 6).map((r, i) => (
              <div
                key={r.id ?? i}
                className='w-full aspect-[4/3] bg-gray-100 overflow-hidden rounded relative'
              >
                {r?.image ? (
                  <Image
                    src={r?.image}
                    alt={r?.name || 'receta'}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-cover'
                    unoptimized
                  />
                ) : (
                  <div className='w-full h-full bg-gray-300' />
                )}
              </div>
            ))
          : Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='w-full aspect-[4/3] bg-gray-300 rounded' />
            ))}
      </div>
    </div>
  )
}
