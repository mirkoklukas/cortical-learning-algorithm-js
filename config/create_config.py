import sys
import os
import json
from create_spatial_config import create_spatial_config
from create_temporal_config import create_temporal_config

if __name__ == '__main__':

    print "Usage: "
    print "#cols, #cells, #segs, #syns, #bitSyns, #bits [, Filename]"

    cols = int(sys.argv[1])
    cells = int(sys.argv[2])
    segs = int(sys.argv[3])
    syns = int(sys.argv[4])
    bitSyns= int(sys.argv[5])
    bits = int(sys.argv[6])
    filename = sys.argv[7] if len(sys.argv) >= 7 else 'config'

    confSpat = create_spatial_config(cols, bits, bitSyns)
    confTemp = create_temporal_config(cols, cells, segs, syns)
    confObj = {
        "spatial" : confSpat,
        "temporal": confTemp
    }


    with open(filename + ".json","w") as output_file:
        output_file.write( "var " + filename + " = " + json.dumps(confObj))
