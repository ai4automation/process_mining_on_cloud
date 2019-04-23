import xml.etree.ElementTree as ET
import networkx as nx
from networkx.drawing.nx_agraph import write_dot
from networkx.relabel import convert_node_labels_to_integers
from  networkx.readwrite.graphml import generate_graphml
import sys


def get_graphml_from_pnet(pnml_file):
    root = ET.parse(pnml_file).getroot()
    G = nx.DiGraph()
    for tran in root.iter('transition'):
        name = tran.find("name").find("text").text
        id = tran.get("id")
        G.add_node(id,name=name,type="transition")
    for place in root.iter('place'):
        id = place.get("id")
        G.add_node(id,type="place")
    for arc in root.iter('arc'):
        G.add_edge(arc.get("source"),arc.get("target"))
    G = convert_node_labels_to_integers(G, first_label=0, ordering='default', label_attribute=None)
    G2 = nx.DiGraph()
    for n in G.nodes():
        if(G.nodes[n]["type"]=="transition"):
            n_v = G.nodes[n]["name"].replace("+complete","");
            G2.add_node(n,name=n_v)
    for n, t in G.nodes.data("type"):
        if(t=="place"):
            for p in G.predecessors(n):
                for s in G.successors(n):
                    G2.add_edge(p,s)
    r_nodes = []
    for n, t in G2.nodes.data("name"):
        if(t=="tau" or "+start" in t or "?_" in t or t[0]=="_"):
            for p in G2.predecessors(n):
                for s in G2.successors(n):
                    G2.add_edge(p,s)
            r_nodes.append(n)
    G2.remove_nodes_from(r_nodes)
    return(G2)

if __name__ == "__main__":
    G = get_graphml_from_pnet(sys.argv[1])
    for line in nx.generate_graphml(G):  # doctest: +SKIP
        print(line)
