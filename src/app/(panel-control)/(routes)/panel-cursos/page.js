"use client";

import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { useProgramAccess } from "@/app/components/useProgramAccess";
import { handleApiError } from "@/app/components/handleApiError";
import CourseTierShop from "@/app/components/CourseTierShop";
import BrandTabs from "@/app/components/BrandTabs";
import TestQuiz from "./_components/TestQuiz";
import { RefreshCw, ArrowRight, AlertCircle } from "lucide-react";

// ─── Interruptor de negocio: ¿Biblioteca Digital abre TODOS los cursos? ─────
// HOY (comportamiento heredado, y con el que se DESPLIEGA esta rama): SÍ,
// isSubscribed (JWT) — que en realidad solo significa suscripción a la
// Biblioteca Digital, el producto de cocina/recetas — da acceso a TODOS los
// cursos, aunque el cliente no haya comprado ninguno. Es un fallo de
// categoría de producto (dos cosas distintas comparten un único booleano),
// no una preferencia de diseño.
//
// rama fix/acceso-cursos-no-detectado: el fallo REPORTADO (un curso
// concedido individualmente que la pantalla no reconoce) se arregla en los
// DOS estados de este interruptor — el acceso por curso vía
// GET /api/v1/course/by-user (ver hasCourseAccess más abajo) se SUMA
// siempre, esté esto encendido o apagado.
//
// Hamlet ha aprobado apagarlo (que Biblioteca Digital deje de abrir cursos)
// pero PENDIENTE de dos números que aún no existen: cuánta gente lo usa hoy
// (consultas a producción ya pedidas). Hasta tenerlos, se despliega en
// `true` para que NADIE pierda acceso el día de este PR.
//
//   true  (por defecto, así se despliega hoy):
//     Biblioteca Digital sigue abriendo todos los cursos, exactamente igual
//     que antes de esta rama. Cero cambios de comportamiento para nadie.
//   false (el estado correcto de negocio, en pausa hasta los dos números):
//     Biblioteca Digital deja de abrir cursos. El acceso a "Mis cursos"
//     depende EXCLUSIVAMENTE de lo que el cliente compró o le concedieron
//     (course/by-user). Biblioteca Digital sigue intacta en "Mi cocina"
//     (panel-cocina/page.js): ese uso es el correcto y este interruptor NO
//     lo toca.
//
// Para encender: cambiar aquí y desplegar en Vercel (front-only, no
// necesita coordinarse con un despliegue de Cloud Run).
const DIGITAL_LIBRARY_UNLOCKS_COURSES = true;

// ─── TEST VIDEO (Bunny.net iframe) ───────────────────────────────────────────
// Remove this constant once the backend is returning real video_url fields
const TEST_VIDEO_URL =
  "https://iframe.mediadelivery.net/play/497237/e42d5227-aee9-4660-9fa9-96d99e7aca7e?responsive=true&autoplay=false";

// Ensures every Bunny.net URL has the responsive flag and uses the correct embed endpoint
const addBunnyParams = (url) => {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has('responsive')) u.searchParams.set('responsive', 'true');
    
    // Crucial fix: The backend provided a '/play/' URL which renders a full webpage.
    // For iframes, Bunny.net requires the '/embed/' endpoint to stretch full width.
    if (u.pathname.includes('/play/')) {
        u.pathname = u.pathname.replace('/play/', '/embed/');
    }
    
    return u.toString();
  } catch {
    return url;
  }
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6F6AF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M22 4L12 14.01l-3-3" />
  </svg>
);

const CircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF690B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF690B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FF690B" stroke="#FF690B" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// Clase cerrada (sin comprar y sin marcar como muestra gratis)
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ─── Video Player Component ───────────────────────────────────────────────────
function VideoPlayer({ videoUrl, videoTitle }) {
  const src = addBunnyParams(videoUrl);
  return (
    <div className="w-full mb-8">
      <div className="w-full aspect-video rounded-[20px] overflow-hidden shadow-lg">
        <iframe
          src={src}
          className="w-full h-full block"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          title={videoTitle || "Video del curso"}
          style={{ border: "none" }}
        />
      </div>
      {videoTitle && (
        <h3 className="mt-4 text-[#3932C0] font-semibold text-lg">{videoTitle}</h3>
      )}
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────
function CursosPageContent() {
  const searchParams = useSearchParams();
  const courseIdParam = searchParams.get("id");

  const { token, isSubscribed } = useAuthStore();

  // ── Cursos que este usuario posee de verdad (compra individual, IAP o
  //    concesión manual del back office) — GET /api/v1/course/by-user vía
  //    el MISMO hook que ya usan el Sidebar y Mi programa/Mi entreno/Mi
  //    cocina (useProgramAccess.js). No se monta una llamada nueva: se
  //    reutiliza (y su caché por token) para no duplicar la petición.
  const { courses: ownedCourses, checked: ownedCoursesChecked } = useProgramAccess();
  const ownedCourseIds = useMemo(
    () => new Set((ownedCourses || []).map((c) => c.id)),
    [ownedCourses]
  );

  // ¿Biblioteca Digital abre TODOS los cursos en esta sesión? Ver el
  // interruptor DIGITAL_LIBRARY_UNLOCKS_COURSES arriba: hoy siempre true,
  // así que esto equivale exactamente a `isSubscribed` como era antes.
  const digitalLibraryGrantsAllCourses = isSubscribed && DIGITAL_LIBRARY_UNLOCKS_COURSES;

  // ¿Tiene el usuario acceso a ESTE curso en concreto? Suma dos fuentes
  // independientes — nunca resta: si CUALQUIERA de las dos dice que sí, hay
  // acceso.
  const hasCourseAccess = (courseId) =>
    digitalLibraryGrantsAllCourses || (!!courseId && ownedCourseIds.has(courseId));

  // ── Vista: 'catalog' o 'player' ─────────────────────────────────────────────
  const [view, setView] = useState('catalog');
  const [courseList, setCourseList] = useState([]);

  // ── Progreso por curso (spec TMV): pestañas En progreso / Pendientes /
  //    Completados. El % sale de los vídeos vistos del detalle de cada curso;
  //    si el detalle no responde, el curso queda en "En progreso" sin barra.
  const [progressMap, setProgressMap] = useState({});
  const [statusTab, setStatusTab] = useState('progress');

  // ── Muestras gratuitas (sin suscripción): qué curso tiene, en su currícula
  //    pública, al menos una clase marcada video_is_free_sample=true. Se
  //    calcula ANTES de decidir qué pantalla mostrar: si nadie tiene ninguna
  //    marca (el caso real de hoy, backend sin desplegar), la sección se
  //    comporta exactamente igual que antes de este cambio.
  const [sampleMap, setSampleMap] = useState({});
  const [catalogHasFreeSamples, setCatalogHasFreeSamples] = useState(false);

  // ── Player state ─────────────────────────────────────────────────────────────
  const [activeCourse, setActiveCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);
  // Error al cargar el detalle del curso (no reproducimos el vídeo de prueba:
  // el alumno creería estar viendo su clase). Guarda flag → botón reintentar.
  const [playerError, setPlayerError] = useState(false);
  // Tests del curso (clase/módulo/final) y el test abierto en el modal (R1-F6).
  const [courseTests, setCourseTests] = useState([]);
  const [activeTest, setActiveTest] = useState(null);

  // ── Global loading / access ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);

  const playerRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  // Devuelve la URL real del vídeo, o null si no se pudo resolver. NUNCA
  // devuelve el vídeo de prueba: si esto falla, el player muestra un error con
  // botón de reintentar en vez de reproducir una clase que no es la del alumno.
  const getVideoUrl = async (videoId, headers, API) => {
    if (!videoId || videoId === "placeholder") return null;
    try {
      const res = await axios.get(`${API}/api/v1/course/watch-video`, {
        params: { video_id: videoId },
        headers,
      });
      return typeof res.data === 'string'
        ? res.data
        : res.data?.url || res.data?.video_url || res.data?.stream_url || null;
    } catch (err) {
      // Token caducado → re-login; cualquier otro fallo → null (estado de error).
      handleApiError(err, '/panel-cursos');
      return null;
    }
  };

  const buildModulesFromVideos = (videos) => {
    const groups = {};
    videos.forEach((video, index) => {
      const moduleName = video.module || video.module_name || video.section || "Bloque 1: General";
      if (!groups[moduleName]) {
        groups[moduleName] = { id: `mod-${index}`, name: moduleName, videos: [] };
      }
      groups[moduleName].videos.push(video);
    });
    return Object.values(groups);
  };

  // ── Abre un curso en la vista player ─────────────────────────────────────────
  const openCourse = async (course) => {
    setActiveCourse(course);
    setModules([]);
    setSelectedVideo(null);
    setPlayerError(false);
    setView('player');
    setPlayerLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL;

      const detailRes = await axios.get(`${API}/api/v1/course/detail/${course.id}`, { headers });
      const detail = detailRes.data;
      const videos = detail?.videos || detail?.curriculum || detail?.lessons || [];

      // Tests del curso (best-effort: si el endpoint falla, el curso funciona igual).
      setCourseTests([]);
      setActiveTest(null);
      axios.get(`${API}/api/v1/course/tests`, { headers, params: { course_id: course.id } })
        .then((r) => setCourseTests(Array.isArray(r.data) ? r.data : []))
        .catch(() => setCourseTests([]));

      if (Array.isArray(videos) && videos.length > 0) {
        const modulesArray = buildModulesFromVideos(videos);
        setModules(modulesArray);

        // Qué clase se abre automáticamente:
        // - Con acceso a ESTE curso (Biblioteca Digital si el interruptor
        //   la deja abrir cursos, O course/by-user): la primera del
        //   temario, EXACTO como siempre para quien ya tenía acceso.
        // - Sin acceso a este curso: NUNCA por posición. Solo la clase que
        //   el backend marcó video_is_free_sample=true puede reproducirse;
        //   si ninguna lo está, no se selecciona nada (candado, igual que
        //   hoy).
        const courseAccess = hasCourseAccess(course.id);
        const videoToOpen = courseAccess
          ? videos[0]
          : videos.find((v) => v.video_is_free_sample === true) || null;

        if (modulesArray.length > 0) {
          const ownerModule = videoToOpen
            ? modulesArray.find((m) =>
                m.videos.some((v) => (v.video_id || v.id) === (videoToOpen.video_id || videoToOpen.id))
              )
            : null;
          setExpandedModules({ [(ownerModule || modulesArray[0]).id]: true });
        }

        if (videoToOpen) {
          const firstId = videoToOpen.video_id || videoToOpen.id;
          const firstTitle = videoToOpen.video_title || videoToOpen.title;
          setSelectedVideo({ id: firstId, title: firstTitle, url: null, loading: true });
          setVideoLoading(true);
          const url = await getVideoUrl(firstId, headers, API);
          // Sin URL real → estado de error (con reintento), nunca vídeo de prueba.
          setSelectedVideo({ id: firstId, title: firstTitle, url, loading: false, error: !url });
          setVideoLoading(false);
        } else {
          // Sin suscripción y sin ninguna clase de muestra en este curso:
          // no hay nada que reproducir. No se llama a watch-video porque no
          // hay ninguna clase gratuita que pedir.
          setSelectedVideo(null);
          setVideoLoading(false);
        }
      } else {
        // Curso sin videos todavía: estado honesto "contenido próximamente",
        // sin reproducir un vídeo de prueba.
        setModules([{
          id: "dummy-1", name: "Contenido próximamente",
          videos: [{ video_id: "placeholder", video_title: "Videos disponibles pronto", video_url: null, views: { is_viewed: false } }]
        }]);
        setSelectedVideo({ id: null, title: "Contenido próximamente", url: null, loading: false, empty: true });
        setExpandedModules({ "dummy-1": true });
      }
    } catch (err) {
      // Token caducado → re-login. Otro fallo → estado de error con reintento;
      // NO pintamos módulos/vídeo de prueba (el alumno creería ver su clase).
      if (handleApiError(err, '/panel-cursos')) return;
      console.warn("Error al cargar detalle del curso:", err?.message);
      setModules([]);
      setSelectedVideo(null);
      setPlayerError(true);
    } finally {
      setPlayerLoading(false);
    }
  };

  const fetchProgressFor = async (list, headers, API) => {
    const entries = await Promise.all(
      list.map(async (course) => {
        try {
          const res = await axios.get(`${API}/api/v1/course/detail/${course.id}`, { headers });
          const videos = res.data?.videos || res.data?.curriculum || res.data?.lessons || [];
          if (!Array.isArray(videos) || videos.length === 0) return [course.id, 0];
          const viewed = videos.filter((v) => v.views?.is_viewed).length;
          return [course.id, Math.round((viewed / videos.length) * 100)];
        } catch {
          return [course.id, null]; // detalle no disponible → sin % (no se inventa)
        }
      })
    );
    const map = Object.fromEntries(entries);
    setProgressMap(map);
    // Arranca en la primera pestaña que tenga cursos.
    const status = (p) => (p === 100 ? 'done' : p === 0 ? 'pending' : 'progress');
    const counts = { progress: 0, pending: 0, done: 0 };
    list.forEach((c) => { counts[status(map[c.id] ?? null)]++; });
    setStatusTab(counts.progress > 0 ? 'progress' : counts.pending > 0 ? 'pending' : counts.done > 0 ? 'done' : 'progress');
  };

  // Para cada curso, ¿tiene alguna clase marcada como muestra gratis en su
  // currícula pública? Detalle no disponible → se trata como "sin muestra"
  // (fallback seguro: nunca se inventa acceso).
  const fetchFreeSampleInfoFor = async (list, headers, API) => {
    const entries = await Promise.all(
      list.map(async (course) => {
        try {
          const res = await axios.get(`${API}/api/v1/course/detail/${course.id}`, { headers });
          const videos = res.data?.videos || res.data?.curriculum || res.data?.lessons || [];
          const hasSample = Array.isArray(videos) && videos.some((v) => v.video_is_free_sample === true);
          return [course.id, hasSample];
        } catch {
          return [course.id, false];
        }
      })
    );
    return Object.fromEntries(entries);
  };

  const fetchCourseList = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL;

      // Obtener cursos directamente de /course/all (endpoint público: no
      // depende de tener suscripción, así que se pide siempre).
      const allRes = await axios.get(`${API}/api/v1/course/all`, { headers });
      const list = allRes.data;

      if (Array.isArray(list)) {
        setCourseList(list);
        setNoAccess(false);

        if (digitalLibraryGrantsAllCourses) {
          // ── Biblioteca Digital abre todo: comportamiento EXACTO de
          //    siempre (mismo código que antes de esta rama, solo cambia
          //    el nombre de la condición) ─────────────────────────────
          if (courseIdParam) {
            const target = list.find((c) => c.id === courseIdParam) || list[0];
            openCourse(target);
          }
          // Progreso real de cada curso (vídeos vistos en su detalle).
          fetchProgressFor(list, headers, API);
        } else {
          // ── Sin acceso global: hay que saber ANTES de pintar nada si
          //    existe al menos una muestra gratis en TODO el catálogo (si
          //    no existe ninguna, hoy sin el campo desplegado, esta rama se
          //    comporta igual que antes) Y, NUEVO, qué cursos posee el
          //    usuario de verdad (course/by-user) — puramente aditivo: si
          //    no posee ninguno, `owned` queda vacío y nada cambia.
          const owned = list.filter((c) => ownedCourseIds.has(c.id));
          if (owned.length > 0) {
            // Progreso SOLO de los cursos que sí son suyos.
            fetchProgressFor(owned, headers, API);
          }

          const map = await fetchFreeSampleInfoFor(list, headers, API);
          setSampleMap(map);
          const anySample = Object.values(map).some(Boolean);
          setCatalogHasFreeSamples(anySample);

          if (courseIdParam && (anySample || owned.length > 0)) {
            const target = list.find((c) => c.id === courseIdParam) || list[0];
            if (target) openCourse(target);
          }
        }
      } else {
        setCourseList([]);
        setNoAccess(true);
      }
    } catch (err) {
      // Token caducado → re-login en vez de la tienda "no tienes acceso".
      if (handleApiError(err, '/panel-cursos')) return;
      console.error("Error al cargar cursos:", err);
      setCourseList([]);
      setNoAccess(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Carga inicial: lista de cursos ────────────────────────────────────────────
  // Se pide siempre que haya token: /course/all y /course/detail/:id son
  // públicos, así que un usuario sin compras también puede ver el catálogo
  // (con sus muestras gratis, si las hay).
  //
  // Espera a `ownedCoursesChecked` (course/by-user, vía useProgramAccess)
  // antes de decidir catálogo/tienda: sin esto, un cliente con un curso
  // suelto vería un parpadeo de "sin acceso" mientras esa llamada aparte
  // todavía está en vuelo, y se corregiría sola medio segundo después. Con
  // Biblioteca Digital (digitalLibraryGrantsAllCourses=true, el caso de
  // hoy) el resultado no depende de course/by-user, pero esperar tampoco
  // cambia nada para ese caso: solo añade el mismo medio segundo de spinner
  // que ya tarda advice/by-user en el Sidebar.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    if (!ownedCoursesChecked) return;
    fetchCourseList();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isSubscribed, ownedCoursesChecked]);

  // ── Cuando cambia ?id= mientras ya hay cursos cargados ───────────────────────
  useEffect(() => {
    if (courseIdParam && courseList.length > 0) {
      const target = courseList.find((c) => c.id === courseIdParam) || courseList[0];
      openCourse(target);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdParam]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleVideoSelect = async (video) => {
    const videoId = video.video_id || video.id;
    const videoTitle = video.video_title || video.title;

    // Nunca se abre desde el front una clase que el usuario no tiene: sin
    // acceso a ESTE curso (ni Biblioteca Digital-si-aplica ni course/by-user),
    // solo se puede reproducir la clase que el backend marcó
    // video_is_free_sample=true. El resto ni siquiera llega a pedir
    // watch-video (aunque lo pidiera, el backend respondería 403).
    if (!hasCourseAccess(activeCourse?.id) && video.video_is_free_sample !== true) {
      return;
    }

    if (video.video_url && video.video_url !== TEST_VIDEO_URL) {
      setSelectedVideo({ id: videoId, title: videoTitle, url: video.video_url, loading: false });
    } else {
      setSelectedVideo({ id: videoId, title: videoTitle, url: null, loading: true });
      setVideoLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL;
      const url = await getVideoUrl(videoId, headers, API);
      // Sin URL real → estado de error con reintento (nunca vídeo de prueba).
      setSelectedVideo({ id: videoId, title: videoTitle, url, loading: false, error: !url });
      setVideoLoading(false);
    }

    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Reintentar la carga del vídeo seleccionado tras un error de watch-video.
  const retryVideo = async () => {
    if (!selectedVideo?.id) return;
    setSelectedVideo((v) => ({ ...v, error: false, loading: true }));
    setVideoLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    const API = process.env.NEXT_PUBLIC_API_URL;
    const url = await getVideoUrl(selectedVideo.id, headers, API);
    setSelectedVideo((v) => ({ ...v, url, loading: false, error: !url }));
    setVideoLoading(false);
  };

  // ¿Tiene acceso al curso que está viendo AHORA en el player? Gobierna el
  // candado por vídeo, la apertura automática y los CTA de compra dentro
  // del reproductor. Con activeCourse aún sin fijar (instante inicial),
  // usa el mismo valor por defecto que el resto de la pantalla.
  const activeCourseAccess = activeCourse
    ? hasCourseAccess(activeCourse.id)
    : digitalLibraryGrantsAllCourses;

  // ── Métricas de progreso ──────────────────────────────────────────────────────
  let totalVideos = 0, completedVideos = 0;
  modules.forEach((mod) => mod.videos.forEach((v) => {
    totalVideos++;
    if (v.views?.is_viewed) completedVideos++;
  }));
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  // ── Renders ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3932C0]"></div>
      </div>
    );
  }

  // Pantalla de venta pura: solo cuando falló la carga de verdad, o cuando
  // no hay NINGUNA muestra gratis en todo el catálogo Y el usuario no posee
  // ni un solo curso (ni por Biblioteca Digital si el interruptor la deja
  // abrir cursos, ni por course/by-user). El añadido de ownedCourseIds es
  // la mitad "aditiva" de la rama fix/acceso-cursos-no-detectado: antes,
  // alguien con un curso comprado suelto y sin Biblioteca Digital caía
  // siempre aquí, viera lo que viera /course/all.
  const showPaywallScreen =
    noAccess || (!digitalLibraryGrantsAllCourses && !catalogHasFreeSamples && ownedCourseIds.size === 0);
  if (showPaywallScreen) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 min-h-screen">
        <h1 className="text-[#3932C0] text-5xl font-bold mb-16">Mis cursos</h1>
        <div className="text-center mb-12">
          <h2 className="text-[#3932C0] text-3xl font-bold mb-4">Aún no tienes acceso a los cursos</h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
            Elige tu curso y cómo quieres acceder: <strong>mensual</strong> (suscripción),{' '}
            <strong>anual</strong> (pago único, 12 meses de acceso) o <strong>de por vida</strong>.
          </p>
        </div>

        {/* Tienda 15.1: una tarjeta por curso con selector de tramo */}
        <CourseTierShop highlight="Fuerte y Definid@" />

        {/* Enlace discreto para refrescar el acceso tras comprar */}
        <div className="w-full flex justify-center">
          <button
            onClick={async () => {
              setLoading(true);
              await useAuthStore.getState().refreshSubscriptionStatus();
              setLoading(false);
            }}
            disabled={loading}
            className="mt-10 flex items-center gap-2 text-sm text-gray-400 hover:text-[#FF690B] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} />
            ¿Acabas de comprar y no ves tu acceso? Actualizar
          </button>
        </div>
      </div>
    );
  }

  // ── Vista: Catálogo SIN acceso global (Biblioteca Digital no abre todo,
  //    o no está suscrito) ──────────────────────────────────────────────────
  // Se llega aquí en dos casos, en la MISMA pantalla, pieza a pieza por
  // curso (estado mixto):
  //   - catalogHasFreeSamples y ownedCourseIds vacío: el caso de siempre,
  //     sin ningún cambio (todas las tarjetas se comportan igual que antes
  //     de esta rama: candado o "clase de muestra").
  //   - ownedCourseIds NO vacío (NUEVO): además de lo anterior, los cursos
  //     que el usuario sí posee (course/by-user) se pintan abiertos, con su
  //     progreso si ya se calculó. Antes de esta rama este caso ni existía:
  //     todo el mundo sin Biblioteca Digital caía en la pantalla de venta.
  // No hay pestañas de progreso globales: con acceso parcial, "en
  // progreso/pendiente/completado" del catálogo entero no tiene sentido
  // (esas pestañas siguen siendo solo de la vista con acceso completo, más
  // abajo, intacta).
  if (view === 'catalog' && !digitalLibraryGrantsAllCourses) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 md:p-12 min-h-screen">
        <h1 className="text-[#3932C0] text-5xl font-bold mb-4">Mis cursos</h1>
        <p className="text-gray-400 text-lg mb-10">
          {ownedCourseIds.size > 0
            ? 'Aquí tienes tus cursos. Prueba gratis la clase de muestra de los demás, o consigue el acceso completo.'
            : 'Prueba gratis la clase de muestra de cada curso, o consigue el acceso completo.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courseList.map((course) => {
            const owned = hasCourseAccess(course.id);
            const hasSample = !owned && !!sampleMap[course.id];
            const progress = owned ? progressMap[course.id] : null;
            return (
              <button
                key={course.id}
                onClick={() => openCourse(course)}
                className="group text-left bg-white border-2 border-gray-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#FF690B]/30 transition-all duration-300 cursor-pointer"
              >
                <div className="relative w-full aspect-video bg-gradient-to-br from-[#3932C0]/10 to-[#FF690B]/10 overflow-hidden">
                  {course.image ? (
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🎓</span>
                    </div>
                  )}
                  {owned ? (
                    <span className="absolute top-3 left-3 rounded-full bg-[#3932C0] text-white text-xs font-bold px-3 py-1 shadow">
                      Tu curso
                    </span>
                  ) : hasSample ? (
                    <span className="absolute top-3 left-3 rounded-full bg-[#22C55E] text-white text-xs font-bold px-3 py-1 shadow">
                      Clase de muestra gratis
                    </span>
                  ) : null}
                </div>

                <div className="p-6">
                  <p className="text-[#FF690B] text-xs font-bold uppercase tracking-widest mb-2">Curso</p>
                  <h2 className="text-[#3932C0] text-xl font-bold mb-2 group-hover:text-[#FF690B] transition-colors line-clamp-2">
                    {course.title || "Curso sin título"}
                  </h2>
                  {course.subtitle && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.subtitle}</p>
                  )}
                  {owned && progress != null && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 bg-[#FFF6F0] rounded-full h-2.5">
                        <div
                          className="bg-[#FF690B] h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[#FF690B] font-bold text-xs whitespace-nowrap">{progress}%</span>
                    </div>
                  )}
                  <p
                    className="text-sm font-semibold mt-3"
                    style={{ color: owned ? '#3932C0' : hasSample ? '#22C55E' : '#9CA3AF' }}
                  >
                    {owned ? 'Continuar curso' : hasSample ? 'Ver clase gratis' : 'Consíguelo para ver el temario'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="w-full flex justify-center mt-14">
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-[#FF690B] font-bold hover:underline"
          >
            Ver todos los cursos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Vista: Catálogo de cursos ─────────────────────────────────────────────────
  if (view === 'catalog') {
    const statusOf = (course) => {
      const p = progressMap[course.id] ?? null;
      return p === 100 ? 'done' : p === 0 ? 'pending' : 'progress';
    };
    const counts = { progress: 0, pending: 0, done: 0 };
    courseList.forEach((c) => { counts[statusOf(c)]++; });
    const STATUS_TABS = [
      { id: 'progress', label: `En progreso (${counts.progress})` },
      { id: 'pending', label: `Pendientes (${counts.pending})` },
      { id: 'done', label: `Completados (${counts.done})` },
    ];
    const visibleCourses = courseList.filter((c) => statusOf(c) === statusTab);
    const EMPTY_TAB_TEXT = {
      progress: 'No tienes ningún curso en progreso ahora mismo.',
      pending: 'No tienes cursos pendientes de empezar.',
      done: 'Todavía no has completado ningún curso. ¡Ánimo, cada clase suma!',
    };

    return (
      <div className="w-full max-w-6xl mx-auto p-6 md:p-12 min-h-screen">
        <h1 className="text-[#3932C0] text-5xl font-bold mb-4">Mis cursos</h1>
        <p className="text-gray-400 text-lg mb-8">{courseList.length} curso{courseList.length !== 1 ? 's' : ''} en tu cuenta</p>

        <BrandTabs tabs={STATUS_TABS} active={statusTab} onChange={setStatusTab} className="mb-10" />

        {visibleCourses.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center mb-10">
            <p className="text-slate-500">{EMPTY_TAB_TEXT[statusTab]}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => openCourse(course)}
              className="group text-left bg-white border-2 border-gray-100 rounded-[24px] overflow-hidden shadow-sm hover:shadow-xl hover:border-[#FF690B]/30 transition-all duration-300 cursor-pointer"
            >
              {/* Imagen del curso */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-[#3932C0]/10 to-[#FF690B]/10 overflow-hidden">
                {course.image ? (
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🎓</span>
                  </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#FF690B] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Info del curso */}
              <div className="p-6">
                <p className="text-[#FF690B] text-xs font-bold uppercase tracking-widest mb-2">Curso</p>
                <h2 className="text-[#3932C0] text-xl font-bold mb-2 group-hover:text-[#FF690B] transition-colors line-clamp-2">
                  {course.title || "Curso sin título"}
                </h2>
                {course.subtitle && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.subtitle}</p>
                )}

                {/* Progreso del curso (si el detalle lo ha devuelto) */}
                {progressMap[course.id] != null && (
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex-1 bg-[#FFF6F0] rounded-full h-2.5">
                      <div
                        className="bg-[#FF690B] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressMap[course.id]}%` }}
                      />
                    </div>
                    <span className="text-[#FF690B] font-bold text-xs whitespace-nowrap">
                      {progressMap[course.id]}%
                    </span>
                  </div>
                )}

                {/* Tutor */}
                {course.tutor && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    {course.tutor.profile_picture ? (
                      <img src={course.tutor.profile_picture} alt={course.tutor.firstName} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#3932C0]/10 flex items-center justify-center text-xs font-bold text-[#3932C0]">
                        {course.tutor.firstName?.[0]}
                      </div>
                    )}
                    <span className="text-gray-500 text-sm">{course.tutor.firstName} {course.tutor.lastName}</span>
                    {course.students > 0 && (
                      <span className="ml-auto text-gray-400 text-xs">{course.students} estudiante{course.students !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Al catálogo completo (web pública) para ampliar formación */}
        <div className="w-full flex justify-center mt-14">
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 text-[#FF690B] font-bold hover:underline"
          >
            Ver todos los cursos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Vista: Player del curso ───────────────────────────────────────────────────
  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 min-h-screen">

      {/* Header con botón volver al catálogo */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => setView('catalog')}
          className="hover:bg-gray-100 p-1 rounded-full transition-colors cursor-pointer"
        >
          <BackIcon />
        </button>
      </div>
      <p className="text-[#FF690B] font-bold text-sm mb-2 ml-1">Curso</p>
      <h1 className="text-[#3932C0] text-4xl md:text-5xl font-bold mb-8">
        {activeCourse?.title || "Curso sin Título"}
      </h1>

      {/* Loading del player */}
      {playerLoading ? (
        <div className="w-full aspect-video rounded-[20px] bg-gray-100 flex flex-col items-center justify-center mb-8 shadow-lg gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3932C0]"></div>
          <p className="text-[#3932C0] font-medium text-sm">Cargando curso...</p>
        </div>
      ) : (
        <>
          {/* Video Player */}
          <div ref={playerRef}>
            {!selectedVideo && !activeCourseAccess ? (
              // Sin acceso a ESTE curso y sin ninguna clase de muestra en él:
              // igual que hoy, no hay nada que reproducir hasta comprarlo.
              <div className="w-full aspect-video rounded-[20px] bg-gray-100 flex flex-col items-center justify-center mb-8 shadow-lg gap-3 px-6 text-center">
                <p className="text-[#363C98] font-semibold text-lg">Todavía no tienes acceso a este curso</p>
                <p className="text-[#6B6BA8] text-sm max-w-md">
                  Este curso todavía no tiene ninguna clase de muestra gratuita. Consigue el acceso para ver el temario completo.
                </p>
                <Link
                  href="/cursos"
                  className="mt-1 rounded-xl px-5 py-2.5 font-bold text-white text-sm inline-block"
                  style={{ backgroundColor: '#FF690B' }}
                >
                  Ver opciones de acceso
                </Link>
              </div>
            ) : null}
            {selectedVideo && (
              selectedVideo.loading || videoLoading ? (
                <div className="w-full aspect-video rounded-[20px] bg-gray-100 flex flex-col items-center justify-center mb-8 shadow-lg gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3932C0]"></div>
                  <p className="text-[#3932C0] font-medium text-sm">Cargando video...</p>
                </div>
              ) : selectedVideo.error || !selectedVideo.url ? (
                // Error real: NO reproducimos el vídeo de prueba (el alumno creería
                // estar viendo su clase). Estado de error con botón de reintentar.
                <div className="w-full aspect-video rounded-[20px] bg-gray-100 flex flex-col items-center justify-center mb-8 shadow-lg gap-3 px-6 text-center">
                  <p className="text-[#363C98] font-semibold">No hemos podido cargar este vídeo</p>
                  <p className="text-[#6B6BA8] text-sm">Comprueba tu conexión e inténtalo de nuevo.</p>
                  <button
                    onClick={retryVideo}
                    className="mt-1 rounded-xl px-5 py-2.5 font-bold text-white text-sm"
                    style={{ backgroundColor: '#FF690B' }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <VideoPlayer videoUrl={selectedVideo.url} videoTitle={selectedVideo.title} />
              )
            )}
          </div>

          {/* Tests del curso (R1-F6): el de la clase seleccionada + módulos/final */}
          {(() => {
            const classTest = selectedVideo?.id
              ? courseTests.find((t) => t.kind === 'class' && t.video_id === selectedVideo.id)
              : null;
            const otherTests = courseTests.filter((t) => t.kind === 'module' || t.kind === 'final');
            if (!classTest && otherTests.length === 0) return null;
            return (
              <div className="mb-8 flex flex-wrap items-center gap-2.5">
                {classTest && (
                  <button
                    onClick={() => setActiveTest(classTest)}
                    className="rounded-2xl bg-[#FF690B] px-5 py-2.5 text-sm sm:text-base font-bold text-white shadow-md hover:scale-[1.02] active:scale-95 transition-transform cursor-pointer"
                  >
                    📝 Test de esta clase
                  </button>
                )}
                {otherTests.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTest(t)}
                    className="rounded-2xl border-2 border-[#363C98]/20 bg-white px-4 py-2.5 text-sm font-bold text-[#363C98] hover:border-[#FF690B] hover:text-[#FF690B] transition-colors cursor-pointer"
                  >
                    {t.kind === 'final' ? '🏁 Test final' : `📚 ${t.title || 'Test del módulo'}`}
                  </button>
                ))}
              </div>
            );
          })()}

          {/* Modal del quiz (overlay fijo) */}
          {activeTest && (
            <TestQuiz test={activeTest} token={token} onClose={() => setActiveTest(null)} />
          )}

          {/* Progress Card: solo tiene sentido con acceso al curso */}
          {activeCourseAccess && (
            <div className="bg-white border-2 border-gray-100 rounded-[20px] p-6 mb-12 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                <span className="text-[#FF690B] font-bold text-lg whitespace-nowrap">
                  {progressPercent}% completado
                </span>
                <div className="w-full bg-[#FFF6F0] rounded-full h-4">
                  <div
                    className="bg-[#FF690B] h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* CTA de compra: sin acceso a este curso, el resto del temario está cerrado */}
          {!activeCourseAccess && (
            <div className="mb-12 rounded-2xl border-2 border-[#FF690B]/30 bg-[#FFF6F0] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-[#3932C0] font-bold text-lg">¿Te está gustando?</p>
                <p className="text-gray-500 text-sm">Consigue el acceso completo para ver todas las clases del curso.</p>
              </div>
              <Link
                href="/cursos"
                className="shrink-0 rounded-xl px-5 py-2.5 font-bold text-white text-sm text-center whitespace-nowrap"
                style={{ backgroundColor: '#FF690B' }}
              >
                Ver opciones de acceso
              </Link>
            </div>
          )}

          {/* Modules / Content */}
          <h2 className="text-[#3932C0] text-2xl font-bold mb-6">Contenido del curso</h2>
          <div className="space-y-4">
            {modules.map((mod) => {
              const isExpanded = expandedModules[mod.id];
              const isModuleComplete = mod.videos.length > 0 && mod.videos.every((v) => v.views?.is_viewed);
              return (
                <div key={mod.id} className="bg-white border-2 border-gray-100 rounded-[20px] overflow-hidden shadow-sm transition-all">
                  <div onClick={() => toggleModule(mod.id)} className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                      <span className="text-[#FF690B] text-xl font-medium">{mod.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isModuleComplete ? (
                        <><span className="text-[#22C55E] text-sm font-medium">Completo</span><CheckCircleIcon /></>
                      ) : (
                        <><span className="text-gray-300 text-sm font-medium">Siguiente</span><CircleIcon /></>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 bg-white border-t border-gray-50">
                      <div className="space-y-2 ml-10">
                        {mod.videos.map((video, vIdx) => {
                          const isVideoComplete = video.views?.is_viewed;
                          const isActive = selectedVideo?.id === (video.video_id || video.id);
                          // Sin acceso a ESTE curso, solo la clase marcada por el
                          // backend se puede abrir; el resto queda cerrada (candado,
                          // sin onClick).
                          const isFreeSample = video.video_is_free_sample === true;
                          // El placeholder de "contenido próximamente" no es una
                          // clase real: no se bloquea con el candado de compra.
                          const isLocked = !activeCourseAccess && !isFreeSample && video.video_id !== "placeholder";
                          return (
                            <div
                              key={video.video_id || vIdx}
                              onClick={isLocked ? undefined : () => handleVideoSelect(video)}
                              aria-disabled={isLocked}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-xl transition-all border-2 ${
                                isLocked
                                  ? "cursor-not-allowed opacity-60 border-transparent"
                                  : `cursor-pointer ${isActive ? "border-[#FF690B] bg-[#FFF6F0]" : "border-transparent hover:bg-orange-50/60"}`
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                                <span className="text-[#FF690B] flex-shrink-0 w-4">
                                  {isLocked ? <LockIcon /> : isActive ? <PlayIcon /> : null}
                                </span>
                                <span className={`font-medium text-base ${isLocked ? "text-gray-400" : isActive ? "text-[#3932C0]" : "text-[#FF690B]"}`}>
                                  {video.video_title || video.title}
                                </span>
                                {!activeCourseAccess && isFreeSample && (
                                  <span className="rounded-full bg-[#22C55E]/10 text-[#22C55E] text-xs font-bold px-2 py-0.5 whitespace-nowrap">
                                    Muestra gratis
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 self-start sm:self-auto">
                                {isLocked ? (
                                  <span className="text-gray-400 text-sm font-medium">Comprar para ver</span>
                                ) : isVideoComplete ? (
                                  <><span className="text-[#22C55E] text-sm font-medium">Completo</span><CheckCircleIcon /></>
                                ) : (
                                  <><span className="text-gray-300 text-sm font-medium">Siguiente</span><CircleIcon /></>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}




export default function CursosPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3932C0]"></div>
      </div>
    }>
      <CursosPageContent />
    </Suspense>
  );
}
