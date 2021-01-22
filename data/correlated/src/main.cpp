
#include <fstream>
#include <iostream>
#include <unordered_map>
#include <vector>

const uint8_t FPS = 15;
const uint8_t seconds_per_point = 3;

std::vector< std::string > line2vector( std::string );

int main() {

    std::vector< std::vector< std::string > > in;

    std::ifstream ifs( "in.csv" );
    if ( !ifs ) {
        std::cerr << "[ERROR]: Failed to open file." << std::endl;
        return 1;
    }

    std::string line;
    while ( std::getline( ifs, line ) ) {
        in.push_back( line2vector(line) );
    }

    std::cout << "Finished reading file." << std::endl;
    ifs.close();


    std::ofstream ofs( "out.csv" );
    if ( !ofs ) {
        std::cerr << "[ERROR]: Failed to create file." << std::endl;
        return 1;
    }

    for ( size_t j = 0; j < in.at(0).size(); j ++ ) {
        ofs << "[";
        for ( size_t i = 0; i < in.size(); i += 10 ) {
            ofs << in.at(i).at(j) << ',';
        }
        ofs << "]," << std::endl;
    }




    ofs.close();
    std::cout << "Finished converting." << std::endl;
    return 0;
}

std::vector< std::string > line2vector( std::string in ) {
    std::vector< std::string > out;

    for ( ;; ) {
        size_t loc = in.find(',');
        if ( loc == -1 ) {
            out.push_back( in.substr(0, in.length()-1 ) );

            break;
        }

        out.push_back( in.substr( 0, loc ) );

        in = in.substr( loc+1 );
    }

    return out;
}