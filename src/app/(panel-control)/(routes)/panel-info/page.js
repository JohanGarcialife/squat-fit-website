import { redirect } from 'next/navigation';

// «Info» desapareció del menú (spec programas TMV): su contenido de marca vive
// en Ajustes → Conócenos y lo legal en Ajustes → Legal. Se conserva la ruta
// antigua para enlaces guardados.
export default function PanelInfoRedirect() {
  redirect('/panel-ajustes/conocenos');
}
