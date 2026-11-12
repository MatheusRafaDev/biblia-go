import { describe, it, expect } from 'vitest';
import {
  filterGraphNodes,
  filterGraphEdges,
  PersonNode,
  PersonEdge,
} from '../../src/features/graph/utils/graphFilters';

describe('graphFilters', () => {
  const sampleNodes: PersonNode[] = [
    { id: 'abraham', name: 'Abraão', gender: 'M', role: 'Patriarca', period: 'patriarcas' },
    { id: 'sarah', name: 'Sara', gender: 'F', role: 'Matriarca', period: 'patriarcas' },
    { id: 'isaac', name: 'Isaque', gender: 'M', role: 'Patriarca', period: 'patriarcas' },
    { id: 'david', name: 'Davi', gender: 'M', role: 'Rei de Israel', period: 'reis' },
    { id: 'peter', name: 'Pedro', gender: 'M', role: 'Apóstolo', period: 'apostolos' },
  ];

  const sampleEdges: PersonEdge[] = [
    { source: 'abraham', target: 'isaac', relationship: 'pai_de' },
    { source: 'sarah', target: 'isaac', relationship: 'pai_de' },
    { source: 'abraham', target: 'sarah', relationship: 'esposo_de' },
    { source: 'isaac', target: 'david', relationship: 'ancestral_de' },
  ];

  it('filters nodes by gender', () => {
    const females = filterGraphNodes(sampleNodes, { gender: 'F' });
    expect(females).toHaveLength(1);
    expect(females[0].name).toBe('Sara');
  });

  it('filters nodes by historical period', () => {
    const kings = filterGraphNodes(sampleNodes, { period: 'reis' });
    expect(kings).toHaveLength(1);
    expect(kings[0].name).toBe('Davi');
  });

  it('filters nodes by case-insensitive name or role search', () => {
    const searchResult = filterGraphNodes(sampleNodes, { searchQuery: 'apóstolo' });
    expect(searchResult).toHaveLength(1);
    expect(searchResult[0].name).toBe('Pedro');
  });

  it('filters edges keeping only those between active nodes and allowed relationships', () => {
    const activeIds = new Set(['abraham', 'isaac']);
    const edges = filterGraphEdges(sampleEdges, activeIds, ['pai_de']);

    expect(edges).toHaveLength(1);
    expect(edges[0]).toEqual({ source: 'abraham', target: 'isaac', relationship: 'pai_de' });
  });
});
