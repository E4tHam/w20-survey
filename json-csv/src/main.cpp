
#include "_src/json.hpp"

#include <fstream>
#include <iostream>
#include <unordered_map>
#include <vector>

#include <sys/stat.h>
#include <sys/types.h>

nlohmann::json outputCleanCase( const std::string & case_name, const nlohmann::json & j );
void remove__collections__( nlohmann::json & j );
void outputCSV( const std::string & filename, const nlohmann::json & j );

class CouldNotOpenFile { };

const uint8_t FPS = 15;
const uint8_t seconds_per_point = 3;

const std::string backup_file = ".backup.json";
const std::string output_dir = ".data/";

const unsigned char _NUM_CASES = 6;
const std::string _CASES[ _NUM_CASES ] = {
    "Correlated_slider",
    "Correlated_slider+stop",
    "Correlated_stop",
    "Independent_slider",
    "Independent_slider+stop",
    "Independent_stop"
};

int main() {

    std::ifstream ifs( backup_file );

    if ( !ifs ) {
        std::cerr << "[ERROR]: Failed to open \"" << backup_file << "\"." << std::endl;
        return 1;
    }

    auto j = nlohmann::json::parse( ifs );

    try {
        for ( uint8_t i = 0; i < _NUM_CASES; i++ ) {
            auto cleanCase = outputCleanCase( _CASES[i], j );
            if ( cleanCase != NULL && cleanCase.size() != 0 ) {
                outputCSV( _CASES[i], cleanCase );
            }
        }
    } catch ( const CouldNotOpenFile & e ) {
        return 1;
    }

    std::cout << "Finished converting " << backup_file << " to CSVs." << std::endl;

    return 0;
}


nlohmann::json outputCleanCase( const std::string & case_name, const nlohmann::json & j ) {

    std::cout << "Parsing " << case_name << "." << std::endl;

    nlohmann::json current_case;
    try {
        current_case =  j.at( "__collections__" )
                .at( "submissions" )
                .at( case_name )
                .at( "__collections__" );
    }
    catch ( const nlohmann::detail::out_of_range & e ) {
        std::cerr << case_name << " does not exist in Firebase." << std::endl;
        return current_case;
    }

    nlohmann::json out = current_case;
    remove__collections__( out );


    // clean out
    for ( auto it = current_case.cbegin(); it != current_case.cend(); it++ ) {

        if ( it.value().at("metadata").at("finished") == true ) {

            std::cout << "  Cleaning and adding " << it.key() << "." << std::endl;

            current_case.at( it.key() ).at("metadata").erase("finished");

        }
        else {
            std::cout << "  Removing " << it.key() << " because the survey was incomplete." << std::endl;
            out.erase( it.key() );
        }
    }

    return out;
}


void remove__collections__( nlohmann::json & j ) {
    
    j.erase("__collections__");

    for ( auto it = j.begin(); it != j.end(); it++ ) {
        if ( it->is_object() ) {
            remove__collections__( *it );
        }
    }
}


void outputCSV( const std::string & filename, const nlohmann::json & j ) {

    std::ofstream ofs( output_dir + filename + ".csv" );
    if ( !ofs ) {
        std::cerr << "[ERROR]: \"" << output_dir << filename << ".csv\" could not be created." << std::endl;
        throw CouldNotOpenFile();
    }

    // Case, token, information, order, second, processes
    // header
    uint8_t num_commas = 0;
    auto test = j;
    if ( test.is_array() ) {
        test = { test };
    }

    for ( auto token_it = test.begin(); token_it != test.end(); token_it++ ) {

        ofs << "TOKEN,";
        num_commas++;

        auto information = token_it.value().at("information");
        for ( auto information_it = information.begin(); information_it != information.end(); information_it++ ) {
            ofs << information_it.key() << ',';
            num_commas++;
        }

        ofs << "Order,";
        num_commas++;

        // stop recording num_commas

        ofs << "Second,";

        auto process0 = token_it.value().at("0");
        for ( uint8_t i = 0; i < 30; i++ )
            for ( auto process0_it = process0.begin(); process0_it != process0.end(); process0_it++ ) {
                ofs << process0_it.key() + "_" + std::to_string(i) << ",";
            }
    }
    ofs << "\n";


    // data
    const bool independent = (filename.find("Independent") != -1 );

    nlohmann::json case_v = j;
    if ( case_v.is_array() ) {
        case_v = { case_v };
    }

    for ( auto token_it = case_v.begin(); token_it != case_v.end(); token_it++ ) {

        // prints TOKEN
        ofs << token_it.key() << ',';

        // prints information
        auto information = token_it.value().at("information");
        for ( auto information_it = information.begin(); information_it != information.end(); information_it++ ) {
            ofs << information_it.value() << ',';
        }

        // prints order
        auto order = token_it.value().at("metadata").at("order").get< std::vector<std::string> >();
        ofs << "\"";
        for ( uint8_t i = 0; i < order.size(); i++ )
            ofs << ( (i)?",":"" ) << order.at(i);
        ofs << "\",";
        
        // prints process data
        for ( uint16_t frame = 0 ; true; frame++ ) {

            float time = (float) frame / FPS;

            if ( frame != 0)
                for ( uint8_t i = 0; i < num_commas; i++ )
                    ofs << ',';

            bool to_break = true;

            ofs << time << ',';



            for ( uint8_t i = 0; i < 30; i++ ) {

                auto process = token_it.value().at( std::to_string(i) );

                for ( auto process_data_it = process.begin(); process_data_it != process.end(); process_data_it++ ) {
                    // std::cerr << process_data_it.key() + "_" + std::to_string(i) << "\n";
                    if      ( process_data_it.value().is_array() ) {
                        try {
                            if ( independent )
                                ofs << process_data_it.value().at( (uint16_t) (time / seconds_per_point) );
                            else
                                ofs << process_data_it.value().at( frame );
                            to_break = false;
                        }
                        catch ( const nlohmann::detail::out_of_range & e ) { }
                        ofs << ",";
                    }
                    else if ( process_data_it.value().is_object() ) {
                        try {
                            ofs << process_data_it.value().at( std::to_string( frame ) );
                            to_break = false;
                        }
                        catch ( const nlohmann::detail::out_of_range & e ) { }
                        ofs << ",";
                    }
                    else {
                        if ( frame == 0 )
                            ofs << process_data_it.value();
                        ofs << ",";
                    }
                }
            }

            if ( to_break )
                break;

            ofs << "\n";
        }

        ofs << "\n\n\n\n";
    }

    ofs.close();
}
