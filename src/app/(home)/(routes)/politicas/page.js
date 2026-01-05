'use client'

import React, { useState } from 'react'

export default function page() {
    const [activeTab, setActiveTab] = useState('aviso-legal');

  // Definición de las tabs
  const tabs = [
    { id: 'aviso-legal', label: 'Aviso Legal' },
    { id: 'cookies', label: 'Política de cookies' },
    { id: 'devoluciones', label: 'Política de Devoluciones' },
    { id: 'privacidad', label: 'Política de privacidad' },
    { id: 'terminos', label: 'Términos y condiciones' },
  ];

 return (
    <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* 
         NAVEGACIÓN TIPO TABS (Estilo Carpeta)
         overflow-x-auto permite hacer scroll horizontal en móviles si no caben las tabs 
      */}
      <nav className="flex items-end  border-orange-500 w-full overflow-x-auto no-scrollbar mb-10">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap px-6 py-3 text-base sm:text-lg font-medium transition-all duration-200 rounded-t-2xl
                ${isActive 
                  ? 'text-orange-500 bg-white border-t-2 border-l-2 border-r-2 border-orange-500 -mb-[2px] z-10 font-bold' 
                  : 'text-[#3B3B98] hover:text-blue-800 mb-0 border-b-2 border-primary'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* CONTENIDO */}
      <section className="text-gray-800 leading-relaxed min-h-[500px]">
        
        {activeTab === 'aviso-legal' && <ContenidoAvisoLegal />}
        
        {activeTab === 'cookies' && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Política de Cookies</h1>
            <p>Contenido pendiente de Política de Cookies...</p>
          </div>
        )}

        {activeTab === 'devoluciones' && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Política de Devoluciones</h1>
            <p>Contenido pendiente de Devoluciones...</p>
          </div>
        )}

        {activeTab === 'privacidad' && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Política de Privacidad</h1>
            <p>Contenido pendiente de Privacidad...</p>
          </div>
        )}

        {activeTab === 'terminos' && (
          <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Términos y condiciones</h1>
            <p>Contenido pendiente de Términos...</p>
          </div>
        )}

      </section>
    </main>
  );
};

// Componente con el texto completo del Aviso Legal (Extraído de la imagen)
const ContenidoAvisoLegal = () => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Aviso legal</h1>

      <p className="mb-6">
        En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), la empresa le informa que es titular del portal web/app móvil. De acuerdo con la exigencia del artículo 10 de la citada Ley, informa de los siguientes datos:
      </p>

      <p className="mb-4">El titular de este portal web/app móvil es:</p>

      <div className="mb-8">
        <p>Empresa: Squat Fit SLU</p>
        <p>CIF: B19463066</p>
        <p>Dirección: Av Maisonnave 41, 3 B</p>
        <p>03003, Alicante, España</p>
        <p>Contacto: hola@squatfit.es</p>
      </div>

      <h2 className="text-xl font-bold text-black mb-3">Usuarios</h2>
      <p className="mb-8">
        El acceso y/o uso de este portal le atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Uso del portal</h2>
      <p className="mb-4">
        El portal web/app móvil proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, &quot;los contenidos&quot;) en Internet pertenecientes a María Casas Gómez o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se extiende al registro que fuese necesario para acceder a determinados servicios o contenidos.
      </p>
      <p className="mb-4">
        En dicho registro el USUARIO será responsable de aportar información veraz y lícita. Como consecuencia de este registro, al USUARIO se le puede proporcionar una contraseña de la que será responsable, comprometiéndose a hacer un uso diligente y confidencial de la misma. El USUARIO se compromete a hacer un uso adecuado de los contenidos y servicios que María Casas Gómez ofrece a través de su portal y con carácter enunciativo, pero no limitativo, a no emplearlos para:
      </p>
      <ul className="list-disc pl-6 mb-8 space-y-2">
        <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público</li>
        <li>Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos</li>
        <li>Provocar daños en los sistemas físicos y lógicos de María Casas Gómez, de sus proveedores o de terceras personas, introducir o difundir en la red virus informáticos o cualesquiera otros sistemas físicos o lógicos que sean susceptibles de provocar los daños anteriormente mencionados;</li>
        <li>Intentar acceder y, en su caso, utilizar las cuentas de correo electrónico de otros usuarios y modificar o manipular sus mensajes. María Casas Gómez se reserva el derecho de retirar todos aquellos comentarios y aportaciones que vulneren el respeto a la dignidad de la persona, que sean discriminatorios, xenófobos, racistas, pornográficos, que atenten contra la juventud o la infancia, el orden o la seguridad pública o que, a su juicio, no resultarán adecuados para su publicación. En cualquier caso, María Casas Gómez no será responsable de las opiniones vertidas por los usuarios a través de los foros, chats, u otras herramientas de participación.</li>
      </ul>

      <h2 className="text-xl font-bold text-black mb-3">Propiedad intelectual e industrial</h2>
      <p className="mb-4">
        Squat Fit será titular de todos los derechos de propiedad intelectual e industrial del portal web/app, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).
      </p>
      <p className="mb-8">
        Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta web/app, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de Squat Fit. El USUARIO se compromete a respetar los derechos de Propiedad Intelectual e Industrial titularidad de Squat Fit. Podrá visualizar los elementos del portal e incluso imprimirlos, copiarlos y almacenarlos en el disco duro de su ordenador o en cualquier otro soporte físico siempre y cuando sea, única y exclusivamente, para su uso personal y privado. El USUARIO deberá abstenerse de suprimir, alterar, eludir o manipular cualquier dispositivo de protección o sistema de seguridad en el que estuviera instalado las páginas del portal web/app móvil Squat Fit.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Exclusión de garantías y responsabilidad</h2>
      <p className="mb-8">
        Squat Fit no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las medidas tecnológicas necesarias para evitarlo.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Modificaciones</h2>
      <p className="mb-8">
        María Casas Gómez se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Enlaces</h2>
      <p className="mb-4">
        En el caso de que en el portal web/app móvil se dispusiese enlaces o hipervínculos hacía otros sitios de Internet, Squat Fit no ejercerá ningún tipo de control sobre dichos sitios y contenidos. En ningún caso María Casas Gómez asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno, ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad, validez y constitucionalidad de cualquier material o información contenida en ninguno de dichos hipervínculos u otros sitios de Internet.
      </p>
      <p className="mb-8">
        Igualmente, la inclusión de estas conexiones externas no implicará ningún tipo de asociación, fusión o participación con las entidades conectadas.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Derecho de exclusión</h2>
      <p className="mb-8">
        Squat Fit se reserva el derecho a denegar o retirar el acceso al portal y/o los servicios ofrecidos sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Generalidades</h2>
      <p className="mb-8">
        Squat Fit perseguirá el incumplimiento de las presentes condiciones, así como cualquier utilización indebida de su portal ejerciendo todas las acciones civiles y penales que le puedan corresponder en derecho.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Modificación de las presentes condiciones y duración</h2>
      <p className="mb-8">
        Squat Fit podrá modificar en cualquier momento las condiciones aquí determinadas, siendo debidamente publicadas como aquí aparecen.<br />
        La vigencia de las citadas condiciones irá en función de su exposición y estarán vigentes hasta que sean modificadas por otras debidamente publicadas.
      </p>

      <h2 className="text-xl font-bold text-black mb-3">Legislación aplicable y jurisdicción</h2>
      <p>
        La relación entre Squat Fit y el USUARIO se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad anteriormente indicada.
      </p>
    </div>
  );
};
