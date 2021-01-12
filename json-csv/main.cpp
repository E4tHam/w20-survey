
#include "_src/json.hpp"

#include <fstream>
#include <iostream>
#include <unordered_map>
#include <vector>

#include <sys/stat.h>
#include <sys/types.h>

class CouldNotOpenFile{ };
nlohmann::json outputCase( const std::string & case_name, const nlohmann::json & j );
void remove__collections__( nlohmann::json & j );
void outputCSV( const nlohmann::json & j );

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

    std::ifstream ifs( "backup.json" );

    auto j = nlohmann::json::parse(ifs);
    nlohmann::json j_cleaned;

    for ( uint8_t i = 0; i < _NUM_CASES; i++ ) {
        auto to_add = outputCase( _CASES[i], j );
        if ( to_add.size() == 0 )
            continue;
        if ( to_add != NULL )
            j_cleaned.push_back({ _CASES[i], to_add });
    }

    std::ofstream ofs( "clean.json" );
    ofs << j_cleaned.dump(4);
    ofs.close();


    outputCSV( j_cleaned );


    return 0;
}

nlohmann::json outputCase( const std::string & case_name, const nlohmann::json & j ) {

    std::cout << "Parsing " << case_name << "\n";

    nlohmann::json out;
    try {
        out =  j.at( "__collections__" )
                .at( "submissions" )
                .at( case_name )
                .at( "__collections__" );
    }
    catch( const nlohmann::detail::out_of_range & e ) {
        std::cerr << case_name << " does not exist in Firebase." << std::endl;
        return out;
    }

    // clean out
    for ( auto it = out.begin(); it != out.end(); it++ ) {
        if ( it.value().at("metadata").at("finished") == true ) {

            it.value().at("metadata").erase("finished");

            remove__collections__( it.value() );

        }
        else {
            out.erase( it );
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


void outputCSV( const nlohmann::json & j ) {
    std::vector<std::string> metadata_titles;
    std::vector<std::string> metadata;
    std::vector<std::string> process_titles;
    std::vector<std::string> process;

    std::ofstream ofs( "data.csv" );
    
    // Case, token, information, order, second, processes
    // header
    uint8_t num_commas = 0;
    ofs << "Case,";
    num_commas++;
    auto test = j.at(0); 
    if ( test.is_array() ) {
        test = { test };
    }
    test = test.begin().value();
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

    }
    ofs << "\n";

    // data
    std::string current_case;
    for ( auto case_v : j ) {
        if ( case_v.is_array() ) {
            case_v = { case_v };
        }
        current_case = case_v.begin().key();
        case_v = case_v.begin().value();

        ofs << current_case << ',';

        for ( auto token_it = case_v.begin(); token_it != case_v.end(); token_it++ ) {

            ofs << token_it.key() << ',';

            auto information = token_it.value().at("information");
            for ( auto information_it = information.begin(); information_it != information.end(); information_it++ ) {
                ofs << information_it.value() << ',';
            }

            auto order = token_it.value().at("metadata").at("order").get< std::vector<std::string> >();
            ofs << "\"";
            for ( auto order_v : order )
                ofs << order_v << ',';
            ofs << "\",";
            
            for ( uint16_t frame = 0 ; true; frame++ ) {

                if ( frame == 0 ) {
                    ofs << "Frame,";
                    for ( uint8_t i = 0; i < 30; i++ ) {
                        auto process = token_it.value().at( std::to_string(i) );
                        for ( auto process_data_it = process.begin(); process_data_it != process.end(); process_data_it++ ) {
                            ofs << process_data_it.key() + "_" + std::to_string(i) << ",";
                        }
                    }
                    ofs << "\n";
                }

                for ( uint8_t i = 0; i < num_commas; i++ )
                    ofs << ',';

                // std::cerr << "frame: " << frame << "\n";

                bool to_break = true;

                ofs << frame << ',';



                for ( uint8_t i = 0; i < 30; i++ ) {

                    auto process = token_it.value().at( std::to_string(i) );

                    for ( auto process_data_it = process.begin(); process_data_it != process.end(); process_data_it++ ) {
                        // std::cerr << process_data_it.key() + "_" + std::to_string(i) << "\n";
                        if      ( process_data_it.value().is_array() ) {
                            try {
                                ofs << process_data_it.value().at( frame );
                                to_break = false;
                            }
                            catch( const nlohmann::detail::out_of_range & e ) { }
                            ofs << ",";
                        }
                        else if ( process_data_it.value().is_object() ) {
                            try {
                                ofs << process_data_it.value().at( std::to_string( frame ) );
                                to_break = false;
                            }
                            catch( const nlohmann::detail::out_of_range & e ) { }
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

            ofs << "\n\n";
        }
    }
    // ofs << 
    ofs.close();
}
