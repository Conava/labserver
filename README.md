# coral-webserver

## Installation

### Use install script
```
bash install.sh
```

### Manual installation

#### Install node.js and npm
Debian/Ubuntu:
```
sudo apt-get install nodejs npm
```
Arch:
```
sudo pacman -S nodejs npm
```

#### Install dependencies
Install the dependencies in server and client directories
```
cd server
npm install
cd ../client
npm install
```

#### Install Vue CLI
```
npm install -g @vue/cli
```

#### Create SSL certificate
```
openssl req -x509 -newkey rsa:4096 -keyout server/certificates/key.pem -out server/certificates/cert.pem -days 365 -nodes
```

#### Make the server script executable
```
chmod +x server/server
```

## Running the UI dev Environment

### Compiles and hot-reloads for rapid development
```
npm run serve
```

### Compiles and minifies for production and use with node.js server
The generated files will be placed in the server/dist directory and are served by the node.js server
```
npm run build
```

## Usage

### Change to the server directory
```
cd server
```

### Start the server
```
./server start
```
Optionally, you can also specify the environment with the `--env | -e` flag, e.g. `./server start --env dev`
Available environments are `dev`and `prod`: `dev` will use the http server on port 3000 (default) and `prod` will start a https server on port 443 (default).

You can also specify the port with the `-port | -p` flag, e.g. `./server start -e prod -p 443`

The output is redirected to the output.log file in the server directory.

### Stop the server
```
./server stop
```

### Restart the server
```
./server restart
```
The same flags as for the start command can be used.
