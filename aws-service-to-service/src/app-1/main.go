package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

func main() {
	http.HandleFunc("/status", StatusHandler)
	http.HandleFunc("/call", CallHandler)
	err := http.ListenAndServe(":8080", nil)
	fmt.Println(err)
}

func CallHandler(w http.ResponseWriter, req *http.Request) {
	log.Printf("Request from: %s, at: %s", req.Host, time.Now().String())

	url := req.URL.Query().Get("url")

	fmt.Printf("URL: %s", url)

	response, err := http.Get(url)

	if err != nil {
		fmt.Print(err.Error())
	}

	responseData, err := io.ReadAll(response.Body)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(responseData))

	_, _ = io.WriteString(w, string(responseData))
}

func StatusHandler(w http.ResponseWriter, req *http.Request) {
	log.Printf("Request from: %s, at: %s", req.Host, time.Now().String())
	resp := "UP"
	_, _ = io.WriteString(w, resp)
}
