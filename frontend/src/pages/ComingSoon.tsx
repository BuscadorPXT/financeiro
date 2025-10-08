import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon = ({ title, description }: ComingSoonProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-300 to-cyan-300 rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-effect rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto"
        >
          {/* Icon */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            className="inline-block mb-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Construction className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600  bg-clip-text text-transparent mb-4">
            {title}
          </h1>

          {/* Description */}
          <p className="text-xl text-[var(--text-secondary)] mb-8">
            {description || 'Esta página está em desenvolvimento e estará disponível em breve.'}
          </p>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-block mb-8"
          >
            <span className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold text-lg shadow-lg">
              🚧 Em Construção
            </span>
          </motion.div>

          {/* Progress Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => navigate('/')}
              leftIcon={<ArrowLeft className="w-5 h-5" />}
              variant="outline"
              size="lg"
            >
              Voltar ao Dashboard
            </Button>
          </motion.div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <div className="glass-effect rounded-xl p-6 text-left">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold text-lg mb-1 text-[var(--text-primary)]">Rápido</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Desenvolvendo com as melhores tecnologias
            </p>
          </div>
          <div className="glass-effect rounded-xl p-6 text-left">
            <div className="text-3xl mb-2">🎨</div>
            <h3 className="font-bold text-lg mb-1 text-[var(--text-primary)]">Moderno</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Interface intuitiva e design contemporâneo
            </p>
          </div>
          <div className="glass-effect rounded-xl p-6 text-left">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold text-lg mb-1 text-[var(--text-primary)]">Seguro</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Seus dados protegidos com as melhores práticas
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ComingSoon;
