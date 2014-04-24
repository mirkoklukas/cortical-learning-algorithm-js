import sys
import os
import json
import numpy
from scipy.stats import rv_discrete  


def create_spatial_config(numCols, numBits, numSyns):

    probabilities = [1/float(numBits) for x in range(numBits)]

    distrib = rv_discrete(values=(range(numBits), probabilities))  


    inputCells = dict([ (c, {"listeningSegs": []}) for c in range(numBits)])


    columnSegs = dict([ (s, {
        "feedingCells": distrib.rvs(size=numSyns).tolist(), 
        "center": None, 
        "boost": 1.0,
        "activeDutyCycle": 0,
        "history": { 
            "overlap": [], 
            "activity": []
        }
        }) for s in range(numCols)])

    synapses = dict([ (s, dict([ (b, {"permanence": 0, "active": 0})  for b in range(numBits) ])) for s in columnSegs ])

    for s in columnSegs:
        columnSegs[s]["center"] = columnSegs[s]["feedingCells"][0] 
        for c in columnSegs[s]["feedingCells"]:
            synapses[s][c]["permanence"] = 0.2
            inputCells[c]["listeningSegs"].append(s);

    config = {
        "numSegs": numCols,
        "numCells": numBits,
        "numSyns": numSyns,
        "segs": columnSegs,
        "cells": inputCells,
        "synapses": synapses
    }

    return config



if __name__ == '__main__':
 
    numCols = int(sys.argv[1])
    numBits = int(sys.argv[2])
    numSyns = int(sys.argv[3])


    config = create_spatial_config(numCols, numBits, numSyns);


    with open("config-spatial.json","w") as output_file:
    # output_file.write("connections = " + json.dumps(connections,indent = 2) + ";")
        # output_file.write("centers = " + json.dumps(centers,indent = 2) + ";")
        output_file.write( "var configSpatial = " + json.dumps(config,indent = 2))




