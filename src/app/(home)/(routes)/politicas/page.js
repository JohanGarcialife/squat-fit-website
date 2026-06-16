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
    <main className="w-full px-4 sm:px-6 lg:px-16 py-10 font-sans">
      
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
                  : 'text-[#3B3B98] hover:text-blue-800 mb-0 border-b-2 w-full border-primary'
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
        
        {activeTab === 'cookies' && <ContenidoCookies />}

        {activeTab === 'devoluciones' && <ContenidoDevoluciones />}

        {activeTab === 'privacidad' && <ContenidoPrivacidad />}

        {activeTab === 'terminos' && <ContenidoTerminos />}

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

// --- Política de Cookies ---
const ContenidoCookies = () => (
  <div className="animate-fadeIn">
    <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Política de Cookies</h1>
    <p className="mb-6">En cumplimiento del artículo 22.2 de la Ley 34/2002, esta página web le informa sobre el uso de cookies.</p>
    <h2 className="text-xl font-bold text-black mb-3">¿Qué son las cookies?</h2>
    <p className="mb-6">Las cookies son pequeños archivos de texto que los sitios web guardan en su navegador. Se utilizan para hacer que los sitios web funcionen de manera más eficiente y para proporcionar información a los propietarios.</p>
    <h2 className="text-xl font-bold text-black mb-3">Tipos de cookies que utilizamos</h2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li><strong>Cookies técnicas:</strong> Imprescindibles para la navegación correcta.</li>
      <li><strong>Cookies de análisis:</strong> Permiten conocer de forma anónima el número de visitantes y uso de funcionalidades.</li>
      <li><strong>Cookies de personalización:</strong> Recuerdan sus preferencias de navegación.</li>
    </ul>
    <h2 className="text-xl font-bold text-black mb-3">Gestión de cookies</h2>
    <p className="mb-6">Puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de su navegador. La desactivación de cookies puede afectar al correcto funcionamiento del sitio.</p>
    <h2 className="text-xl font-bold text-black mb-3">Cookies de terceros</h2>
    <p>Squat Fit puede utilizar servicios de terceros (como Google Analytics) para fines estadísticos. Puede consultar las políticas de privacidad de dichos proveedores en sus sitios web respectivos.</p>
  </div>
);

// --- Política de Devoluciones ---
const ContenidoDevoluciones = () => (
  <div className="animate-fadeIn">
    <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Política de Devoluciones</h1>
    <p className="mb-6">En Squat Fit queremos que estés completamente satisfecho con tu compra.</p>
    <h2 className="text-xl font-bold text-black mb-3">Productos digitales y suscripciones</h2>
    <p className="mb-6">Debido a la naturaleza digital de nuestros productos, una vez que se ha proporcionado acceso al contenido, no se realizarán reembolsos salvo en los casos indicados a continuación.</p>
    <h2 className="text-xl font-bold text-black mb-3">Derecho de desistimiento</h2>
    <p className="mb-6">De acuerdo con la normativa española y europea, dispone de 14 días naturales desde la contratación para ejercer su derecho de desistimiento, siempre que no haya comenzado a disfrutar del servicio o descargado el contenido digital.</p>
    <h2 className="text-xl font-bold text-black mb-3">Proceso de solicitud de devolución</h2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>Envíe un correo a hola@squatfit.es con su nombre, número de pedido y motivo.</li>
      <li>Nuestro equipo analizará su solicitud en un plazo máximo de 5 días hábiles.</li>
      <li>Si procede, el reembolso se realizará en el mismo medio de pago en un plazo de 10–14 días hábiles.</li>
    </ul>
    <h2 className="text-xl font-bold text-black mb-3">Excepciones</h2>
    <p>No se aceptarán devoluciones cuando el contenido haya sido descargado o consumido, o cuando hayan transcurrido más de 14 días naturales desde la compra.</p>
  </div>
);

// --- Política de Privacidad ---
const ContenidoPrivacidad = () => (
  <div className="animate-fadeIn">
    <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Política de Privacidad</h1>
    <p className="mb-6">En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), le informamos sobre el tratamiento de sus datos personales.</p>
    <h2 className="text-xl font-bold text-black mb-3">Responsable del tratamiento</h2>
    <div className="mb-6">
      <p>Empresa: Squat Fit SLU | CIF: B19463066</p>
      <p>Dirección: Av Maisonnave 41, 3 B, 03003, Alicante, España</p>
      <p>Contacto: hola@squatfit.es</p>
    </div>
    <h2 className="text-xl font-bold text-black mb-3">Datos que recabamos</h2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>Datos de identificación: nombre, apellidos, correo electrónico.</li>
      <li>Datos de salud relacionados con los servicios de nutrición y entrenamiento (aportados voluntariamente).</li>
      <li>Datos de facturación y datos de navegación (cookies).</li>
    </ul>
    <h2 className="text-xl font-bold text-black mb-3">Finalidad del tratamiento</h2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>Prestación del servicio contratado (planes, cursos, asesoramiento).</li>
      <li>Gestión de pagos, facturación y comunicaciones del servicio.</li>
      <li>Con consentimiento expreso: envío de comunicaciones comerciales.</li>
    </ul>
    <h2 className="text-xl font-bold text-black mb-3">Sus derechos</h2>
    <p>Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hola@squatfit.es. También puede reclamar ante la AEPD (www.aepd.es).</p>
  </div>
);

// --- Términos y Condiciones ---
const ContenidoTerminos = () => (
  <div className="animate-fadeIn">
    <h1 className="text-4xl font-bold text-[#3B3B98] mb-6">Términos y Condiciones</h1>
    <p className="mb-6">Los presentes Términos y Condiciones regulan el acceso y uso de los servicios ofrecidos por Squat Fit SLU. Al contratar cualquier servicio, el usuario acepta estos términos.</p>
    <h2 className="text-xl font-bold text-black mb-3">1. Objeto</h2>
    <p className="mb-6">Squat Fit ofrece servicios de asesoramiento en nutrición, planes de entrenamiento y formación en línea. El acceso requiere registro y, en su caso, el pago del precio correspondiente.</p>
    <h2 className="text-xl font-bold text-black mb-3">2. Condiciones de acceso</h2>
    <p className="mb-6">El usuario debe ser mayor de 18 años o contar con autorización de sus tutores legales. Es responsable de mantener sus credenciales en seguridad y no compartirlas con terceros.</p>
    <h2 className="text-xl font-bold text-black mb-3">3. Precios y pago</h2>
    <p className="mb-6">Los precios incluyen los impuestos aplicables. Squat Fit puede modificar sus tarifas, notificando al usuario con antelación razonable.</p>
    <h2 className="text-xl font-bold text-black mb-3">4. Uso adecuado</h2>
    <p className="mb-6">Queda prohibida la reproducción o distribución de los contenidos sin autorización expresa de Squat Fit.</p>
    <h2 className="text-xl font-bold text-black mb-3">5. Responsabilidad</h2>
    <p className="mb-6">Los planes de nutrición y entrenamiento son orientativos y no sustituyen el consejo médico. Squat Fit no se responsabiliza de los resultados individuales de cada usuario.</p>
    <h2 className="text-xl font-bold text-black mb-3">6. Cancelación</h2>
    <p className="mb-6">El usuario podrá cancelar su suscripción desde su perfil o mediante hola@squatfit.es. La cancelación surtirá efecto al final del período de facturación en curso.</p>
    <h2 className="text-xl font-bold text-black mb-3">7. Legislación aplicable</h2>
    <p>Los presentes Términos se rigen por la legislación española. Cualquier controversia se someterá a los Juzgados y Tribunales de la ciudad de Alicante.</p>
  </div>
);

