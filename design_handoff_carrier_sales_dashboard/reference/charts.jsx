/* charts.jsx — hand-built SVG charts for the Carrier Sales dashboards.
   Exports to window: LineChart, Donut, Sparkline, MiniBars.            */
const { useState: _useState } = React;

/* ---- smooth path through points (Catmull-Rom -> cubic bezier) ---- */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/* ============ LINE CHART (calls + booked area, rate dashed) ============ */
function LineChart({ data, width = 720, height = 280 }) {
  const [hi, setHi] = _useState(null);
  const padL = 38, padR = 44, padT = 16, padB = 30;
  const iw = width - padL - padR, ih = height - padT - padB;
  const maxV = Math.max(...data.map(d => d.calls)) * 1.12;
  const x = i => padL + (iw * i) / (data.length - 1);
  const y = v => padT + ih - (ih * v) / maxV;
  const yR = r => padT + ih - (ih * r) / 100;   // rate on 0-100 axis

  const callsPts = data.map((d, i) => [x(i), y(d.calls)]);
  const bookPts  = data.map((d, i) => [x(i), y(d.booked)]);
  const ratePts  = data.map((d, i) => [x(i), yR(d.rate)]);
  const callsLine = smoothPath(callsPts);
  const bookLine  = smoothPath(bookPts);
  const rateLine  = smoothPath(ratePts);
  const area = (line, pts) => `${line} L ${pts[pts.length-1][0]} ${padT+ih} L ${pts[0][0]} ${padT+ih} Z`;
  const yTicks = [0, .25, .5, .75, 1].map(f => Math.round(maxV * f));

  return (
    <svg width={width} height={height} style={{ display:'block', overflow:'visible' }}
         onMouseLeave={() => setHi(null)}>
      <defs>
        <linearGradient id="hrCalls" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(51,209,126,.26)" />
          <stop offset="100%" stopColor="rgba(51,209,126,0)" />
        </linearGradient>
        <linearGradient id="hrBook" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(111,224,163,.18)" />
          <stop offset="100%" stopColor="rgba(111,224,163,0)" />
        </linearGradient>
      </defs>
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={padL} x2={width-padR} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,.05)" />
          <text x={padL-10} y={y(t)+4} textAnchor="end" fontSize="10.5" fontFamily="var(--hr-mono)" fill="var(--hr-t3)">{t>=1000?(t/1000)+'k':t}</text>
        </g>
      ))}
      {[0,20,40,60,80].map((r,i)=>(
        <text key={i} x={width-padR+10} y={yR(r)+4} textAnchor="start" fontSize="10.5" fontFamily="var(--hr-mono)" fill="var(--hr-t3)">{r}%</text>
      ))}
      <path d={area(callsLine, callsPts)} fill="url(#hrCalls)" />
      <path d={area(bookLine, bookPts)} fill="url(#hrBook)" />
      <path d={callsLine} fill="none" stroke="var(--hr-g)" strokeWidth="2.4" strokeLinecap="round" />
      <path d={bookLine} fill="none" stroke="var(--hr-g-2)" strokeWidth="2.2" strokeLinecap="round" />
      <path d={rateLine} fill="none" stroke="var(--hr-t2)" strokeWidth="1.6" strokeDasharray="2 5" strokeLinecap="round" />

      {data.map((d, i) => (
        <g key={i}>
          <text x={x(i)} y={height-8} textAnchor="middle" fontSize="10.5" fontFamily="var(--hr-mono)" fill="var(--hr-t3)">{d.label}</text>
          <rect x={x(i)-iw/(data.length*2)} y={padT} width={iw/data.length} height={ih} fill="transparent"
                onMouseEnter={() => setHi(i)} />
        </g>
      ))}
      {hi !== null && (
        <g pointerEvents="none">
          <line x1={x(hi)} x2={x(hi)} y1={padT} y2={padT+ih} stroke="rgba(255,255,255,.16)" />
          <circle cx={x(hi)} cy={y(data[hi].calls)} r="4.5" fill="var(--hr-g)" stroke="#121212" strokeWidth="2.5" />
          <circle cx={x(hi)} cy={y(data[hi].booked)} r="4.5" fill="var(--hr-g-2)" stroke="#121212" strokeWidth="2.5" />
          <g transform={`translate(${Math.min(Math.max(x(hi)-66,2), width-134)}, ${padT})`}>
            <rect width="132" height="74" rx="9" fill="#0c0c0c" stroke="rgba(255,255,255,.12)" />
            <text x="12" y="20" fontSize="11" fontFamily="var(--hr-mono)" fill="var(--hr-t2)">{data[hi].full || data[hi].label}</text>
            <circle cx="15" cy="36" r="3.5" fill="var(--hr-g)" />
            <text x="26" y="40" fontSize="12" fill="var(--hr-t1)">Calls</text>
            <text x="120" y="40" textAnchor="end" fontSize="12" fontFamily="var(--hr-mono)" fontWeight="700" fill="var(--hr-t1)">{data[hi].calls}</text>
            <circle cx="15" cy="56" r="3.5" fill="var(--hr-g-2)" />
            <text x="26" y="60" fontSize="12" fill="var(--hr-t1)">Booked</text>
            <text x="120" y="60" textAnchor="end" fontSize="12" fontFamily="var(--hr-mono)" fontWeight="700" fill="var(--hr-t1)">{data[hi].booked}</text>
          </g>
        </g>
      )}
    </svg>
  );
}

/* ============ DONUT ============ */
function Donut({ data, size = 184, stroke = 26, activeKey, onHover }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size/2} ${size/2})`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--hr-surface-3)" strokeWidth={stroke} />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * c;
          const off = acc * c;
          acc += frac;
          const dim = activeKey && activeKey !== d.key;
          return (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
              stroke={d.color} strokeWidth={activeKey === d.key ? stroke + 4 : stroke}
              strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-off}
              opacity={dim ? .28 : 1} style={{ transition:'opacity .15s, stroke-width .15s' }}
              onMouseEnter={() => onHover && onHover(d.key)}
              onMouseLeave={() => onHover && onHover(null)} />
          );
        })}
      </g>
    </svg>
  );
}

/* ============ SPARKLINE ============ */
function Sparkline({ points, width = 96, height = 30, color = 'var(--hr-g)' }) {
  const max = Math.max(...points), min = Math.min(...points);
  const rng = max - min || 1;
  const pts = points.map((p, i) => [ (width*i)/(points.length-1), height - 3 - ((height-6)*(p-min))/rng ]);
  const line = smoothPath(pts);
  return (
    <svg width={width} height={height} style={{ display:'block' }}>
      <path d={`${line} L ${width} ${height} L 0 ${height} Z`} fill="rgba(51,209,126,.12)" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ============ MINI BARS (sentiment-style) ============ */
function MiniBars({ rows }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {rows.map((r, i) => (
        <div key={i}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13, color:'var(--hr-t1)' }}>{r.label}</span>
            <span className="hr-mono" style={{ fontSize:13, fontWeight:600 }}>{r.pct}%</span>
          </div>
          <div className="hr-bar"><div className="hr-bar-fill" style={{ width:r.pct+'%', background:r.color }} /></div>
        </div>
      ))}
    </div>
  );
}

/* ============ RESPONSIVE WRAPPER ============ */
function ResponsiveLine({ data, height = 300, min = 320 }) {
  const ref = React.useRef(null);
  const [w, setW] = React.useState(0);
  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)));
    ro.observe(ref.current);
    setW(ref.current.clientWidth);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ width:'100%' }}>
      {w >= min && <LineChart data={data} width={w} height={height} />}
    </div>
  );
}

Object.assign(window, { LineChart, ResponsiveLine, Donut, Sparkline, MiniBars, smoothPath });
