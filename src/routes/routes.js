import config from '~/config';

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
import Pie from '~/scenes/pie';
import FAQ from '~/scenes/faq';
import Geography from '~/scenes/geography';

const publicRoutes = [
  { path: config.routers.dashboard, component: Dashboard },
  { path: config.routers.hospital, component: Hospital },
  { path: config.routers.contactCooperate, component: ContactCooperate },
  { path: config.routers.user, component: User },
  { path: config.routers.news, component: News },
  { path: config.routers.bar, component: Bar },
  { path: config.routers.form, component: Form },
  { path: config.routers.line, component: Line },
  { path: config.routers.docter, component: Docter },
  // { path: config.routerxs.checkPhone, component: CheckPhone, layout: HeaderOnly },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };
