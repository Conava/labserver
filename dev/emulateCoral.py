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

            # Parse the connectionId from the request's path
            path = urllib.parse.urlparse(self.path).path
            connection_id = path.split('connectionId')[-1]  # Get the part after 'connectionId'

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

            # Send a 200 OK response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()

            # Send a response body
            response = {
                'connectionId': int(connection_id),
                'status': response["status"],  # Use the status from the selected response
                'passphrase': response["passphrase"]  # Use the passphrase from the selected response
            }
            self.wfile.write(json.dumps(response).encode())

        except Exception as e:
            self.send_error(500, 'Internal Server Error')
            print(f"An error occurred: {e}")

def run(server_class=HTTPServer, handler_class=MyHandler):
    print('Starting server...')
    server_address = ('', 80)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()

if __name__ == '__main__':
    run()