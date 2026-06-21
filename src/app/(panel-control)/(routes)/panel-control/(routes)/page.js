'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TopVentas from '../_components/TopVentas'
import { useAuthStore } from '@/stores/auth.store'

export default function Page() {
  const [courses, setCourses] = useState([])
  const [userCourses, setUserCourses] = useState([])
  const { token } = useAuthStore()

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course/all`)
        setCourses(response.data)
        console.log('Cursos obtenidos desde la API:', response.data)
      } catch (error) {
        console.error('Error al obtener los cursos:', error)
      }
    }

    const fetchUserCourses = async () => {
      if (!token) return
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course/by-user`, { headers })
        
        console.log('Cursos del usuario obtenidos:', response.data)
        
        // Calcular el progreso para cada curso
        const computed = response.data.map(course => {
          const totalVideos = course.videos?.length || 0
          const viewedVideos = course.videos?.filter(v => v.views?.is_viewed).length || 0
          const progress = totalVideos > 0 ? Math.round((viewedVideos / totalVideos) * 100) : 0
          return {
            ...course,
            progress
          }
        })

        // Filtrar solo los cursos que el usuario ya ha iniciado (tiene al menos un video interactuado/views no nulo)
        const initiated = computed.filter(course => 
          course.videos?.some(v => v.views)
        )

        setUserCourses(initiated)
      } catch (error) {
        console.error('Error al obtener cursos del usuario:', error)
      }
    }

    fetchCourses()
    fetchUserCourses()
  }, [token])

  return (
    <div className='py-16 pl-20 w-full'>
      <TopVentas courses={courses} userCourses={userCourses} />
    </div>
  )
}
 