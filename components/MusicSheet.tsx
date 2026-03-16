
import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, StaveConnector } from 'vexflow';
import { MusicNote } from '../types';

interface MusicSheetProps {
  tracks: MusicNote[][][]; // Array of 4 tracks, each track is an array of 4 measures
}

const MusicSheet: React.FC<MusicSheetProps> = ({ tracks }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || tracks.length === 0) return;

    const canvas = canvasRef.current;
    // We must use the canvas element directly for the CANVAS backend in VexFlow 5
    const renderer = new Renderer(canvas, Renderer.Backends.CANVAS);
    
    const totalWidth = 900;
    const height = 650; 
    
    renderer.resize(totalWidth, height);
    const context = renderer.getContext();
    
    // Clear the canvas manually before redrawing to prevent ghosting
    context.clear();
    
    const measureWidth = (totalWidth - 60) / 4;
    const yOffsets = [40, 180, 350, 490];

    // Procesamos 4 compases (columnas)
    for (let m = 0; m < 4; m++) {
      let currentX = 50 + (m * measureWidth);
      const staves: Stave[] = [];

      // Creamos los pentagramas para esta columna
      for (let t = 0; t < 4; t++) {
        const stave = new Stave(currentX, yOffsets[t], measureWidth);
        const isTreble = t % 2 === 0;
        const clef = isTreble ? 'treble' : 'bass';

        if (m === 0) {
          stave.addClef(clef).addTimeSignature('4/4');
          
          // Añadir llaves y conectores de sistema
          if (t === 0) {
            const nextStave = new Stave(currentX, yOffsets[1], measureWidth);
            const brace = new StaveConnector(stave, nextStave);
            brace.setType(StaveConnector.type.BRACE);
            brace.setContext(context).draw();
            
            const line = new StaveConnector(stave, nextStave);
            line.setType(StaveConnector.type.SINGLE_LEFT);
            line.setContext(context).draw();
          }
          if (t === 2) {
             const nextStave = new Stave(currentX, yOffsets[3], measureWidth);
             const brace = new StaveConnector(stave, nextStave);
             brace.setType(StaveConnector.type.BRACE);
             brace.setContext(context).draw();

             const line = new StaveConnector(stave, nextStave);
             line.setType(StaveConnector.type.SINGLE_LEFT);
             line.setContext(context).draw();
          }
        }

        stave.setContext(context).draw();
        staves.push(stave);

        // Renderizar notas
        const measureNotes = tracks[t][m];
        const vfNotes = measureNotes.map((n) => {
          return new StaveNote({
            clef: clef as any,
            keys: n.keys,
            duration: n.duration,
          });
        });

        const voice = new Voice({ num_beats: 4, beat_value: 4 });
        voice.addTickables(vfNotes);

        new Formatter().joinVoices([voice]).formatToStave([voice], stave);
        voice.draw(context, stave);
      }
      
      // Líneas conectoras verticales al final de cada compás
      const conn1 = new StaveConnector(staves[0], staves[1]);
      conn1.setType(StaveConnector.type.SINGLE_RIGHT);
      conn1.setContext(context).draw();
      
      const conn2 = new StaveConnector(staves[2], staves[3]);
      conn2.setType(StaveConnector.type.SINGLE_RIGHT);
      conn2.setContext(context).draw();
    }

  }, [tracks]);

  return (
    <div className="flex justify-center items-center w-full overflow-x-auto py-4 bg-white rounded-lg">
      <canvas 
        ref={canvasRef} 
        className="max-w-full h-auto"
      />
    </div>
  );
};

export default MusicSheet;
