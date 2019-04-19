import pandas as pd
import networkx as nx
import trie_representation
import sys
import json
def path_recur(nxg,n,path_json):
    d = nxg.nodes[n]
    path_json.append(d)
    for p in nxg.predecessors(n):
        path_recur(nxg,p,path_json)

def get_paths(nxg,keep_prefix_count):
    paths_json = [];
    for n,d in nxg.nodes.data():
        if("_end" in d and d["_end"]==True):
            path_json=[]
            path_recur(nxg,n,path_json)
            count = path_json[0]["counter"]
            path_json.reverse()
            if(keep_prefix_count==True):
                path = path_json
            else:
                path = [r["name"] for r in path_json]
            paths_json.append({"count":count,"path":path})
    return(paths_json)

def get_unique_paths(activity_timeseries,keep_prefix_count=False):
    nxg = trie_representation.get_trie_representation(activity_timeseries);
    paths_json = get_paths(nxg,keep_prefix_count)
    paths_json.sort(key=lambda x: x["count"], reverse=True)
    return paths_json

if __name__ == "__main__":
    keep_prefix_count  = True
    if(sys.argv[2] == 0):
        keep_prefix_count = False;
    paths_json = get_unique_paths(sys.argv[1],keep_prefix_count)
    print(json.dumps(paths_json))
