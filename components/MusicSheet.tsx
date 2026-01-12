
import React, { useEffect, useRef } from 'react';
import { Renderer, Stave, StaveNote, Voice, Formatter, StaveConnector } from 'vexflow';
import { MusicNote } from '../types';

interface MusicSheetProps {
  trebleMeasures: MusicNote[][];
  bassMeasures: MusicNote[][];
}

const MusicSheet: React.FC<MusicSheetProps> = ({ trebleMeasures, bassMeasures }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || trebleMeasures.length === 0) return;

    // Limpiar renderizado previo
    containerRef.current.innerHTML = '';

    const renderer = new Renderer(containerRef.current, Renderer.Backends.SVG);
    
    // Ancho total para 4 compases
    const totalWidth = 850;
    const height = 350;
    renderer.resize(totalWidth, height);

    const context = renderer.getContext();
    const measureWidth = (totalWidth - 50) / 4;
    
    let currentX = 40;

    for (let i = 0; i < 4; i++) {
      // Treble Staff (Top)
      const trebleStave = new Stave(currentX, 40, measureWidth);
      if (i === 0) {
        trebleStave.addClef('treble').addTimeSignature('4/4');
      }
      trebleStave.setContext(context).draw();

      // Bass Staff (Bottom)
      const bassStave = new Stave(currentX, 160, measureWidth);
      if (i === 0) {
        bassStave.addClef('bass').addTimeSignature('4/4');
        
        // Add connectors for the first measure
        const lineLeft = new StaveConnector(trebleStave, bassStave);
        lineLeft.setType(StaveConnector.type.SINGLE_LEFT);
        lineLeft.setContext(context).draw();

        const brace = new StaveConnector(trebleStave, bassStave);
        brace.setType(StaveConnector.type.BRACE);
        brace.setContext(context).draw();
      }

      // Connector for measure boundary
      const connector = new StaveConnector(trebleStave, bassStave);
      connector.setType(i === 3 ? StaveConnector.type.SINGLE_RIGHT : StaveConnector.type.SINGLE_RIGHT);
      connector.setContext(context).draw();

      bassStave.setContext(context).draw();

      // Treble Notes
      const vfTrebleNotes = trebleMeasures[i].map((n) => {
        return new StaveNote({
          clef: 'treble',
          keys: n.keys,
          duration: n.duration,
        });
      });
      const trebleVoice = new Voice({ num_beats: 4, beat_value: 4 });
      trebleVoice.addTickables(vfTrebleNotes);

      // Bass Notes
      const vfBassNotes = bassMeasures[i].map((n) => {
        return new StaveNote({
          clef: 'bass',
          keys: n.keys,
          duration: n.duration,
        });
      });
      const bassVoice = new Voice({ num_beats: 4, beat_value: 4 });
      bassVoice.addTickables(vfBassNotes);

      // Format both voices together on their respective staves
      new Formatter().joinVoices([trebleVoice]).formatToStave([trebleVoice], trebleStave);
      new Formatter().joinVoices([bassVoice]).formatToStave([bassVoice], bassStave);
      
      trebleVoice.draw(context, trebleStave);
      bassVoice.draw(context, bassStave);

      currentX += measureWidth;
    }

  }, [trebleMeasures, bassMeasures]);

  return (
    <div 
      id="music-canvas" 
      ref={containerRef} 
      className="flex justify-center items-center w-full overflow-x-auto py-4"
    />
  );
};

export default MusicSheet;
