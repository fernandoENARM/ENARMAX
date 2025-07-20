import React from 'react';
import { PieChart, Pie, Cell } from "recharts";

const renderLegend = (data) => (
  <ul className="space-y-1 ml-4">
    {data.map((entry) => (
      <li key={entry.name} className="flex items-center text-sm">
        <span className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: entry.color}}></span>
        {entry.name}
      </li>
    ))}
  </ul>
);

const ProgressDonut = ({ data }) => (
  <div className="bg-white rounded-2xl border p-5 flex items-center space-x-4">
    <PieChart width={140} height={140}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        innerRadius={50}
        outerRadius={65}
        paddingAngle={3}
      >
        {data.map((entry) => (
          <Cell key={entry.name} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
    {renderLegend(data)}
  </div>
);

export default ProgressDonut;
