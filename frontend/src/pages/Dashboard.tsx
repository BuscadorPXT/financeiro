import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  FileCheck,
  XCircle,
  Clock,
  CheckCircle,
  ChevronDown,
  Search,
  Bell,
  Plus,
  Download,
  Users,
  ArrowRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { api } from '../services/api';
import relatorioService from '../services/relatorioService';
import { formatCurrency, formatNumber } from '../utils/formatters';
import clsx from 'clsx';
import { usePagamentos } from '../hooks/usePagamentos';
import { useDespesas } from '../hooks/useDespesas';

interface DashboardData {
  usuarios: {
    total: number;
    ativos: number;
    inativos: number;
    churn: number;
    taxaChurn: number;
  };
  financeiro: {
    receitaTotal: number;
    despesaTotal: number;
    saldo: number;
    receitaMensal: number;
    despesaMensal: number;
    saldoMensal: number;
  };
  pagamentos: {
    total: number;
    primeiros: number;
    recorrentes: number;
    valorMedio: number;
  };
  comissoes: {
    total: number;
    valorTotal: number;
  };
  prospeccao: {
    total: number;
    convertidas: number;
    taxaConversao: number;
  };
}

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showMonthFilter, setShowMonthFilter] = useState(false);

  const { pagamentos } = usePagamentos();
  const { despesas } = useDespesas();

  const months = [
    { value: '', label: 'Todos os meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Calcular dados reais para o gráfico
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = selectedYear || new Date().getFullYear();
    const data = [];

    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      const month = targetDate.getMonth();
      const year = targetDate.getFullYear();

      // Calcular receita do mês (soma dos pagamentos)
      const receitaMes = pagamentos
        .filter((p) => {
          const dataPagto = new Date(p.dataPagto);
          return dataPagto.getMonth() === month && dataPagto.getFullYear() === year;
        })
        .reduce((sum, p) => sum + p.valor, 0);

      // Calcular despesa do mês
      const despesaMes = despesas
        .filter((d) => {
          return d.competenciaMes === month + 1 && d.competenciaAno === year;
        })
        .reduce((sum, d) => sum + d.valor, 0);

      data.push({
        month: monthNames[month],
        value: receitaMes,
        receita: receitaMes,
        despesa: despesaMes,
        lucro: receitaMes - despesaMes
      });
    }

    return data;
  }, [pagamentos, despesas, selectedYear]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const params: { mes?: string; ano?: number } = {};
        if (selectedMonth) params.mes = selectedMonth;
        if (selectedYear) params.ano = selectedYear;

        const dashResponse = await relatorioService.getDashboard(params);
        setDashboardData(dashResponse);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedMonth, selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300 to-blue-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 animate-float" style={{ animationDelay: '-3s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2 font-poppins">
              Bem-vindo de volta ✨
            </h1>
            <button className="flex items-center text-[var(--text-secondary)] group transition-all duration-300 hover:text-gray-900 ">
              <span className="text-base font-medium">Visão geral financeira</span>
              <ChevronDown className="w-5 h-5 ml-2 group-hover:translate-y-1 transition-transform duration-300" />
            </button>
          </div>

          <div className="flex items-center space-x-4 mt-6 lg:mt-0">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="pl-12 pr-4 py-3 w-72 rounded-2xl border-0 glass-effect shadow-lg focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-[var(--text-primary)] transition-all duration-300 placeholder-gray-500 "
              />
            </div>
            <button className="p-3 rounded-2xl glass-effect shadow-lg hover:shadow-xl transition-all duration-300 relative group transform hover:scale-105">
              <Bell className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse-slow shadow-lg"></div>
            </button>
          </div>
        </motion.header>

        {/* Financial Overview Cards */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600  bg-clip-text text-transparent font-poppins"
            >
              Visão Geral Financeira
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <button
                onClick={() => setShowMonthFilter(!showMonthFilter)}
                className="text-[var(--text-secondary)] flex items-center space-x-2 glass-effect px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <span className="text-sm font-medium">
                  {selectedMonth ? `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}` : `Ano ${selectedYear}`}
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMonthFilter ? 'rotate-180' : ''}`} />
              </button>

              {showMonthFilter && (
                <div className="absolute right-0 mt-2 w-64 glass-effect rounded-xl shadow-xl border border-white/20 p-4 z-50">
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">Ano</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-2 block">Mês</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>{month.label}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowMonthFilter(false)}
                    className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Receita Total */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow">
                +28%
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3 font-semibold">Receita Total</p>
              <p className="text-xl md:text-2xl mb-2 text-[var(--text-primary)] font-bold font-poppins whitespace-nowrap overflow-hidden text-ellipsis">
                {dashboardData ? formatCurrency(dashboardData.financeiro.receitaTotal) : 'R$ 0,00'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium truncate">Mês selecionado</p>
            </motion.div>

            {/* Pagamentos Pendentes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow">
                +15%
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3 font-semibold">Pagamentos</p>
              <p className="text-xl md:text-2xl mb-2 text-[var(--text-primary)] font-bold font-poppins whitespace-nowrap overflow-hidden text-ellipsis">
                {dashboardData ? formatNumber(dashboardData.pagamentos.total) : '0'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium truncate">Total processado</p>
            </motion.div>

            {/* Usuários Ativos */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-red-600 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow">
                -{dashboardData?.usuarios.churn || 0}
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3 font-semibold">Churn</p>
              <p className="text-xl md:text-2xl mb-2 text-[var(--text-primary)] font-bold font-poppins whitespace-nowrap overflow-hidden text-ellipsis">
                {dashboardData ? formatNumber(dashboardData.usuarios.churn) : '0'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium truncate">Taxa: {dashboardData?.usuarios.taxaChurn.toFixed(1) || '0'}%</p>
            </motion.div>

            {/* Em Análise */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow">
                +12%
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3 font-semibold">Prospecção</p>
              <p className="text-xl md:text-2xl mb-2 text-[var(--text-primary)] font-bold font-poppins whitespace-nowrap overflow-hidden text-ellipsis">
                {dashboardData ? formatNumber(dashboardData.prospeccao.total) : '0'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium truncate">Taxa conversão: {dashboardData?.prospeccao.taxaConversao.toFixed(1) || '0'}%</p>
            </motion.div>

            {/* Completos */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="relative glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group transform hover:-translate-y-2 border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-xs font-bold rounded-full px-3 py-1.5 text-white shadow-lg animate-pulse-slow">
                +35%
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-3 font-semibold">Usuários Ativos</p>
              <p className="text-xl md:text-2xl mb-2 text-[var(--text-primary)] font-bold font-poppins whitespace-nowrap overflow-hidden text-ellipsis">
                {dashboardData ? formatNumber(dashboardData.usuarios.ativos) : '0'}
              </p>
              <p className="text-xs text-[var(--text-secondary)] font-medium truncate">Total: {dashboardData?.usuarios.total || 0}</p>
            </motion.div>
          </div>
        </section>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="xl:col-span-2 glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Analytics de Receita</h3>
                <p className="text-sm text-[var(--text-secondary)]">Visão geral de performance mensal</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="text-xs font-medium px-4 py-2 rounded-xl bg-indigo-100  text-indigo-700  hover:bg-indigo-200  transition-all duration-300">
                  6M
                </button>
                <button className="text-xs font-medium px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:bg-gray-100  transition-all duration-300">
                  1A
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    }}
                    content={({ active, payload, label }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-4">
                            <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                Receita: <span className="font-semibold text-green-600">{formatCurrency(data.receita)}</span>
                              </p>
                              <p className="text-sm text-gray-600">
                                Despesa: <span className="font-semibold text-red-600">{formatCurrency(data.despesa)}</span>
                              </p>
                              <p className="text-sm text-gray-600 pt-1 border-t border-gray-200">
                                Lucro: <span className={`font-semibold ${data.lucro >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(data.lucro)}</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="glass-effect rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20"
          >
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Ações Rápidas</h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Novo Pagamento</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Exportar Relatório</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Gerenciar Usuários</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-color)]">
              <h4 className="font-semibold text-[var(--text-primary)] mb-3">Atividade Recente</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-sm text-[var(--text-secondary)]">Pagamento aprovado</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-sm text-[var(--text-secondary)]">Novo usuário cadastrado</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <p className="text-sm text-[var(--text-secondary)]">Comissão pendente</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistics Grid */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="glass-effect rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Pagamentos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)] flex-shrink-0">Primeiros:</span>
                <span className="font-bold text-[var(--text-primary)] text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">{dashboardData?.pagamentos.primeiros || 0}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)] flex-shrink-0">Recorrentes:</span>
                <span className="font-bold text-[var(--text-primary)] text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">{dashboardData?.pagamentos.recorrentes || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] gap-2">
                <span className="text-sm text-[var(--text-secondary)] flex-shrink-0">Valor Médio:</span>
                <span className="font-bold text-indigo-600 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">
                  {dashboardData ? formatCurrency(dashboardData.pagamentos.valorMedio) : 'R$ 0,00'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Comissões</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)] flex-shrink-0">Total:</span>
                <span className="font-bold text-[var(--text-primary)] text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">{dashboardData?.comissoes.total || 0}</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] gap-2">
                <span className="text-sm text-[var(--text-secondary)] flex-shrink-0">Valor Total:</span>
                <span className="font-bold text-emerald-600 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">
                  {dashboardData ? formatCurrency(dashboardData.comissoes.valorTotal) : 'R$ 0,00'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-3xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Financeiro</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-sm text-[var(--text-secondary)] flex-shrink-0">Despesas:</span>
                <span className="font-bold text-red-600 text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]">
                  {dashboardData ? formatCurrency(dashboardData.financeiro.despesaTotal) : 'R$ 0,00'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-[var(--border-color)] gap-2">
                <span className="text-sm text-[var(--text-secondary)] flex-shrink-0">Saldo:</span>
                <span className={clsx(
                  'font-bold text-right whitespace-nowrap overflow-hidden text-ellipsis max-w-[50%]',
                  dashboardData && dashboardData.financeiro.saldo >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                )}>
                  {dashboardData ? formatCurrency(dashboardData.financeiro.saldo) : 'R$ 0,00'}
                </span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Dashboard;
