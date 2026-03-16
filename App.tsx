
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Music, Copy, RefreshCw, Check } from 'lucide-react';
import MusicSheet from './components/MusicSheet';
import { MusicNote, NoteDuration } from './types';
import { TREBLE_NOTES, BASS_NOTES } from './constants';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [allTracks, setAllTracks] = useState<MusicNote[][][]>([]);
  const [isCopied, setIsCopied] = useState(false);
  
  // Referencia específica para capturar solo la partitura
  const scoreContainerRef = useRef<HTMLDivElement>(null);

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
    const durationOptions: {id: NoteDuration, beats: number}[] = [
      {id: 'w', beats: 4},
      {id: 'h', beats: 2},
      {id: 'q', beats: 1}
    ];

    const tracks: MusicNote[][][] = [];
    for (let t = 0; t < 4; t++) {
      const isTreble = t % 2 === 0;
      const possibleNotes = isTreble ? TREBLE_NOTES : BASS_NOTES;
      const measures: MusicNote[][] = [];
      for (let i = 0; i < 4; i++) {
        measures.push(generateMeasure(possibleNotes, durationOptions));
      }
      tracks.push(measures);
    }
    setAllTracks(tracks);
  }, []);

  const copyToClipboard = async () => {
    if (!scoreContainerRef.current) return;
    
    window.focus();

    try {
      const blobPromise = (async () => {
        // Capturamos solo el contenedor que tiene la partitura
        const canvas = await html2canvas(scoreContainerRef.current!, { 
          scale: 3, // Mayor calidad para la partitura sola
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
        });
        
        return new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('No se pudo crear la imagen'));
          }, 'image/png');
        });
      })();

      const clipboardItem = new ClipboardItem({
        'image/png': blobPromise
      });

      await navigator.clipboard.write([clipboardItem]);
      
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('Error al copiar la partitura. Intenta de nuevo.');
    }
  };

  useEffect(() => {
    generateNotes();
  }, [generateNotes]);

  return (
    <div className="min-h-screen p-4 md:p-12 flex flex-col items-center bg-slate-50">
      <header className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-3">
            <Music className="text-indigo-600" size={48} />
            Pentagrama Maestro
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Práctica extendida: 4 Pentagramas (Sol, Fa, Sol, Fa)</p>
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
            onClick={copyToClipboard}
            className={`flex items-center gap-2 border-2 px-6 py-3 rounded-xl font-bold transition shadow-sm active:scale-95 ${
              isCopied 
              ? 'bg-emerald-500 border-emerald-500 text-white' 
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            {isCopied ? <Check size={24} /> : <Copy size={24} />}
            {isCopied ? '¡Copiado!' : 'Copiar Solo Partitura'}
          </button>
        </div>
      </header>

      <main className="w-full max-w-6xl">
        <div className="bg-white p-8 md:p-16 rounded-3xl shadow-2xl border border-slate-200 flex flex-col items-center overflow-x-auto">
          <div className="w-full flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
            <div className="flex flex-col">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Ejercicios de piano</span>
              <h2 className="text-2xl font-bold text-slate-800">Partitura Completa</h2>
            </div>
            <div className="flex gap-4">
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 italic">4/4 C</span>
              <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">Práctica</span>
            </div>
          </div>
          
          {/* El contenedor que será capturado: Solo la partitura */}
          <div 
            ref={scoreContainerRef} 
            className="w-full flex justify-center py-6 bg-white"
          >
            <MusicSheet tracks={allTracks} />
          </div>

          <div className="w-full mt-10 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-center">
             <p className="text-indigo-800 font-medium">
               Al copiar la imagen, ahora solo se guardarán los pentagramas con las notas.
             </p>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-slate-400 text-sm pb-12 flex flex-col items-center gap-2 text-center px-4">
        <div className="h-px w-24 bg-slate-200 mb-4"></div>
        <p>&copy; {new Date().getFullYear()} Pentagrama Maestro</p>
      </footer>
    </div>
  );
};

export default App;
