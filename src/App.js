import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { routes } from './routes';
import DefaultLayout from './layouts/defaultLayout';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './utils/protectedRoute';

function App() {
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
