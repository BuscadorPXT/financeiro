import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Listas from './pages/Listas';
import Prospeccao from './pages/Prospeccao';
import Usuarios from './pages/Usuarios';
import Pagamentos from './pages/Pagamentos';
import Despesas from './pages/Despesas';
import Agenda from './pages/Agenda';
import Churn from './pages/Churn';
import Comissoes from './pages/Comissoes';
import Relatorios from './pages/Relatorios';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Rota pública de login */}
            <Route path="/login" element={<Login />} />

            {/* Rotas protegidas */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="/listas" element={<Listas />} />
                <Route path="/prospeccao" element={<Prospeccao />} />
                <Route path="/usuarios" element={<Usuarios />} />
                <Route path="/pagamentos" element={<Pagamentos />} />
                <Route path="/despesas" element={<Despesas />} />
                <Route path="/agenda" element={<Agenda />} />
                <Route path="/churn" element={<Churn />} />
                <Route path="/comissoes" element={<Comissoes />} />
                <Route path="/relatorios" element={<Relatorios />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
