/* shell.jsx — shared data, icons, and primitives for the dashboards.
   Exports to window: DATA, Icon, Sidebar, KpiCard, Badge, OutcomeLegend,
   RecentCalls, FollowUpQueue, SentimentCard, IntegrationStrip, StatusPills. */

/* ============================ DATA ============================ */
const DATA = {
  trend: {
    '7d': [
      { label:'May 17', full:'May 17', calls:612, booked:78,  rate:46 },
      { label:'May 18', full:'May 18', calls:688, booked:96,  rate:51 },
      { label:'May 19', full:'May 19', calls:642, booked:112, rate:38 },
      { label:'May 20', full:'May 20', calls:701, booked:118, rate:41 },
      { label:'May 21', full:'May 21', calls:734, booked:121, rate:40 },
      { label:'May 22', full:'May 22', calls:806, booked:124, rate:43 },
      { label:'May 23', full:'May 23', calls:799, booked:83,  rate:42 },
    ],
    '30d': [
      { label:'Apr 24', calls:520, booked:62, rate:34 },
      { label:'Apr 29', calls:566, booked:80, rate:37 },
      { label:'May 3',  calls:604, booked:95, rate:39 },
      { label:'May 8',  calls:648, booked:101, rate:41 },
      { label:'May 13', calls:690, booked:110, rate:40 },
      { label:'May 18', calls:734, booked:118, rate:44 },
      { label:'May 23', calls:806, booked:124, rate:43 },
    ],
  },
  kpis: [
    { key:'calls',   label:'Inbound Calls',  value:'4,982', delta:'+12.4%', dir:'up',   sub:'vs prior 7 days',
      icon:'phone', spark:[612,688,642,701,734,806,799] },
    { key:'booking', label:'Booking Rate',   value:'39.7', unit:'%', delta:'+3.2 pp', dir:'up', sub:'732 of 1,842 eligible',
      icon:'target', spark:[34,37,38,41,40,43,42] },
    { key:'margin',  label:'Avg Margin / Load', value:'$312', delta:'+9.0%', dir:'up', sub:'vs $284 prior',
      icon:'dollar', spark:[262,270,284,291,300,308,312] },
    { key:'rounds',  label:'Avg Negotiation', value:'2.3', unit:'rounds', delta:'−0.4', dir:'down', goodDown:true, sub:'to reach agreement',
      icon:'loop', spark:[3.1,2.9,2.8,2.6,2.5,2.4,2.3] },
  ],
  outcomes: [
    { key:'booked', name:'Booked',       value:732,  pct:'14.7%', color:'var(--hr-g)' },
    { key:'agreed', name:'Rate Agreed',  value:1102, pct:'22.1%', color:'var(--hr-g-2)' },
    { key:'match',  name:'Not a Match',  value:1563, pct:'31.4%', color:'var(--hr-amber)' },
    { key:'noans',  name:'No Answer',    value:892,  pct:'17.9%', color:'var(--hr-gray)' },
    { key:'disq',   name:'Disqualified', value:693,  pct:'13.9%', color:'var(--hr-red)' },
  ],
  sentiment: [
    { label:'Positive', pct:72, color:'var(--hr-g)' },
    { label:'Neutral',  pct:18, color:'var(--hr-amber)' },
    { label:'Negative', pct:10, color:'var(--hr-red)' },
  ],
  calls: [
    { carrier:'Pinnacle Logistics', mc:'MC 123456', elig:'green',  eligT:'Eligible',
      o:'DAL', d:'LAX', eq:'Van · 2,200 mi',  out:'green', outT:'Booked',
      offer:'$2.45', agreed:'$2.38', rounds:3, sent:'green', sum:'Booked at $2.38/mi. Strong fit, fast coverage.' },
    { carrier:'Summit Freight LLC', mc:'MC 654321', elig:'green', eligT:'Eligible',
      o:'ATL', d:'ORD', eq:'Reefer · 720 mi', out:'g2', outT:'Rate Agreed',
      offer:'$2.10', agreed:'$2.05', rounds:2, sent:'green', sum:'Agreed at $2.05/mi. Tracking requested.' },
    { carrier:'Velocity Transport', mc:'MC 789012', elig:'amber', eligT:'Not a Match',
      o:'PHX', d:'DEN', eq:'Van · 602 mi',    out:'amber', outT:'Not a Match',
      offer:'—', agreed:'—', rounds:1, sent:'amber', sum:'Out of route. Prefers CO lanes.' },
    { carrier:'Northline Carriers', mc:'MC 345678', elig:'green', eligT:'Eligible',
      o:'MIA', d:'ATL', eq:'Reefer · 662 mi', out:'gray', outT:'No Answer',
      offer:'—', agreed:'—', rounds:1, sent:'gray', sum:'Voicemail left. Will retry in 24h.' },
    { carrier:'Rapid Haul Inc.', mc:'MC 901234', elig:'red', eligT:'Disqualified',
      o:'CHI', d:'SEA', eq:'Van · 1,730 mi',  out:'red', outT:'Disqualified',
      offer:'—', agreed:'—', rounds:1, sent:'red', sum:'Failed insurance verification.' },
    { carrier:'Cascade Freight Co.', mc:'MC 553311', elig:'green', eligT:'Eligible',
      o:'SLC', d:'PDX', eq:'Flatbed · 765 mi', out:'green', outT:'Booked',
      offer:'$2.60', agreed:'$2.52', rounds:2, sent:'green', sum:'Booked at $2.52/mi. Repeat carrier.' },
    { carrier:'Lone Star Logistics', mc:'MC 778210', elig:'green', eligT:'Eligible',
      o:'HOU', d:'MEM', eq:'Van · 561 mi',     out:'g2', outT:'Rate Agreed',
      offer:'$1.95', agreed:'$1.92', rounds:3, sent:'amber', sum:'Agreed after 3 rounds. Margin tight.' },
    { carrier:'Evergreen Trucking', mc:'MC 442109', elig:'amber', eligT:'Not a Match',
      o:'SEA', d:'BOI', eq:'Reefer · 502 mi',  out:'amber', outT:'Not a Match',
      offer:'—', agreed:'—', rounds:1, sent:'gray', sum:'No reefer capacity this week.' },
  ],
  queue: [
    { carrier:'Iron Horse Logistics', mc:'MC 112233', o:'HOU', d:'LAX', eq:'Van · 1,540 mi', reason:'Price objection', action:'Re-negotiate' },
    { carrier:'Coastal Carriers',     mc:'MC 445566', o:'SAV', d:'NJ',  eq:'Reefer · 665 mi', reason:'Capacity check', action:'Call back' },
    { carrier:'Blue Ridge Transport', mc:'MC 778899', o:'BNA', d:'DAL', eq:'Van · 630 mi',   reason:'Load details',   action:'Send details' },
  ],
  integrations: [
    { name:'FMCSA API', state:'Live',      icon:'shield' },
    { name:'Load Board', state:'Connected', icon:'board' },
    { name:'Voice AI',  state:'Healthy',    icon:'mic' },
    { name:'ELD / Tracking', state:'Connected', icon:'eld' },
  ],
};

/* ============================ ICONS ============================ */
const P = { fill:'none', stroke:'currentColor', strokeWidth:1.7, strokeLinecap:'round', strokeLinejoin:'round' };
const ICONS = {
  grid:   <g {...P}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></g>,
  phone:  <g {...P}><path d="M5 4h3l1.6 4-2 1.4a12 12 0 0 0 5 5l1.4-2 4 1.6V18a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4Z"/></g>,
  truck:  <g {...P}><path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></g>,
  swap:   <g {...P}><path d="M4 8h13l-3-3M20 16H7l3 3"/></g>,
  bars:   <g {...P}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></g>,
  gear:   <g {...P}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></g>,
  target: <g {...P}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.4"/></g>,
  dollar: <g {...P}><path d="M12 3v18M16 7.5c0-1.7-1.8-2.5-4-2.5s-4 .9-4 2.7c0 3.8 8 2.1 8 5.8 0 1.9-2 2.7-4 2.7s-4-.9-4-2.6"/></g>,
  loop:   <g {...P}><path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2"/><path d="M20 4v4h-4M4 20v-4h4"/></g>,
  check:  <g {...P}><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></g>,
  headset:<g {...P}><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a4 4 0 0 1-4 3h-2"/></g>,
  shield: <g {...P}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/></g>,
  clock:  <g {...P}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></g>,
  bolt:   <g {...P}><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></g>,
  mic:    <g {...P}><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></g>,
  board:  <g {...P}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h7"/></g>,
  eld:    <g {...P}><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M7 21h10M12 17v4"/><path d="M7 11l2 2 3-4 2 3 2-2"/></g>,
  arrow:  <g {...P}><path d="M5 12h13M13 6l6 6-6 6"/></g>,
  chev:   <g {...P}><path d="M9 6l6 6-6 6"/></g>,
  search: <g {...P}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></g>,
  bell:   <g {...P}><path d="M18 9a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M10 20a2 2 0 0 0 4 0"/></g>,
  info:   <g {...P}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></g>,
  dots:   <g {...P}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></g>,
};
function Icon({ name, size = 18, style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" style={{ display:'block', ...style }}>{ICONS[name]}</svg>;
}

/* ============================ SIDEBAR ============================ */
function Sidebar() {
  const [active, setActive] = React.useState('Dashboard');
  const items = [
    { name:'Dashboard', icon:'grid' }, { name:'Calls', icon:'phone' },
    { name:'Loads', icon:'truck' },    { name:'Carriers', icon:'swap' },
    { name:'Reports', icon:'bars' },   { name:'Settings', icon:'gear' },
  ];
  return (
    <aside className="hr-side">
      <div className="hr-brand">
        <div className="hr-brand-mark"><Icon name="bolt" size={18} /></div>
        <div>
          <div className="hr-brand-name">HappyRobot</div>
          <div className="hr-brand-sub">Freight OS</div>
        </div>
      </div>
      <nav className="hr-nav">
        <div className="hr-nav-label">Operations</div>
        {items.map(it => (
          <div key={it.name} className={'hr-nav-item' + (active===it.name?' is-active':'')} onClick={()=>setActive(it.name)}>
            <span className="hr-nav-ic"><Icon name={it.icon} /></span>{it.name}
          </div>
        ))}
      </nav>
      <div className="hr-side-foot">
        <div className="hr-user">
          <div className="hr-avatar">AM</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="hr-user-name">Yutong Li</div>
            <div className="hr-user-role">Operations Team</div>
          </div>
          <span style={{ color:'var(--hr-t3)' }}><Icon name="chev" size={16} /></span>
        </div>
      </div>
    </aside>
  );
}

/* ============================ STATUS PILLS ============================ */
function StatusPills({ compact }) {
  return (
    <div className="hr-head-meta">
      <span className="hr-pill"><span className="hr-dot" />Operational</span>
      {!compact && <span className="hr-pill"><Icon name="shield" size={14} style={{color:'var(--hr-g)'}} />FMCSA <span className="hr-mono">Live</span></span>}
      <span className="hr-pill"><Icon name="clock" size={14} />Updated <span className="hr-mono">2m ago</span></span>
    </div>
  );
}

/* ============================ KPI CARD ============================ */
function KpiCard({ k, showSpark = true, big }) {
  const cls = k.goodDown && k.dir==='down' ? 'good-down' : k.dir;
  return (
    <div className={'hr-card is-hoverable hr-kpi' + (big?' hr-feature':'')}>
      <div className="hr-kpi-top">
        <span className="hr-kpi-label">{k.label}</span>
        <span className="hr-kpi-ic"><Icon name={k.icon} size={16} /></span>
      </div>
      <div className="hr-kpi-val">{k.value}{k.unit && <span className="hr-kpi-unit">{k.unit}</span>}</div>
      <div className="hr-kpi-foot">
        <span className={'hr-delta '+cls}>
          <Icon name="arrow" size={13} style={{ transform: k.dir==='up'?'rotate(-90deg)':'rotate(90deg)' }} />{k.delta}
        </span>
        <span className="hr-kpi-sub">{k.sub}</span>
        {showSpark && <span style={{ marginLeft:'auto' }}><Sparkline points={k.spark} color={k.dir==='down'&&!k.goodDown?'var(--hr-red)':'var(--hr-g)'} /></span>}
      </div>
    </div>
  );
}

/* ============================ OUTCOME LEGEND ============================ */
function OutcomeLegend({ active, onHover }) {
  return (
    <div className="hr-legend">
      {DATA.outcomes.map(o => (
        <div key={o.key} className="hr-legend-row"
             style={{ background: active===o.key?'var(--hr-surface-2)':'transparent' }}
             onMouseEnter={()=>onHover&&onHover(o.key)} onMouseLeave={()=>onHover&&onHover(null)}>
          <div className="hr-legend-key">
            <span className="hr-swatch" style={{ background:o.color }} />
            <span className="hr-legend-name">{o.name}</span>
          </div>
          <span className="hr-legend-val">{o.value.toLocaleString()}</span>
          <span className="hr-legend-pct">{o.pct}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================ RECENT CALLS ============================ */
function RecentCalls({ rows = DATA.calls, dense }) {
  return (
    <table className="hr-table">
      <thead><tr>
        <th>Carrier</th><th>Eligibility</th><th>Lane</th><th>Outcome</th>
        {!dense && <th className="num">Offer</th>}
        <th className="num">Agreed</th><th className="num">Rounds</th><th>Sentiment</th>
      </tr></thead>
      <tbody>
        {rows.map((c, i) => (
          <tr key={i} className="hr-row">
            <td>
              <div className="hr-carrier">{c.carrier}</div>
              <div className="hr-sub hr-mono">{c.mc}</div>
            </td>
            <td><Badge tone={c.elig} text={c.eligT} dot /></td>
            <td>
              <div className="hr-lane">{c.o}<span className="arr"><Icon name="arrow" size={13} /></span>{c.d}</div>
              <div className="hr-sub">{c.eq}</div>
            </td>
            <td><Badge tone={c.out} text={c.outT} /></td>
            {!dense && <td className="num hr-mono hr-muted">{c.offer}</td>}
            <td className="num hr-mono" style={{ color: c.agreed!=='—'?'var(--hr-g)':'var(--hr-t3)', fontWeight:600 }}>{c.agreed}</td>
            <td className="num hr-mono hr-muted">{c.rounds}</td>
            <td><span className="hr-swatch" style={{ background: toneColor(c.sent), display:'inline-block', width:8, height:8, marginRight:7 }} /><span className="hr-faint" style={{ fontSize:12 }}>{sentLabel(c.sent)}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
function toneColor(t){ return {green:'var(--hr-g)', g2:'var(--hr-g-2)', amber:'var(--hr-amber)', red:'var(--hr-red)', gray:'var(--hr-gray)'}[t]; }
function sentLabel(t){ return {green:'Positive', amber:'Neutral', red:'Negative', gray:'Unknown'}[t]; }

/* ============================ BADGE ============================ */
function Badge({ tone, text, dot }) {
  const cls = { green:'green', g2:'green', amber:'amber', red:'red', gray:'gray' }[tone] || 'gray';
  return <span className={'hr-badge '+cls+(dot?' dot':'')} style={tone==='g2'?{color:'var(--hr-g-2)'}:undefined}>{text}</span>;
}

/* ============================ FOLLOW-UP QUEUE ============================ */
function FollowUpQueue({ items = DATA.queue }) {
  return (
    <div className="hr-queue">
      {items.map((q, i) => (
        <div key={i} className="hr-queue-item">
          <div className="hr-q-ic"><Icon name="headset" size={18} /></div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:650, fontSize:13.5 }}>{q.carrier}</div>
            <div className="hr-lane" style={{ marginTop:3, fontSize:11.5, color:'var(--hr-t2)' }}>{q.o}<span className="arr"><Icon name="arrow" size={11} /></span>{q.d}<span className="hr-faint" style={{fontFamily:'var(--hr-sans)', fontWeight:400}}>· {q.eq}</span></div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div className="hr-sub" style={{ marginBottom:6 }}>{q.reason}</div>
            <button className="hr-btn">{q.action}</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================ SENTIMENT CARD BODY ============================ */
function SentimentBody() { return <MiniBars rows={DATA.sentiment} />; }

/* ============================ INTEGRATION STRIP ============================ */
function IntegrationStrip() {
  return (
    <div className="hr-card" style={{ padding:'16px 22px' }}>
      <div className="hr-int">
        <span className="hr-mono" style={{ fontSize:11, letterSpacing:'.06em', color:'var(--hr-t3)', textTransform:'uppercase' }}>Integration Status</span>
        {DATA.integrations.map((it,i)=>(
          <div key={i} className="hr-int-item">
            <span className="hr-int-ic"><Icon name={it.icon} size={16} /></span>{it.name}
            <span className="hr-badge green dot" style={{ padding:'2px 8px', fontSize:11 }}>{it.state}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  DATA, Icon, Sidebar, StatusPills, KpiCard, OutcomeLegend, RecentCalls,
  Badge, FollowUpQueue, SentimentBody, IntegrationStrip, toneColor, sentLabel,
});
