
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WordCloudProps {
  keywords: string[];
}

const WordCloud: React.FC<WordCloudProps> = ({ keywords }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || keywords.length === 0) return;

    // Count frequencies
    const counts: Record<string, number> = {};
    keywords.forEach(k => {
      const lower = k.toLowerCase();
      counts[lower] = (counts[lower] || 0) + 1;
    });

    const data = Object.entries(counts)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 30);

    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 400;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const color = d3.scaleOrdinal(d3.schemeTableau10);
    const sizeScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.value) || 0, d3.max(data, d => d.value) || 1])
      .range([15, 60]);

    const simulation = d3.forceSimulation<any>(data)
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .force('collide', d3.forceCollide((d: any) => sizeScale(d.value) + 10))
      .on('tick', () => {
        nodes.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });

    const nodes = svg.append('g')
      .selectAll('g')
      .data(data)
      .join('g');

    nodes.append('circle')
      .attr('r', d => sizeScale(d.value))
      .attr('fill', (d, i) => color(i.toString()))
      .attr('opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    nodes.append('text')
      .text(d => d.text)
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('font-size', d => `${Math.max(10, sizeScale(d.value) / 2.5)}px`)
      .style('font-weight', '600')
      .style('fill', '#fff')
      .style('pointer-events', 'none');

  }, [keywords]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <h3 className="text-lg font-semibold mb-4 text-slate-800">Keyword Pulse</h3>
      <div className="w-full flex justify-center">
        <svg ref={svgRef} width="100%" height="400" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet" />
      </div>
    </div>
  );
};

export default WordCloud;
