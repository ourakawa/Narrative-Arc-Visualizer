import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { analyzeNarrative } from './services/geminiService';
import { AnalysisChart } from './components/AnalysisChart';
import { AnalysisResponse } from './types';
import { 
  Clapperboard, 
  Activity, 
  BrainCircuit, 
  AlertTriangle, 
  ChevronRight, 
  FileText, 
  Loader2,
  Settings,
  Info
} from 'lucide-react';

// App Constants
const APP_VERSION = "v1.1.0";
const MAX_CHAR_LIMIT = 30000; // Limit to ensure stability on free tier
const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (推奨・高速)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (安定版)' },
  { id: 'gemini-2.5-flash-lite-preview-02-05', name: 'Gemini 2.5 Flash Lite (最速)' },
];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  const handleAnalyze = async () => {
    if (!inputText.trim() || isOverLimit) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await analyzeNarrative(inputText, selectedModel);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "解析中にエラーが発生しました。時間を置いて再試行するか、テキストを短くしてください。");
    } finally {
      setIsLoading(false);
    }
  };

  const sampleText = `タイトル：『ラスト・メロディ』

第一幕
かつて天才ピアニストと呼ばれた主人公・有馬は、事故で左手の機能を失い、今はしがない調律師として生きている。ある日、彼は古いピアノの調律依頼を受け、山奥の洋館を訪れる。そこで出会ったのは、盲目の少女・エリス。彼女は「完成しない曲がある」と言い、有馬に演奏を頼む。有馬は断るが、エリスの純粋な音色に心を動かされ、指導を引き受けることになる。

第二幕
エリスの聴覚は異常に鋭く、有馬の嘘（左手が動かないこと）をすぐに見抜く。二人は衝突しながらも、連弾を通じて心を通わせていく。しかし、洋館の主であるエリスの祖父が現れ、二人の交流を禁じる。実はエリスは、亡き祖母の身代わりとして英才教育を受けさせられていたのだ。有馬はエリスを連れ出し、コンクールへの出場を決意する。
コンクール予選。有馬はエリスの伴奏としてステージに立つが、緊張から左手が震え、演奏が止まってしまう。会場がざわめく中、エリスが一人でメロディを紡ぎ出し、有馬をリードする。二人の音は重なり、会場を圧倒するが、祖父の追手が迫っていた。

第三幕
逃避行の末、二人は海辺の廃教会にたどり着く。そこで有馬は、かつて自分が左手を失った事故の原因が、この祖父との因縁にあることを知る。絶望する有馬だが、エリスは「過去は変えられないけど、この曲のラストは変えられる」と告げる。
追手が教会を取り囲む中、二人は最後の連弾を始める。それは悲劇的な旋律ではなく、希望に満ちた長調へと転調していく。演奏が終わると同時に、祖父が入ってくるが、二人の音楽の力に圧倒され、立ち尽くす。
後日、有馬は再び表舞台に戻ることはなかったが、街のピアノ教室からは、楽しげな連弾の音が聞こえてくるのだった。`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-700 p-2 rounded-md">
              <Clapperboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide flex items-center gap-2">
                Narrative Arc Visualizer
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                  {APP_VERSION}
                </span>
              </h1>
              <p className="text-xs text-slate-400">日本映画学会 / リテラ企画 実証実験アプリ</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5">
               <Settings className="w-3 h-3 text-slate-400" />
               <select 
                 value={selectedModel}
                 onChange={(e) => setSelectedModel(e.target.value)}
                 className="bg-transparent text-xs font-mono text-slate-300 focus:outline-none cursor-pointer"
               >
                 {MODELS.map(m => (
                   <option key={m.id} value={m.id} className="bg-slate-900">{m.name}</option>
                 ))}
               </select>
             </div>
             <div className="text-xs font-mono text-emerald-500 flex items-center gap-1">
               <Activity className="w-3 h-3" /> Ready
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Script / Plot Input
              </h2>
              <button 
                onClick={() => setInputText(sampleText)}
                className="text-xs text-slate-500 hover:text-blue-400 underline"
              >
                サンプルを入力
              </button>
            </div>
            
            <div className="relative flex-1">
              <textarea
                className={`w-full h-full bg-slate-950 border rounded-lg p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 resize-none font-mono placeholder-slate-600
                  ${isOverLimit 
                    ? 'border-red-800 focus:ring-red-900/50 text-red-200' 
                    : 'border-slate-700 focus:ring-blue-600/50 text-slate-300'
                  }`}
                placeholder="ここにプロットや脚本を貼り付けてください..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className={`absolute bottom-4 right-4 text-xs font-mono bg-slate-900/80 px-2 py-1 rounded backdrop-blur-sm border
                 ${isOverLimit ? 'text-red-400 border-red-800' : 'text-slate-500 border-slate-700'}`}>
                 {charCount.toLocaleString()} / {MAX_CHAR_LIMIT.toLocaleString()} chars
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Mobile Model Selector */}
              <div className="md:hidden">
                <label className="text-xs text-slate-500 mb-1 block">Select Model</label>
                <select 
                   value={selectedModel}
                   onChange={(e) => setSelectedModel(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded p-2"
                 >
                   {MODELS.map(m => (
                     <option key={m.id} value={m.id}>{m.name}</option>
                   ))}
                 </select>
              </div>

              {isOverLimit && (
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  文字数が上限を超えています。テキストを短くしてください。
                </p>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading || !inputText || isOverLimit}
                className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2
                  ${isLoading || !inputText || isOverLimit
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-900/20'
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    ANALYZING STRUCTURE...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    ANALYZE NARRATIVE
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {error}
            </div>
          )}

          {!result && !isLoading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-12">
              <Activity className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">左側のフォームにテキストを入力して分析を開始してください</p>
              <p className="text-sm mt-2 opacity-60">AIが三幕構成、感情曲線、テンションの起伏を可視化します</p>
              <div className="mt-8 flex gap-4 text-xs text-slate-700">
                <div className="flex items-center gap-1">
                  <Info className="w-3 h-3" /> Max {MAX_CHAR_LIMIT.toLocaleString()} chars
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="w-3 h-3" /> Multi-Model Support
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-900 rounded-full opacity-30"></div>
                <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              </div>
              <p className="text-blue-400 font-mono animate-pulse">Processing Narrative Data...</p>
              <p className="text-xs text-slate-500">Using {MODELS.find(m => m.id === selectedModel)?.name}</p>
            </div>
          )}

          {result && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 overflow-y-auto pb-10">
              
              {/* Title Card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{result.title}</h2>
                    <p className="text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-4">
                      "{result.logline}"
                    </p>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 md:w-1/3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Structure Quality Control</h4>
                    <ul className="space-y-2">
                      {result.structural_defect_feedback.map((fb, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-amber-200/80">
                           <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-500" />
                           {fb}
                        </li>
                      ))}
                      {result.structural_defect_feedback.length === 0 && (
                        <li className="text-xs text-emerald-400 flex items-center gap-2">
                           <Activity className="w-3 h-3" /> No major defects detected.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  NARRATIVE ARC VISUALIZATION
                </h3>
                <AnalysisChart beats={result.beats} />
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase">Overall Analysis</h3>
                    <p className="text-slate-300 text-sm leading-7">
                      {result.overall_structure}
                    </p>
                 </div>
                 
                 <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-[300px] overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase sticky top-0 bg-slate-900 pb-2 border-b border-slate-800">
                      Beat Breakdown
                    </h3>
                    <div className="space-y-4">
                      {result.beats.map((beat) => (
                        <div key={beat.beat_number} className="group hover:bg-slate-800/50 p-2 rounded transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-blue-400">#{beat.beat_number} [{beat.act}]</span>
                            <div className="flex gap-2 text-[10px] font-mono opacity-50">
                              <span>E:{beat.emotional_value}</span>
                              <span>T:{beat.tension_level}</span>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-200 mb-1 flex items-center gap-1">
                            {beat.title}
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                          </p>
                          <p className="text-xs text-slate-500 line-clamp-2">{beat.summary}</p>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

export default App;