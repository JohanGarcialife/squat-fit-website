'use client';

import React, { useEffect, useState } from 'react';
import CourseTierShopCard from './CourseTierCard';
import { fetchTieredCourses } from './courseCatalog';

// Tienda de cursos con tramos (15.1): una tarjeta por curso, cada una con su
// selector Mensual / Anual / De por vida. Se usa en la tienda del panel
// (Cursos sin suscripción) y donde haga falta listar el catálogo completo.
export default function CourseTierShop({ highlight }) {
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    fetchTieredCourses().then(setGroups).catch(() => setGroups([]));
  }, []);

  if (groups === null) {
    return (
      <div className="w-full flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3932C0]" />
      </div>
    );
  }

  if (groups.length === 0) return null;

  // El curso destacado (p. ej. Fuerte y Definid@) va primero.
  const ordered = highlight
    ? [...groups].sort((a, b) => (b.baseName === highlight ? 1 : 0) - (a.baseName === highlight ? 1 : 0))
    : groups;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
      {ordered.map((group) => (
        <CourseTierShopCard key={group.baseName} group={group} />
      ))}
    </div>
  );
}
