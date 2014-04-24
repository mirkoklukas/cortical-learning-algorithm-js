import sys
import os
import json
import numpy
from scipy.stats import rv_discrete  



def create_temporal_config(numCols, numCells, numSegs, numSyns):


    probabilities = [1/float(numCols*numCells) for x in range(numCols*numCells)]
    distrib = rv_discrete(values=(range(numCols*numCells), probabilities))  


    columns = dict([ (x, { 
        "id": x, 
        "cells": [y + x*numCells for y in range(numCells)] 
    })  for x in range(numCols)])
    
    cells = dict([ (c, { 
        "id": c, 
        "column": None, 
        "state": 0, 
        "feedingSegs": [ (s + c*numSegs) for s in range(numSegs) ], 
        "listeningSegs": []  
    }) for c in range(numCols*numCells) ])

    segs = dict([ (s, { 
        "id": s, 
        "feedingCells": distrib.rvs(size=numSyns).tolist(), 
        "listeningCell": None 
    }) for s in range(numCols*numCells*numSegs)])


    for s in segs:
        for c in segs[s]["feedingCells"]:
            cells[c]["listeningSegs"].append(int(s))

    for c in cells:
        for s in cells[c]["feedingSegs"]:
            segs[s]["listeningCell"] = int(c)

    for col in columns:
        for cell in columns[col]["cells"]:
            cells[cell]["column"] = int(col)


    config = {
        "numCols": numCols,
        "numCells": numCells,
        "numSegs": numSegs,
        "numSyns": numSyns,
        "columns": columns,
        "segs": segs,
        "cells": cells
    }


    return config



if __name__ == '__main__':
    
    numCols     = int(sys.argv[1])
    numCells    = int(sys.argv[2])
    numSegs     = int(sys.argv[3]) 
    numSyns     = int(sys.argv[4])



    config =  create_temporal_config(numCols, numCells, numSegs, numSyns)

    

    with open("config-temporal.json","w") as output_file:
        output_file.write( "var configTemporal = " + json.dumps(config,indent = 2))





