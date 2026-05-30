/* variantA.jsx — "Focused" : calm, spacious, single-column rhythm.
   Density cut by whitespace + fewer modules above the fold.            */
function VariantA() {
  const [filter, setFilter] = React.useState('all');
  const [donutKey, setDonutKey] = React.useState(null);

  const filters = [
    { key:'all',    label:'All' },
    { key:'booked', label:'Booked' },
    { key:'agreed', label:'Rate Agreed' },
    { key:'match',  label:'Not a Match' },
    { key:'lost',   label:'No Answer / Disq.' },
  ];
  const match = (c) => {
    if (filter==='all') return true;
    if (filter==='booked') return c.outT==='Booked';
    if (filter==='agreed') return c.outT==='Rate Agreed';
    if (filter==='match')  return c.outT==='Not a Match';
    if (filter==='lost')   return c.outT==='No Answer' || c.outT==='Disqualified';
    return true;
  };
  const count = (f) => f==='all' ? DATA.calls.length : DATA.calls.filter(c=>{
    const t=c.outT; if(f==='booked')return t==='Booked'; if(f==='agreed')return t==='Rate Agreed';
    if(f==='match')return t==='Not a Match'; if(f==='lost')return t==='No Answer'||t==='Disqualified'; return true;
  }).length;
  const rows = DATA.calls.filter(match);

  return (
    <div className="hr">
      <Sidebar />
      <main className="hr-main">
        <header className="hr-head">
          <div>
            <h1 className="hr-title">Inbound Carrier Sales</h1>
            <p className="hr-subtitle">Carrier verification, load matching & automated rate negotiation.</p>
          </div>
          <StatusPills />
        </header>

        {/* KPI row */}
        <div className="hr-grid" style={{ gridTemplateColumns:'repeat(4,1fr)' }}>
          {DATA.kpis.map(k => <KpiCard key={k.key} k={k} />)}
        </div>

        {/* Outcomes + sentiment — moved up to the hero slot */}
        <div className="hr-flex" style={{ alignItems:'stretch' }}>
          <section className="hr-card is-hoverable" style={{ flex:'1.4 1 0' }}>
            <div className="hr-card-head">
              <div className="hr-card-title">Outcome Breakdown</div>
              <button className="hr-link">Report →</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:30 }}>
              <div className="hr-donut-wrap">
                <Donut data={DATA.outcomes} activeKey={donutKey} onHover={setDonutKey} />
                <div className="hr-donut-center">
                  <div className="hr-donut-num">4,982</div>
                  <div className="hr-donut-cap">Total Calls</div>
                </div>
              </div>
              <div style={{ flex:1 }}><OutcomeLegend active={donutKey} onHover={setDonutKey} /></div>
            </div>
          </section>
          <section className="hr-card is-hoverable" style={{ flex:'1 1 0', display:'flex', flexDirection:'column' }}>
            <div className="hr-card-head">
              <div className="hr-card-title">Carrier Sentiment</div>
              <button className="hr-link">Report →</button>
            </div>
            <div style={{ marginTop:6 }}><SentimentBody /></div>
            <div style={{ marginTop:'auto', paddingTop:18, fontSize:12, color:'var(--hr-t3)' }}>
              Classified from transcript tone across <span className="hr-mono" style={{color:'var(--hr-t2)'}}>4,289</span> completed calls.
            </div>
          </section>
        </div>

        {/* Recent calls — the operational core */}
        <section className="hr-card is-hoverable">
          <div className="hr-card-head">
            <div className="hr-card-title">Recent Calls</div>
            <button className="hr-link">View all calls →</button>
          </div>
          <div className="hr-chips" style={{ marginBottom:6 }}>
            {filters.map(f=>(
              <button key={f.key} className={'hr-chip'+(filter===f.key?' is-on':'')} onClick={()=>setFilter(f.key)}>
                {f.label}<span className="hr-chip-count">{count(f.key)}</span>
              </button>
            ))}
          </div>
          <RecentCalls rows={rows} />
        </section>
      </main>
    </div>
  );
}
function Lg({ c, t, dash }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:7, fontSize:12.5, color:'var(--hr-t2)', whiteSpace:'nowrap' }}>
      <span style={{ width:14, height:0, borderTop: dash?`2px dashed ${c}`:`3px solid ${c}`, borderRadius:2 }} />{t}
    </span>
  );
}
window.VariantA = VariantA;
