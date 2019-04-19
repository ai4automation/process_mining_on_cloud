
from  networkx.readwrite.graphml import read_graphml
import networkx as nx
import path_statistics
import sys

def overlay_freq_statistics(log,dfg):
    nxg = read_graphml(dfg)
    var_with_count = path_statistics.get_unique_paths(log)

    mapping  = {}
    for n, t in enumerate(nxg.nodes.data("name")):
        mapping[t[1]] = t[0]
    for n in nxg.nodes():
        nxg.nodes[n]["freq"] = 0
    for e in nxg.edges():
        nxg.edges[e]["freq"] = 0
    for v in var_with_count:
        seq = v["path"]
        n = v["count"]
        for i in range(0,len(seq)):
            n_id = mapping[seq[i]]
            nxg.nodes[n_id]["freq"] += n
        for i in range(1,len(seq)):
            s_id = mapping[seq[i-1]]
            t_id = mapping[seq[i]]
            nxg[s_id][t_id]["freq"] += n
    return(nxg)

if __name__ == "__main__":
    G = overlay_freq_statistics(sys.argv[1],sys.argv[2])
    for line in nx.generate_graphml(G):  # doctest: +SKIP
        print(line)
