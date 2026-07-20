import { redirect } from 'next/navigation';

// «Planes» pasó a llamarse «Mi programa» (spec programas TMV). Se conserva la
// ruta antigua para enlaces guardados.
export default function PanelPlanesRedirect() {
  redirect('/mi-programa');
}
