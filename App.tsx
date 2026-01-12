
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Music, FileDown, RefreshCw } from 'lucide-react';
import MusicSheet from './components/MusicSheet';
import { MusicNote, NoteDuration } from './types';
import { TREBLE_NOTES, BASS_NOTES } from './constants';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [trebleMeasures, setTrebleMeasures] = useState<MusicNote[][]>([]);
  const [bassMeasures, setBassMeasures] = useState<MusicNote[][]>([]);
  
  const sheetRef = useRef<HTMLDivElement>(null);

  const generateMeasure = (possibleNotes: string[], durationOptions: {id: NoteDuration, beats: number}[]) => {
    const currentMeasure: MusicNote[] = [];
    let measureBeats = 0;
    while (measureBeats < 4) {
      const validOptions = durationOptions.filter(d => d.beats <= (4 - measureBeats));
      if (validOptions.length === 0) break;
      const choice = validOptions[Math.floor(Math.random() * validOptions.length)];
      currentMeasure.push({
        keys: [possibleNotes[Math.floor(Math.random() * possibleNotes.length)]],
        duration: choice.id
      });
      measureBeats += choice.beats;
    }
    return currentMeasure;
  };

  const generateNotes = useCallback(() => {
    // Hardcoded options: Redondas (4), Blancas (2), Negras (1)
    const durationOptions: {id: NoteDuration, beats: number}[] = [
      {id: 'w', beats: 4},
      {id: 'h', beats: 2},
      {id: 'q', beats: 1}
    ];

    const newTreble: MusicNote[][] = [];
    const newBass: MusicNote[][] = [];
    
    for (let i = 0; i < 4; i++) {
      newTreble.push(generateMeasure(TREBLE_NOTES, durationOptions));
      newBass.push(generateMeasure(BASS_NOTES, durationOptions));
    }

    setTrebleMeasures(newTreble);
    setBassMeasures(newBass);
  }, []);

  const exportPDF = async () => {
    if (!sheetRef.current) return;
    const canvas = await html2canvas(sheetRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.setFontSize(20);
    pdf.text(`Práctica de Piano: Clave de Sol y Fa`, 15, 20);
    pdf.addImage(imgData, 'PNG', 10, 30, pdfWidth - 20, pdfHeight - 20);
    pdf.save(`partitura_grand_staff.pdf`);
  };

  useEffect(() => {
    generateNotes();
  }, [generateNotes]);

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center bg-slate-50">
      <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <Music className="text-indigo-600" size={48} />
            Pentagrama Maestro
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Practica lectura en Clave de Sol y Fa simultáneamente</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={generateNotes}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg hover:shadow-indigo-200 active:scale-95"
          >
            <RefreshCw size={24} />
            Nueva Partitura
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold transition shadow-sm active:scale-95"
          >
            <FileDown size={24} />
            Descargar PDF
          </button>
        </div>
      </header>

      <main className="w-full max-w-5xl">
        <div 
          ref={sheetRef}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center overflow-x-auto"
        >
          <div className="w-full flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ejercicios de lectura</span>
              <h2 className="text-2xl font-bold text-slate-800">4 Compases Mixtos</h2>
            </div>
            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 italic">4/4 C</span>
              <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Nivel Principiante</span>
            </div>
          </div>
          
          <div className="w-full flex justify-center py-6">
            <MusicSheet trebleMeasures={trebleMeasures} bassMeasures={bassMeasures} />
          </div>

          <div className="w-full mt-10 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-center">
             <p className="text-indigo-800 font-medium">
               Este ejercicio incluye una combinación aleatoria de <strong>Redondas</strong>, <strong>Blancas</strong> y <strong>Negras</strong> en ambas claves.
             </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-slate-400 text-sm pb-12 flex flex-col items-center gap-2">
        <div className="h-px w-24 bg-slate-200 mb-4"></div>
        <p>&copy; {new Date().getFullYear()} Pentagrama Maestro</p>
        <p className="italic">El camino hacia la maestría musical comienza con un solo compás.</p>
      </footer>
    </div>
  );
};

export default App;
