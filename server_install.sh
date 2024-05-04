#!/bin/bash

# Function to check for SSL certificates and generate them if not found
check_ssl_certificates() {
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
}
# Function to install packages on Debian
install_debian() {
    sudo apt-get update
    sudo apt-get install -y nodejs npm
    npm install bcrypt ejs express express-session fs
}

# Function to install packages on Arch
install_arch() {
    sudo pacman -Syu
    sudo pacman -S nodejs npm
    npm install bcrypt ejs express express-session fs
}

# Function to install packages on macOS
install_macos() {
    # Uncomment the line below if homebrew is not installed
    #/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    brew install nodejs npm
    npm install bcrypt ejs express express-session fs
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
    echo "Uncomment line 20 if homebrew is not installed."
    install_macos
else
    echo "Unsupported operating system."
fi

check_ssl_certificates