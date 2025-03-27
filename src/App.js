import { Fragment } from 'react';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import DefaultLayout from './layouts/defaultLayout';
import { toast, ToastContainer } from 'react-toastify';
import ProtectedRoute from './utils/protectedRoute';
import { io } from 'socket.io-client';
import { formatDate } from './utils/time';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:8080', { transports: ['websocket'] });
socket.on('connect', () => console.log(' Kết nối thành công với Server'));

function App() {
  const user = useSelector((state) => state.auth.user?.payload);
  const userLogin = user?.userData?._id;
  useEffect(() => {
    if (userLogin) {
      socket.emit('join-doctor-room', userLogin);
    }

    socket.on('new-appointment', (newAppointment) => {
      toast.success(`📢 Có lịch hẹn khám mới. Ngày ${formatDate(newAppointment?.date)}`);
      <ToastContainer />;
      console.log('📢 Nhận lịch hẹn mới:', newAppointment);
    });

    return () => {
      socket.off('new-appointment');
    };
  }, [userLogin]);
  return (
    <>
      <Router>
        <Routes>
          {routes.map(({ path, layout, isPrivate, requiredRole, component: Component }, index) => {
            let Layout = DefaultLayout;
            if (layout) {
              Layout = layout;
            } else if (layout === null) {
              Layout = Fragment;
            }
            return (
              <Route
                key={index}
                path={path}
                element={
                  isPrivate ? (
                    <ProtectedRoute requiredRole={requiredRole}>
                      <Layout>
                        <Component />
                        <ToastContainer />
                      </Layout>
                    </ProtectedRoute>
                  ) : (
                    <Layout>
                      <Component />
                      <ToastContainer />
                    </Layout>
                  )
                }
              />
            );
          })}
        </Routes>
      </Router>
    </>
  );
}

export default App;
