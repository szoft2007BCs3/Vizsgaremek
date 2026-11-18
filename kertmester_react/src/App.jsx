import { useEffect } from 'react';
import Layout from './components/Layout.jsx';
import { useRoute } from './lib/useRoute.js';
import Fooldal from './pages/Fooldal.jsx';
import Tervezo from './pages/Tervezo.jsx';
import Webshop from './pages/Webshop.jsx';
import Rendeles from './pages/Rendeles.jsx';
import Profil from './pages/Profil.jsx';

const PAGES = {
  fooldal: { title: 'Kertmester — Kerttervezés', component: Fooldal },
  tervezo: { title: 'Kertmester — Tervező', component: Tervezo },
  webshop: { title: 'Kertmester — Webshop', component: Webshop },
  rendeles: { title: 'Kertmester — Megrendelés', component: Rendeles },
  profil: { title: 'Kertmester — Profil', component: Profil }
};

export default function App() {
  const { path, params } = useRoute();
  const page = PAGES[path] || PAGES.fooldal;
  const Page = page.component;

  useEffect(() => {
    document.title = page.title;
    window.scrollTo(0, 0);
  }, [page]);

  return (
    <Layout>
      <Page key={path} params={params} />
    </Layout>
  );
}
