import xml.etree.ElementTree as ET
import networkx as nx
from networkx.drawing.nx_agraph import write_dot
from networkx.relabel import convert_node_labels_to_integers
from  networkx.readwrite.graphml import read_graphml
import sys
import pygraphviz as pgv



def get_gv_graph(graphml_string):
    G = read_graphml(graphml_string)
    gvG=pgv.AGraph(strict=False,directed=True)
    if(len(nx.get_edge_attributes(G,"freq"))>0):
        total = max([e[2] for e in G.edges.data("freq")])
    gvG.node_attr['shape']='rectangle'
    for n, t in G.nodes.data():
        node_name = t["name"];
        if('freq' in t):
            node_name = node_name+"\n"+str(t["freq"])
        gvG.add_node(node_name)
    for s,d, t in G.edges.data():
        s_n = G.nodes[s]
        d_n = G.nodes[d]
        s = s_n["name"]
        d = d_n["name"]
        label = ""
        if("freq" in t):
            s = s + "\n"+str(s_n["freq"])
            d = d + "\n"+str(d_n["freq"])
            label = t["freq"]
            frac = float(label)/float(total)
            if frac>0.32 and frac<0.67:
                color = 'yellow'
            elif frac>0.66:
                color = 'red'
            else:
                color = 'green'
            gvG.add_edge(s, d, label="  "+ str(label), color = color, penwidth = float(label)/float(total)*3 + 0.5)
        else:
            gvG.add_edge(s,d,label=label)
    gvG.layout(prog='dot') # use dot
    return(gvG)


if __name__ == "__main__":
    gvG = get_gv_graph(sys.argv[1])
    print(gvG.to_string());
