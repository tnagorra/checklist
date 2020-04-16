#!/bin/bash

function get_input {
    local inp
    while true; do
        read -p "$1" inp
        if [ -z "$inp" ]; then
            echo "$2"
        else
            break;
        fi
    done
    echo "$inp"
}

project_name=$(get_input "Enter name of the project: " "Enter valid project name!")
project_description=$(get_input "Enter description of the project: " "Enter valid project description!")
project_id=$(get_input "Enter id for the project: " "Enter valid project id!")
project_color=$(get_input "Enter color for the project: " "Enter valid project color!")

echo "Creating project '$project_name'"
git grep -l MY_APP_ID -- :^setup.sh | xargs sed -i "s/MY_APP_ID/$project_id/g"
git grep -l MY_APP_NAME -- :^setup.sh | xargs sed -i "s/MY_APP_NAME/$project_name/g"
git grep -l MY_APP_DESCRIPTION -- :^setup.sh | xargs sed -i "s/MY_APP_DESCRIPTION/$project_description/g"
git grep -l MY_APP_COLOR -- :^setup.sh | xargs sed -i "s/MY_APP_COLOR/$project_color/g"
