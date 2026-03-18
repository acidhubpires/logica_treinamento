import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Gamepad2, 
  ClipboardCheck, 
  Award, 
  Briefcase, 
  HelpCircle, 
  Library,
  Settings,
  User,
  ChevronRight,
  Play,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { AppData, UserProgress, Role, TrainingModule, Quiz, QuizQuestion, SupportMaterial, VideoSlot, FAQItem, LibraryItem, CaseStudy } from './types';
import { INITIAL_DATA } from './constants';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Sidebar = ({ role, setRole }: { role: Role, setRole: (r: Role) => void }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/trainings', icon: BookOpen, label: 'Treinamentos' },
    { path: '/simulator', icon: Gamepad2, label: 'Simulador' },
    { path: '/quizzes', icon: ClipboardCheck, label: 'Quizzes' },
    { path: '/certificates', icon: Award, label: 'Certificados' },
    { path: '/cases', icon: Briefcase, label: 'Cases de Sucesso' },
    { path: '/faq', icon: HelpCircle, label: 'FAQ' },
    { path: '/library', icon: Library, label: 'Biblioteca' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-slate-900 font-bold">
          EC
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">EduCorp</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-400 font-medium" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Modo</span>
          </div>
          <button 
            onClick={() => setRole(role === 'admin' ? 'user' : 'admin')}
            className={cn(
              "px-2 py-1 text-[10px] font-bold rounded uppercase tracking-tighter transition-colors",
              role === 'admin' ? "bg-emerald-500 text-slate-900" : "bg-slate-700 text-slate-300"
            )}
          >
            {role === 'admin' ? 'Admin' : 'User'}
          </button>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">Usuário Demo</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">{role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

// --- Main App Component ---

export default function App() {
  const [role, setRole] = useState<Role>('user');
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('educorp_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('educorp_progress');
    return saved ? JSON.parse(saved) : { watchedVideos: [], accessedMaterials: [], quizResults: {} };
  });

  useEffect(() => {
    localStorage.setItem('educorp_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('educorp_progress', JSON.stringify(progress));
  }, [progress]);

  // --- Metrics Calculation ---
  const metrics = useMemo(() => {
    const totalModules = data.modules.length;
    const totalVideos = data.modules.reduce((acc, m) => acc + m.videos.length, 0);
    const totalMaterials = data.modules.reduce((acc, m) => acc + m.materials.length, 0);
    const totalQuizzes = data.modules.reduce((acc, m) => acc + m.quizzes.length, 0);
    
    const watched = progress.watchedVideos.length;
    const accessed = progress.accessedMaterials.length;
    const quizResults = Object.values(progress.quizResults) as { completed: boolean; score: number }[];
    const completedQuizzes = quizResults.filter(q => q.completed).length;
    
    const totalItems = totalVideos + totalMaterials + totalQuizzes;
    const completedItems = watched + accessed + completedQuizzes;
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    // Quiz evaluation
    const quizScores = quizResults.map(q => q.score);
    const avgScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;
    
    let rating = 'N/A';
    if (avgScore >= 90) rating = 'Excelente';
    else if (avgScore >= 70) rating = 'Bom';
    else if (avgScore >= 50) rating = 'Regular';
    else if (avgScore > 0) rating = 'Ruim';

    // Certificate count
    const eligibleCertificates = data.modules.filter(m => calculateModuleProgress(m, progress) >= 70).length;

    return {
      totalModules,
      totalVideos, watched,
      totalMaterials, accessed,
      totalQuizzes, completedQuizzes,
      overallProgress,
      rating,
      avgScore,
      eligibleCertificates
    };
  }, [data, progress]);

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <Sidebar role={role} setRole={setRole} />
        
        <main className="flex-1 overflow-y-auto">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Plataforma</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="font-semibold text-slate-700 capitalize">
                {window.location.pathname.replace('/', '') || 'Dashboard'}
              </span>
            </div>
            
            {role === 'admin' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider">
                <Edit3 className="w-3 h-3" />
                Modo Edição Ativo
              </div>
            )}
          </header>

          <div className="p-8 max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard metrics={metrics} data={data} progress={progress} />} />
              <Route path="/trainings" element={<TrainingsView data={data} setData={setData} role={role} progress={progress} setProgress={setProgress} />} />
              <Route path="/trainings/:moduleId" element={<ModuleDetail data={data} setData={setData} role={role} progress={progress} setProgress={setProgress} />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/quizzes" element={<QuizzesOverview data={data} progress={progress} />} />
              <Route path="/quizzes/:moduleId/:quizId" element={<QuizInterface data={data} progress={progress} setProgress={setProgress} />} />
              <Route path="/certificates" element={<CertificatesView metrics={metrics} data={data} progress={progress} />} />
              <Route path="/cases" element={<CasesView data={data} setData={setData} role={role} />} />
              <Route path="/faq" element={<FAQView data={data} setData={setData} role={role} />} />
              <Route path="/library" element={<LibraryView data={data} setData={setData} role={role} />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

// --- Page Components ---

function Dashboard({ metrics, data, progress }: { metrics: any, data: AppData, progress: UserProgress }) {
  const chartData = [
    { name: 'Vídeos', total: metrics.totalVideos, completed: metrics.watched },
    { name: 'Materiais', total: metrics.totalMaterials, completed: metrics.accessed },
    { name: 'Quizzes', total: metrics.totalQuizzes, completed: metrics.completedQuizzes },
  ];

  const pieData = [
    { name: 'Concluído', value: metrics.overallProgress },
    { name: 'Restante', value: 100 - metrics.overallProgress },
  ];

  const COLORS = ['#10b981', '#f1f5f9'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">EduCorp Dashboard</h2>
        <p className="text-slate-500">Rastreabilidade de seu progresso e métricas de interação.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Progresso Total" 
          value={`${metrics.overallProgress}%`} 
          icon={LayoutDashboard} 
          color="emerald"
          subtitle={`${metrics.watched + metrics.accessed + metrics.completedQuizzes} de ${metrics.totalVideos + metrics.totalMaterials + metrics.totalQuizzes} itens`}
        />
        <StatCard 
          title="Módulos" 
          value={`${metrics.totalModules}/5`} 
          icon={BookOpen} 
          color="blue"
          subtitle={`${5 - metrics.totalModules} restantes`}
        />
        <StatCard 
          title="Quizzes" 
          value={`${metrics.completedQuizzes}/${metrics.totalQuizzes}`} 
          icon={ClipboardCheck} 
          color="indigo"
          subtitle={`${metrics.totalQuizzes - metrics.completedQuizzes} restantes`}
        />
        <StatCard 
          title="Certificados" 
          value={`${metrics.eligibleCertificates}/${metrics.totalModules}`} 
          icon={Award} 
          color="amber"
          subtitle={`${metrics.totalModules - metrics.eligibleCertificates} restantes`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-500" />
            Interações por Conteúdo
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Concluído" />
                <Bar dataKey="total" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold mb-4 self-start">Critério de Avaliação</h3>
          <div className="w-full space-y-6">
            <div className="flex flex-col items-center">
              <span className={cn(
                "text-4xl font-black mb-2",
                metrics.rating === 'Excelente' ? "text-emerald-500" :
                metrics.rating === 'Bom' ? "text-blue-500" :
                metrics.rating === 'Regular' ? "text-amber-500" :
                "text-rose-500"
              )}>
                {metrics.rating}
              </span>
              <span className="text-sm text-slate-400 font-medium">Baseado na média dos quizzes</span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Média de Acertos</span>
                <span className="text-slate-900">{Math.round(metrics.avgScore)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-rose-500" style={{ width: '25%' }} />
                <div className="h-full bg-amber-500" style={{ width: '25%' }} />
                <div className="h-full bg-blue-500" style={{ width: '25%' }} />
                <div className="h-full bg-emerald-500" style={{ width: '25%' }} />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>Ruim</span>
                <span>Regular</span>
                <span>Bom</span>
                <span>Excelente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string, value: string, icon: any, color: string, subtitle: string }) {
  const colorClasses = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    amber: "bg-amber-50 text-amber-600",
  }[color] || "bg-slate-50 text-slate-600";

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-xl", colorClasses)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-slate-500">{title}</h4>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
      </div>
    </div>
  );
}

// --- Trainings View ---

function TrainingsView({ data, setData, role, progress, setProgress }: { data: AppData, setData: any, role: Role, progress: UserProgress, setProgress: any }) {
  const navigate = useNavigate();

  const addModule = () => {
    if (data.modules.length >= 5) return alert("Limite de 5 módulos atingido.");
    const newModule: TrainingModule = {
      id: `m${Date.now()}`,
      title: 'Novo Módulo',
      description: 'Descrição do novo módulo de treinamento.',
      videos: [],
      materials: [],
      quizzes: []
    };
    setData({ ...data, modules: [...data.modules, newModule] });
  };

  const deleteModule = (id: string) => {
    if (!confirm("Deseja excluir este módulo?")) return;
    setData({ ...data, modules: data.modules.filter(m => m.id !== id) });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Treinamentos</h2>
          <p className="text-slate-500">Explore os módulos de capacitação disponíveis.</p>
        </div>
        {role === 'admin' && (
          <button 
            onClick={addModule}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Novo Módulo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.modules.map((module) => {
          const moduleProgress = calculateModuleProgress(module, progress);
          return (
            <div 
              key={module.id} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all"
            >
              <div className="h-32 bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20" />
                <div className="absolute bottom-4 left-4">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur rounded text-[10px] font-bold uppercase tracking-wider text-slate-700">
                    {module.videos.length} Vídeos · {module.quizzes.length} Quizzes
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{module.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{module.description}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>Progresso</span>
                    <span className="text-emerald-500">{moduleProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${moduleProgress}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button 
                    onClick={() => navigate(`/trainings/${module.id}`)}
                    className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
                  >
                    Acessar
                  </button>
                  {role === 'admin' && (
                    <button 
                      onClick={() => deleteModule(module.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function calculateModuleProgress(module: TrainingModule, progress: UserProgress) {
  const total = module.videos.length + module.materials.length + module.quizzes.length;
  if (total === 0) return 0;
  
  const watched = module.videos.filter(v => progress.watchedVideos.includes(v.id)).length;
  const accessed = module.materials.filter(m => progress.accessedMaterials.includes(m.id)).length;
  const quizzed = module.quizzes.filter(q => progress.quizResults[q.id]?.completed).length;
  
  return Math.round(((watched + accessed + quizzed) / total) * 100);
}

// --- Module Detail View ---

function ModuleDetail({ data, setData, role, progress, setProgress }: { data: AppData, setData: any, role: Role, progress: UserProgress, setProgress: any }) {
  const { moduleId } = useLocation().pathname.split('/').slice(-1)[0] ? { moduleId: useLocation().pathname.split('/').pop() } : { moduleId: null };
  const navigate = useNavigate();
  const module = data.modules.find(m => m.id === moduleId);

  if (!module) return <div>Módulo não encontrado.</div>;

  const updateModule = (updates: Partial<TrainingModule>) => {
    setData({
      ...data,
      modules: data.modules.map(m => m.id === moduleId ? { ...m, ...updates } : m)
    });
  };

  const addVideo = () => {
    if (module.videos.length >= 5) return alert("Limite de 5 vídeos atingido.");
    const url = prompt("URL do vídeo (YouTube/Vimeo Embed):");
    if (!url) return;
    updateModule({ videos: [...module.videos, { id: `v${Date.now()}`, title: 'Novo Vídeo', url }] });
  };

  const addMaterial = () => {
    if (module.materials.length >= 10) return alert("Limite de 10 materiais atingido.");
    const title = prompt("Título do material:");
    const url = prompt("URL do material:");
    if (!title || !url) return;
    updateModule({ materials: [...module.materials, { id: `mat${Date.now()}`, title, type: 'url', url }] });
  };

  const addQuiz = () => {
    if (module.quizzes.length >= 5) return alert("Limite de 5 quizzes atingido.");
    const title = prompt("Título do Quiz:");
    if (!title) return;
    
    // Create a default quiz with 5 questions as per requirement
    const questions: QuizQuestion[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `q_item_${Date.now()}_${i}`,
      question: `Pergunta ${i + 1}`,
      options: ['Opção A', 'Opção B', 'Opção C', 'Opção D', 'Opção E'],
      correctAnswerIndex: 0,
      explanation: 'Gabarito e explicação da resposta.'
    }));

    const newQuiz: Quiz = {
      id: `q${Date.now()}`,
      title,
      questions
    };
    updateModule({ quizzes: [...module.quizzes, newQuiz] });
    alert("Quiz criado com 5 questões padrão. Use o modo edição para personalizar.");
  };

  const editQuiz = (quizId: string) => {
    const quiz = module.quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    const newTitle = prompt("Novo título do Quiz:", quiz.title);
    if (newTitle === null) return;

    const updatedQuestions = quiz.questions.map((q, idx) => {
      const questionText = prompt(`Questão ${idx + 1}:`, q.question);
      if (!questionText) return q;

      const options = q.options.map((opt, oIdx) => {
        const optText = prompt(`Opção ${oIdx + 1} para Questão ${idx + 1}:`, opt);
        return optText || opt;
      });

      const correctIdx = parseInt(prompt(`Índice da resposta correta (0-4) para Questão ${idx + 1}:`, q.correctAnswerIndex.toString()) || "0");
      const explanation = prompt(`Explicação para Questão ${idx + 1}:`, q.explanation) || q.explanation;

      return { ...q, question: questionText, options, correctAnswerIndex: correctIdx, explanation };
    });

    updateModule({
      quizzes: module.quizzes.map(q => q.id === quizId ? { ...q, title: newTitle, questions: updatedQuestions } : q)
    });
  };

  const toggleVideoWatched = (id: string) => {
    const isWatched = progress.watchedVideos.includes(id);
    setProgress({
      ...progress,
      watchedVideos: isWatched 
        ? progress.watchedVideos.filter(vid => vid !== id)
        : [...progress.watchedVideos, id]
    });
  };

  const markMaterialAccessed = (id: string) => {
    if (!progress.accessedMaterials.includes(id)) {
      setProgress({
        ...progress,
        accessedMaterials: [...progress.accessedMaterials, id]
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/trainings')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{module.title}</h2>
          <p className="text-slate-500">{module.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Videos Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-500" />
                Vídeos de Treinamento
              </h3>
              {role === 'admin' && (
                <button onClick={addVideo} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Adicionar Vídeo
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {module.videos.map(video => (
                <div key={video.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                      progress.watchedVideos.includes(video.id) ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
                    )}>
                      {progress.watchedVideos.includes(video.id) ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{video.title}</h4>
                      <button 
                        onClick={() => window.open(video.url, '_blank')}
                        className="text-xs text-emerald-600 font-medium hover:underline flex items-center gap-1"
                      >
                        Assistir Agora <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleVideoWatched(video.id)}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-bold transition-colors",
                        progress.watchedVideos.includes(video.id) 
                          ? "bg-emerald-500 text-white" 
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      )}
                    >
                      {progress.watchedVideos.includes(video.id) ? 'Concluído' : 'Marcar Concluído'}
                    </button>
                    {role === 'admin' && (
                      <button 
                        onClick={() => updateModule({ videos: module.videos.filter(v => v.id !== video.id) })}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {module.videos.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
                  Nenhum vídeo cadastrado.
                </div>
              )}
            </div>
          </section>

          {/* Quizzes Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                Avaliações (Quizzes)
              </h3>
              {role === 'admin' && (
                <button onClick={addQuiz} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Adicionar Quiz
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {module.quizzes.map(quiz => (
                <div key={quiz.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      progress.quizResults[quiz.id]?.completed ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-400"
                    )}>
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{quiz.title}</h4>
                      <p className="text-xs text-slate-500">
                        {progress.quizResults[quiz.id]?.completed 
                          ? `Nota: ${progress.quizResults[quiz.id].score}%` 
                          : `${quiz.questions.length} Questões`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => navigate(`/quizzes/${module.id}/${quiz.id}`)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-colors",
                        progress.quizResults[quiz.id]?.completed 
                          ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                          : "bg-emerald-500 text-white hover:bg-emerald-600"
                      )}
                    >
                      {progress.quizResults[quiz.id]?.completed ? 'Ver Gabarito' : 'Iniciar Quiz'}
                    </button>
                    {role === 'admin' && (
                      <>
                        <button 
                          onClick={() => editQuiz(quiz.id)}
                          className="p-2 text-slate-300 hover:text-blue-500 transition-colors"
                          title="Editar Quiz"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => updateModule({ quizzes: module.quizzes.filter(q => q.id !== quiz.id) })}
                          className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Progress Card */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-lg font-bold">Seu Progresso</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Módulo</span>
                <span>{calculateModuleProgress(module, progress)}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${calculateModuleProgress(module, progress)}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-800 p-3 rounded-xl">
                <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Vídeos</span>
                <span className="text-xl font-bold">{module.videos.filter(v => progress.watchedVideos.includes(v.id)).length}/{module.videos.length}</span>
              </div>
              <div className="bg-slate-800 p-3 rounded-xl">
                <span className="block text-[10px] uppercase text-slate-500 font-bold mb-1">Materiais</span>
                <span className="text-xl font-bold">{module.materials.filter(m => progress.accessedMaterials.includes(m.id)).length}/{module.materials.length}</span>
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-500" />
                Materiais de Apoio
              </h3>
              {role === 'admin' && (
                <button onClick={addMaterial} className="text-xs font-bold text-emerald-600">
                  + Adicionar
                </button>
              )}
            </div>
            <div className="space-y-2">
              {module.materials.map(mat => (
                <a 
                  key={mat.id}
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markMaterialAccessed(mat.id)}
                  className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                    <span className="text-sm font-medium text-slate-700">{mat.title}</span>
                  </div>
                  {progress.accessedMaterials.includes(mat.id) && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </a>
              ))}
              {module.materials.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4 italic">Nenhum material disponível.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// --- Quiz Interface ---

function QuizInterface({ data, progress, setProgress }: { data: AppData, progress: UserProgress, setProgress: any }) {
  const navigate = useNavigate();
  const pathParts = useLocation().pathname.split('/');
  const moduleId = pathParts[2];
  const quizId = pathParts[3];
  
  const module = data.modules.find(m => m.id === moduleId);
  const quiz = module?.quizzes.find(q => q.id === quizId);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>(() => {
    return progress.quizResults[quizId!]?.answers || new Array(quiz?.questions.length || 0).fill(-1);
  });
  const [showResults, setShowResults] = useState(progress.quizResults[quizId!]?.completed || false);

  if (!quiz) return <div>Quiz não encontrado.</div>;

  const handleAnswer = (optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setUserAnswers(newAnswers);
  };

  const finishQuiz = () => {
    if (userAnswers.includes(-1)) return alert("Responda todas as questões antes de finalizar.");
    
    const correctCount = quiz.questions.reduce((acc, q, idx) => {
      return acc + (userAnswers[idx] === q.correctAnswerIndex ? 1 : 0);
    }, 0);
    
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    
    setProgress({
      ...progress,
      quizResults: {
        ...progress.quizResults,
        [quiz.id]: { score, completed: true, answers: userAnswers }
      }
    });
    setShowResults(true);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-slate-900">{quiz.title}</h2>
          <p className="text-slate-500">Questão {currentQuestionIndex + 1} de {quiz.questions.length}</p>
        </div>
        <button onClick={() => navigate(-1)} className="text-sm font-bold text-slate-500 hover:text-slate-700">
          Sair do Quiz
        </button>
      </div>

      {!showResults ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">{currentQuestion?.question || "Questão sem texto"}</h3>
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    userAnswers[currentQuestionIndex] === idx 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold" 
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  )}
                >
                  <span className="inline-block w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold text-center leading-6 mr-3">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-6 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30"
            >
              Anterior
            </button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button 
                onClick={finishQuiz}
                className="px-8 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
              >
                Finalizar Quiz
              </button>
            ) : (
              <button 
                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                className="px-8 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
              >
                Próxima
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900">Quiz Concluído!</h3>
            <div className="text-5xl font-black text-emerald-500">
              {progress.quizResults[quiz.id]?.score}%
            </div>
            <p className="text-slate-500">
              Você acertou {quiz.questions.filter((q, i) => userAnswers[i] === q.correctAnswerIndex).length} de {quiz.questions.length} questões.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
            >
              Voltar ao Treinamento
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Gabarito Comentado</h3>
            {quiz.questions.map((q, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="font-bold text-slate-800">{idx + 1}. {q.question}</h4>
                  {userAnswers[idx] === q.correctAnswerIndex 
                    ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    : <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
                  }
                </div>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div 
                      key={oIdx}
                      className={cn(
                        "p-3 rounded-lg text-sm",
                        oIdx === q.correctAnswerIndex ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200" :
                        oIdx === userAnswers[idx] ? "bg-rose-50 text-rose-700 border border-rose-200" :
                        "text-slate-500"
                      )}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">Explicação:</span>
                  {q.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Placeholder Components ---

function Simulator() {
  const [amount, setAmount] = useState<number>(100000);
  const [rate, setRate] = useState<number>(1.5);
  const [term, setTerm] = useState<number>(12);

  const result = useMemo(() => {
    const totalInterest = amount * (rate / 100) * term;
    const totalValue = amount + totalInterest;
    const monthlyPayment = totalValue / term;
    return {
      totalInterest,
      totalValue,
      monthlyPayment
    };
  }, [amount, rate, term]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Simulador FIDC</h2>
        <p className="text-slate-500">Simule operações de Fundo de Investimento em Direitos Creditórios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Parâmetros da Operação</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Valor do Aporte (R$)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Taxa Mensal (%)</label>
              <input 
                type="number" 
                step="0.1"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Prazo (Meses)</label>
              <input 
                type="number" 
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="bg-emerald-900 text-white p-8 rounded-2xl shadow-xl space-y-8 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold opacity-80 mb-6">Resultado da Simulação</h3>
            
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Retorno Total Estimado</span>
                <div className="text-4xl font-black">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.totalValue)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Juros Totais</span>
                  <div className="text-xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.totalInterest)}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Parcela Mensal</span>
                  <div className="text-xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.monthlyPayment)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <p className="text-xs opacity-60 italic">
              * Esta é uma simulação simplificada para fins educacionais. Taxas e condições reais podem variar de acordo com o mercado e perfil do fundo.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-blue-500 rounded-lg text-white">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-blue-900">Dica de Especialista</h4>
          <p className="text-sm text-blue-800 mt-1">
            Operações de FIDC são excelentes para antecipação de recebíveis, permitindo que empresas melhorem seu fluxo de caixa sem contrair dívidas bancárias tradicionais.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuizzesOverview({ data, progress }: { data: AppData, progress: UserProgress }) {
  const allQuizzes = data.modules.flatMap(m => m.quizzes.map(q => ({ ...q, moduleId: m.id, moduleTitle: m.title })));
  const pending = allQuizzes.filter(q => !progress.quizResults[q.id]?.completed);
  const completed = allQuizzes.filter(q => progress.quizResults[q.id]?.completed);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Painel de Quizzes</h2>
        <p className="text-slate-500">Gerencie suas avaliações e veja o que falta realizar.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            Pendentes ({pending.length})
          </h3>
          <div className="space-y-4">
            {pending.map(quiz => (
              <Link 
                key={quiz.id} 
                to={`/quizzes/${quiz.moduleId}/${quiz.id}`}
                className="block bg-white p-6 rounded-2xl border border-slate-200 hover:border-amber-500 transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{quiz.moduleTitle}</span>
                    <h4 className="text-lg font-bold text-slate-900 group-hover:text-amber-600">{quiz.title}</h4>
                    <p className="text-sm text-slate-500">{quiz.questions.length} questões</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500" />
                </div>
              </Link>
            ))}
            {pending.length === 0 && <p className="text-slate-400 italic">Nenhum quiz pendente!</p>}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            Realizados ({completed.length})
          </h3>
          <div className="space-y-4">
            {completed.map(quiz => (
              <div key={quiz.id} className="bg-white p-6 rounded-2xl border border-slate-200 opacity-70">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{quiz.moduleTitle}</span>
                    <h4 className="text-lg font-bold text-slate-900">{quiz.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-600">Nota: {progress.quizResults[quiz.id].score}%</span>
                    </div>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function CertificatesView({ metrics, data, progress }: { metrics: any, data: AppData, progress: UserProgress }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Certificados</h2>
        <p className="text-slate-500">Acompanhe seus requisitos para emissão de certificados.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center shrink-0">
            <Award className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">Certificado de Capacitação EduCorp</h3>
            <p className="text-slate-500 text-sm max-w-xl">
              Regra de Emissão: É necessário completar pelo menos 70% de cada módulo. 
              O progresso envolve visualização de vídeos, acesso a materiais e conclusão de quizzes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.modules.map(module => {
            const moduleProgress = calculateModuleProgress(module, progress);
            const isEligible = moduleProgress >= 70;
            return (
              <div key={module.id} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900">{module.title}</h4>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
                    isEligible ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  )}>
                    {isEligible ? 'Elegível' : 'Em Progresso'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Progresso Atual</span>
                    <span>{moduleProgress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${moduleProgress}%` }} />
                  </div>
                </div>
                <button 
                  disabled={!isEligible}
                  className={cn(
                    "w-full py-3 rounded-xl font-bold text-sm transition-all",
                    isEligible 
                      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md" 
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  )}
                >
                  {isEligible ? 'Emitir Certificado' : 'Faltam ' + (70 - moduleProgress) + '% para liberar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CasesView({ data, setData, role }: { data: AppData, setData: any, role: Role }) {
  const addCase = () => {
    if (data.cases.length >= 5) return alert("Limite de 5 cases atingido.");
    const title = prompt("Título do case:");
    const url = prompt("URL do case:");
    if (!title || !url) return;
    setData({ ...data, cases: [...data.cases, { id: `c${Date.now()}`, title, type: 'video', url }] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Cases de Sucesso</h2>
          <p className="text-slate-500">Inspire-se com histórias reais de sucesso.</p>
        </div>
        {role === 'admin' && (
          <button onClick={addCase} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold">
            <Plus className="w-5 h-5" /> Novo Case
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.cases.map(item => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group">
            <div className="h-40 bg-slate-100 flex items-center justify-center relative">
              <Briefcase className="w-12 h-12 text-slate-300" />
              <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/10 transition-colors" />
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <button 
                onClick={() => window.open(item.url, '_blank')}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                Ver Conteúdo <ExternalLink className="w-4 h-4" />
              </button>
              {role === 'admin' && (
                <button 
                  onClick={() => setData({ ...data, cases: data.cases.filter(c => c.id !== item.id) })}
                  className="w-full py-2 text-rose-500 text-xs font-bold hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Remover Case
                </button>
              )}
            </div>
          </div>
        ))}
        {data.cases.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 italic">
            Nenhum case de sucesso cadastrado.
          </div>
        )}
      </div>
    </div>
  );
}

function FAQView({ data, setData, role }: { data: AppData, setData: any, role: Role }) {
  const addFAQ = () => {
    const question = prompt("Pergunta:");
    const answer = prompt("Resposta:");
    if (!question || !answer) return;
    setData({ ...data, faq: [...data.faq, { id: `f${Date.now()}`, question, answer }] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">FAQ</h2>
          <p className="text-slate-500">Perguntas frequentes e suporte.</p>
        </div>
        {role === 'admin' && (
          <button onClick={addFAQ} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold">
            <Plus className="w-5 h-5" /> Adicionar FAQ
          </button>
        )}
      </div>

      <div className="space-y-4 max-w-3xl">
        {data.faq.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 group">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold text-slate-900">{item.question}</h3>
              {role === 'admin' && (
                <button 
                  onClick={() => setData({ ...data, faq: data.faq.filter(f => f.id !== item.id) })}
                  className="p-1 text-slate-300 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-slate-600 leading-relaxed">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryView({ data, setData, role }: { data: AppData, setData: any, role: Role }) {
  const addItem = () => {
    const title = prompt("Título da referência:");
    const url = prompt("URL da referência:");
    if (!title || !url) return;
    setData({ ...data, library: [...data.library, { id: `l${Date.now()}`, title, type: 'url', url }] });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Biblioteca</h2>
          <p className="text-slate-500">Referências bibliográficas e materiais extras.</p>
        </div>
        {role === 'admin' && (
          <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold">
            <Plus className="w-5 h-5" /> Adicionar Item
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.library.map(item => (
          <a 
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between hover:border-emerald-500 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                <Library className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-700">{item.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-500" />
              {role === 'admin' && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setData({ ...data, library: data.library.filter(l => l.id !== item.id) });
                  }}
                  className="p-1 text-slate-300 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </a>
        ))}
        {data.library.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 italic">
            Nenhuma referência bibliográfica cadastrada.
          </div>
        )}
      </div>
    </div>
  );
}

