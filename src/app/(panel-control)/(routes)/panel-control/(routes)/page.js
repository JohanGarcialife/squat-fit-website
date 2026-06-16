'use client'
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import TopVentas from '../_components/TopVentas'

export default function Page() {
  const [courses, setCourses] = useState([])

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

    fetchCourses()
  }, [])

  return (
    <div className='py-16 pl-20 w-full'>
      <TopVentas courses={courses} />
    </div>
  )
}
 