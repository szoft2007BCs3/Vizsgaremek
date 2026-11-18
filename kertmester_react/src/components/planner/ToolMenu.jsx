import { Icon } from './icons.jsx';

function ToolButton({ tool, current, setTool, label, title }) {
  return (
    <button type="button" className={`btn-tool${current === tool ? ' active' : ''}`} title={title || label} onClick={() => setTool(tool)}>
      <Icon name={tool} />
      <span className="btn-label">{label}</span>
    </button>
  );
}

function ToggleButton({ icon, label, title, pressed, onClick, className = '' }) {
  return (
    <button type="button" className={`btn-tool${pressed ? ' active' : ''} ${className}`.trim()} aria-pressed={pressed} title={title} onClick={onClick}>
      <Icon name={icon} />
      <span className="btn-label">{label}</span>
    </button>
  );
}

const ZONE_SHAPES = [
  { shape: 'freehand', label: 'Szabadkéz', title: 'Szabadkéz' },
  { shape: 'rectangle', label: 'Téglalap', title: 'Téglalap' },
  { shape: 'ellipse', label: 'Ellipszis', title: 'Ellipszis (Shift: kör)' }
];

export default function ToolMenu({ ui, actions }) {
  const { tool, color, lineWidth, shapeFill, zone, mature } = ui;
  const { setTool, setColor, setLineWidth, toggleShapeFill, setZoneShape, toggleZoneFill, toggleMature, undo, clear } = actions;

  return (
    <section className="panel planner-menu">
      <h2 className="panel-title">Rajzmenü</h2>
      <div className={`toolbar${tool === 'zone' ? ' zone-mode' : ''}`}>
        <div className="tool-group drawing-only">
          <span className="group-title">Szín és vastagság</span>
          <div className="group-tools">
            <input type="color" value={color} title="Szín" aria-label="Szín" onChange={(e) => setColor(e.target.value)} />
            <label className="size-control" title="Vonalvastagság">
              <input type="range" min="1" max="50" value={lineWidth} aria-label="Vonalvastagság" onChange={(e) => setLineWidth(Number(e.target.value))} />
              <output>{lineWidth}</output>
            </label>
          </div>
        </div>

        <div className="tool-group">
          <span className="group-title">Eszközök</span>
          <div className="group-tools">
            <ToolButton tool="pen" current={tool} setTool={setTool} label="Toll" title="Toll" />
            <ToolButton tool="eraser" current={tool} setTool={setTool} label="Radír" title="Radír" />
            <ToolButton tool="spray" current={tool} setTool={setTool} label="Spray" title="Spray" />
            <ToolButton tool="bucket" current={tool} setTool={setTool} label="Vödör" title="Vödör" />
            <ToolButton tool="hand" current={tool} setTool={setTool} label="Mozgatás" title="Terület mozgatása, üres részen a nézet húzása" />
            <ToolButton tool="reshape" current={tool} setTool={setTool} label="Alakítás" title="Fogd meg egy terület szélét, majd húzd el vagy told be" />
            <ToolButton tool="text" current={tool} setTool={setTool} label="Szöveg" title="Szöveg írása a rajzra" />
          </div>
        </div>

        <div className="tool-group drawing-only">
          <span className="group-title">Alakzatok</span>
          <div className="group-tools">
            <ToolButton tool="line" current={tool} setTool={setTool} label="Vonal" title="Vonal" />
            <ToolButton tool="ellipse" current={tool} setTool={setTool} label="Ellipszis" title="Ellipszis" />
            <ToolButton tool="rectangle" current={tool} setTool={setTool} label="Téglalap" title="Téglalap" />
            <ToggleButton icon="fillToggle" label="Kitöltés" title="Kitöltés" pressed={shapeFill} onClick={toggleShapeFill} />
          </div>
        </div>

        <div className="tool-group zone-group" hidden={tool !== 'zone'}>
          <span className="group-title">Területrajzolás</span>
          <div className="group-tools">
            <span className="zone-swatch" style={zone.look ? { background: zone.look.color, borderColor: zone.look.mark } : undefined}></span>
            <span className="zone-name">{zone.look ? zone.look.label : ''}</span>
            {ZONE_SHAPES.map((item) => (
              <button key={item.shape} type="button" className={`btn-tool${zone.shape === item.shape ? ' active' : ''}`} title={item.title} onClick={() => setZoneShape(item.shape)}>
                <Icon name={`zone-${item.shape}`} />
                <span className="btn-label">{item.label}</span>
              </button>
            ))}
            <ToggleButton icon="zoneFillBtn" label="Kitöltés" title="Kitöltés" pressed={zone.fill} onClick={toggleZoneFill} />
            <button type="button" className="btn-tool zone-exit" title="Kilépés a területrajzolásból (Esc)" onClick={() => setTool('pen')}>✓ Kész</button>
          </div>
        </div>

        <div className="tool-group">
          <span className="group-title">Növények mérete</span>
          <div className="group-tools">
            <ToggleButton icon="matureToggle" label={mature ? 'Kifejlett méret' : 'Csemete méret'} title="Csemete / kifejlett fa méret váltása" pressed={mature} onClick={toggleMature} />
          </div>
        </div>

        <div className="tool-group">
          <span className="group-title">Műveletek</span>
          <div className="group-tools">
            <button type="button" className="btn-tool" title="Visszavonás" onClick={undo}>
              <Icon name="undoBtn" />
              <span className="btn-label">Visszavonás</span>
            </button>
            <button type="button" className="btn-tool btn-clear" title="Mindent töröl (rajz, elemek, területek, kosár)" onClick={clear}>
              <Icon name="clearBtn" />
              <span className="btn-label">Törlés</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
