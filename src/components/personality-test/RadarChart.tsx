// src/components/personality-test/RadarChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TestResult } from '@/types/database';

const RadarChart: React.FC<{ 
  results: TestResult[];
  language: 'en' | 'de';
}> = ({ results, language }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !results.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // ========== EDIT THESE VALUES TO CUSTOMIZE THE CHART ==========
    // Styling options - edit these variables directly
    const width = 600;               // Width of the chart
    const height = 600;              // Height of the chart
    const margin = 160;              // Increased margin for labels
        
    const axisLineColor = "#ddd";    // Color of axis lines
    const gridLineColor = "#999";    // Darker grid lines
    const gridLineWidth = 1.2;       // Thicker grid lines
    const areaFillColor = "rgba(100, 111, 212, 0.2)"; // Fill color
    const areaStrokeColor = "#4a61e2"; // Outline color EFA8A8
    const pointColor = "#EFA8A8";    // Color of data points
    const pointSize = 5;             // Size of data points
        
    const labelFontSize = 14;        // Domain label font size
    const labelColor = "#333";       // Domain label color
    const labelFontWeight = "bold";  // Domain label font weight
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const labelOffset = 60;          // Distance from chart edge to labels
        
    const percentageFontSize = 10;   // Scale percentage font size
    const percentageColor = "#999";  // Scale percentage color
        
    const scoreFontSize = 12;        // Score value font size
    const scoreColor = "#333";       // Score value color
    const scoreFontWeight = "bold";  // Score value font weight
     
    const fixedScoreOffset = 22;     // Constant pixel offset for score labels
    // ============================================================
    
    const radius = Math.min(width, height) / 2 - margin;
    
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Scales
    const angleScale = d3.scaleLinear()
      .domain([0, results.length])
      .range([0, 2 * Math.PI]);

    const radiusScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, radius]);

    // Draw circular gridlines
    [20, 40, 60, 80, 100].forEach(value => {
      // Grid circles
      svg.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", radiusScale(value))
        .attr("fill", "none")
        .attr("stroke", gridLineColor)
        .attr("stroke-width", gridLineWidth)
        .attr("stroke-dasharray", "2,2"); // More subtle dash
      
      // Percentage labels (only at the top)
      if (value > 0) {
        svg.append("text")
          .attr("x", 0)
          .attr("y", -radiusScale(value) - 7) // More space
          .attr("text-anchor", "middle")
          .attr("font-size", percentageFontSize)
          .attr("fill", percentageColor)
          .text(`${value}%`);
      }
    });

    // Draw axes
    results.forEach((_, i) => {
      // Axis lines
      svg.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", radiusScale(100) * Math.cos(angleScale(i) - Math.PI / 2))
        .attr("y2", radiusScale(100) * Math.sin(angleScale(i) - Math.PI / 2))
        .attr("stroke", axisLineColor)
        .attr("stroke-width", 1);

      // Domain labels
      const angle = angleScale(i) - Math.PI / 2;
      const labelRadius = radius + 30; // More distance for labels
      const x = labelRadius * Math.cos(angle);
      const y = labelRadius * Math.sin(angle);
      
      let textAnchor = "middle";
      let xOffset = 0;
      
      // Improved text anchoring with extra offset for side labels
      if (Math.cos(angle) > 0.3) {
        textAnchor = "start";
        xOffset = 5;
      } else if (Math.cos(angle) < -0.3) {
        textAnchor = "end";
        xOffset = -5;
      }
      
      const domain = results[i].domain;
      const label = language === 'en' ? domain.name_en : domain.name_de;
      
      svg.append("text")
        .attr("x", x + xOffset)
        .attr("y", y)
        .attr("text-anchor", textAnchor)
        .attr("font-size", labelFontSize)
        .attr("font-weight", labelFontWeight)
        .attr("fill", labelColor)
        .text(label);
    });

    // Draw radar area
    const points = results.map((d, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      return [
        radiusScale(d.score) * Math.cos(angle),
        radiusScale(d.score) * Math.sin(angle)
      ];
    });
    
    // Create a line generator
    const lineGenerator = d3.line().curve(d3.curveLinearClosed);
    
    // Add the path
    svg.append("path")
      .attr("d", lineGenerator(points as [number, number][]))
      .attr("fill", areaFillColor)
      .attr("stroke", areaStrokeColor)
      .attr("stroke-width", 2);

// Add data points and score labels
results.forEach((d, i) => {
    const angle = angleScale(i) - Math.PI / 2;
    const x = radiusScale(d.score) * Math.cos(angle);
    const y = radiusScale(d.score) * Math.sin(angle);
    
    // Data point - removed white border
    svg.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", pointSize)
      .attr("fill", pointColor);
    
    // Score label - with constant offset
    // Calculate unit vector in the direction from center to point
    const magnitude = Math.sqrt(x*x + y*y);
    // Avoid division by zero
    const unitX = magnitude === 0 ? 0 : x / magnitude;
    const unitY = magnitude === 0 ? 0 : y / magnitude;
    
    // Apply fixed pixel offset in the direction of the point
    const labelX = x + (unitX * fixedScoreOffset);
    const labelY = y + (unitY * fixedScoreOffset);
    
    svg.append("text")
      .attr("x", labelX)
      .attr("y", labelY)
      .attr("text-anchor", "middle")
      .attr("font-size", scoreFontSize)
      .attr("font-weight", scoreFontWeight)
      .attr("fill", scoreColor)
      .text(`${d.score.toFixed(1)}%`);
  });
      
  }, [results, language]);

  return (
    <div className="radar-chart">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default RadarChart;