import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { NarrativeBeat } from '../types';

interface AnalysisChartProps {
  beats: NarrativeBeat[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as NarrativeBeat;
    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-xl max-w-sm text-sm">
        <p className="font-bold text-slate-200 mb-1">
          #{data.beat_number} {data.title}
        </p>
        <p className="text-slate-400 text-xs mb-2">{data.act}</p>
        <div className="flex gap-4 mb-2">
           <span className="text-emerald-400 font-mono">Emotion: {data.emotional_value}</span>
           <span className="text-rose-400 font-mono">Tension: {data.tension_level}</span>
        </div>
        <p className="text-slate-300 mb-2 italic">{data.summary}</p>
        <div className="pt-2 border-t border-slate-800">
           <p className="text-slate-500 text-xs">Analysis: {data.analysis_comment}</p>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalysisChart: React.FC<AnalysisChartProps> = ({ beats }) => {
  // Find transition points for ReferenceLines
  const actTransitions = beats.reduce((acc, beat, index) => {
    if (index > 0 && beat.act !== beats[index - 1].act) {
      acc.push({ index: index - 0.5, label: beat.act }); // Offset to place line between points
    }
    return acc;
  }, [] as { index: number; label: string }[]);

  return (
    <div className="w-full h-[500px] bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={beats}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis 
            dataKey="beat_number" 
            stroke="#94a3b8" 
            label={{ value: 'Beat / Scene Sequence', position: 'insideBottomRight', offset: -10, fill: '#64748b' }}
          />
          <YAxis 
            stroke="#94a3b8" 
            domain={[-10, 10]} 
            ticks={[-10, -5, 0, 5, 10]}
            label={{ value: 'Intensity', angle: -90, position: 'insideLeft', fill: '#64748b' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {/* Act Separators */}
          {actTransitions.map((t, i) => (
             <ReferenceLine 
                key={i} 
                x={t.index} 
                stroke="#64748b" 
                strokeDasharray="5 5" 
                label={{ value: t.label, position: 'insideTop', fill: '#94a3b8', fontSize: 12 }} 
             />
          ))}
          <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />

          <Line
            type="monotone"
            dataKey="emotional_value"
            name="Emotional Arc (主人公の感情)"
            stroke="#34d399" // Emerald 400
            strokeWidth={3}
            dot={{ fill: '#34d399', r: 4 }}
            activeDot={{ r: 8 }}
            animationDuration={1500}
          />
          <Line
            type="monotone"
            dataKey="tension_level"
            name="Tension Level (物語の緊張感)"
            stroke="#e11d48" // Rose 600
            strokeWidth={3}
            dot={{ fill: '#e11d48', r: 4 }}
            activeDot={{ r: 8 }}
            animationDuration={1500}
            animationBegin={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
