import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  color: string;
  children?: Node[];
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
}

export function MindMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tasks = useTaskStore((state) => state.tasks);

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return;

    // Clear previous SVG
    d3.select(containerRef.current).selectAll('*').remove();

    // Prepare data
    const rootTasks = tasks.filter((task) => !task.parentTaskId);
    const taskMap = new Map(tasks.map((task) => [task.id, task]));

    const nodes: Node[] = [];
    const links: Link[] = [];

    // Create nodes and links
    const processTask = (task: Task) => {
      const node: Node = {
        id: task.id,
        name: task.title,
        color: getTaskColor(task),
      };
      nodes.push(node);

      const childTasks = tasks.filter((t) => t.parentTaskId === task.id);
      childTasks.forEach((childTask) => {
        const childNode = processTask(childTask);
        links.push({
          source: node,
          target: childNode,
        });
      });

      return node;
    };

    rootTasks.forEach(processTask);

    // Set up SVG
    const width = containerRef.current.clientWidth;
    const height = 600;
    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'link',
        d3.forceLink(links).id((d: any) => d.id).distance(100)
      );

    // Draw links
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Draw nodes
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(
        d3
          .drag<SVGGElement, Node>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended)
      );

    // Add circles to nodes
    node
      .append('circle')
      .attr('r', 30)
      .attr('fill', (d) => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add text to nodes
    node
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('fill', '#fff')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .each(function (d) {
        const text = d3.select(this);
        const words = d.name.split(/\s+/);
        const lineHeight = 1.1;
        const y = text.attr('y');
        const dy = parseFloat(text.attr('dy'));
        let tspan = text
          .text(null)
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', dy + 'em');

        let lineNumber = 0;
        let line: string[] = [];
        let word = words[0];
        let lineLength = 0;

        for (let i = 0; i < words.length; i++) {
          word = words[i];
          line.push(word);
          lineLength = line.join(' ').length;

          if (lineLength > 10 && i > 0) {
            tspan.text(line.join(' '));
            line = [word];
            tspan = text
              .append('tspan')
              .attr('x', 0)
              .attr('y', y)
              .attr('dy', ++lineNumber * lineHeight + dy + 'em')
              .text(word);
          }
        }
        if (line.length > 0) {
          tspan.text(line.join(' '));
        }
      });

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as Node).x!)
        .attr('y1', (d) => (d.source as Node).y!)
        .attr('x2', (d) => (d.target as Node).x!)
        .attr('y2', (d) => (d.target as Node).y!);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [tasks]);

  const getTaskColor = (task: Task) => {
    if (task.completed) return '#22c55e';
    switch (task.priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    />
  );
}