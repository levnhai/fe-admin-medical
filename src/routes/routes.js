import config from '~/config';

// layout
import HeaderOnly from '~/layouts/headerOnly';

// user
import Dashboard from '~/scenes/dashboard';
import Hospital from '~/scenes/hospital';
import ContactCooperate from '~/scenes/cooperate';
import User from '~/scenes/user';
import News from '~/scenes/news';
import Doctor from '~/scenes/docter';
import Category from '~/scenes/categorynews';
import Bar from '~/scenes/bar';
import Form from '~/scenes/form';
import Line from '~/scenes/line';
import Login from '~/scenes/login';
import Pie from '~/scenes/pie';
import FAQ from '~/scenes/faq';
import Geography from '~/scenes/geography';
import Unauthorized from '~/scenes/unauthorized';
import Calendar from '~/scenes/schedule/schedule';
import Appointment from '~/scenes/appointment/appointment';
import SystemAdmin from '~/scenes/admin';

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
    requiredRole: ['system_admin', 'hospital_admin', 'doctor'],
  },
  { path: config.routers.doctor, component: Doctor, isPrivate: true, requiredRole: ['system_admin', 'hospital_admin'] },
  {
    path: config.routers.hospital,
    component: Hospital,
    isPrivate: true,
    requiredRole: ['system_admin'],
  },
  {
    path: config.routers.category,
    component: Category,
    isPrivate: true,
    requiredRole: ['system_admin'],
  },
  {
    path: config.routers.user,
    component: User,
    isPrivate: true,
    requiredRole: ['system_admin', 'hospital_admin', 'doctor'],
  },
  {
    path: config.routers.schedulerDoctor,
    component: Calendar,
    isPrivate: true,
    requiredRole: ['hospital_admin', 'doctor'],
  },
  {
    path: config.routers.systemAdmin,
    component: SystemAdmin,
    isPrivate: true,
    requiredRole: ['system_admin'],
  },
  { path: config.routers.schedulerAppointment, component: Appointment, isPrivate: true },
  { path: config.routers.unauthorized, component: Unauthorized, isPrivate: true, layout: HeaderOnly },
  // { path: config.routerxs.checkPhone, component: CheckPhone, layout: HeaderOnly },
];

export { routes };
