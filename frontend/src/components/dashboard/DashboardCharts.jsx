import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
    ScatterChart, Scatter, ZAxis
} from 'recharts';

export const RiskCreditScatter = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 350, width: '100%' }}>
            <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                        type="number" 
                        dataKey="credit_score" 
                        name="Credit Score" 
                        unit="" 
                        domain={[300, 850]}
                        stroke="#94a3b8"
                        label={{ value: 'Credit Score', position: 'bottom', fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                        type="number" 
                        dataKey="risk_prob" 
                        name="Risk" 
                        unit="%" 
                        stroke="#94a3b8"
                        label={{ value: 'Risk %', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 12 }}
                    />
                    <ZAxis type="number" dataKey="loan_amnt" range={[50, 400]} name="Loan Amount" />
                    <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }} 
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.9)', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Scatter name="Approved" data={data.filter(d => d.status === 'Approved')} fill="#10b981" shape="circle" />
                    <Scatter name="Rejected" data={data.filter(d => d.status === 'Rejected')} fill="#ef4444" shape="triangle" />
                    <Scatter name="Pending" data={data.filter(d => d.status === 'Pending')} fill="#f59e0b" shape="diamond" />
                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};

export const FunnelChart = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={data} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                    <Tooltip 
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TrendChart = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorApprovals" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="top" height={36}/>
                    <Area type="monotone" dataKey="approvals" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApprovals)" strokeWidth={2} />
                    <Line type="monotone" dataKey="defaults" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const ProductPerformance = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 250, width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.map((item, index) => (
                <div key={index} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem', color: '#94a3b8' }}>
                        <span>{item.name}</span>
                        <span>{item.value}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                            height: '100%', 
                            width: `${item.value}%`, 
                            background: item.fill || 'var(--primary)', 
                            borderRadius: '4px', 
                            transition: 'width 1s ease' 
                        }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const RiskSegmentation = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const HomeOwnershipPie = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" iconSize={10} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const DefaultReasons = ({ data }) => {
    if (!data) return null;
    return (
        <div style={{ height: 250, width: '100%' }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={90} fontSize={12} />
                    <Tooltip 
                        contentStyle={{ background: 'rgba(30, 41, 59, 0.8)', border: '1px solid #334155', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
