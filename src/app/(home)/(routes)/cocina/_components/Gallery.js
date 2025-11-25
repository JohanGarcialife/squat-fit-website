'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Image from 'next/image'

export default function Gallery() {
  const [galeria, setGaleria] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
console.log(galeria);

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
    <div className='py-24 px-20 flex flex-col justify-center items-center gap-6'>
      <h2 className='text-primary font-bold text-6xl'>Recetas</h2>

      {loading && <p>Cargando recetas...</p>}
      {error && <p className='text-red-500'>{error}</p>}

      <div className='grid grid-cols-3 grid-rows-3 gap-4'>
        {galeria.length > 0
          ? galeria.map((r, i) => (
              <div key={r.id ?? i} className='w-96 h-72 bg-gray-100 overflow-hidden rounded relative'>
                {r?.image ? (
                  <Image
                    src={r.image}
                    alt={r?.name || 'receta'}
                    fill
                    sizes='(max-width: 1024px) 100vw, 384px'
                    className='object-cover'
                    unoptimized
                  />
                ) : (
                  <div className='w-full h-full bg-gray-300' />
                )}
              </div>
            ))
          : Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className='w-96 h-72 bg-gray-300' />
            ))}
      </div>
    </div>
  )
}
