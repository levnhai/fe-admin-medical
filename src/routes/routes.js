import config from '~/config';

// layout
import HeaderOnly from '~/layouts/headerOnly';

// user
import Dashboard from '~/scenes/dashboard';
import Hospital from '~/scenes/hospital';
import ContactCooperate from '~/scenes/cooperate';
import User from '~/scenes/user';
import News from '~/scenes/news';
import Docter from '~/scenes/docter';
import Bar from '~/scenes/bar';
import Form from '~/scenes/form';
import Line from '~/scenes/line';
import Login from '~/scenes/login';
import Pie from '~/scenes/pie';
import FAQ from '~/scenes/faq';
import Geography from '~/scenes/geography';
import Unauthorized from '~/scenes/unauthorized';

const routes = [
  { path: config.routers.contactCooperate, component: ContactCooperate, isPrivate: true },
  { path: config.routers.news, component: News, isPrivate: true },
  { path: config.routers.bar, component: Bar, isPrivate: true },
  { path: config.routers.form, component: Form, isPrivate: true },
  { path: config.routers.line, component: Line, isPrivate: true },
  { path: config.routers.login, component: Login, layout: HeaderOnly, isPrivate: false },
  {
    path: config.routers.dashboard,
    component: Dashboard,
    isPrivate: true,
    requiredRole: ['system_admin', 'hospital_admin', 'docter'],
  },
  { path: config.routers.docter, component: Docter, isPrivate: true, requiredRole: ['system_admin', 'hospital_admin'] },
  {
    path: config.routers.hospital,
    component: Hospital,
    isPrivate: true,
    requiredRole: ['system_admin'],
  },
  { path: config.routers.user, component: User, isPrivate: true, requiredRole: ['system_admin', 'hospital_admin'] },
  { path: config.routers.unauthorized, component: Unauthorized, isPrivate: true, layout: HeaderOnly },
  // { path: config.routerxs.checkPhone, component: CheckPhone, layout: HeaderOnly },
];

export { routes };
