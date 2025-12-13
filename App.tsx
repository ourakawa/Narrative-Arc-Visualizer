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
  Info,
  Printer,
  HelpCircle,
  X
} from 'lucide-react';

// App Constants
const APP_VERSION = "v1.3.1"; // Performance Patch
const MAX_CHAR_LIMIT = 30000; // Limit to ensure stability on free tier
const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (推奨・高速)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (安定版)' },
  { id: 'gemini-2.5-flash-lite-preview-02-05', name: 'Gemini 2.5 Flash Lite (最速)' },
];

// Sample Text
const SAMPLE_TEXT = `タイトル：『ラスト・メロディ』

第一幕
かつて天才ピアニストと呼ばれた主人公・有馬は、事故で左手の機能を失い、今はしがない調律師として生きている。ある日、彼は古いピアノの調律依頼を受け、山奥の洋館を訪れる。そこで出会ったのは、盲目の少女・エリス。彼女は「完成しない曲がある」と言い、有馬に演奏を頼む。有馬は断るが、エリスの純粋な音色に心を動かされ、指導を引き受けることになる。

第二幕
エリスの聴覚は異常に鋭く、有馬の嘘（左手が動かないこと）をすぐに見抜く。二人は衝突しながらも、連弾を通じて心を通わせていく。しかし、洋館の主であるエリスの祖父が現れ、二人の交流を禁じる。実はエリスは、亡き祖母の身代わりとして英才教育を受けさせられていたのだ。有馬はエリスを連れ出し、コンクールへの出場を決意する。
コンクール予選。有馬はエリスの伴奏としてステージに立つが、緊張から左手が震え、演奏が止まってしまう。会場がざわめく中、エリスが一人でメロディを紡ぎ出し、有馬をリードする。二人の音は重なり、会場を圧倒するが、祖父の追手が迫っていた。

第三幕
逃避行の末、二人は海辺の廃教会にたどり着く。そこで有馬は、かつて自分が左手を失った事故の原因が、この祖父との因縁にあることを知る。絶望する有馬だが、エリスは「過去は変えられないけど、この曲のラストは変えられる」と告げる。
追手が教会を取り囲む中、二人は最後の連弾を始める。それは悲劇的な旋律ではなく、希望に満ちた長調へと転調していく。演奏が終わると同時に、祖父が入ってくるが、二人の音楽の力に圧倒され、立ち尽くす。
後日、有馬は再び表舞台に戻ることはなかったが、街のピアノ教室からは、楽しげな連弾の音が聞こえてくるのだった。`;

// Pre-calculated result for the sample text (Instant Load / Zero Cost)
const SAMPLE_RESULT: AnalysisResponse = {
  title: "ラスト・メロディ",
  logline: "左手を失った元天才ピアニストと盲目の少女が、連弾を通じて過去のトラウマと因縁を乗り越え、希望のラストシーンを奏でる再生の物語。",
  overall_structure: "非常に堅実で古典的な三幕構成に従っています。第一幕で欠落を抱えた二人が出会い、第二幕で協力と試練（コンクールの失敗と追跡）を経て絆を深め、第三幕で過去の因縁と対峙し、音楽による魂の救済で解決に至ります。カタルシスの配置が適切です。",
  structural_defect_feedback: [
    "全体的に完成度が高いですが、祖父が改心するプロセスが「音楽の力」の一点に依存しており、ややご都合主義に見える可能性があります。",
    "コンクールから廃教会への移動の動機付け（逃避行）のテンポ感が、前後のシーンに比べて急に感じられるかもしれません。"
  ],
  beats: [
    {
      beat_number: 1,
      title: "有馬とエリスの出会い",
      summary: "左手を失った元天才ピアニスト有馬が、調律依頼で盲目の少女エリスと出会う。彼女の未完成の曲と純粋な音色に触れ、指導を引き受ける。",
      act: "Act 1",
      emotional_value: -3,
      tension_level: 2,
      analysis_comment: "主人公の現状（欠落）の提示と、インサイティング・インシデント（出会い）。静かな始まり。"
    },
    {
      beat_number: 2,
      title: "連弾を通じた交流",
      summary: "エリスは有馬の嘘を見抜くが、連弾を通じて心を通わせる。二人の欠落が補完関係にあることが示される。",
      act: "Act 2",
      emotional_value: 3,
      tension_level: 3,
      analysis_comment: "関係性の構築。ポジティブな感情の上昇が見られるプログレスパート。"
    },
    {
      beat_number: 3,
      title: "祖父の妨害と脱出",
      summary: "エリスの祖父が交流を禁じる。エリスが身代わりであったことが判明し、有馬は彼女を連れ出しコンクールへ向かう。",
      act: "Act 2",
      emotional_value: -2,
      tension_level: 6,
      analysis_comment: "敵対者の登場による葛藤の発生。ミッドポイントへ向かう動機の転換。"
    },
    {
      beat_number: 4,
      title: "コンクールでの挫折と共鳴",
      summary: "予選ステージで有馬のトラウマが発動し演奏が止まるが、エリスのリードにより持ち直し、会場を圧倒する演奏となる。",
      act: "Act 2",
      emotional_value: 6,
      tension_level: 8,
      analysis_comment: "「全てを失う」瞬間の回避と、二人の絆の証明。感情値が大きく振れるシーン。"
    },
    {
      beat_number: 5,
      title: "廃教会での絶望と決意",
      summary: "追手から逃げた廃教会で、有馬は自身の事故と祖父の因縁を知り絶望するが、エリスの言葉で再起する。",
      act: "Act 3",
      emotional_value: -8,
      tension_level: 7,
      analysis_comment: "「魂の暗い夜」。クライマックス直前の最も感情が沈むポイント。"
    },
    {
      beat_number: 6,
      title: "最後の連弾",
      summary: "追手が迫る中、二人は希望に満ちた長調の曲を奏でる。その音楽は祖父をも圧倒し、因縁を断ち切る。",
      act: "Act 3",
      emotional_value: 9,
      tension_level: 9,
      analysis_comment: "クライマックス。最大の緊張と最高の感情的カタルシスが同時に訪れる。"
    },
    {
      beat_number: 7,
      title: "エピローグ",
      summary: "有馬は表舞台には戻らなかったが、ピアノ教室から楽しげな連弾の音が聞こえ、平穏な日常が示唆される。",
      act: "Act 3",
      emotional_value: 5,
      tension_level: 0,
      analysis_comment: "レゾリューション。新しい日常への着地。"
    }
  ]
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const charCount = inputText.length;
  const isOverLimit = charCount > MAX_CHAR_LIMIT;

  const handleAnalyze = async () => {
    if (!inputText.trim() || isOverLimit) return;
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    // COST OPTIMIZATION:
    // If the input matches the sample text exactly, use the pre-calculated result.
    // This makes the demo instant (0s latency) and costs $0 (0 tokens).
    if (inputText === SAMPLE_TEXT) {
      // Simulate a very short network delay for UI smoothness (optional, can be 0)
      setTimeout(() => {
        setResult(SAMPLE_RESULT);
        setIsLoading(false);
      }, 600);
      return;
    }

    try {
      const data = await analyzeNarrative(inputText, selectedModel);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "解析中にエラーが発生しました。時間を置いて再試行するか、テキストを短くしてください。");
    } finally {
      setIsLoading(false); // Only needed here if we didn't hit the cache
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50 print:hidden">
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
             <button 
               onClick={() => setShowHelp(true)}
               className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
               title="分析指標ガイド"
             >
               <HelpCircle className="w-5 h-5" />
             </button>
             <div className="text-xs font-mono text-emerald-500 flex items-center gap-1">
               <Activity className="w-3 h-3" /> Ready
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* Left Column: Input */}
        <div className="lg:col-span-4 flex flex-col gap-6 print:hidden">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-sm flex flex-col h-full max-h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-200 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Script / Plot Input
              </h2>
              <button 
                onClick={() => setInputText(SAMPLE_TEXT)}
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
        <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden print:col-span-12">
          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 print:hidden">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              {error}
            </div>
          )}

          {!result && !isLoading && !error && (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-xl p-12 print:hidden">
              <Activity className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">左側のフォームにテキストを入力して分析を開始してください</p>
              <p className="text-sm mt-2 opacity-60">AIが三幕構成、感情曲線、テンションの起伏を可視化します</p>
              <div className="mt-8 flex gap-4 text-xs text-slate-700">
                <div className="flex items-center gap-1">
                  <Info className="w-3 h-3" /> Max {MAX_CHAR_LIMIT.toLocaleString()} chars
                </div>
                <div className="flex items-center gap-1">
                  <Settings className="w-3 h-3" /> Sample: Zero Cost / Instant Load
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 print:hidden">
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
              
              <div className="flex justify-end print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print / Save PDF
                </button>
              </div>

              {/* Title Card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{result.title}</h2>
                    <p className="text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-4">
                      "{result.logline}"
                    </p>
                  </div>
                  <div className="bg-slate-950 p-0 rounded-lg border border-slate-800 md:w-2/5 max-w-md max-h-[240px] overflow-hidden flex flex-col">
                    <h4 className="text-xs font-bold text-slate-400 uppercase p-3 border-b border-slate-800 bg-slate-950/70 flex items-center gap-2 shrink-0">
                      <AlertTriangle className="w-3 h-3 text-amber-500"/>
                      Structure Quality Control
                    </h4>
                    <div className="overflow-y-auto p-3">
                      <ul className="space-y-3">
                        {result.structural_defect_feedback.map((fb, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-200/90">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0"></span>
                            <span>{fb}</span>
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
        
        {/* Help Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  AI分析指標ガイド
                </h3>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6 text-sm text-slate-300 max-h-[70vh] overflow-y-auto">
                <div>
                  <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Emotional Arc (感情曲線)
                  </h4>
                  <p className="leading-relaxed opacity-90">
                    主人公の心理状態や運勢の浮き沈みを数値化しています。
                    <br/><span className="text-xs opacity-60">[-10: 絶望/死] 〜 [0: 平常] 〜 [+10: 最高の幸福]</span>
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-rose-400 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Tension Level (テンション)
                  </h4>
                  <p className="leading-relaxed opacity-90">
                    観客が感じる緊張感やサスペンスの度合いです。
                    <br/><span className="text-xs opacity-60">[0: 緩和/静寂] 〜 [5: 葛藤] 〜 [10: クライマックス/命の危険]</span>
                  </p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <h4 className="font-bold text-amber-400 mb-1 text-xs uppercase">分析のヒント</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    一般的に、ヒット作は「感情」と「テンション」が逆の動きをすることが多いと言われています（例：主人公は絶望しているが、物語の緊張感は最高潮にあるなど）。二つのラインの乖離や交差に注目してください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);

export default App;