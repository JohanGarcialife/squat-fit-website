'use client';

import React from 'react';

// Contenido legal compartido entre la web pública (/politicas) y el panel del
// cliente (panel-info), para que ambos muestren exactamente el mismo texto.
// Datos de empresa reales: Squat Fit SLU · CIF B19463066.

const H1 = ({ children }) => (
  <h1 className="text-3xl sm:text-4xl font-bold text-[#3B3B98] mb-6">{children}</h1>
);
const H2 = ({ children }) => (
  <h2 className="text-xl font-bold text-black mb-3">{children}</h2>
);

// --- Aviso Legal ---
export const ContenidoAvisoLegal = () => (
  <div className="animate-fadeIn">
    <H1>Aviso legal</H1>
    <p className="mb-6">
      En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio
      Electrónico (LSSI-CE), la empresa le informa que es titular del portal web/app móvil. De acuerdo con la exigencia
      del artículo 10 de la citada Ley, informa de los siguientes datos:
    </p>
    <p className="mb-4">El titular de este portal web/app móvil es:</p>
    <div className="mb-8">
      <p>Empresa: Squat Fit SLU</p>
      <p>CIF: B19463066</p>
      <p>Dirección: Av Maisonnave 41, 3 B</p>
      <p>03003, Alicante, España</p>
      <p>Contacto: hola@squatfit.es</p>
    </div>

    <H2>Usuarios</H2>
    <p className="mb-8">
      El acceso y/o uso de este portal le atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las
      Condiciones Generales de Uso aquí reflejadas. Las citadas Condiciones serán de aplicación independientemente de las
      Condiciones Generales de Contratación que en su caso resulten de obligado cumplimiento.
    </p>

    <H2>Uso del portal</H2>
    <p className="mb-4">
      El portal web/app móvil proporciona el acceso a multitud de informaciones, servicios, programas o datos (en
      adelante, &quot;los contenidos&quot;) en Internet pertenecientes a María Casas Gómez o a sus licenciantes a los que
      el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal. Dicha responsabilidad se
      extiende al registro que fuese necesario para acceder a determinados servicios o contenidos.
    </p>
    <p className="mb-4">
      En dicho registro el USUARIO será responsable de aportar información veraz y lícita. Como consecuencia de este
      registro, al USUARIO se le puede proporcionar una contraseña de la que será responsable, comprometiéndose a hacer
      un uso diligente y confidencial de la misma. El USUARIO se compromete a hacer un uso adecuado de los contenidos y
      servicios que María Casas Gómez ofrece a través de su portal y con carácter enunciativo, pero no limitativo, a no
      emplearlos para:
    </p>
    <ul className="list-disc pl-6 mb-8 space-y-2">
      <li>Incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.</li>
      <li>
        Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo
        o atentatorio contra los derechos humanos.
      </li>
      <li>
        Provocar daños en los sistemas físicos y lógicos de María Casas Gómez, de sus proveedores o de terceras
        personas, introducir o difundir en la red virus informáticos o cualesquiera otros sistemas físicos o lógicos que
        sean susceptibles de provocar los daños anteriormente mencionados.
      </li>
      <li>
        Intentar acceder y, en su caso, utilizar las cuentas de correo electrónico de otros usuarios y modificar o
        manipular sus mensajes. María Casas Gómez se reserva el derecho de retirar todos aquellos comentarios y
        aportaciones que vulneren el respeto a la dignidad de la persona, que sean discriminatorios, xenófobos, racistas,
        pornográficos, que atenten contra la juventud o la infancia, el orden o la seguridad pública o que, a su juicio,
        no resultaran adecuados para su publicación. En cualquier caso, María Casas Gómez no será responsable de las
        opiniones vertidas por los usuarios a través de los foros, chats, u otras herramientas de participación.
      </li>
    </ul>

    <H2>Propiedad intelectual e industrial</H2>
    <p className="mb-4">
      Squad Fit será titular de todos los derechos de propiedad intelectual e industrial del portal web/app, así como de
      los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos;
      marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de
      ordenador necesarios para su funcionamiento, acceso y uso, etc.).
    </p>
    <p className="mb-8">
      Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de
      Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública,
      incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta web/app, con
      fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de Squad Fit. El USUARIO
      se compromete a respetar los derechos de Propiedad Intelectual e Industrial titularidad de Squad Fit.
    </p>

    <H2>Exclusión de garantías y responsabilidad</H2>
    <p className="mb-8">
      Squad Fit no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran
      ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la
      transmisión de virus o programas maliciosos o lesivos en los contenidos, a pesar de haber adoptado todas las
      medidas tecnológicas necesarias para evitarlo.
    </p>

    <H2>Modificaciones</H2>
    <p className="mb-8">
      María Casas Gómez se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en
      su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la
      misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
    </p>

    <H2>Enlaces</H2>
    <p className="mb-8">
      En el caso de que en el portal web/app móvil se dispusiese enlaces o hipervínculos hacia otros sitios de Internet,
      Squad Fit no ejercerá ningún tipo de control sobre dichos sitios y contenidos. En ningún caso María Casas Gómez
      asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno.
    </p>

    <H2>Legislación aplicable y jurisdicción</H2>
    <p>
      La relación entre Squad Fit y el USUARIO se regirá por la normativa española vigente y cualquier controversia se
      someterá a los Juzgados y tribunales de la ciudad anteriormente indicada.
    </p>
  </div>
);

// --- Política de Cookies (auditada: sin analítica ni publicidad) ---
export const ContenidoCookies = () => (
  <div className="animate-fadeIn">
    <H1>Política de Cookies</H1>
    <p className="mb-6">
      En cumplimiento del artículo 22.2 de la Ley 34/2002 (LSSI-CE), te informamos sobre el uso de cookies y tecnologías
      de almacenamiento en este sitio.
    </p>

    <H2>¿Qué son las cookies?</H2>
    <p className="mb-6">
      Las cookies (y tecnologías similares como el almacenamiento local del navegador) son pequeños archivos que un sitio
      web guarda en tu dispositivo. Sirven para que la web funcione correctamente y recuerde información entre páginas.
    </p>

    <H2>¿Qué utilizamos en esta web?</H2>
    <p className="mb-4">
      Somos especialmente respetuosos con tu privacidad: <strong>no utilizamos cookies de analítica, de publicidad ni de
      seguimiento de terceros.</strong> Solo empleamos lo imprescindible para que la web funcione:
    </p>
    <div className="overflow-x-auto rounded-2xl border border-slate-200 mb-6">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 text-[#3B3B98]">
            <th className="p-3 font-bold">Nombre</th>
            <th className="p-3 font-bold">Tipo</th>
            <th className="p-3 font-bold">Finalidad</th>
            <th className="p-3 font-bold">Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-slate-100">
            <td className="p-3 font-mono text-xs">cart-storage · auth-storage · sf_origin</td>
            <td className="p-3">Técnica propia (almacenamiento local)</td>
            <td className="p-3">Recordar tu carrito, tu sesión iniciada y el origen de tu visita.</td>
            <td className="p-3">Persistente hasta que borres los datos del navegador</td>
          </tr>
          <tr className="border-t border-slate-100">
            <td className="p-3 font-mono text-xs">__stripe_mid</td>
            <td className="p-3">Técnica de terceros (Stripe)</td>
            <td className="p-3">Procesar el pago de forma segura y prevenir el fraude. Solo al pagar.</td>
            <td className="p-3">1 año</td>
          </tr>
          <tr className="border-t border-slate-100">
            <td className="p-3 font-mono text-xs">__stripe_sid</td>
            <td className="p-3">Técnica de terceros (Stripe)</td>
            <td className="p-3">Procesar el pago de forma segura y prevenir el fraude. Solo al pagar.</td>
            <td className="p-3">30 minutos</td>
          </tr>
        </tbody>
      </table>
    </div>

    <H2>Gestión de cookies</H2>
    <p className="mb-6">
      Puedes permitir, bloquear o eliminar el almacenamiento instalado en tu equipo mediante la configuración de tu
      navegador. Ten en cuenta que desactivar el almacenamiento técnico puede afectar al funcionamiento del carrito, del
      inicio de sesión o del proceso de pago.
    </p>

    <H2>Cambios en esta política</H2>
    <p>
      No usamos cookies de terceros con fines publicitarios o estadísticos. Si en el futuro incorporásemos herramientas
      de analítica, actualizaríamos esta política y te solicitaríamos tu consentimiento previo.
    </p>
  </div>
);

// --- Política de Devoluciones ---
export const ContenidoDevoluciones = () => (
  <div className="animate-fadeIn">
    <H1>Política de Devoluciones</H1>
    <p className="mb-6">En Squad Fit queremos que estés completamente satisfecho con tu compra.</p>
    <H2>Productos digitales y suscripciones</H2>
    <p className="mb-6">
      Debido a la naturaleza digital de nuestros productos, una vez que se ha proporcionado acceso al contenido, no se
      realizarán reembolsos salvo en los casos indicados a continuación.
    </p>
    <H2>Derecho de desistimiento</H2>
    <p className="mb-6">
      De acuerdo con la normativa española y europea, dispone de 14 días naturales desde la contratación para ejercer su
      derecho de desistimiento, siempre que no haya comenzado a disfrutar del servicio o descargado el contenido digital.
    </p>
    <H2>Proceso de solicitud de devolución</H2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>Envíe un correo a hola@squatfit.es con su nombre, número de pedido y motivo.</li>
      <li>Nuestro equipo analizará su solicitud en un plazo máximo de 5 días hábiles.</li>
      <li>Si procede, el reembolso se realizará en el mismo medio de pago en un plazo de 10–14 días hábiles.</li>
    </ul>
    <H2>Excepciones</H2>
    <p>
      No se aceptarán devoluciones cuando el contenido haya sido descargado o consumido, o cuando hayan transcurrido más
      de 14 días naturales desde la compra.
    </p>
  </div>
);

// --- Política de Privacidad ---
export const ContenidoPrivacidad = () => (
  <div className="animate-fadeIn">
    <H1>Política de Privacidad</H1>
    <p className="mb-6">
      En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), le informamos sobre el
      tratamiento de sus datos personales.
    </p>
    <H2>Responsable del tratamiento</H2>
    <div className="mb-6">
      <p>Empresa: Squat Fit SLU | CIF: B19463066</p>
      <p>Dirección: Av Maisonnave 41, 3 B, 03003, Alicante, España</p>
      <p>Contacto: hola@squatfit.es</p>
    </div>
    <H2>Datos que recabamos</H2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>Datos de identificación: nombre, apellidos, correo electrónico.</li>
      <li>Datos de salud relacionados con los servicios de nutrición y entrenamiento (aportados voluntariamente).</li>
      <li>Datos de facturación y datos de navegación (almacenamiento técnico y pasarela de pago).</li>
    </ul>
    <H2>Finalidad del tratamiento</H2>
    <ul className="list-disc pl-6 mb-6 space-y-2">
      <li>Prestación del servicio contratado (planes, cursos, asesoramiento).</li>
      <li>Gestión de pagos, facturación y comunicaciones del servicio.</li>
      <li>Con consentimiento expreso: envío de comunicaciones comerciales.</li>
    </ul>
    <H2>Sus derechos</H2>
    <p>
      Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a
      hola@squatfit.es. También puede reclamar ante la AEPD (www.aepd.es).
    </p>
  </div>
);

// --- Términos y Condiciones ---
export const ContenidoTerminos = () => (
  <div className="animate-fadeIn">
    <H1>Términos y Condiciones</H1>
    <p className="mb-6">
      Los presentes Términos y Condiciones regulan el acceso y uso de los servicios ofrecidos por Squat Fit SLU. Al
      contratar cualquier servicio, el usuario acepta estos términos.
    </p>
    <H2>1. Objeto</H2>
    <p className="mb-6">
      Squad Fit ofrece servicios de asesoramiento en nutrición, planes de entrenamiento y formación en línea. El acceso
      requiere registro y, en su caso, el pago del precio correspondiente.
    </p>
    <H2>2. Condiciones de acceso</H2>
    <p className="mb-6">
      El usuario debe ser mayor de 18 años o contar con autorización de sus tutores legales. Es responsable de mantener
      sus credenciales en seguridad y no compartirlas con terceros.
    </p>
    <H2>3. Precios y pago</H2>
    <p className="mb-6">
      Los precios incluyen los impuestos aplicables. Squad Fit puede modificar sus tarifas, notificando al usuario con
      antelación razonable.
    </p>
    <H2>4. Uso adecuado</H2>
    <p className="mb-6">
      Queda prohibida la reproducción o distribución de los contenidos sin autorización expresa de Squad Fit.
    </p>
    <H2>5. Responsabilidad</H2>
    <p className="mb-6">
      Los planes de nutrición y entrenamiento son orientativos y no sustituyen el consejo médico. Squad Fit no se
      responsabiliza de los resultados individuales de cada usuario.
    </p>
    <H2>6. Cancelación</H2>
    <p className="mb-6">
      El usuario podrá cancelar su suscripción desde su perfil o mediante hola@squatfit.es. La cancelación surtirá efecto
      al final del período de facturación en curso.
    </p>
    <H2>7. Legislación aplicable</H2>
    <p>
      Los presentes Términos se rigen por la legislación española. Cualquier controversia se someterá a los Juzgados y
      Tribunales de la ciudad de Alicante.
    </p>
  </div>
);

// Orden y etiquetas de las secciones legales, para construir menús/tabs.
export const LEGAL_SECTIONS = [
  { id: 'aviso-legal', label: 'Aviso Legal', Component: ContenidoAvisoLegal },
  { id: 'privacidad', label: 'Política de Privacidad', Component: ContenidoPrivacidad },
  { id: 'cookies', label: 'Política de Cookies', Component: ContenidoCookies },
  { id: 'devoluciones', label: 'Política de Devoluciones', Component: ContenidoDevoluciones },
  { id: 'terminos', label: 'Términos y Condiciones', Component: ContenidoTerminos },
];
