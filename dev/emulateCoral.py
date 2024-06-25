from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse
import json
import argparse
import sys


class MyHandler(BaseHTTPRequestHandler):
    responses = [
        {"connectionId": None, "status": 1, "passphrase": "watch"},
        {"connectionId": None, "status": 0, "passphrase": ""},
        {"connectionId": None, "status": 2, "passphrase": ""},
        {"connectionId": None, "status": 1, "passphrase": "watch"},
        {"connectionId": None, "status": 1, "passphrase": "lighter"},
        {"connectionId": None, "status": 1, "passphrase": "hand"},
        {"connectionId": None, "status": 1, "passphrase": "pen"},
        {"connectionId": None, "status": 1, "passphrase": "watch"},
        {"connectionId": None, "status": 1, "passphrase": "pointer"}
    ]

def do_GET(self):
    try:
        # Print the request line
        print(self.requestline)

        # Print the headers
        print(self.headers)

        # If there's data sent by the client, print it
        content_length = self.headers.get('Content-Length')
        if content_length:
            data = self.rfile.read(int(content_length))
            print(data.decode())

        # Parse the connectionId from the request's query parameters
        query = urllib.parse.urlparse(self.path).query
        query_components = dict(qc.split("=") for qc in query.split("&") if '=' in qc)
        connection_id = query_components.get('connectionId', '100')

        # Prompt for input and select the response
        print("Select a response:")
        # Print out all available responses and the reveived connectionId
        for i, response in enumerate(self.responses):
            print(f'{i + 1}: Connection ID: {connection_id} Status: {response["status"]} Passphrase: {response["passphrase"]}')

        response_index = int(input("Enter a number from 1 to 9: ")) - 1
        response = self.responses[response_index]

        response["connectionId"] = connection_id  # Use the connectionId from the request
        if response_index == 0:
            response["connection_id"] = "123"

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()

        response_str = json.dumps(response)
        self.wfile.write(response_str.encode())

        # Print the response that was sent
        print("Response sent: ", response_str)
    except Exception as e:
        print(f"An error occurred: {e}")

def run(server_class=HTTPServer, handler_class=MyHandler, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd on port {port}...')
    httpd.serve_forever()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--response', type=int, default=0, help='The index of the response to send back')
    args = parser.parse_args()

    if args.response < 0 or args.response >= len(MyHandler.responses):
        print(f'Invalid response index. Please provide a value between 0 and {len(MyHandler.responses) - 1}.')
        sys.exit(1)

    run()