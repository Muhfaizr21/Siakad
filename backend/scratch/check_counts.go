package main

import (
	"fmt"
	"siakad-backend/config"
	"siakad-backend/models"
)

func main() {
	config.ConnectDB()
	
	var countProdi int64
	config.DB.Model(&models.ProgramStudi{}).Count(&countProdi)
	
	var countMhs int64
	config.DB.Model(&models.Mahasiswa{}).Count(&countMhs)
	
	var countDosen int64
	config.DB.Model(&models.Dosen{}).Count(&countDosen)
	
	var countFakultas int64
	config.DB.Model(&models.Fakultas{}).Count(&countFakultas)

	fmt.Println("--- DATABASE STATUS ---")
	fmt.Printf("Fakultas: %d\n", countFakultas)
	fmt.Printf("Program Studi: %d\n", countProdi)
	fmt.Printf("Mahasiswa: %d\n", countMhs)
	fmt.Printf("Dosen: %d\n", countDosen)
	fmt.Println("-----------------------")
}
