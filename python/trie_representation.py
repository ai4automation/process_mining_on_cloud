import pandas as pd
import networkx as nx
import sys
import json
class TrieNode(object):
    """
    Our trie node implementation. Very basic. but does the job
    """
    node_id = 0
    def __init__(self, char: str):
        self.char = char
        self.uid = TrieNode.node_id
        self.children = []
        # Is it the last character of the word.`
        self.word_finished = False
        # How many times this character appeared in the addition process
        self.counter = 1
        TrieNode.node_id = TrieNode.node_id+1

def add(root, chars):
    """
    Adding a word in the trie structure
    """
    node = root
    for char in chars:
        found_in_child = False
        # Search for the character in the children of the present `node`
        for child in node.children:
            if child.char == char:
                # We found it, increase the counter by 1 to keep track that another
                # word has it as well
                child.counter += 1
                # And point the node to the child that contains this char
                node = child
                found_in_child = True
                break
        # We did not find it so add a new chlid
        if not found_in_child:
            new_node = TrieNode(char)
            node.children.append(new_node)
            # And then point node to the new child
            node = new_node
    # Everything finished. Mark it as the end of a word.
    node.word_finished = True

def get_trie_representation(activity_timeseries):
    df = pd.read_json(activity_timeseries,orient="records")
    activity_groups = df.groupby("processInstanceId")["activityName"].apply(list)
    root = TrieNode('*')
    for i in range(activity_groups.size):
        add(root, activity_groups[i])
    G = nx.DiGraph()
    get_trie_recur(root,G)
    return(G)

def get_trie_recur(node,G):
    if(node.char!="*"):
        G.add_node(node.uid,name=node.char,counter=node.counter)

    if node.word_finished == True :
        G.nodes[node.uid]["_end"] = True;

    for child in node.children:
        if(node.char!='*'):
            G.add_edge(node.uid,child.uid)
        get_trie_recur(child,G)

if __name__ == "__main__":
    G = get_trie_representation(sys.argv[1])
    for line in nx.generate_graphml(G):  # doctest: +SKIP
        print(line)
