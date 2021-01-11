
#include "_src/json.hpp"

#include <fstream>
#include <iostream>

class CouldNotOpenFile{ };

int main() {

    std::ifstream ifs( "test.json" );

    nlohmann::json j;
    ifs >> j;

    std::cout << j.dump(4) << std::endl;

    return 0;
}
