"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuthStore } from "@/stores/auth.store";
import ConfirmationModal from "@/app/components/ConfirmationModal";

// --- Icons ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6F6AF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const UserIcon = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF690B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

// --- Validation Schema ---
const ProfileSchema = Yup.object().shape({
  nombre: Yup.string().required("El nombre es obligatorio"),
  apellidos: Yup.string().required("Los apellidos son obligatorios"),
  nombrePublico: Yup.string().required("El nombre público es obligatorio"),
  telefono: Yup.string().required("El teléfono es obligatorio"),
  email: Yup.string().email("Email inválido").required("El email es obligatorio"),
  contrasena: Yup.string().required("La contraseña es obligatoria"),
  fechaNacimiento: Yup.date().nullable(),
});

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);

  const formik = useFormik({
    initialValues: {
      nombre: "Eben",
      apellidos: "Sivianes",
      nombrePublico: "Eben S.",
      telefono: "+34 600 00 00 00",
      email: "email@gmail.com",
      contrasena: "*********",
      fechaNacimiento: "1911-11-11", // Changed to YYYY-MM-DD for consistency with date inputs if needed, normally handling text for mock
    },
    validationSchema: ProfileSchema,
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      // Handle update logic here
    },
  });

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-12 min-h-screen">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center space-x-2"> {/* Just Back Arrow and Title */}
           <button onClick={() => router.back()} className="hover:bg-gray-100 p-2 rounded-full transition-colors">
             <BackIcon />
           </button>
           {/* Title below back button in design? Or Next to it? 
               Design: Back arrow top left. Title "Mi perfil" below it? 
               Actually looks like Header row: < Back >        (Right: Trash)
               Row below: Title "Mi perfil"
           */}
        </div>

        {/* User Icon */}
        <div className="p-4 rounded-full flex items-center justify-center h-20 w-20 bg-[#FFF6F0]"> 
            <div className="bg-[#FF690B] p-3 rounded-full">
             <UserIcon />
            </div>
        </div>
      </div>

      <h1 className="text-[#3932C0] text-3xl font-bold mb-8 mt-[-40px] ml-4">Mi perfil</h1>

      {/* Form */}
      <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Nombre */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF690B] font-medium ml-1">Nombre*</label>
          <input
            name="nombre"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.nombre}
            className={`border-2 border-[#FF690B] rounded-2xl px-4 py-3 text-[#FF690B] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF690B]/50 bg-white ${formik.touched.nombre && formik.errors.nombre ? 'border-red-500' : ''}`}
          />
          {formik.touched.nombre && formik.errors.nombre && (
            <div className="text-red-500 text-sm ml-2">{formik.errors.nombre}</div>
          )}
        </div>

        {/* Teléfono */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF690B] font-medium ml-1">Teléfono *</label>
          <input
            name="telefono"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.telefono}
            className="border-2 border-[#FF690B] rounded-2xl px-4 py-3 text-[#FF690B] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF690B]/50 bg-white"
          />
          {formik.touched.telefono && formik.errors.telefono && (
             <div className="text-red-500 text-sm ml-2">{formik.errors.telefono}</div>
          )}
        </div>

        {/* Apellidos */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF690B] font-medium ml-1">Apellidos*</label>
          <input
            name="apellidos"
            type="text"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.apellidos}
            className="border-2 border-[#FF690B] rounded-2xl px-4 py-3 text-[#FF690B] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF690B]/50 bg-white"
          />
           {formik.touched.apellidos && formik.errors.apellidos && (
             <div className="text-red-500 text-sm ml-2">{formik.errors.apellidos}</div>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-2 relative">
          <label className="text-[#FF690B] font-medium ml-1">Email *</label>
          <div className="relative">
            <input
                name="email"
                type="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="border-2 border-[#FF690B] rounded-2xl px-4 py-3 text-[#FF690B] font-bold w-full focus:outline-none focus:ring-2 focus:ring-[#FF690B]/50 bg-white"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <PencilIcon />
            </div>
          </div>
           {formik.touched.email && formik.errors.email && (
             <div className="text-red-500 text-sm ml-2">{formik.errors.email}</div>
          )}
        </div>

        {/* Nombre Público */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF690B] font-medium ml-1">Nombre público*</label>
           <div className="relative">
            <input
                name="nombrePublico"
                type="text"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nombrePublico}
                className="border-2 border-[#FF690B] rounded-2xl px-4 py-3 text-[#FF690B] font-bold w-full focus:outline-none focus:ring-2 focus:ring-[#FF690B]/50 bg-white"
            />
             {/* Mocking the 'x' close style from image if needed, for now standard input */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-[#FF690B]" onClick={() => formik.setFieldValue('nombrePublico', '')}>
                ✕
            </div>
           </div>
           {formik.touched.nombrePublico && formik.errors.nombrePublico && (
             <div className="text-red-500 text-sm ml-2">{formik.errors.nombrePublico}</div>
          )}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF690B] font-medium ml-1">Contraseña *</label>
          <div className="relative">
            <input
                name="contrasena"
                type="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.contrasena}
                className="border-2 border-[#FF690B] rounded-2xl px-4 py-3 text-[#FF690B] font-bold w-full focus:outline-none focus:ring-2 focus:ring-[#FF690B]/50 bg-white tracking-widest"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <PencilIcon />
            </div>
          </div>
           {formik.touched.contrasena && formik.errors.contrasena && (
             <div className="text-red-500 text-sm ml-2">{formik.errors.contrasena}</div>
          )}
        </div>

        {/* Fecha de nacimiento */}
        <div className="flex flex-col space-y-2">
          <label className="text-[#FF690B] font-medium ml-1">Fecha de nacimiento</label>
          <input
            name="fechaNacimiento"
            type="date" // Using date input for functionality, though reference has specific text format.
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.fechaNacimiento}
            className="border-2 border-[#FF690B] rounded-2xl px-4 py-3 text-[#FF690B] font-bold focus:outline-none focus:ring-2 focus:ring-[#FF690B]/50 bg-white"
          />
           {formik.touched.fechaNacimiento && formik.errors.fechaNacimiento && (
             <div className="text-red-500 text-sm ml-2">{formik.errors.fechaNacimiento}</div>
          )}
        </div>

        {/* Empty Div for Grid Alignment if odd number items */}
        <div className="hidden md:block"></div>

        {/* Submit / Logout Button - Design places it at bottom right of grid or full width? 
            Design image shows it aligned to the right column? Or full width of that column?
            "Cerrar sesión" usually isn't the form submit, but here it is the main action button shown.
            Wait, the form has "Editar" buttons in the previous inputs (pencil).
            The big orange button says "Cerrar sesión". So the primary action on this page shown is Logout.
            I will place it in the second column slot.
        */}
        <div className="md:col-start-2">
            <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full bg-[#FF690B] hover:bg-[#FF690B]/90 text-white font-bold py-4 rounded-xl shadow-lg transition-colors text-lg"
            >
                Cerrar sesión
            </button>
        </div>

      </form>

       <div className="mt-8 text-right text-gray-400 text-xs">
         Si quieres eliminar tu cuenta, ponte en contacto a través del chat.
       </div>

       <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        message="¿Estás seguro de que quieres cerrar sesión?"
      />

    </div>
  );
}
