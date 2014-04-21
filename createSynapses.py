import sys
import os
import json
import numpy
from scipy.stats import rv_discrete  



def create_synapse_matrix(numCols, numBits, numSyns):

	probabilities = [1/float(numBits) for x in range(numBits)]

	distrib = rv_discrete(values=(range(numBits), probabilities))  

	potentialSynapses = []
	centers = []

	for y in range(numCols):
		L = distrib.rvs(size=numSyns).tolist()

		centers.append(L[0])
		potentialSynapses.append([ int(x in L) for x in range(numBits)])

	# matrix = [ distrib.rvs(size=numSyns).tolist() for x in range(numCols)]  


	return (potentialSynapses, centers)



if __name__ == '__main__':

    if len(sys.argv) < 4:
        print "Usage: ..."

    numCols = int(sys.argv[1])
    numBits = int(sys.argv[2])
    numSyns = int(sys.argv[3])


    if len(sys.argv) >= 5:
        output_filename = sys.argv[4]
    else:
        output_filename = None

    potentialSynapses, centers = create_synapse_matrix(numCols, numBits, numSyns);

    #If we defined an output filename, write the results to it, otherwise just print them to stdout
    if output_filename:
        with open(output_filename,"w") as output_file:
            # output_file.write("connections = " + json.dumps(connections,indent = 2) + ";")
            # output_file.write("centers = " + json.dumps(centers,indent = 2) + ";")
            output_file.write( "var desiredLocalActivity = " + str(10) + ";\n")
            output_file.write( "var minOverlap = " + str(10) + ";\n")
            output_file.write( "var numCols = " + str(numCols) + ";\n")
            output_file.write( "var numBits = " + str(numBits) + ";\n")
            output_file.write( "var numSyns = " + str(numSyns) + ";\n")
            output_file.write( "var potentialSynapses = [ \n")
            output_file.write( ", \n".join(map(str, potentialSynapses)) )
            output_file.write( "\n];")
            output_file.write( "\n")
            output_file.write( "var centers = [ " )
            output_file.write( ", ".join(map(str, centers)) )
            output_file.write( "];" )

    else:
        # print "connections = " + json.dumps(connections,indent = 2) + ";"
        # print "centers = " + json.dumps(centers,indent = 2) + ";"
        print "var potentialSynapses = ["
        print ", \n".join(map(str, potentialSynapses))
        print "];"
        print "var centers = [ "
        print ", ".join(map(str, centers))
        print "];"


