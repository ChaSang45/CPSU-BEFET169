// ไฟล์กลาง: อ่าน env, ต่อฐานข้อมูล, ครอบ middleware แล้วเปิด server (โครงเดียวกับ lab สัปดาห์ 8)
package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"faculty-activities/handler"
	"faculty-activities/mw"
	"faculty-activities/store"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load() // ในเครื่องอ่านไฟล์ .env / บน Render ไม่มีไฟล์ก็ไม่เป็นไร ใช้ env ของ Render

	dbURL := os.Getenv("DATABASE_URL")
	secret := os.Getenv("JWT_SECRET")
	if dbURL == "" || secret == "" {
		log.Fatal("ต้องตั้งค่า DATABASE_URL และ JWT_SECRET ก่อน")
	}
	port := os.Getenv("PORT") // Render กำหนด PORT ให้เอง
	if port == "" {
		port = "8080"
	}
	origin := os.Getenv("FRONTEND_ORIGIN") // เช่น https://xxx.vercel.app (ไม่มี / ปิดท้าย)
	if origin == "" {
		origin = "http://localhost:3000"
	}

	st, err := store.New(context.Background(), dbURL)
	if err != nil {
		log.Fatal("ต่อฐานข้อมูลไม่ได้: ", err)
	}
	defer st.DB.Close()

	h := &handler.Handler{Store: st, Secret: []byte(secret)}

	var app http.Handler = http.TimeoutHandler(h.Routes(), 10*time.Second, "เซิร์ฟเวอร์ใช้เวลานานเกินไป")
	app = mw.Logging(mw.Recovery(mw.CORS(origin, app)))

	srv := &http.Server{Addr: ":" + port, Handler: app}

	go func() {
		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			log.Fatal(err)
		}
	}()
	log.Println("server เปิดที่ :" + port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit // รอสัญญาณปิด (Ctrl+C หรือ Render สั่งหยุด)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Println("ปิดไม่ทัน", err)
	}
	log.Println("ปิด server เรียบร้อย")
}
