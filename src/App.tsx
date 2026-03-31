import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  Smartphone, 
  Zap, 
  ArrowRight,
  Loader2,
  ChevronRight,
  Info,
  FileText,
  Download,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { generateMockData } from './lib/mockData';
import { analyzeCreditworthiness } from './lib/gemini';
import { Transaction, SMSRecord, CreditAnalysis } from './types';
import { format, parseISO } from 'date-fns';
import { auth, db } from './firebase';
import { parseMpesaText } from './lib/parser';
import { LOAN_PRODUCTS } from './lib/marketplace';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp
} from 'firebase/firestore';

const TRANSLATIONS = {
  en: {
    title: 'AltScore AI',
    subtitle: 'Predicting creditworthiness using alternative data patterns: Mobile Money, Utility Payments, and Business SMS records.',
    analyze: 'Run Credit Analysis',
    analyzing: 'Analyzing Patterns...',
    import: 'Import Real Data (CSV/SMS)',
    login: 'Login to Save History',
    logout: 'Logout',
    history: 'Score History',
    transactions: 'Transaction History',
    sms: 'SMS Business Records',
    marketplace: 'Loan Marketplace',
    simulator: 'Score Simulator',
    grade: 'Grade',
    score: 'Creditworthiness Score',
    risk: 'Risk Analysis',
    recommendations: 'Strategic Recommendations',
    pillars: 'Alternative Credit Pillars',
    consistency: 'Consistency',
    savings: 'Savings Rate',
    liquidity: 'Liquidity',
    resilience: 'Resilience',
    business: 'Business Activity',
    eligible: 'Eligible for this product',
    notEligible: 'Requires higher score',
    whatIf: 'What-If Score Simulator',
    adjust: 'Adjust your financial behavior to see potential score impact.'
  },
  sw: {
    title: 'AltScore AI',
    subtitle: 'Kutabiri uwezo wa kukopesheka kwa kutumia mifumo mbadala ya data: Pesa ya Simu, Malipo ya Huduma, na rekodi za Biashara za SMS.',
    analyze: 'Fanya Uchambuzi wa Mikopo',
    analyzing: 'Kuchambua Mifumo...',
    import: 'Ingiza Data Halisi (CSV/SMS)',
    login: 'Ingia ili Uhifadhi Historia',
    logout: 'Ondoka',
    history: 'Historia ya Alama',
    transactions: 'Historia ya Miamala',
    sms: 'Rekodi za Biashara za SMS',
    marketplace: 'Soko la Mikopo',
    simulator: 'Kisimulizi cha Alama',
    grade: 'Daraja',
    score: 'Alama ya Mikopo',
    risk: 'Uchambuzi wa Hatari',
    recommendations: 'Mapendekezo ya Kimkakati',
    pillars: 'Nguzo Mbadala za Mikopo',
    consistency: 'Uthabiti',
    savings: 'Kiwango cha Akiba',
    liquidity: 'Ukwasi',
    resilience: 'Uvumilivu',
    business: 'Shughuli za Biashara',
    eligible: 'Unastahili bidhaa hii',
    notEligible: 'Inahitaji alama ya juu zaidi',
    whatIf: 'Kisimulizi cha Alama cha "Ikiwa"',
    adjust: 'Rekebisha tabia yako ya kifedha ili kuona athari inayowezekana ya alama.'
  }
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'sw'>('en');
  const t = TRANSLATIONS[lang];
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<{ transactions: Transaction[], smsRecords: SMSRecord[] } | null>(null);
  const [analysis, setAnalysis] = useState<CreditAnalysis | null>(null);
  const [simulatedScore, setSimulatedScore] = useState<number | null>(null);
  const [simulatedMetrics, setSimulatedMetrics] = useState({
    consistency: 70,
    savings: 15,
    business: 40
  });
  const [history, setHistory] = useState<(CreditAnalysis & { id: string })[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'sms' | 'history' | 'marketplace' | 'simulator'>('transactions');
  const [isDragging, setIsDragging] = useState(false);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      return;
    }

    const q = query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (CreditAnalysis & { id: string })[];
      setHistory(docs);
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setData(generateMockData());
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleAnalyze = async () => {
    if (!data) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeCreditworthiness(data.transactions, data.smsRecords);
      setAnalysis(result);
      
      if (user) {
        await addDoc(collection(db, 'analyses'), {
          ...result,
          userId: user.uid,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (analysis) {
      setSimulatedScore(analysis.score);
      setSimulatedMetrics({
        consistency: analysis.metrics.consistencyScore,
        savings: analysis.metrics.savingsRate,
        business: Math.min(100, (data?.smsRecords.filter(s => s.isBusiness).length || 0) * 5)
      });
    }
  }, [analysis]);

  const handleSimulate = (key: keyof typeof simulatedMetrics, value: number) => {
    if (!analysis) return;
    const newMetrics = { ...simulatedMetrics, [key]: value };
    setSimulatedMetrics(newMetrics);
    
    // Simple linear simulation logic
    const baseScore = analysis.score;
    const diffConsistency = (newMetrics.consistency - analysis.metrics.consistencyScore) * 0.5;
    const diffSavings = (newMetrics.savings - analysis.metrics.savingsRate) * 1.2;
    const diffBusiness = (newMetrics.business - Math.min(100, (data?.smsRecords.filter(s => s.isBusiness).length || 0) * 5)) * 0.8;
    
    setSimulatedScore(Math.min(850, Math.max(300, Math.round(baseScore + diffConsistency + diffSavings + diffBusiness))));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    let text = "";
    if (e.type === 'drop') {
      const files = (e as React.DragEvent).dataTransfer.files;
      if (files.length > 0) text = await files[0].text();
    } else {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) text = await files[0].text();
    }

    if (text) {
      const parsed = parseMpesaText(text);
      if (parsed.transactions.length > 0) {
        setData(parsed);
        setAnalysis(null);
      }
    }
  };

  const chartData = useMemo(() => {
    if (!data) return [];
    const monthlyData: Record<string, { month: string, inflow: number, outflow: number }> = {};
    
    // Get last 6 months
    const sortedTransactions = [...data.transactions].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedTransactions.forEach(t => {
      const month = format(parseISO(t.date), 'MMM');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, inflow: 0, outflow: 0 };
      }
      if (t.type === 'inflow') monthlyData[month].inflow += t.amount;
      else monthlyData[month].outflow += t.amount;
    });

    return Object.values(monthlyData);
  }, [data]);

  const radarData = useMemo(() => {
    if (!analysis) return [];
    return [
      { subject: 'Consistency', A: analysis.metrics.consistencyScore, fullMark: 100 },
      { subject: 'Savings', A: analysis.metrics.savingsRate * 5, fullMark: 100 },
      { subject: 'Liquidity', A: Math.min(100, (analysis.metrics.monthlyInflow / 50000) * 100), fullMark: 100 },
      { subject: 'Resilience', A: 75, fullMark: 100 }, // Simulated
      { subject: 'Business', A: Math.min(100, (data?.smsRecords.filter(s => s.isBusiness).length || 0) * 5), fullMark: 100 },
    ];
  }, [analysis, data]);

  if (!data) return null;

  return (
    <div className="min-h-screen technical-grid p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16 border-b-2 border-brand-ink pb-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-brand-neon rounded-full animate-pulse shadow-[0_0_10px_#00FF00]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.3em] opacity-50">System Status: Operational // AltScore v1.0</span>
            </div>
            <h1 className="text-7xl md:text-9xl font-serif italic font-bold tracking-tighter leading-[0.8] text-brand-ink">
              {t.title.split(' ')[0]} <span className="text-brand-accent">{t.title.split(' ')[1]}</span>
            </h1>
            <p className="text-sm max-w-lg font-medium opacity-60 leading-relaxed border-l-2 border-brand-ink pl-4">
              {t.subtitle}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <button 
              onClick={() => setLang(lang === 'en' ? 'sw' : 'en')}
              className="px-4 py-2 border border-brand-ink text-[10px] font-black uppercase tracking-widest hover:bg-brand-ink hover:text-brand-bg transition-all"
            >
              {lang === 'en' ? 'SWAHILI' : 'ENGLISH'}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-40">Authenticated User</div>
                  <div className="text-xs font-bold font-mono">{user.displayName}</div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-3 bg-brand-ink text-brand-bg text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-brand-ink transition-all"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="px-8 py-4 bg-brand-ink text-brand-bg text-[10px] font-black uppercase tracking-widest hover:bg-brand-accent hover:text-brand-ink transition-all shadow-xl"
              >
                {t.login}
              </button>
            )}
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Data Overview */}
          <div className="lg:col-span-7 space-y-12">
            {/* Action Bar */}
            <div className="flex flex-wrap gap-4">
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileUpload}
                className={`relative flex-1 min-w-[200px] px-8 py-6 border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-4 ${isDragging ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-ink/20 hover:border-brand-ink'}`}
              >
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={handleFileUpload}
                  accept=".csv,.txt"
                />
                <Smartphone className="w-5 h-5 opacity-40" />
                <span className="text-[11px] font-black uppercase tracking-widest opacity-60">{t.import}</span>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="group relative px-12 py-6 bg-brand-ink text-brand-bg font-black uppercase tracking-widest text-xs flex items-center gap-4 hover:bg-brand-accent hover:text-brand-ink transition-all disabled:opacity-50 shadow-2xl"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Activity className="w-5 h-5" />
                )}
                {isAnalyzing ? t.analyzing : t.analyze}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
              <StatCard 
                label="Total Inflow" 
                value={`Ksh ${data.transactions.filter(t => t.type === 'inflow').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}`}
                icon={<TrendingUp className="w-4 h-4 text-brand-neon" />}
              />
              <StatCard 
                label="Total Outflow" 
                value={`Ksh ${data.transactions.filter(t => t.type === 'outflow').reduce((acc, t) => acc + t.amount, 0).toLocaleString()}`}
                icon={<TrendingDown className="w-4 h-4 text-brand-accent" />}
              />
              <StatCard 
                label="Utility Consistency" 
                value={`${data.transactions.filter(t => t.category === 'utility').length} Payments`}
                icon={<Zap className="w-4 h-4 text-yellow-400" />}
              />
              <StatCard 
                label="Business SMS" 
                value={`${data.smsRecords.filter(s => s.isBusiness).length} Records`}
                icon={<Smartphone className="w-4 h-4 text-blue-400" />}
              />
            </div>

          {/* Chart Section */}
          <div className="bg-white border-2 border-brand-ink p-8 shadow-[8px_8px_0px_#141414]">
            <div className="flex items-center justify-between mb-12">
              <h3 className="font-serif italic text-3xl">Cashflow Dynamics</h3>
              <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-ink" /> Inflow
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-brand-accent" /> Outflow
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(20,20,20,0.1)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 900, fill: '#141414', fontFamily: 'JetBrains Mono' }} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'rgba(20,20,20,0.05)' }}
                    contentStyle={{ 
                      backgroundColor: '#141414', 
                      border: 'none', 
                      borderRadius: '0',
                      color: '#E4E3E0',
                      fontSize: '12px',
                      fontFamily: 'JetBrains Mono'
                    }}
                  />
                  <Bar dataKey="inflow" fill="#141414" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="outflow" fill="#F27D26" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Grid */}
          <div className="bg-white border-2 border-brand-ink shadow-[8px_8px_0px_#141414] overflow-hidden">
            <div className="flex border-b-2 border-brand-ink overflow-x-auto bg-brand-bg/50">
              <TabButton active={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}>{t.transactions}</TabButton>
              <TabButton active={activeTab === 'sms'} onClick={() => setActiveTab('sms')}>{t.sms}</TabButton>
              <TabButton active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')}>{t.marketplace}</TabButton>
              {analysis && <TabButton active={activeTab === 'simulator'} onClick={() => setActiveTab('simulator')}>{t.simulator}</TabButton>}
              {user && <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')}>{t.history}</TabButton>}
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              {activeTab === 'transactions' ? (
                <div>
                  <div className="data-grid-row border-b-2 border-brand-ink bg-brand-ink text-brand-bg">
                    <div className="col-header text-brand-bg opacity-100">Date</div>
                    <div className="col-header text-brand-bg opacity-100">Description</div>
                    <div className="col-header text-brand-bg opacity-100">Category</div>
                    <div className="col-header text-brand-bg opacity-100 text-right">Amount</div>
                  </div>
                  {data.transactions.slice(0, 50).map(t => (
                    <div key={t.id} className="data-grid-row hover:bg-brand-accent hover:text-brand-ink">
                      <div className="data-value opacity-60">{t.date}</div>
                      <div className="font-bold tracking-tight">{t.description}</div>
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 ${t.type === 'inflow' ? 'bg-brand-neon shadow-[0_0_5px_#00FF00]' : 'bg-brand-accent'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.category}</span>
                      </div>
                      <div className={`text-right data-value font-black ${t.type === 'inflow' ? 'text-brand-neon' : ''}`}>
                        {t.type === 'inflow' ? '+' : '-'}{t.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'sms' ? (
                <div>
                  <div className="data-grid-row border-b-2 border-brand-ink bg-brand-ink text-brand-bg">
                    <div className="col-header text-brand-bg opacity-100">Date</div>
                    <div className="col-header text-brand-bg opacity-100">Sender</div>
                    <div className="col-header text-brand-bg opacity-100 col-span-2">Content</div>
                  </div>
                  {data.smsRecords.map(s => (
                    <div key={s.id} className="data-grid-row hover:bg-brand-accent hover:text-brand-ink">
                      <div className="data-value opacity-60">{s.date}</div>
                      <div className="font-black uppercase tracking-widest">{s.sender}</div>
                      <div className="col-span-2 text-xs opacity-80 leading-relaxed">{s.content}</div>
                    </div>
                  ))}
                </div>
              ) : activeTab === 'marketplace' ? (
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-brand-bg/20">
                  {LOAN_PRODUCTS.map(lp => {
                    const isEligible = (analysis?.score || 0) >= lp.minScore;
                    return (
                      <div key={lp.id} className={`p-8 border-2 border-brand-ink transition-all ${isEligible ? 'bg-white shadow-[4px_4px_0px_#141414] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#141414]' : 'bg-brand-ink/5 opacity-40 grayscale'}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="font-serif italic text-2xl leading-none mb-1">{lp.name}</h4>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{lp.provider}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-serif italic font-bold">Ksh {lp.amount.toLocaleString()}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-brand-accent">{lp.interestRate}% APR</div>
                          </div>
                        </div>
                        <p className="text-xs opacity-70 mb-8 leading-relaxed">{lp.description}</p>
                        <div className="flex items-center justify-between pt-6 border-t border-brand-ink/10">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isEligible ? 'text-brand-neon' : 'text-brand-accent'}`}>
                            {isEligible ? t.eligible : t.notEligible}
                          </span>
                          <button 
                            disabled={!isEligible}
                            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${isEligible ? 'bg-brand-ink text-brand-bg hover:bg-brand-accent hover:text-brand-ink' : 'bg-brand-ink/10 text-brand-ink/30 cursor-not-allowed'}`}
                          >
                            Apply Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : activeTab === 'simulator' ? (
                <div className="p-12 space-y-16 bg-white">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="max-w-md">
                      <h3 className="font-serif italic text-5xl mb-6 tracking-tighter">{t.whatIf}</h3>
                      <p className="text-sm opacity-60 leading-relaxed">{t.adjust}</p>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <motion.span 
                        key={simulatedScore}
                        initial={{ scale: 1.5, color: '#F27D26' }}
                        animate={{ scale: 1, color: '#141414' }}
                        className="text-[12rem] font-serif italic font-bold tracking-tighter leading-none"
                      >
                        {simulatedScore}
                      </motion.span>
                      <span className="text-2xl opacity-20 font-mono">/ 850</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <SimulatorSlider label={t.consistency} value={simulatedMetrics.consistency} onChange={(v) => handleSimulate('consistency', v)} />
                    <SimulatorSlider label={t.savings} value={simulatedMetrics.savings} onChange={(v) => handleSimulate('savings', v)} />
                    <SimulatorSlider label={t.business} value={simulatedMetrics.business} onChange={(v) => handleSimulate('business', v)} />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="data-grid-row border-b-2 border-brand-ink bg-brand-ink text-brand-bg">
                    <div className="col-header text-brand-bg opacity-100">Date</div>
                    <div className="col-header text-brand-bg opacity-100">Score</div>
                    <div className="col-header text-brand-bg opacity-100">Grade</div>
                    <div className="col-header text-brand-bg opacity-100 text-right">Action</div>
                  </div>
                  {history.map(h => (
                    <div key={h.id} className="data-grid-row hover:bg-brand-accent hover:text-brand-ink">
                      <div className="data-value opacity-60">{format(parseISO(h.timestamp), 'MMM dd, HH:mm')}</div>
                      <div className="text-xl font-serif italic font-bold">{h.score}</div>
                      <div>
                        <span className="px-4 py-1 bg-brand-ink text-brand-bg text-[10px] font-black uppercase tracking-widest">
                          Grade {h.grade}
                        </span>
                      </div>
                      <div className="text-right">
                        <button 
                          onClick={() => setAnalysis(h)}
                          className="text-brand-accent hover:underline font-black uppercase text-[10px] tracking-widest"
                        >
                          View Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Results */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {analysis ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-12"
              >
                {/* Score Card */}
                <div className="widget-container p-12 relative overflow-hidden is-active-glow">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <ShieldCheck className="w-64 h-64" />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-12">
                      <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40">Creditworthiness Index</span>
                      <span className="px-6 py-2 bg-brand-accent text-brand-ink text-[11px] font-black uppercase tracking-widest">
                        Grade {analysis.grade}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-6 mb-8">
                      <span className="big-number">{analysis.score}</span>
                      <span className="text-3xl opacity-20 font-mono">/ 850</span>
                    </div>
                    
                    <p className="text-lg font-serif italic opacity-80 leading-relaxed border-t border-white/10 pt-8">
                      {analysis.summary}
                    </p>
                  </div>
                </div>

                {/* Radar Chart: The 5 Pillars */}
                <div className="bg-white border-2 border-brand-ink p-8 shadow-[8px_8px_0px_#141414]">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 mb-12">Alternative Credit Pillars</h4>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="rgba(20,20,20,0.1)" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fontSize: 10, fontWeight: 900, fill: '#141414', fontFamily: 'JetBrains Mono' }} 
                        />
                        <Radar
                          name="AltScore"
                          dataKey="A"
                          stroke="#F27D26"
                          fill="#F27D26"
                          fillOpacity={0.6}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Risk Profile Analysis</h4>
                  {analysis.riskFactors.map((rf, idx) => (
                    <div key={idx} className="flex gap-6 p-6 bg-white border-2 border-brand-ink hover:bg-brand-bg transition-all">
                      <div className="mt-1">
                        {rf.impact === 'positive' ? (
                          <ShieldCheck className="w-6 h-6 text-brand-neon" />
                        ) : rf.impact === 'negative' ? (
                          <ShieldAlert className="w-6 h-6 text-brand-accent" />
                        ) : (
                          <Info className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest mb-2">{rf.factor}</div>
                        <div className="text-xs opacity-70 leading-relaxed font-medium">{rf.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowReport(true)}
                  className="w-full py-8 bg-brand-ink text-brand-bg text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-brand-accent hover:text-brand-ink transition-all shadow-2xl"
                >
                  <FileText className="w-6 h-6" />
                  Generate Formal Credit Report
                </button>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-16 border-4 border-dashed border-brand-ink/10 text-center opacity-30">
                <Activity className="w-20 h-20 mb-8 animate-pulse" />
                <h3 className="font-serif italic text-3xl mb-4">Awaiting Analysis</h3>
                <p className="text-sm max-w-[250px] leading-relaxed">
                  Import your mobile money patterns to initialize the AI scoring engine.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-32 pt-12 border-t-2 border-brand-ink flex flex-col md:flex-row justify-between items-center gap-8 opacity-50 pb-12">
        <div className="text-[11px] font-black uppercase tracking-[0.3em]">
          &copy; 2026 AltScore AI // Alternative Data Credit Systems // v1.0.4
        </div>
        <div className="flex gap-12 text-[11px] font-black uppercase tracking-[0.3em]">
          <a href="#" className="hover:text-brand-accent transition-colors">Privacy Protocol</a>
          <a href="#" className="hover:text-brand-accent transition-colors">API Documentation</a>
          <a href="#" className="hover:text-brand-accent transition-colors">System Status</a>
        </div>
      </footer>

      {/* Report Modal */}
      <AnimatePresence>
        {showReport && analysis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-bg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 md:p-12 relative print:p-0 print:max-h-none print:static"
            >
              <button 
                onClick={() => setShowReport(false)}
                className="absolute top-8 right-8 p-2 hover:bg-brand-ink/5 rounded-full print:hidden"
              >
                <X className="w-6 h-6" />
              </button>

              <div id="printable-report" className="space-y-12">
                <div className="flex justify-between items-start border-b-4 border-brand-ink pb-8">
                  <div>
                    <h2 className="text-6xl font-serif italic font-bold tracking-tighter">Alternative Credit Report</h2>
                    <p className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mt-4">Generated by AltScore AI // {new Date().toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10rem] font-serif italic font-bold tracking-tighter leading-[0.7]">{analysis.score}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-brand-accent mt-4">Grade {analysis.grade}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-12">
                    <section>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">Executive Summary</h3>
                      <p className="text-lg font-serif italic leading-relaxed opacity-80">{analysis.summary}</p>
                    </section>
                    
                    <section>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">Financial Metrics</h3>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="p-8 border-2 border-brand-ink">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Monthly Inflow</div>
                          <div className="text-3xl font-serif italic font-bold">Ksh {analysis.metrics.monthlyInflow.toLocaleString()}</div>
                        </div>
                        <div className="p-8 border-2 border-brand-ink">
                          <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2">Savings Rate</div>
                          <div className="text-3xl font-serif italic font-bold">{analysis.metrics.savingsRate}%</div>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="space-y-12">
                    <section>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">Risk Assessment</h3>
                      <div className="space-y-6">
                        {analysis.riskFactors.map((rf, i) => (
                          <div key={i} className="border-l-4 border-brand-ink pl-6 py-2">
                            <div className="text-xs font-black uppercase tracking-widest mb-1">{rf.factor}</div>
                            <div className="text-xs opacity-70 leading-relaxed font-medium">{rf.description}</div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 opacity-40">Strategic Guidance</h3>
                      <ul className="space-y-4">
                        {analysis.recommendations.map((rec, i) => (
                          <li key={i} className="text-sm font-serif italic flex gap-4">
                            <span className="text-brand-accent font-bold not-italic">0{i+1}</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>

                <div className="pt-12 border-t border-brand-ink/10 flex justify-between items-end opacity-50">
                  <div className="text-[9px] font-bold uppercase tracking-widest">
                    Verification ID: {Math.random().toString(36).substring(2, 15).toUpperCase()}
                  </div>
                  <div className="text-[9px] font-bold uppercase tracking-widest">
                    &copy; 2026 AltScore AI Systems
                  </div>
                </div>
              </div>

              <div className="mt-12 flex gap-4 print:hidden">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-brand-ink text-brand-bg text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-accent hover:text-brand-ink transition-all"
                >
                  <Download className="w-4 h-4" />
                  Print / Save as PDF
                </button>
                <button 
                  onClick={() => setShowReport(false)}
                  className="px-8 py-4 border border-brand-ink/20 text-[10px] font-bold uppercase tracking-widest hover:bg-brand-ink/5 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="widget-container p-6 border-brand-ink/20 hover:border-brand-accent transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 group-hover:text-brand-accent transition-all">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-serif italic font-bold tracking-tight">{value}</div>
    </div>
  );
}

function TabButton({ children, active, onClick }: { children: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-r-2 border-brand-ink ${active ? 'bg-brand-ink text-brand-bg' : 'hover:bg-brand-ink/5'}`}
    >
      {children}
    </button>
  );
}

function SimulatorSlider({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{label}</span>
        <span className="text-3xl font-serif italic font-bold">{value}%</span>
      </div>
      <div className="relative h-2 bg-brand-ink/10">
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full appearance-none cursor-pointer accent-brand-accent bg-transparent z-10"
        />
        <div 
          className="absolute top-0 left-0 h-full bg-brand-ink transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
