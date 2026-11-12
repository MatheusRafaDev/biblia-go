export interface PersonNode {
  id: string;
  name: string;
  gender?: 'M' | 'F';
  role?: string;
  period?: 'antigo_testamento' | 'novo_testamento' | 'patriarcas' | 'reis' | 'apostolos';
}

export interface PersonEdge {
  source: string;
  target: string;
  relationship: 'pai_de' | 'filho_de' | 'esposo_de' | 'irmao_de' | 'ancestral_de';
}

export interface GraphFilterOptions {
  gender?: 'M' | 'F';
  period?: string;
  searchQuery?: string;
  allowedRelationships?: string[];
}

export function filterGraphNodes(nodes: PersonNode[], options: GraphFilterOptions): PersonNode[] {
  return nodes.filter((node) => {
    if (options.gender && node.gender && node.gender !== options.gender) {
      return false;
    }
    if (options.period && node.period && node.period !== options.period) {
      return false;
    }
    if (options.searchQuery && options.searchQuery.trim().length > 0) {
      const q = options.searchQuery.toLowerCase().trim();
      const matchName = node.name.toLowerCase().includes(q);
      const matchRole = node.role ? node.role.toLowerCase().includes(q) : false;
      if (!matchName && !matchRole) {
        return false;
      }
    }
    return true;
  });
}

export function filterGraphEdges(
  edges: PersonEdge[],
  activeNodeIds: Set<string>,
  allowedRelationships?: string[]
): PersonEdge[] {
  return edges.filter((edge) => {
    // Both source and target must be in the active node set
    if (!activeNodeIds.has(edge.source) || !activeNodeIds.has(edge.target)) {
      return false;
    }
    if (allowedRelationships && allowedRelationships.length > 0) {
      return allowedRelationships.includes(edge.relationship);
    }
    return true;
  });
}
