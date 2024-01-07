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
	http.HandleFunc("/endpoint", EndpointHandler)
	err := http.ListenAndServe(":8080", nil)
	fmt.Println(err)
}

func EndpointHandler(w http.ResponseWriter, req *http.Request) {
	log.Printf("Request from: %s, at: %s", req.Host, time.Now().String())
	resp := "HALLO FROM ENDPOINT ;)"
	_, _ = io.WriteString(w, resp)
}

func StatusHandler(w http.ResponseWriter, req *http.Request) {
	log.Printf("Request from: %s, at: %s", req.Host, time.Now().String())
	resp := "UP"
	_, _ = io.WriteString(w, resp)
}
