"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { LayoutGrid, List, Menu, Search, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import AccessNotice from "@/app/components/AccessNotice";
import RichProductCards from "@/app/components/RichProductCards";
import { handleApiError } from "@/app/components/handleApiError";
import { useSystemRecipes } from "@/app/components/useSystemRecipes";
import { trackRecipeEvent } from "@/app/components/recipeMetrics";
import { BookIndexSidebar } from "@/app/(panel-control)/(routes)/panel-control/_components/Sidebar";
import {
  CATEGORIAS,
  FACETAS,
  cumpleFacetas,
  iconoDeCategoria,
  ordenDeCategoria,
  taxonomiaDe,
} from "@/app/components/recetarioTaxonomia";
import TarjetaReceta, { urlDeImagen } from "../_components/TarjetaReceta";
import PreferenciasChips from "../_components/PreferenciasChips";
import BienvenidaPreferencias from "../_components/BienvenidaPreferencias";
import Spinner from "@/app/components/Spinner";

const API = process.env.NEXT_PUBLIC_API_URL;

const SIN_CATEGORIA = "Otras recetas";
const CLAVE_VISTA = "sqf_recetario_vista";

// Ancla de cada sección, para que el índice lateral pueda saltar a ella.
const anclaDe = (categoria) => `cat-${categoria.replace(/\s+/g, "-").toLowerCase()}`;

function MisRecetasContenido() {
  const { token, isSubscribed } = useAuthStore();
  const { loading, checked, recipes } = useSystemRecipes();
  const router = useRouter();
  // La ficha de una receta enlaza su categoría aquí (?categoria=Comidas), que
  // es como se vuelve «a las demás de este tipo» sin pasar por los filtros.
  const parametros = useSearchParams();

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState(parametros.get("categoria") || null);
  const [facetas, setFacetas] = useState([]);
  // La LISTA es la vista por defecto: con la foto al lado (vertical, como en
  // el libro) se lee mejor el nombre y los datos de un vistazo, y caben más
  // recetas en pantalla. La rejilla sigue a un clic.
  const [vista, setVista] = useState("lista");
  const [indiceAbierto, setIndiceAbierto] = useState(false);
  const [seccionVisible, setSeccionVisible] = useState(null);
  const [libros, setLibros] = useState([]);

  // La vista elegida se recuerda: quien prefiere la lista no quiere volver a
  // pulsarla cada vez que entra. Blindado como el resto (modo privado antiguo).
  useEffect(() => {
    try {
      const guardada = localStorage.getItem(CLAVE_VISTA);
      if (guardada === "lista" || guardada === "rejilla") setVista(guardada);
    } catch {
      /* sin storage */
    }
  }, []);

  const cambiarVista = (siguiente) => {
    setVista(siguiente);
    try {
      localStorage.setItem(CLAVE_VISTA, siguiente);
    } catch {
      /* sin storage */
    }
  };

  // Los libros solo hacen falta para el bloque de acceso al lector del final.
  useEffect(() => {
    if (!token) return;
    let vivo = true;
    axios
      .get(`${API}/api/v1/book/all`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (vivo) setLibros(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        if (handleApiError(err, "/panel-cocina/recetas")) return;
        if (vivo) setLibros([]);
      });
    return () => {
      vivo = false;
    };
  }, [token]);

  // Un evento «search» por pausa de escritura, no uno por tecla (mismo
  // criterio que el buscador del lector y el del índice del libro).
  useEffect(() => {
    const q = busqueda.trim();
    if (!q) return undefined;
    const t = setTimeout(() => trackRecipeEvent("search", { searchTerm: q }), 500);
    return () => clearTimeout(t);
  }, [busqueda]);

  // Recetas + su taxonomía del libro, una sola vez.
  const conTaxonomia = useMemo(
    () => (recipes || []).map((receta) => ({ receta, taxonomia: taxonomiaDe(receta) })),
    [recipes],
  );

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return conTaxonomia.filter(({ receta, taxonomia }) => {
      if (q && !(receta.name || "").toLowerCase().includes(q)) return false;
      if (categoria && (taxonomia?.categoria || SIN_CATEGORIA) !== categoria) return false;
      return cumpleFacetas(taxonomia, facetas);
    });
  }, [conTaxonomia, busqueda, categoria, facetas]);

  // Secciones en el orden del libro (Desayunos, Comidas, Cenas…), no
  // alfabético: es el orden que el cliente ya reconoce del índice impreso.
  const secciones = useMemo(() => {
    const mapa = new Map();
    for (const item of visibles) {
      const cat = item.taxonomia?.categoria || SIN_CATEGORIA;
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat).push(item);
    }
    return [...mapa.entries()]
      .map(([cat, items]) => ({
        categoria: cat,
        ancla: anclaDe(cat),
        icono: cat === SIN_CATEGORIA ? "🍳" : iconoDeCategoria(cat),
        items: items.sort((a, b) => (a.taxonomia?.pagina ?? 9999) - (b.taxonomia?.pagina ?? 9999)),
      }))
      .sort((a, b) => ordenDeCategoria(a.categoria) - ordenDeCategoria(b.categoria));
  }, [visibles]);

  // Conteos para las pastillas de filtro: un filtro que no dice cuántas
  // recetas deja es un filtro a ciegas (y el libro marca «sin gluten» en 147
  // de 149, cosa que solo se ve si el número está delante).
  const conteoCategorias = useMemo(() => {
    const conteo = new Map();
    for (const { taxonomia } of conTaxonomia) {
      const cat = taxonomia?.categoria || SIN_CATEGORIA;
      conteo.set(cat, (conteo.get(cat) || 0) + 1);
    }
    return conteo;
  }, [conTaxonomia]);

  const conteoFacetas = useMemo(() => {
    const conteo = new Map();
    for (const faceta of FACETAS) {
      conteo.set(
        faceta.id,
        conTaxonomia.filter(({ taxonomia }) => cumpleFacetas(taxonomia, [faceta.id])).length,
      );
    }
    return conteo;
  }, [conTaxonomia]);

  // Índice lateral: el mismo componente del lector de libro. Categorías como
  // nivel 0 y recetas colgando de cada una.
  const itemsIndice = useMemo(
    () =>
      secciones.map((seccion, i) => ({
        id: seccion.ancla,
        title: `${seccion.categoria} (${seccion.items.length})`,
        page: seccion.ancla,
        icon: seccion.icono,
        level: 0,
        sort_order: i,
        children: seccion.items.map(({ receta }, j) => ({
          id: receta.id,
          title: receta.name || "Receta",
          page: `receta:${receta.id}`,
          icon: "•",
          level: 1,
          sort_order: j,
        })),
      })),
    [secciones],
  );

  // Sección en la que está el cliente ahora mismo, para marcarla en el índice.
  useEffect(() => {
    if (!secciones.length) return undefined;
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setSeccionVisible(visible.target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    for (const seccion of secciones) {
      const nodo = document.getElementById(seccion.ancla);
      if (nodo) observador.observe(nodo);
    }
    return () => observador.disconnect();
  }, [secciones]);

  const irA = (destino) => {
    if (typeof destino === "string" && destino.startsWith("receta:")) {
      setIndiceAbierto(false);
      const id = destino.slice("receta:".length);
      trackRecipeEvent("click", { recipeId: id });
      router.push(`/panel-cocina/receta/${id}`);
      return;
    }
    const nodo = document.getElementById(String(destino));
    if (nodo) nodo.scrollIntoView({ behavior: "smooth", block: "start" });
    setIndiceAbierto(false);
  };

  const hayFiltros = Boolean(busqueda.trim() || categoria || facetas.length);
  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoria(null);
    setFacetas([]);
  };

  if (!token) return <AccessNotice redirect="/panel-cocina/recetas" />;

  if (loading || !checked) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[#363C98] font-semibold text-lg">Cargando tus recetas...</p>
        </div>
      </div>
    );
  }

  // Sin recetas: o no hay acceso a la biblioteca y tampoco hay muestras
  // marcadas, o el backend no devolvió nada. El endpoint no distingue los dos
  // casos, así que tampoco se distingue aquí: se ofrece la biblioteca.
  if (!recipes.length) {
    return (
      <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-12 min-h-screen">
        <h1 className="text-[#363C98] text-4xl md:text-5xl font-bold mb-4">Mis recetas</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-10">
          Aún no tienes recetas disponibles. Suscríbete a la{" "}
          <strong>Biblioteca Digital de Squad Fit</strong> para abrir las 149 recetas
          de los libros de cocina, con 5 nuevas cada semana.
        </p>
        <RichProductCards show={["cocina"]} />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10 pb-16 min-h-screen">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#363C98] text-4xl md:text-5xl font-bold">Mis recetas</h1>
          <p className="text-slate-400 mt-2">
            {recipes.length} {recipes.length === 1 ? "receta" : "recetas"} de tus libros de cocina.
          </p>
        </div>
        {/* Mismo botón naranja del lector de libro: es el que abre el índice */}
        <button
          type="button"
          onClick={() => setIndiceAbierto(true)}
          aria-label="Abrir el índice de recetas"
          className="shrink-0 flex items-center gap-2 text-[#FF690B] hover:opacity-80 transition-opacity cursor-pointer font-bold"
        >
          <span className="hidden sm:inline">Índice</span>
          <Menu className="w-8 h-8" strokeWidth={3} />
        </button>
      </div>

      <div className="mb-6">
        <PreferenciasChips />
      </div>

      {/* ── Buscador, vista y filtros ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar receta…"
              aria-label="Buscar receta"
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-[#363C98] placeholder:text-slate-300 focus:outline-none focus:border-[#FF690B] transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#F8F9FC] rounded-2xl p-1 self-start">
            {[
              { id: "rejilla", Icon: LayoutGrid, label: "Rejilla" },
              { id: "lista", Icon: List, label: "Lista" },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => cambiarVista(id)}
                aria-pressed={vista === id}
                title={`Ver en ${label.toLowerCase()}`}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold transition-colors cursor-pointer ${
                  vista === id ? "bg-white text-[#FF690B] shadow-sm" : "text-slate-400 hover:text-[#363C98]"
                }`}
              >
                <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categorías: la banda del pie de cada receta en el libro */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.filter((c) => conteoCategorias.get(c.id)).map((c) => {
            const activa = categoria === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoria(activa ? null : c.id)}
                aria-pressed={activa}
                className={`rounded-full px-3.5 py-1.5 text-sm font-bold border transition-colors cursor-pointer ${
                  activa
                    ? "bg-[#363C98] border-[#363C98] text-white"
                    : "bg-white border-slate-200 text-[#363C98] hover:border-[#363C98]"
                }`}
              >
                <span className="mr-1.5">{c.icono}</span>
                {c.id}
                <span className={activa ? "text-white/70 ml-1.5" : "text-slate-300 ml-1.5"}>
                  {conteoCategorias.get(c.id)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Iconos del libro (guía de la pág. 12): ni uno más, ni uno menos */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-300 mr-1">
            Iconos del libro
          </span>
          {FACETAS.map((f) => {
            const activa = facetas.includes(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  setFacetas((previas) =>
                    previas.includes(f.id) ? previas.filter((x) => x !== f.id) : [...previas, f.id],
                  )
                }
                aria-pressed={activa}
                className={`rounded-full px-3 py-1 text-xs font-bold border transition-colors cursor-pointer ${
                  activa
                    ? "bg-[#FF690B] border-[#FF690B] text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:border-[#FF690B]"
                }`}
              >
                {f.label}
                <span className={activa ? "text-white/70 ml-1.5" : "text-slate-300 ml-1.5"}>
                  {conteoFacetas.get(f.id)}
                </span>
              </button>
            );
          })}
          {hayFiltros && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-[#FF690B] transition-colors cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" /> Quitar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Recetas ───────────────────────────────────────────────────────── */}
      {visibles.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 py-20">
          <span className="text-4xl">🔍</span>
          <p className="text-[#363C98]/60 font-semibold">
            Ninguna receta con esos filtros.
          </p>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="text-[#FF690B] font-bold hover:underline cursor-pointer"
          >
            Quitar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {secciones.map((seccion) => (
            <section key={seccion.categoria} id={seccion.ancla} className="scroll-mt-24">
              <h2 className="text-[#363C98] text-2xl font-bold mb-4 flex items-center gap-2">
                <span>{seccion.icono}</span>
                {seccion.categoria}
                <span className="text-slate-300 text-base font-semibold">
                  {seccion.items.length}
                </span>
              </h2>
              {vista === "lista" ? (
                <div className="flex flex-col gap-3">
                  {seccion.items.map(({ receta, taxonomia }) => (
                    <TarjetaReceta
                      key={receta.id}
                      receta={receta}
                      taxonomia={taxonomia}
                      vista="lista"
                      href={`/panel-cocina/receta/${receta.id}`}
                      onClick={() => trackRecipeEvent("click", { recipeId: receta.id })}
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {seccion.items.map(({ receta, taxonomia }) => (
                    <TarjetaReceta
                      key={receta.id}
                      receta={receta}
                      taxonomia={taxonomia}
                      vista="rejilla"
                      href={`/panel-cocina/receta/${receta.id}`}
                      onClick={() => trackRecipeEvent("click", { recipeId: receta.id })}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* ── Los libros, para quien quiera hojearlos enteros ───────────────── */}
      {isSubscribed && libros.length > 0 && (
        <section className="mt-16 border-t border-slate-100 pt-10">
          <h2 className="text-[#363C98] text-2xl font-bold mb-6">Tus libros</h2>
          <div className="flex flex-wrap gap-6">
            {libros.flatMap((libro) => {
              const versiones = libro.versions?.length
                ? libro.versions
                : [{ version_id: libro.id, version_title: libro.title }];
              return versiones.map((version) => {
                const versionId = version.version_id || version.id || libro.id;
                return (
                  <Link
                    key={`${libro.id}-${versionId}`}
                    href={`/panel-cocina/libro/${libro.id}?v=${versionId}`}
                    className="group flex items-center gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 pr-6"
                  >
                    <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-[#FFF6F0] shrink-0">
                      <Image
                        src={urlDeImagen(version.version_image || libro.image)}
                        alt={libro.title || "Libro de cocina"}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[#363C98] font-bold group-hover:text-[#FF690B] transition-colors">
                        {libro.title || "Libro de cocina"}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {version.version_title || version.title || "Abrir el libro"}
                      </p>
                    </div>
                  </Link>
                );
              });
            })}
          </div>
        </section>
      )}

      <BookIndexSidebar
        isOpen={indiceAbierto}
        onClose={() => setIndiceAbierto(false)}
        items={itemsIndice}
        activePage={seccionVisible}
        onItemClick={irA}
        etiqueta="Recetas"
        placeholder="Buscar en el índice…"
        unidad={{ singular: "entrada", plural: "entradas" }}
        vacio={<>No hay recetas que<br />encajen con los filtros.</>}
        variante="recetario"
      />

      <BienvenidaPreferencias />
    </div>
  );
}

// `useSearchParams` exige un límite de Suspense (mismo patrón que
// panel-cocina/receta/[id]/page.js y panel-cursos/page.js).
export default function MisRecetasPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <MisRecetasContenido />
    </Suspense>
  );
}
