import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SensorData, ThreatAlert } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ThreatMapProps {
  sensorData: SensorData[];
  alerts: ThreatAlert[];
}

export const ThreatMap: React.FC<ThreatMapProps> = ({ sensorData, alerts }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // India coastline bounds (simplified)
    const projection = d3.geoMercator()
      .center([78, 15])
      .scale(1000)
      .translate([width / 2, height / 2]);

    // Draw coastline (simplified)
    const coastlineData = [
      [68, 24], [70, 22], [72, 19], [74, 15], [76, 12], [78, 10], [80, 11], [82, 13], [84, 16], [86, 18], [88, 22]
    ];

    const line = d3.line<[number, number]>()
      .x(d => projection(d)![0])
      .y(d => projection(d)![1])
      .curve(d3.curveCardinal);

    svg.append("path")
      .datum(coastlineData)
      .attr("d", line)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 3)
      .attr("fill", "none");

    // Draw sensor locations
    const sensorGroups = svg.selectAll(".sensor")
      .data(sensorData)
      .enter()
      .append("g")
      .attr("class", "sensor")
      .attr("transform", d => {
        const [x, y] = projection([d.location.lng, d.location.lat])!;
        return `translate(${x},${y})`;
      });

    sensorGroups.append("circle")
      .attr("r", 8)
      .attr("fill", d => {
        switch (d.status) {
          case 'critical': return '#ef4444';
          case 'warning': return '#f59e0b';
          default: return '#10b981';
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        setSelectedLocation(d.location.name);
      });

    sensorGroups.append("text")
      .attr("dy", -12)
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .attr("fill", "#374151")
      .text(d => d.location.name);

    // Draw alert zones
    alerts.forEach((alert, index) => {
      const [x, y] = projection([alert.location.lng, alert.location.lat])!;
      
      svg.append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 30)
        .attr("fill", "none")
        .attr("stroke", alert.severity === 'critical' ? '#dc2626' : '#f59e0b')
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5")
        .style("opacity", 0.7);

      svg.append("text")
        .attr("x", x + 35)
        .attr("y", y)
        .attr("font-size", "12px")
        .attr("fill", alert.severity === 'critical' ? '#dc2626' : '#f59e0b')
        .attr("font-weight", "bold")
        .text(`${alert.type.toUpperCase()}`);
    });

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 150}, 30)`);

    const legendData = [
      { color: '#10b981', label: 'Normal' },
      { color: '#f59e0b', label: 'Warning' },
      { color: '#ef4444', label: 'Critical' }
    ];

    legend.selectAll(".legend-item")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * 20})`)
      .each(function(d) {
        const g = d3.select(this);
        g.append("circle")
          .attr("r", 6)
          .attr("fill", d.color);
        g.append("text")
          .attr("x", 15)
          .attr("y", 4)
          .attr("font-size", "12px")
          .text(d.label);
      });

  }, [sensorData, alerts]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          Real-time Coastal Threat Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <svg
            ref={svgRef}
            width="100%"
            height="500"
            viewBox="0 0 800 500"
            className="border rounded-lg bg-gradient-to-b from-blue-50 to-blue-100"
          />
          {selectedLocation && (
            <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border">
              <h4 className="font-semibold">{selectedLocation}</h4>
              {sensorData
                .filter(d => d.location.name === selectedLocation)
                .map(sensor => (
                  <div key={sensor.id} className="text-sm mt-1">
                    <span className="capitalize">{sensor.type.replace('_', ' ')}: </span>
                    <span className={`font-medium ${
                      sensor.status === 'critical' ? 'text-red-600' : 
                      sensor.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {sensor.value} {sensor.unit}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};