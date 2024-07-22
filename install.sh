#!/bin/bash

# Function to check for SSL certificates and generate them if not found
check_ssl_certificates() {
    # Check if the certificates directory exists and create it if not
    if [[ ! -d server/certificates ]]; then
        echo "Certificates directory not found. Creating it..."
        mkdir -p server/certificates
    fi

    # Change directory to server/certificates
    cd server/certificates || exit

    # Check if SSL certificates exist and generate them if not
    if [[ ! -f key.pem ]] || [[ ! -f cert.pem ]]; then
        echo "SSL certificates not found."
        read -p "Do you want to generate new certificates? (y/n) " choice
        case "$choice" in
            y|Y )
                echo "Generating new certificates..."
                openssl genrsa -out key.pem 2048
                openssl req -new -x509 -key key.pem -out cert.pem -days 365
                ;;
            n|N )
                echo "Not generating new certificates."
                ;;
            * )
                echo "Invalid choice. Please enter 'y' or 'n'."
                check_ssl_certificates
                ;;
        esac
    else
        echo "SSL certificates found."
    fi

    # Change directory back to the root of the project
    cd ../..
}

# Function to generate a .env file with a random SESSION_SECRET
generate_env_file() {
    echo "Generating .env file with a random SESSION_SECRET..."
    if [[ ! -f .env ]]; then
        # Using openssl to generate a random string for SESSION_SECRET
        local secret=$(openssl rand -hex 32)
        echo "SESSION_SECRET=$secret" > .env
        echo ".env file created successfully."
    else
        echo ".env file already exists. Skipping creation."
    fi
}


# Function to install packages on Debian
install_debian() {
    echo "Updating package list..."
    sudo apt-get update
    echo "Installing nodejs and npm..."
    sudo apt-get install -y nodejs npm
    echo "Installing npm packages for server..."
    cd server && npm install
    echo "Installing npm packages for client..."
    cd ../client && npm install
    echo "All packages installed successfully."
    cd ..
}

# Function to install packages on Arch
install_arch() {
    echo "Updating package list..."
    sudo pacman -Syu
    echo "Installing nodejs and npm..."
    sudo pacman -S nodejs npm
    echo "Installing npm packages for server..."
    cd server && npm install
    echo "Installing npm packages for client..."
    cd ../client && npm install
    echo "All packages installed successfully."
    cd ..
}

# Function to install packages on macOS
install_macos() {
    # Check if homebrew is installed
    # Uncomment the next line below if homebrew is not installed
    #/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo "Installing nodejs and npm..."
    brew install nodejs npm
    echo "Installing npm packages for server..."
    cd server && npm install
    echo "Installing npm packages for client..."
    cd ../client && npm install
    echo "All packages installed successfully."
    cd ..
}

# Detect the operating system
if [[ -f /etc/debian_version ]]; then
    echo "Debian detected."
    install_debian
elif [[ -f /etc/arch-release ]]; then
    echo "Arch Linux detected."
    install_arch
elif [[ "$(uname)" == "Darwin" ]]; then
    echo "macOS detected."
    echo "Uncomment line 62 if homebrew is not installed."
    install_macos
else
    echo "Unsupported operating system."
fi

check_ssl_certificates
generate_env_file

chmod +x server/server

echo "Installation completed successfully."
echo "Use ./server --start' in server directory to start the server."