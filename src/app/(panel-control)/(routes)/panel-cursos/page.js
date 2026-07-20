"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import CourseTierShop from "@/app/components/CourseTierShop";
import { RefreshCw } from "lucide-react";

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

  // ── Vista: 'catalog' o 'player' ─────────────────────────────────────────────
  const [view, setView] = useState('catalog');
  const [courseList, setCourseList] = useState([]);

  // ── Player state ─────────────────────────────────────────────────────────────
  const [activeCourse, setActiveCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);

  // ── Global loading / access ──────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [noAccess, setNoAccess] = useState(false);

  const playerRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const getVideoUrl = async (videoId, headers, API) => {
    if (!videoId || videoId === "placeholder") return TEST_VIDEO_URL;
    try {
      const res = await axios.get(`${API}/api/v1/course/watch-video`, {
        params: { video_id: videoId },
        headers,
      });
      return typeof res.data === 'string'
        ? res.data
        : res.data?.url || res.data?.video_url || res.data?.stream_url || TEST_VIDEO_URL;
    } catch {
      return TEST_VIDEO_URL;
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
    setView('player');
    setPlayerLoading(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL;

      const detailRes = await axios.get(`${API}/api/v1/course/detail/${course.id}`, { headers });
      const detail = detailRes.data;
      const videos = detail?.videos || detail?.curriculum || detail?.lessons || [];

      if (Array.isArray(videos) && videos.length > 0) {
        const modulesArray = buildModulesFromVideos(videos);
        setModules(modulesArray);
        if (modulesArray.length > 0) setExpandedModules({ [modulesArray[0].id]: true });

        // Cargar la URL del primer video
        const firstVideo = videos[0];
        const firstId = firstVideo.video_id || firstVideo.id;
        const firstTitle = firstVideo.video_title || firstVideo.title;
        setSelectedVideo({ id: firstId, title: firstTitle, url: null, loading: true });
        setVideoLoading(true);
        const url = await getVideoUrl(firstId, headers, API);
        setSelectedVideo({ id: firstId, title: firstTitle, url, loading: false });
        setVideoLoading(false);
      } else {
        // Curso sin videos
        setModules([{
          id: "dummy-1", name: "Contenido próximamente",
          videos: [{ video_id: "placeholder", video_title: "Videos disponibles pronto", video_url: null, views: { is_viewed: false } }]
        }]);
        setSelectedVideo({ id: null, url: TEST_VIDEO_URL, title: "Vista previa", loading: false });
        setExpandedModules({ "dummy-1": true });
      }
    } catch (err) {
      console.warn("Error al cargar detalle del curso:", err?.message);
      setModules([{
        id: "dummy-1", name: "Bloque 1: Introducción",
        videos: [{ video_id: "1", video_title: "Clase 1: Bienvenida", video_url: TEST_VIDEO_URL, views: { is_viewed: false } }]
      }]);
      setSelectedVideo({ id: null, url: TEST_VIDEO_URL, title: "Vista previa", loading: false });
      setExpandedModules({ "dummy-1": true });
    } finally {
      setPlayerLoading(false);
    }
  };

  const fetchCourseList = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL;

      // Obtener cursos directamente de /course/all
      const allRes = await axios.get(`${API}/api/v1/course/all`, { headers });
      const list = allRes.data;

      if (Array.isArray(list)) {
        setCourseList(list);
        setNoAccess(false);

        // Si viene ?id= en la URL, ir directamente al player de ese curso
        if (courseIdParam) {
          const target = list.find((c) => c.id === courseIdParam) || list[0];
          openCourse(target);
        }
      } else {
        setCourseList([]);
        setNoAccess(true);
      }
    } catch (err) {
      console.error("Error al cargar cursos:", err);
      setCourseList([]);
      setNoAccess(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Carga inicial: lista de cursos ────────────────────────────────────────────
  useEffect(() => {
    if (token) {
      if (isSubscribed) {
        fetchCourseList();
      } else {
        setCourseList([]);
        setNoAccess(true);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isSubscribed]);

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

    if (video.video_url && video.video_url !== TEST_VIDEO_URL) {
      setSelectedVideo({ id: videoId, title: videoTitle, url: video.video_url, loading: false });
    } else {
      setSelectedVideo({ id: videoId, title: videoTitle, url: null, loading: true });
      setVideoLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const API = process.env.NEXT_PUBLIC_API_URL;
      const url = await getVideoUrl(videoId, headers, API);
      setSelectedVideo({ id: videoId, title: videoTitle, url, loading: false });
      setVideoLoading(false);
    }

    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

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

  if (!isSubscribed || noAccess) {
    return (
      <div className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 min-h-screen">
        <h1 className="text-[#3932C0] text-5xl font-bold mb-16">Cursos</h1>
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

  // ── Vista: Catálogo de cursos ─────────────────────────────────────────────────
  if (view === 'catalog') {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 md:p-12 min-h-screen">
        <h1 className="text-[#3932C0] text-5xl font-bold mb-4">Cursos</h1>
        <p className="text-gray-400 text-lg mb-12">{courseList.length} curso{courseList.length !== 1 ? 's' : ''} disponible{courseList.length !== 1 ? 's' : ''}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courseList.map((course) => (
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
            {selectedVideo && (
              selectedVideo.loading || videoLoading || !selectedVideo.url ? (
                <div className="w-full aspect-video rounded-[20px] bg-gray-100 flex flex-col items-center justify-center mb-8 shadow-lg gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3932C0]"></div>
                  <p className="text-[#3932C0] font-medium text-sm">Cargando video...</p>
                </div>
              ) : (
                <VideoPlayer videoUrl={selectedVideo.url} videoTitle={selectedVideo.title} />
              )
            )}
          </div>

          {/* Progress Card */}
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
                          return (
                            <div
                              key={video.video_id || vIdx}
                              onClick={() => handleVideoSelect(video)}
                              className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 px-4 rounded-xl cursor-pointer transition-all border-2 ${
                                isActive ? "border-[#FF690B] bg-[#FFF6F0]" : "border-transparent hover:bg-orange-50/60"
                              }`}
                            >
                              <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                                <span className="text-[#FF690B] flex-shrink-0 w-4">
                                  {isActive ? <PlayIcon /> : null}
                                </span>
                                <span className={`font-medium text-base ${isActive ? "text-[#3932C0]" : "text-[#FF690B]"}`}>
                                  {video.video_title || video.title}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 self-start sm:self-auto">
                                {isVideoComplete ? (
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
