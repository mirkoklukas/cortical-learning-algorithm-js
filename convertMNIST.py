import os, struct
from array import array as pyarray
from numpy import append, array, int8, uint8, zeros
from pylab import *
from numpy import *
import json

def read(digits, dataset = "training", path = "."):
    """
    Loads MNIST files into 3D numpy arrays

    Adapted from: http://abel.ee.ucla.edu/cvxopt/_downloads/mnist.py
    """

    if dataset is "training":
        fname_img = os.path.join(path, 'train-images-idx3-ubyte')
        fname_lbl = os.path.join(path, 'train-labels-idx1-ubyte')
    elif dataset is "testing":
        fname_img = os.path.join(path, 't10k-images-idx3-ubyte')
        fname_lbl = os.path.join(path, 't10k-labels-idx1-ubyte')
    else:
        raise ValueError, "dataset must be 'testing' or 'training'"

    flbl = open(fname_lbl, 'rb')
    magic_nr, size = struct.unpack(">II", flbl.read(8))
    lbl = pyarray("b", flbl.read())
    flbl.close()

    fimg = open(fname_img, 'rb')
    magic_nr, size, rows, cols = struct.unpack(">IIII", fimg.read(16))
    img = pyarray("B", fimg.read())
    fimg.close()

    ind = [ k for k in xrange(size) if lbl[k] in digits ]
    N = len(ind)

    images = zeros((N, rows, cols), dtype=uint8)
    labels = zeros((N, 1), dtype=int8)
    for i in xrange(len(ind)):
        images[i] = array(img[ ind[i]*rows*cols : (ind[i]+1)*rows*cols ]).reshape((rows, cols))
        labels[i] = lbl[ind[i]]

    return images, labels


if __name__ == '__main__':

    images, labels = read([0,1], 'training')
    data = "var input = ["
    pics = []
    for j in range(20):
        imgstr = ""
        rows = [];
        for i in range(len(images[j]) ):
              rows.append( "[" + ", ".join(map(str, images[j][i])) + "]" )
              # print ", ".join(map(str, images[1][i]))   
        imgstr += "[\n"
        imgstr += ", \n".join(rows)
        imgstr += "]\n"
        pics.append(imgstr)
    data += ", ".join(pics)
    data += "]"

    with open("input.js","w") as output_file:
        output_file.write( data )
    # print ", \n".join(map(str, images[1]))
    # imshow(images[8], cmap=cm.gray)
    # show()






