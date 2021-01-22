
# Makefile #


# $@ ··· [target]
# $^ ··· {Dependencies}


# Variables

EXE		= main
SOURCES	= main.o
HEADERS	=

REMOVE	= out.csv

CXX		= g++
CXXFLAGS= --std=c++11


# Basic Commands

all: clean ${EXE}

${EXE}: ${SOURCES} ${HEADERS}
	${CXX} ${CXXFLAGS} -o $@ ${SOURCES}

clean:
	rm -f *.o ${EXE} ${REMOVE}


# Individual Files

main.o: main.cpp
	${CXX} ${CXXFLAGS} -c main.cpp
