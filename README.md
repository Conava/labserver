# coral-webserver

## Installation 

### Use docker

#### Install from GitLab

To use the Docker image from the GitLab repository, follow these steps:

1. **Download the Docker image**:

   Navigate to the `/dockerImages` folder in the GitLab repository and download the desired image with the naming pattern `labserver:<version>` (e.g., `labserver-v1.0.0`).

2. **Load the Docker image**:

   After downloading the image, you can load it into Docker using the following command:
   ```sh
   docker load -i /path/to/labserver:<version>.tar
    ```
    Replace `/path/to/labserver:<version>.tar.gz` with the path to the downloaded image.

3. **Run the Docker container**:
   After loading the image, you can run the Docker container using the following command:
   ```sh
   docker run -p <path>:3000 labserver:<version>
   ```
    Replace `<path>` with the desired port number. Recommended: 443

4. **More options**:
    - (Optional Parameter) --name <containerName>
      Replace `<containerName>` with any desired name for the container.
    - (Optional Parameter) -d
      Use the `-d` flag to run the container in the background.
    - (Optional Parameter) -e NODE_ENV=dev
      Set the environment to development. Default: production

##### Example:
```sh
docker run -e NODE_ENV=dev -d -p 443:3000 --name labserver labserver:v1.0.0
```


#### Build from source code

To build the Docker image from the source code, follow these steps:

1. **Clone the repository**:

   Clone the repository to your local machine using the following command:
   ```sh
   git clone https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/webserver.git
   ```
   
2. **Build the Docker image**:

    Navigate to the repository and build the Docker image using the following command:
    ```sh
    docker build -t <imageName>:<version> .
    ```
    Replace `<imageName>` with any desired name for the image.
    Replace `<version>` with the desired version number.

3. **Run the Docker container**: 
    After building the image, you can run the Docker container using the following command:
    ```sh
    docker run -p <path>:3000 <imageName>:<version>
    ```
    Replace `<imageName>` with the name of the image.
    Replace `<path>` with the desired port number. Recommended: 443

4. **More options**:
    - (Optional Parameter) --name <containerName> 
            Replace `<containerName>` with any desired name for the container.
    - (Optional Parameter) -d 
            Use the `-d` flag to run the container in the background.
    - (Optional Parameter) -e NODE_ENV=dev
            Set the environment to development. Default: production

##### Example:
```sh
docker run -e NODE_ENV=dev -d -p 443:3000 --name labserver labserver:v1.0.0
```


#### Managing the Docker container

After running the Docker container, you can manage it using the following commands:

- **Start the container**:
    ```sh
    docker start <containerName>
    ```
- **Stop the container**:
    ```sh
    docker stop <containerName>
    ```
- **Remove the container**:
    ```sh
    docker rm <containerName>
    ```
- **Remove the image**:
    ```sh
    docker rmi <imageName>:<version>
    ```
    Replace `<version>` with the desired version number.
- **Access the container**:
    ```sh
    docker exec -it <containerName> bash
    ```
- **Save an image**:
    ```sh
    docker save -o /path/to/<imageName>:<version>.tar <imageName>:<version>
    ```
    Replace `/path/to/<imageName>:<version>.tar` with the desired path and filename.
- **Load an image**:
    ```sh
    docker load -i /path/to/<imageName>:<version>.tar
    ```
    Replace `/path/to/<imageName>:<version>.tar` with the path to the desired image.


### Use install script (Linux and macOS only)

#### Clone the repository

Clone the repository to your local machine using the following command:


   ```sh
  git clone https://git.informatik.uni-hamburg.de/base.camp/teaching/bsc-proj-basecamp-sose-2024/2-laboratory/webserver.git
   ```

#### Run the installation script

Navigate to the repository and run the installation script using the following command:

   ```sh
   bash install.sh
   ```


### Manual installation

#### Install node.js and npm

Debian/Ubuntu:
```sh
sudo apt-get install nodejs npm
```

Arch:
```sh
sudo pacman -S nodejs npm
```

Windows:
Download the installer from the [official website](https://nodejs.org/en/download/)

#### Install dependencies
Install the dependencies in server and client directories with the npm package manager
```
cd server
npm install
cd ../client
npm install
```

#### Install Vue CLI
```sh
npm install -g @vue/cli
```

#### Create SSL certificates if not present
```sh
openssl req -x509 -newkey rsa:4096 -keyout server/certificates/key.pem -out server/certificates/cert.pem -days 365 -nodes
```
You can instead copy your own certificates to the server/certificates directory.

#### Create a .env file in the client directory
```sh
openssl rand -hex 32 | awk '{print "SESSION_SECRET="$1}' > .env
```

#### Make the server management script executable
```sh
chmod +x server/server
```

## Start the server

### Server management script

To start the server, run the server management script in the server directory:

```sh
./server start 
```

Start: `./server start`
Restart: `./server restart`
Stop: `./server stop`

Available Parameters:
- `--port | -P`: Specify the port number. Default: 3000
- `--env | -E`: Specify the environment. [prod: production OR dev: development] Default: prod

Example:
```sh
./server start -P 443 -E prod
```

### Manual start

To start the server manually, run the following commands in the server directory:

```sh
node server.js
```

Available Parameters:
- `--port | -P`: Specify the port number. Default: 3000
- `--env | -E`: Specify the environment. [prod: production OR dev: development] Default: prod

Example:
```sh
node server.js -P 443 -E prod
```

## Access the website

If run locally, open a web browser and navigate to the following URL:

Dev Environment:
```
http://localhost:<port>
```

Prod Environment:
Sometimes its necessary to specify the https:// in front of the URL to access the website
You also might need to accept the self-signed certificate in the browser
```
https://localhost:<port>
```

Replace <port> with the port number specified during the server start. Default is 3000

## Development

To start the development server, run the following commands in the client directory:

```sh
./server start -E dev
```

OR via docker

```sh
docker run -e NODE_ENV=dev -d -p <port>:3000 --name <containerName> <imageName>:<version>
```

Differences between the development and production environments:
- HTTP instead of HTTPS
- Deactivated security features
- Availability of the dev/emulateCoral.py script to emulate the Coral device
- Username: admin / Password: nimda credentials skip the authentication process

Start the development UI

```sh
cd client
npm run serve
```

Features:
- Hot reload
- Vue devtools

The development Front-End runs locally and is not served by the server. In order to work properly it must access the server. 
Changing the URL and/or Port it the / Routes might be necessary

## Use of emulateCoral.py

The emulateCoral.py script is used to emulate the Coral device in the development environment.
Start it before requesting the authentication on the web interface.

To start the script, run the following command in the client/dev directory:

```sh
python emulateCoral.py
```

If a request from the server is received, you will be prompted with the following response options:
```
   {"connectionId": None, "status": 1, "passphrase": "watch"},
   {"connectionId": None, "status": 0, "passphrase": ""},
   {"connectionId": None, "status": 2, "passphrase": ""},
   {"connectionId": None, "status": 1, "passphrase": "watch"},
   {"connectionId": None, "status": 1, "passphrase": "lighter"},
   {"connectionId": None, "status": 1, "passphrase": "hand"},
   {"connectionId": None, "status": 1, "passphrase": "pen"},
   {"connectionId": None, "status": 1, "passphrase": "watch"},
   {"connectionId": None, "status": 1, "passphrase": "pointer"}
```
Choose one by entering 0-9 in the terminal and pressing Enter to test the desired functionality.
